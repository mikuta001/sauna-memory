import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildAlbumQuery,
  parseAlbumSelection,
} from "../src/app/(main)/album/selection";

test("defaults and all supported year/season combinations", () => {
  assert.deepEqual(parseAlbumSelection({}, 2026), {
    selectedYear: 2026, selectedSeason: null,
  });
  for (const year of ["2024", "2025", "2026", "all"]) {
    for (const season of ["spring", "summer", "autumn", "winter", undefined]) {
      assert.deepEqual(parseAlbumSelection({ year, season }, 2026), {
        selectedYear: year === "all" ? "all" : Number(year),
        selectedSeason: season ?? null,
      });
    }
  }
  assert.equal(parseAlbumSelection({ year: "2027" }, 2027).selectedYear, 2027);
  assert.equal(parseAlbumSelection({}, 2027).selectedYear, 2027);
});

test("invalid and repeated years default independently of a valid season", () => {
  for (const year of [undefined, "", "2023", "2027", "abc", "NaN", "Infinity",
    "2024.0", "2.024e3", "0x7e8", "02024", " 2024", "2024 ", "ALL",
    ["2024", "2025"], ["2024", "2024"], ["all", "all"]]) {
    assert.deepEqual(parseAlbumSelection({ year, season: "winter" }, 2026), {
      selectedYear: 2026, selectedSeason: "winter",
    });
  }
});

test("invalid and repeated seasons default independently of a valid year", () => {
  for (const season of [undefined, "", "all", "fall", "Spring", " winter",
    ["spring", "winter"], ["winter", "winter"]]) {
    assert.deepEqual(parseAlbumSelection({ year: "all", season }, 2026), {
      selectedYear: "all", selectedSeason: null,
    });
  }
});

test("selection changes preserve the other condition and unrelated query values", () => {
  const search = "year=2024&season=autumn&tag=a&tag=b";
  const selection = parseAlbumSelection({ year: "2024", season: "autumn" }, 2026);
  assert.equal(buildAlbumQuery(search, { ...selection, selectedYear: "all" }),
    "year=all&season=autumn&tag=a&tag=b");
  assert.equal(buildAlbumQuery(search, { ...selection, selectedSeason: "winter" }),
    "year=2024&season=winter&tag=a&tag=b");
  assert.equal(buildAlbumQuery(search, { selectedYear: "all", selectedSeason: null }),
    "year=all&tag=a&tag=b");
});

test("interaction replaces duplicate and invalid parameters with normalized selection", () => {
  const search = "year=bad&year=2024&season=bad&season=winter";
  const selection = parseAlbumSelection({
    year: ["bad", "2024"], season: ["bad", "winter"],
  }, 2026);
  assert.equal(buildAlbumQuery(search, selection), "year=2026");
  assert.equal(buildAlbumQuery(search, { ...selection, selectedSeason: "spring" }),
    "year=2026&season=spring");
});
