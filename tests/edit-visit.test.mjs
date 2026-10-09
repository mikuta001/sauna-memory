import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsxRuntime from 'react/jsx-runtime';

function load(path, dependencies) {
  const source = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, console: { error() {} }, require(name) {
    if (name === 'react/jsx-runtime') return jsxRuntime;
    assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
    return dependencies[name];
  } });
  return exports;
}
const base = '../src/app/components/VisitForm/';
const validation = load(base + 'validation.ts', { '@/app/constants/rating': { MAX_RATING: 5 } });
const plain = value => JSON.parse(JSON.stringify(value));

function setup(options = {}) {
  const id = options.id ?? 42;
  const saunaId = options.saunaId ?? 9;
  const state = {
    visits: [
      { id, user_id: 'me', sauna_id: 7, visited_at: new Date('2020-01-01'), comment: '保存済み', review_rating: 0, created_at: 'original', images: ['image'] },
      { id: 99, user_id: 'other', comment: '他人の記録' },
    ],
    companions: [{ id: 1, user_id: 'me', name: '友人' }, { id: 2, user_id: 'other', name: '新しい友人' }],
    links: [{ visit_id: id, companion_id: 1 }, { visit_id: 99, companion_id: 2 }],
  };
  const events = [];
  const auth = { async createClient() {
    if (options.clientThrows) throw Error('client');
    return { auth: { async getUser() {
      if (options.authThrows) throw Error('auth');
      return { data: { user: options.signedOut ? null : { id: options.otherOwner ? 'other' : 'me' } }, error: options.authError ? Error('auth') : null };
    } } };
  } };
  const navigation = {
    notFound() { throw Error('404'); },
    redirect(path) { events.push('redirect:' + path); throw Error('redirect:' + path); },
  };
  const models = draft => ({
    visits: {
      async findUnique({ where }) {
        events.push('read');
        const row = draft.visits.find(v => v.id === where.id && v.user_id === where.user_id);
        if (options.missingVisit || !row) return null;
        return { ...row, review_rating: { toNumber: () => row.review_rating },
          visit_companions: draft.links.filter(l => l.visit_id === row.id).map(l => ({
            companion: draft.companions.find(c => c.id === l.companion_id),
          })) };
      },
      async update({ where, data }) {
        const row = draft.visits.find(v => v.id === where.id && v.user_id === where.user_id);
        assert.ok(row);
        assert.deepEqual(Object.keys(data).sort(), ['comment', 'review_rating', 'sauna_id', 'visited_at']);
        Object.assign(row, data);
        if (options.failAt === 'visit') throw Error('write');
      },
    },
    saunas: { async findUnique({ where }) {
      assert.equal(where.id, saunaId);
      return options.missingSauna ? null : { id: saunaId, name: '変更先' };
    } },
    companions: {
      async findFirst({ where }) { return draft.companions.find(c => c.user_id === where.user_id && c.name === where.name); },
      async create({ data }) {
        const row = { id: draft.companions.length + 1, ...data };
        draft.companions.push(row);
        if (options.failAt === 'companion') throw Error('write');
        return row;
      },
    },
    visit_companions: {
      async deleteMany({ where }) {
        draft.links = draft.links.filter(l => l.visit_id !== where.visit_id);
        if (options.failAt === 'delete') throw Error('write');
      },
      async createMany({ data }) {
        draft.links.push(...data);
        if (options.failAt === 'link') throw Error('write');
      },
    },
  });
  const prisma = {
    ...models(state),
    async $transaction(callback) {
      events.push('transaction');
      const draft = structuredClone(state);
      await callback(models(draft));
      Object.assign(state, draft);
      events.push('commit');
    },
  };
  const actions = load(base + 'actions.ts', {
    '@/lib/prisma': { prisma }, '@/lib/supabase/server': auth, './validation': validation,
    'next/navigation': navigation, 'next/cache': { revalidatePath(path) { events.push('revalidate:' + path); } },
  });
  const Page = load('../src/app/(main)/edit/visits/[visitId]/sauna/[saunaId]/page.tsx', {
    '@/lib/prisma': { prisma }, '@/lib/supabase/server': auth, 'next/navigation': navigation,
    'next/link': { default: 'a' }, 'lucide-react': { ChevronLeft: 'icon' },
    '@/app/components/VisitForm': { default: 'visit-form' },
    '@/app/components/VisitForm/actions': actions,
  }).default;
  const form = new FormData();
  form.set('visitedAt', '2020-02-02');
  form.set('comment', '変更した感想');
  form.set('rating', '0');
  form.append('companions', ' 友人 ');
  form.append('companions', '新しい友人');
  form.append('companions', '友人');
  form.set('user_id', 'other');
  return { state, events, form,
    run: (visitId = id, target = saunaId) => actions.updateVisit(visitId, target, { message: '' }, form),
    page: (visitId = String(id), target = String(saunaId)) => Page({ params: Promise.resolve({ visitId, saunaId: target }) }),
  };
}

test('page loads saved values including zero for a different sauna, binds both IDs and has edit navigation', async () => {
  const s = setup();
  const tree = await s.page();
  assert.equal(tree.props.children[0].props.href, '/edit/visits/42/sauna');
  assert.equal(tree.props.children[1].props.children, '変更先');
  const props = tree.props.children[2].props;
  assert.deepEqual(plain(props.initialValues), {
    visitedAt: '2020-01-01', comment: '保存済み', rating: 0, companions: [{ id: '1', name: '友人' }],
  });
  assert.equal(props.submitLabel, '更新する');
  assert.equal(props.pendingLabel, '更新中…');
  props.initialValues.comment = '未保存';
  assert.equal((await s.page()).props.children[2].props.initialValues.comment, '保存済み');
  await assert.rejects(props.submitAction({ message: '' }, s.form), /redirect:\/home/);
  assert.equal(s.state.visits[0].id, 42);
  assert.equal(s.state.visits[0].sauna_id, 9);
});

for (const options of [{ signedOut: true }, { authError: true }, { missingVisit: true }, { missingSauna: true }, { otherOwner: true }]) {
  test(`page access control: ${JSON.stringify(options)}`, async () => {
    const s = setup(options);
    await assert.rejects(s.page(), options.signedOut || options.authError ? /redirect:\/signin/ : /404/);
    if (options.signedOut || options.authError) assert.ok(!s.events.includes('read'));
  });
}

for (const raw of ['', 'abc', '1.5', '1e2', '2147483648', '-2147483649']) {
  test(`page rejects either invalid ID: ${JSON.stringify(raw)}`, async () => {
    const s = setup();
    await assert.rejects(s.page(raw), /404/);
    await assert.rejects(s.page('42', raw), /404/);
    assert.deepEqual(s.events, []);
  });
}

test('update preserves identity, owner, creation and images; reuses own companions and isolates other records', async () => {
  const s = setup();
  const untouched = structuredClone(s.state.visits[1]);
  await assert.rejects(s.run(), /redirect:\/home/);
  assert.equal(s.state.visits.length, 2);
  const row = s.state.visits[0];
  assert.equal(row.id, 42);
  assert.equal(row.user_id, 'me');
  assert.equal(row.created_at, 'original');
  assert.deepEqual(row.images, ['image']);
  assert.equal(row.sauna_id, 9);
  assert.equal(row.comment, '変更した感想');
  assert.equal(row.visited_at.toISOString(), '2020-02-02T00:00:00.000Z');
  assert.equal(row.review_rating, 0);
  assert.deepEqual(s.state.visits[1], untouched);
  assert.equal(s.state.companions.length, 3);
  assert.deepEqual(plain(s.state.links), [
    { visit_id: 99, companion_id: 2 }, { visit_id: 42, companion_id: 1 }, { visit_id: 42, companion_id: 3 },
  ]);
  assert.equal(s.state.companions[2].user_id, 'me');
  assert.deepEqual(s.events.slice(-3), ['commit', 'revalidate:/home', 'redirect:/home']);
  // Replacement, then complete removal, leaves both masters and other records alone.
  s.form.delete('companions');
  s.form.append('companions', '新しい友人');
  await assert.rejects(s.run(), /redirect:\/home/);
  assert.equal(s.state.companions.length, 3);
  assert.deepEqual(plain(s.state.links), [{ visit_id: 99, companion_id: 2 }, { visit_id: 42, companion_id: 3 }]);
  s.form.delete('companions');
  await assert.rejects(s.run(), /redirect:\/home/);
  assert.deepEqual(plain(s.state.links), [{ visit_id: 99, companion_id: 2 }]);
  assert.equal(s.state.companions.length, 3);
});

for (const id of [-2147483648, -1, 0, 2147483647]) {
  test(`DB Int IDs are accepted: ${id}`, async () => {
    const s = setup({ id, saunaId: id });
    await s.page();
    await assert.rejects(s.run(), /redirect:\/home/);
  });
}

for (const options of ['signedOut', 'authError', 'authThrows', 'clientThrows', 'missingVisit', 'missingSauna', 'otherOwner']) {
  test(`update rejects ${options} without mutations or success effects`, async () => {
    const s = setup({ [options]: true });
    const before = structuredClone(s.state);
    assert.ok((await s.run()).message);
    assert.deepEqual(s.state, before);
    assert.ok(!s.events.some(e => /commit|revalidate|redirect/.test(e)));
  });
}
for (const id of [NaN, Infinity, 1.5, 2147483648, -2147483649, '42']) {
  test(`update rejects either invalid ID: ${id}`, async () => {
    const s = setup();
    assert.ok((await s.run(id)).message);
    assert.ok((await s.run(42, id)).message);
    assert.deepEqual(s.events, []);
  });
}
for (const [field, value] of [['visitedAt', '2020-02-30'], ['visitedAt', '9999-01-01'], ['comment', 'x'.repeat(141)], ['rating', ''], ['rating', '5.5'], ['rating', '0.1'], ['companions', ' '], ['companions', 'x'.repeat(51)]]) {
  test(`invalid ${field} input is rejected before DB access`, async () => {
    const s = setup();
    s.form.set(field, value);
    assert.ok((await s.run()).message);
    assert.deepEqual(s.events, []);
  });
}
for (const failAt of ['visit', 'companion', 'delete', 'link']) {
  test(`${failAt} failure rolls back the transaction without navigation`, async () => {
    const s = setup({ failAt });
    const before = structuredClone(s.state);
    assert.ok((await s.run()).message);
    assert.deepEqual(s.state, before);
    assert.ok(!s.events.some(e => /commit|revalidate|redirect/.test(e)));
  });
}

test('controlled form retains edited values on action error and displays pending labels', async () => {
  const s = setup({ failAt: 'link' });
  let values = [], cursor = 0, actionState = { message: '' }, pending = false;
  const Form = load(base + 'index.tsx', {
    react: {
      useState(initial) {
        const index = cursor++;
        if (!(index in values)) values[index] = initial;
        return [values[index], next => { values[index] = next; }];
      },
      useActionState(action) {
        return [actionState, async data => { actionState = await action(actionState, data); }, pending];
      },
    },
    'lucide-react': { Paperclip: 'icon' },
    '@/app/components/CompanionInput': { default: 'companions' },
    '@/app/components/RatingSlider': { default: 'rating' },
  }).default;
  const props = (await s.page()).props.children[2].props;
  const render = () => { cursor = 0; return Form(props); };
  const nodes = tree => {
    const all = [];
    function visit(node) {
      if (!node || typeof node !== 'object') return;
      all.push(node);
      for (const child of [node.props?.children].flat(Infinity)) visit(child);
    }
    visit(tree);
    return all;
  };
  let tree = render();
  let children = nodes(tree);
  children.find(n => n.props?.name === 'visitedAt').props.onChange({ target: { value: '2020-02-02' } });
  children.find(n => n.type === 'textarea').props.onChange({ target: { value: '変更した感想' } });
  children.find(n => n.type === 'companions').props.onChange([{ id: 'new', name: '新しい友人' }]);
  children.find(n => n.type === 'rating').props.onChange(0);
  await tree.props.action(s.form);
  tree = render();
  children = nodes(tree);
  assert.equal(children.find(n => n.props?.role === 'alert').props.children, actionState.message);
  assert.equal(children.find(n => n.props?.name === 'visitedAt').props.value, '2020-02-02');
  assert.equal(children.find(n => n.type === 'textarea').props.value, '変更した感想');
  assert.equal(children.find(n => n.props?.name === 'rating').props.value, 0);
  assert.equal(children.find(n => n.props?.name === 'companions').props.value, '新しい友人');
  pending = true;
  children = nodes(render());
  assert.equal(children.find(n => n.type === 'fieldset').props.disabled, true);
  assert.equal(children.find(n => n.props?.type === 'submit').props.children, '更新中…');
});
