import { type UserRecord } from "./page";
import { type AlbumSelection } from "./selection";
import {
  type VisitSummaryDisplayProps,
  Comparison,
} from "@/app/components/VisitSummaryDisplay/type";
import { SEASON_NAME } from "@/app/constants/season";

export function getVisitSummary(
  records: UserRecord[],
  preRecords: UserRecord[] | null,
  selection: AlbumSelection,
  preSelection: AlbumSelection | null,
): VisitSummaryDisplayProps {
  let periodLabel = "";
  if (selection.selectedYear !== "all") {
    if (selection.selectedSeason) {
      periodLabel = `${selection.selectedYear}年${SEASON_NAME[selection.selectedSeason]}`;
    } else {
      periodLabel = `${selection.selectedYear}年`;
    }
  } else {
    if (selection.selectedSeason) {
      periodLabel = `${SEASON_NAME[selection.selectedSeason]}`;
    } else {
      periodLabel = `全期間`;
    }
  }

  const visitCount = records.length;

  let comparison: Comparison | null = null;
  let comparisonLabel = null;
  let comparisonVisitCount = null;

  if (preRecords && preSelection) {
    if (preSelection.selectedYear !== "all") {
      if (preSelection.selectedSeason) {
        comparisonLabel = `${preSelection.selectedYear}年${SEASON_NAME[preSelection.selectedSeason]}`;
      } else {
        comparisonLabel = `${preSelection.selectedYear}年`;
      }
      comparisonVisitCount = preRecords.length;
      comparison = {
        label: comparisonLabel,
        visitCount: comparisonVisitCount,
      };
    }
  }

  return {
    periodLabel,
    visitCount,
    comparison,
  };
}

export function getNewSaunaVisit(
  allRecords: UserRecord[],
  selectedRecords: UserRecord[],
) {
  const firstVisit = new Map<number, UserRecord>();
  const selectedRecordIds = new Set(selectedRecords.map((record) => record.id));
  let newSaunaRecords = [];

  for (const record of allRecords) {
    const saveRecord = firstVisit.get(record.sauna.id);
    if (!saveRecord) {
      firstVisit.set(record.sauna.id, record);
    } else {
      if (record.visitedAt.getTime() < saveRecord.visitedAt.getTime()) {
        firstVisit.set(record.sauna.id, record);
      }
    }
  }

  for (const record of firstVisit.values()) {
    if (selectedRecordIds.has(record.id)) {
      newSaunaRecords.push(record);
    }
  }

  const firstVisitedSauna = {
    visits: newSaunaRecords.map((record) => {
      return {
        id: record.sauna.id.toString(),
        name: record.sauna.name,
        imageUrl: null,
        visitedAt: record.visitedAt.toISOString(),
      };
    }),
  };

  return firstVisitedSauna;
}

export function getHighestRatingSauna(records: UserRecord[]) {
  const sortedRecords = [...records];
  sortedRecords.sort((a, b) => {
    const compare = b.rating.toNumber() - a.rating.toNumber();
    if (compare === 0) {
      return b.visitedAt.getTime() - a.visitedAt.getTime();
    } else {
      return compare;
    }
  });

  const highestRatingSauna = {
    records: sortedRecords.slice(0, 3).map((record) => {
      return {
        id: record.id.toString(),
        name: record.sauna.name,
        rating: record.rating.toNumber(),
        visitedAt: record.visitedAt.toISOString(),
        imagePath: null
      }
    })
  }

  return highestRatingSauna;
}
