import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

// Run the actual action and validator with isolated external services.
function loadModule(path, dependencies, globals = {}) {
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports,
    require(name) {
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
    console: { error() {} },
    ...globals,
  });
  return exports;
}

const directory = '../src/app/components/VisitForm/';
const validation = loadModule(`${directory}validation.ts`, {
  '@/app/constants/rating': { MAX_RATING: 5 },
});
const userA = '11111111-1111-4111-8111-111111111111';
const userB = '22222222-2222-4222-8222-222222222222';

function setup(options = {}) {
  const state = {
    companions: [{ id: 1, user_id: userB, name: '友人' }],
    visits: [],
    links: [],
  };
  const events = [];
  const currentUser = options.userId ?? userA;
  const prisma = {
    users: { async findUnique({ where }) {
      events.push('user');
      assert.equal(where.id, currentUser);
      return options.missingUser ? null : { id: where.id };
    } },
    saunas: { async findUnique() { return options.missingSauna ? null : { id: 1 }; } },
    async $transaction(callback) {
      events.push('transaction');
      // This fake verifies action boundaries; PostgreSQL rollback needs an integration test.
      const draft = structuredClone(state);
      await callback({
        companions: {
          async findFirst({ where }) {
            return draft.companions.find(c => c.user_id === where.user_id && c.name === where.name);
          },
          async create({ data }) {
            if (options.failAt === 'companion' && draft.companions.length > 1) throw Error('write failed');
            const row = { id: draft.companions.length + 1, ...data };
            draft.companions.push(row);
            return row;
          },
        },
        visits: { async create({ data }) {
          draft.visits.push(data);
          if (options.failAt === 'visit') throw Error('write failed');
          draft.links.push(...data.visit_companions.create);
          if (options.failAt === 'link') throw Error('write failed');
        } },
      });
      Object.assign(state, draft);
      events.push('commit');
    },
  };
  const { createVisit } = loadModule(`${directory}actions.ts`, {
    '@/lib/prisma': { prisma },
    '@/lib/supabase/server': { async createClient() {
      if (options.clientThrows) throw Error('client failed');
      return { auth: { async getUser() {
        if (options.authThrows) throw Error('network failed');
        return { data: { user: options.signedOut ? null : { id: currentUser } }, error: options.authError ? Error('auth failed') : null };
      } } };
    } },
    './validation': validation,
    'next/cache': { revalidatePath(path) { events.push(`revalidate:${path}`); } },
    'next/navigation': { redirect(path) { events.push(`redirect:${path}`); throw Error('NEXT_REDIRECT'); } },
  }, { process: { env: { NODE_ENV: 'production' } } });
  const form = new FormData();
  form.set('visitedAt', '2020-01-01');
  form.set('comment', '気持ちよかった');
  form.set('rating', '4.5');
  form.set('user_id', userB);
  form.append('companions', '友人');
  return { state, events, form, run: () => createVisit(1, { message: '' }, form) };
}

for (const option of ['signedOut', 'authError', 'authThrows', 'clientThrows', 'missingUser', 'missingSauna']) {
  test(`${option}: returns form error without writes or navigation`, async () => {
    const s = setup({ [option]: true });
    const before = structuredClone(s.state);
    assert.ok((await s.run()).message);
    assert.deepEqual(s.state, before);
    assert.ok(!s.events.includes('transaction'));
    assert.ok(!s.events.some(e => e.startsWith('revalidate:') || e.startsWith('redirect:')));
    if (option !== 'missingUser' && option !== 'missingSauna') assert.deepEqual(s.events, []);
  });
}

test('production: verified owner overrides form user ID and does not reuse another user’s companion', async () => {
  const s = setup();
  await assert.rejects(s.run(), /NEXT_REDIRECT/);
  assert.equal(s.state.visits[0].user_id, userA);
  assert.equal(s.state.companions[1].user_id, userA);
  assert.equal(s.state.links[0].companion_id, 2);
  assert.deepEqual(s.events.slice(-3), ['commit', 'revalidate:/home', 'redirect:/home']);
  await assert.rejects(s.run(), /NEXT_REDIRECT/);
  assert.equal(s.state.companions.length, 2);
  assert.equal(s.state.links[1].companion_id, 2);
});

test('another authenticated user reuses their own companion', async () => {
  const s = setup({ userId: userB });
  await assert.rejects(s.run(), /NEXT_REDIRECT/);
  assert.equal(s.state.visits[0].user_id, userB);
  assert.equal(s.state.companions.length, 1);
  assert.equal(s.state.links[0].companion_id, 1);
});

for (const failAt of ['companion', 'visit', 'link']) {
  test(`${failAt} failure: all writes stay within the failed transaction`, async () => {
    const s = setup({ failAt });
    s.form.append('companions', 'もう一人');
    const before = structuredClone(s.state);
    assert.ok((await s.run()).message);
    assert.deepEqual(s.state, before);
    assert.deepEqual(s.events, ['user', 'transaction']);
  });
}

test('invalid input keeps existing validation and does not write', async () => {
  const s = setup();
  s.form.set('rating', '6');
  assert.match((await s.run()).message, /評価/);
  assert.deepEqual(s.events, []);
});
