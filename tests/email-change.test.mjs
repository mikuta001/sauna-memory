import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';

// Server Actionの外部境界だけを置き換え、実DBや認証情報を変更せず検証する。
const directory = fileURLToPath(new URL('../src/app/(main)/mypage', import.meta.url));
function load(filename, dependencies = {}) {
  const source = readFileSync(path.join(directory, filename), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require: (name) => {
      if (!(name in dependencies)) throw new Error(`Unexpected import: ${name}`);
      return dependencies[name];
    },
  });
  return exports;
}

const validation = load('emailValidation.ts');
function setup({ currentEmail = 'old@example.com', profileEmail = currentEmail,
  authError = null, updateError = null, returnedEmail = 'new@example.com',
  dbFailure = false, missingProfile = false } = {}) {
  const calls = { authUpdates: 0, writes: [], refreshes: [] };
  const client = { auth: {
    getUser: async () => ({ data: { user: { id: 'authenticated-id', email: currentEmail } }, error: authError }),
    updateUser: async () => {
      calls.authUpdates++;
      return { data: { user: { email: returnedEmail } }, error: updateError };
    },
  } };
  const action = load('action.ts', {
    '@/lib/supabase/server': { createClient: async () => client },
    'next/navigation': { redirect: () => { throw new Error('Unexpected redirect'); } },
    'next/cache': { revalidatePath: (value) => calls.refreshes.push(value) },
    '@/lib/prisma': { prisma: { users: {
      findUnique: async () => missingProfile ? null : { email: profileEmail },
      update: async (args) => {
        if (dbFailure) throw new Error('DB unavailable');
        calls.writes.push(args);
      },
    } } },
    './emailValidation': validation,
  }).updateUserEmail;
  return { calls, run: async (email = 'new@example.com') => {
    const form = new FormData();
    form.set('email', email);
    form.set('userId', 'untrusted-id');
    return action({ status: 'idle', message: '' }, form);
  } };
}

test('validation rejects empty, non-string, malformed and overlong input', () => {
  for (const value of [null, {}, '', ' ', 'bad@', 'a b@example.com', `${'a'.repeat(244)}@example.com`]) {
    assert.equal(validation.validateEmailChange(value).success, false);
  }
  assert.equal(validation.validateEmailChange(' User+Tag@Example.com ').email, 'user+tag@example.com');
});

test('invalid input never changes Auth or DB', async () => {
  const { run, calls } = setup();
  assert.equal((await run('invalid')).status, 'error');
  assert.equal(calls.authUpdates, 0);
  assert.equal(calls.writes.length, 0);
});

test('unauthenticated requests never change Auth', async () => {
  const { run, calls } = setup({ authError: { code: 'session_not_found' } });
  assert.equal((await run()).status, 'error');
  assert.equal(calls.authUpdates, 0);
});

test('missing profile prevents partial Auth update', async () => {
  const { run, calls } = setup({ missingProfile: true });
  assert.equal((await run()).status, 'error');
  assert.equal(calls.authUpdates, 0);
});

test('confirmed email sync uses authenticated identity, not submitted ID', async () => {
  const { run, calls } = setup();
  assert.equal((await run()).status, 'success');
  assert.equal(calls.writes[0].where.id, 'authenticated-id');
  assert.equal(calls.writes[0].data.email, 'new@example.com');
  assert.deepEqual(calls.refreshes, ['/mypage']);
});

test('Auth rejection never writes DB', async () => {
  const { run, calls } = setup({ updateError: { code: 'email_exists' } });
  assert.equal((await run()).status, 'error');
  assert.equal(calls.writes.length, 0);
});

test('pending confirmation never writes unconfirmed email', async () => {
  const { run, calls } = setup({ returnedEmail: 'old@example.com' });
  assert.equal((await run()).status, 'pending');
  assert.equal(calls.writes.length, 0);
});

test('partial success returns warning and refreshes Auth-based display', async () => {
  const { run, calls } = setup({ dbFailure: true });
  assert.equal((await run()).status, 'warning');
  assert.deepEqual(calls.refreshes, ['/mypage']);
});

test('retry after partial success repairs DB without another Auth update', async () => {
  const { run, calls } = setup({ currentEmail: 'new@example.com', profileEmail: 'old@example.com' });
  assert.equal((await run()).status, 'success');
  assert.equal(calls.authUpdates, 0);
  assert.equal(calls.writes[0].data.email, 'new@example.com');
});

test('unchanged and synchronized email does not write either store', async () => {
  const { run, calls } = setup({ currentEmail: 'new@example.com' });
  assert.equal((await run()).status, 'success');
  assert.equal(calls.authUpdates, 0);
  assert.equal(calls.writes.length, 0);
});
