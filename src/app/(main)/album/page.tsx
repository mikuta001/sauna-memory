import { Presentation } from "lucide-react";
import AlbumContent from "./AlbumContent";
import { getUserVisitRecords } from "./records";
import {
  AlbumSelection,
  parseAlbumSelection,
  type AlbumSearchParams,
} from "./selection";
import { Decimal } from "@prisma/client/runtime/library";
import { getNewSaunaVisit, getVisitSummary } from "./aggregate";

const PREVIOUS_SEASON = {
  spring: "winter",
  summer: "spring",
  autumn: "summer",
  winter: "autumn",
} as const;

export type UserRecord = {
  id: number;
  visitedAt: Date;
  sauna: {
    id: number;
    name: string;
  };
  rating: Decimal;
  body: string;
  tagNames: string[];
};

export default async function AlbumPage({
  searchParams,
}: {
  searchParams: Promise<AlbumSearchParams>;
}) {
  const selection = parseAlbumSelection(await searchParams);
  let preSelection: AlbumSelection | null = { ...selection };

  if (selection.selectedYear !== "all") {
    if (
      selection.selectedSeason === null ||
      selection.selectedSeason === "spring"
    ) {
      preSelection.selectedYear = selection.selectedYear - 1;
      if (selection.selectedSeason === "spring") {
        preSelection.selectedSeason = PREVIOUS_SEASON[selection.selectedSeason];
      }
    } else {
      preSelection.selectedSeason = PREVIOUS_SEASON[selection.selectedSeason];
    }
  } else {
    preSelection = null;
  }

  const userRecords = await getUserVisitRecords(selection);
  let preUserRecords: UserRecord[] = [];
  if (preSelection) {
    preUserRecords = await getUserVisitRecords(preSelection);
  }

  const usersAllRecords = await getUserVisitRecords({selectedYear: 'all', selectedSeason: null});


  const visitSummaryData = getVisitSummary(
    userRecords,
    preUserRecords,
    selection,
    preSelection,
  );

  const newSaunaVisitData = getNewSaunaVisit(usersAllRecords, userRecords);

  return (
    <AlbumContent
      selectedYear={selection.selectedYear}
      selectedSeason={selection.selectedSeason}
      visitSummaryData={visitSummaryData}
      newSaunaVisitData={newSaunaVisitData}
    />
  );
}
