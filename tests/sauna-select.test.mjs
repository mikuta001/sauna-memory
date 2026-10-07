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
  vm.runInNewContext(source, {
    exports,
    require(name) {
      if (name === 'react/jsx-runtime') return jsxRuntime;
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  });
  return exports.default;
}

function editPage({ signedOut = false, authError = false, owner = 'me', missing = false } = {}) {
  const queries = [];
  const Page = load('../src/app/(main)/edit/visits/[visitId]/sauna/page.tsx', {
    'next/navigation': {
      notFound() { throw Error('404'); },
      redirect(path) { throw Error(`redirect:${path}`); },
    },
    '@/app/components/SaunaSelectForm': { default: 'form' },
    '@/lib/supabase/server': { async createClient() {
      return { auth: { async getUser() {
        return { data: { user: signedOut ? null : { id: 'me' } }, error: authError ? Error('auth') : null };
      } } };
    } },
    '@/lib/prisma': { prisma: {
      visits: { async findFirst(query) {
        queries.push(query);
        return missing || query.where.user_id !== owner ? null : { sauna_id: 7 };
      } },
      saunas: { async findMany() { return [{ id: 7, name: '保存済み' }, { id: 9, name: '変更候補' }]; } },
    } },
  });
  return { queries, run: (visitId = '42') => Page({ params: Promise.resolve({ visitId }) }) };
}

test('edit page selects the saved sauna of the authenticated owner', async () => {
  const s = editPage();
  const tree = await s.run();
  const props = tree.props.children[1].props;
  assert.equal(props.selectedValue, '7');
  assert.equal(props.nextPathBase, '/edit/visits/42/sauna');
  assert.equal(s.queries[0].where.id, 42);
  assert.equal(s.queries[0].where.user_id, 'me');
});

for (const visitId of ['abc', '1.5', '1e2', '', '2147483648', '-2147483649']) {
  test(`invalid visit ID ${JSON.stringify(visitId)} returns 404 before querying`, async () => {
    const s = editPage();
    await assert.rejects(s.run(visitId), /404/);
    assert.equal(s.queries.length, 0);
  });
}
for (const options of [{ missing: true }, { owner: 'someone-else' }]) {
  test(`unavailable visit ${JSON.stringify(options)} returns 404`, async () => {
    await assert.rejects(editPage(options).run(), /404/);
  });
}
for (const options of [{ signedOut: true }, { authError: true }]) {
  test(`unauthenticated request ${JSON.stringify(options)} redirects without queries`, async () => {
    const s = editPage(options);
    await assert.rejects(s.run(), /redirect:\/signin/);
    assert.equal(s.queries.length, 0);
  });
}

for (const base of ['/create/sauna', '/edit/visits/42/sauna']) {
  test(`${base}: selection, replacement, clearing, encoding and navigation`, () => {
    let value;
    const pushed = [];
    const Form = load('../src/app/components/SaunaSelectForm/index.tsx', {
      react: { useState(initial) { if (value === undefined) value = initial; return [value, next => { value = next; }]; } },
      'next/navigation': { useRouter() { return { push(path) { pushed.push(path); } }; } },
      '@/app/components/SaunaCombobox': { default: 'combobox' },
    });
    const render = (options = [{ id: '7', name: '保存済み' }, { id: '候補/9?', name: '変更候補' }]) => Form({
      options, selectedValue: base.startsWith('/edit') ? '7' : null, nextPathBase: base,
    });
    const submit = tree => tree.props.onSubmit({ preventDefault() {} });
    let tree = render();
    assert.equal(tree.props.children[0].props.value, base.startsWith('/edit') ? '7' : null);
    assert.equal(tree.props.children[2].props.disabled, !base.startsWith('/edit'));
    tree.props.children[0].props.onChange('候補/9?');
    tree = render();
    submit(tree);
    assert.deepEqual(pushed, [`${base}/${encodeURIComponent('候補/9?')}`]);
    tree.props.children[0].props.onChange(null);
    tree = render();
    assert.equal(tree.props.children[2].props.disabled, true);
    submit(tree);
    assert.equal(pushed.length, 1);
    tree = render([]);
    assert.equal(tree.props.children[1].props.role, 'status');
    assert.equal(tree.props.children[2].props.disabled, true);
  });
}
