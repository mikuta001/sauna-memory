import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsxRuntime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';

function loadModule(file, dependencies) {
  const source = ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, require(name) {
    assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
    return dependencies[name];
  } });
  return exports;
}

function row(id, userId, visitedAt, createdAt) {
  return {
    id, user_id: userId, visited_at: new Date(visitedAt), created_at: new Date(createdAt),
    sauna: { name: 'サウナ' }, review_rating: { toNumber: () => 4.5 }, comment: '感想',
    visit_companions: id === 1 ? [{ companion: { name: '友人' } }] : [],
  };
}

function setup() {
  const state = { user: { id: 'user-a' }, error: null, dbError: null, queries: [], rows: [
    row(1, 'user-a', '2026-09-01', '2026-09-01'),
    row(2, 'user-a', '2026-09-01', '2026-09-02'),
    row(3, 'user-a', '2026-09-01', '2026-09-02'),
    row(4, 'user-a', '2026-09-02', '2026-09-01'),
    row(5, 'user-b', '2026-09-03', '2026-09-03'),
    row(6, 'development-user', '2026-09-04', '2026-09-04'),
  ] };
  const { getHomeRecords } = loadModule('../src/app/(main)/home/records.ts', {
    'server-only': {},
    'next/navigation': { redirect(path) { throw Error(`REDIRECT:${path}`); } },
    '@/lib/supabase/server': { async createClient() { return { auth: { async getUser() {
      return { data: { user: state.user }, error: state.error };
    } } }; } },
    '@/lib/prisma': { prisma: { visits: { async findMany(query) {
      state.queries.push(query);
      if (state.dbError) throw state.dbError;
      // Apply the requested filter/order to mixed-owner fixtures; actual SQL needs integration testing.
      return state.rows.filter(r => r.user_id === query.where.user_id).sort((a, b) => {
        for (const order of query.orderBy) {
          const [field, direction] = Object.entries(order)[0];
          const difference = a[field] - b[field];
          if (difference) return direction === 'desc' ? -difference : difference;
        }
        return 0;
      });
    } } } },
  });
  return { state, run: getHomeRecords };
}

const plain = value => JSON.parse(JSON.stringify(value));

test('verified owner only, stable descending order, and display value conversion', async () => {
  const { state, run } = setup();
  const records = await run();
  assert.deepEqual(Array.from(records, r => r.id), [4, 3, 2, 1]);
  assert.deepEqual(plain(records[3]), {
    id: 1, visitedAt: '2026-09-01T00:00:00.000Z', title: 'サウナ', rating: 4.5, body: '感想', tagNames: ['友人'],
  });
  assert.ok(records[3].visitedAt instanceof Date);
  assert.equal(typeof records[3].rating, 'number');
  assert.deepEqual(plain(records[0].tagNames), []);
  assert.equal(state.queries.length, 1);
  assert.deepEqual(plain(state.queries[0]), {
    where: { user_id: 'user-a' },
    orderBy: [{ visited_at: 'desc' }, { created_at: 'desc' }, { id: 'desc' }],
    select: { id: true, visited_at: true, sauna: { select: { name: true } }, review_rating: true, comment: true,
      visit_companions: { select: { companion: { select: { name: true } } } } },
  });
});

test('switching users and new records are reflected without a shared result cache', async () => {
  const { state, run } = setup();
  await run();
  state.user = { id: 'user-b' };
  assert.deepEqual(Array.from(await run(), r => r.id), [5]);
  state.rows.push(row(7, 'user-b', '2026-09-05', '2026-09-05'));
  assert.deepEqual(Array.from(await run(), r => r.id), [7, 5]);
});

test('no records yields an empty array', async () => {
  const { state, run } = setup();
  state.user = { id: 'new-user' };
  assert.deepEqual(plain(await run()), []);
});

for (const scenario of ['signed out', 'auth error']) {
  test(`${scenario}: redirects before querying records`, async () => {
    const { state, run } = setup();
    if (scenario === 'signed out') state.user = null;
    else state.error = Error('invalid token');
    await assert.rejects(run(), /REDIRECT:\/signin/);
    assert.equal(state.queries.length, 0);
  });
}

test('database failure propagates instead of becoming an empty array', async () => {
  const { state, run } = setup();
  state.dbError = Error('database unavailable');
  await assert.rejects(run(), error => error === state.dbError);
});

test('home awaits record preparation and propagates failures', async () => {
  let calls = 0;
  const failure = Error('record preparation failed');
  const { default: Home } = loadModule('../src/app/(main)/home/page.tsx', {
    './records': { async getHomeRecords() { calls++; throw failure; } },
    '@/app/components/RecordCard': { default: () => null },
    '@/app/components/RecordDateDisplay': { default: () => null },
    'react/jsx-runtime': { jsx: () => ({}) },
  });
  await assert.rejects(Home(), error => error === failure);
  assert.equal(calls, 1);
});

const dateDisplay = loadModule('../src/app/components/RecordDateDisplay/index.tsx', {
  'react/jsx-runtime': jsxRuntime,
});
const ratingStars = loadModule('../src/app/components/RatingStars/index.tsx', {
  'react/jsx-runtime': jsxRuntime,
  '@/app/constants/rating': { MAX_RATING: 5 },
});
const cardHeader = loadModule('../src/app/components/RecordCard/RecordCardHeader.tsx', {
  'react/jsx-runtime': jsxRuntime,
  '../RatingStars': ratingStars,
});
const recordCard = loadModule('../src/app/components/RecordCard/index.tsx', {
  'react/jsx-runtime': jsxRuntime,
  './RecordCardHeader': cardHeader,
  'next/image': { default: () => { throw Error('Images are outside this test'); } },
});

function homeWith(records) {
  return loadModule('../src/app/(main)/home/page.tsx', {
    './records': { async getHomeRecords() { return records; } },
    'react/jsx-runtime': jsxRuntime,
    '@/app/components/RecordCard': recordCard,
    '@/app/components/RecordDateDisplay': dateDisplay,
  }).default;
}

for (const timeZone of ['UTC', 'Asia/Tokyo', 'America/Los_Angeles', 'Pacific/Kiritimati']) {
  test(`home groups and renders UTC dates across month/year boundaries in ${timeZone}`, async () => {
    const originalTZ = process.env.TZ;
    process.env.TZ = timeZone;
    try {
      const entries = [
        [3, '2026-10-01'], [2, '2026-10-01'], [1, '2026-10-01'],
        [4, '2026-09-30'], [5, '2026-01-01'], [6, '2025-12-31'],
      ].map(([id, day]) => Object.freeze({
        id, visitedAt: new Date(`${day}T00:00:00.000Z`),
        title: `施設${id}`, body: `感想${id}`, rating: 4.5, tagNames: [],
      }));
      // Unsorted date groups also sort correctly; order within a date is preserved.
      const records = Object.freeze([entries[5], ...entries.slice(0, 5)]);
      const tree = await homeWith(records)();
      const groups = Array.from(tree.props.children);
      assert.deepEqual(groups.map(group => group.key), ['2026-10-01', '2026-09-30', '2026-01-01', '2025-12-31']);
      assert.deepEqual(groups.map(group => Array.from(group.props.children[1].props.children, card => card.key)),
        [['3', '2', '1'], ['4'], ['5'], ['6']]);
      const html = renderToStaticMarkup(tree);
      for (const label of ['2026年10月1日（木）', '2026年9月30日（水）', '2026年1月1日（木）', '2025年12月31日（水）']) {
        assert.equal(html.split(label).length - 1, 1);
      }
      assert.equal((html.match(/<section/g) || []).length, 4);
      assert.equal((html.match(/<article/g) || []).length, records.length);
      for (const record of records) {
        assert.equal(html.split(record.title).length - 1, 1);
        assert.equal(html.split(record.body).length - 1, 1);
      }
    } finally {
      if (originalTZ === undefined) delete process.env.TZ;
      else process.env.TZ = originalTZ;
    }
  });
}

test('empty home renders no headings, groups, or cards', async () => {
  const html = renderToStaticMarkup(await homeWith([])());
  assert.doesNotMatch(html, /<h2|<section|<article/);
});
