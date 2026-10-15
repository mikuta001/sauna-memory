import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsxRuntime from 'react/jsx-runtime';

function loadModule(file, dependencies = {}) {
  const source = ts.transpileModule(readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports, URLSearchParams, window: { location: { hash: '#album-summary-heading' } },
    require(name) {
      assert.ok(name in dependencies, `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  });
  return exports;
}

const selection = loadModule('../src/app/(main)/album/selection.ts');
const sampleData = loadModule('../src/app/(main)/album/sample-data.ts');

function setup(isPending = false) {
  const calls = [];
  const dependencies = {
    'react/jsx-runtime': jsxRuntime,
    react: { useTransition: () => [isPending, callback => callback()] },
    'next/navigation': {
      useRouter: () => ({ replace: (...args) => calls.push(args) }),
      usePathname: () => '/album',
      useSearchParams: () => new URLSearchParams('year=2024&season=autumn&tag=keep'),
    },
    './selection': selection,
    './sample-data': sampleData,
  };
  for (const name of ['YearSelect', 'SeasonSelect', 'VisitSummaryDisplay',
    'NewSaunaVisitDisplay', 'HighestRatingSaunaDisplay', 'SaunaFriendDisplay', 'AIFeedbackDisplay']) {
    dependencies[`@/app/components/${name}`] = { default: name };
  }
  const { default: Content } = loadModule('../src/app/(main)/album/AlbumContent.tsx', dependencies);
  return { Content, calls };
}

function find(element, type) {
  if (!element || typeof element !== 'object') return undefined;
  if (element.type === type) return element;
  const children = element.props?.children;
  for (const child of Array.isArray(children) ? children : [children]) {
    const result = find(child, type);
    if (result) return result;
  }
}

test('server page awaits and normalizes URL parameters into client props', async () => {
  const { default: Page } = loadModule('../src/app/(main)/album/page.tsx', {
    'react/jsx-runtime': jsxRuntime, './selection': selection,
    './AlbumContent': { default: 'AlbumContent' },
  });
  const element = await Page({ searchParams: Promise.resolve({ year: '2024', season: 'autumn' }) });
  assert.equal(element.props.selectedYear, 2024);
  assert.equal(element.props.selectedSeason, 'autumn');
});

test('year and season handlers replace both conditions without scrolling and preserve hash', () => {
  const { Content, calls } = setup();
  const element = Content({ selectedYear: 2024, selectedSeason: 'autumn' });
  find(element, 'YearSelect').props.onChange('all');
  find(element, 'SeasonSelect').props.onChange(null);
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [
    ['/album?year=all&season=autumn&tag=keep#album-summary-heading', { scroll: false }],
    ['/album?year=2024&tag=keep#album-summary-heading', { scroll: false }],
  ]);
});

test('pending transition disables both selectors and guards their handlers', () => {
  const { Content, calls } = setup(true);
  const element = Content({ selectedYear: 2024, selectedSeason: 'autumn' });
  const year = find(element, 'YearSelect').props;
  const season = find(element, 'SeasonSelect').props;
  assert.equal(year.disabled, true);
  assert.equal(season.disabled, true);
  year.onChange('all');
  season.onChange('winter');
  assert.equal(calls.length, 0);
});

test('new server props control selection while sample summaries remain fixed', () => {
  const { Content } = setup();
  for (const props of [
    { selectedYear: 2024, selectedSeason: 'autumn' },
    { selectedYear: 'all', selectedSeason: null },
  ]) {
    const element = Content(props);
    assert.equal(find(element, 'YearSelect').props.value, props.selectedYear);
    assert.equal(find(element, 'SeasonSelect').props.value, props.selectedSeason);
    assert.equal(find(element, 'YearSelect').props.disabled, false);
    assert.equal(JSON.stringify(find(element, 'VisitSummaryDisplay').props),
      JSON.stringify(sampleData.albumSampleData.summary));
    assert.equal(find(element, 'AIFeedbackDisplay').props.feedback, sampleData.albumSampleData.feedback);
  }
});
