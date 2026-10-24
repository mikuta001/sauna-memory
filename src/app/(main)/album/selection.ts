import type { SelectedYear } from "@/app/components/YearSelect/type";
import type { Season } from "@/app/components/SeasonSelect/type";

export const FIRST_ALBUM_YEAR = 2024;

export type AlbumSelection = {
  selectedYear: SelectedYear;
  selectedSeason: Season | null;
};

export type AlbumSearchParams = Record<string, string | string[] | undefined>;

export function parseAlbumSelection(
  params: AlbumSearchParams,
  currentYear = new Date().getFullYear(),
): AlbumSelection {
  const { year, season } = params;
  let selectedYear: SelectedYear = currentYear;
  if (year === "all") {
    selectedYear = "all";
  } else if (typeof year === "string" && /^[1-9]\d{3}$/.test(year)) {
    const number = Number(year);
    if (number >= FIRST_ALBUM_YEAR && number <= currentYear) {
      selectedYear = number;
    }
  }

  const selectedSeason =
    season === "spring" ||
    season === "summer" ||
    season === "autumn" ||
    season === "winter"
      ? season
      : null;

  return { selectedYear, selectedSeason };
}

export function buildAlbumQuery(
  search: string,
  { selectedYear, selectedSeason }: AlbumSelection,
): string {
  const params = new URLSearchParams(search);
  params.set("year", String(selectedYear));
  if (selectedSeason === null) {
    params.delete("season");
  } else {
    params.set("season", selectedSeason);
  }
  return params.toString();
}
