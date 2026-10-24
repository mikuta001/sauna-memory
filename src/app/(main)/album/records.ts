import "server-only";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SEASON_MONTH } from "@/app/constants/season";
import { type AlbumSelection, FIRST_ALBUM_YEAR } from "./selection";

export async function getUserVisitRecords(selection: AlbumSelection) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/signin");

  const { selectedYear, selectedSeason } = selection;
  let dateRanges: { startDate: Date; endDate: Date }[] = [];

  const nowYear = new Date().getFullYear();
  const yearCount = nowYear - FIRST_ALBUM_YEAR + 1;
  const optionalYears = Array.from(
    { length: yearCount },
    (_, index) => nowYear - index,
  );

  if (selectedYear !== "all") {
    dateRanges = [
      {
        startDate: new Date(selectedYear, 0, 1),
        endDate: new Date(selectedYear + 1, 0, 1),
      },
    ];
    if (selectedSeason !== null) {
      dateRanges = [
        {
          startDate: new Date(
            selectedYear,
            SEASON_MONTH[selectedSeason].startMonth - 1,
            1,
          ),
          endDate: new Date(
            selectedYear,
            SEASON_MONTH[selectedSeason].endMonth,
            1,
          ),
        },
      ];
      if (selectedSeason === "winter") {
        dateRanges = [
          {
            startDate: new Date(
              selectedYear,
              SEASON_MONTH[selectedSeason].startMonth - 1,
              1,
            ),
            endDate: new Date(
              selectedYear + 1,
              SEASON_MONTH[selectedSeason].endMonth,
              1,
            ),
          },
        ];
      }
    }
  } else {
    if (selectedSeason !== null) {
      dateRanges = optionalYears.map((year) => {
        return {
          startDate: new Date(
            year,
            SEASON_MONTH[selectedSeason].startMonth - 1,
            1,
          ),
          endDate: new Date(year, SEASON_MONTH[selectedSeason].endMonth, 1),
        };
      });
      if (selectedSeason === "winter") {
        dateRanges = optionalYears.map((year) => {
          return {
            startDate: new Date(
              year,
              SEASON_MONTH[selectedSeason].startMonth - 1,
              1,
            ),
            endDate: new Date(
              year + 1,
              SEASON_MONTH[selectedSeason].endMonth,
              1,
            ),
          };
        });
      }
    }
  }

  const visits = await prisma.visits.findMany({
    where: {
      user_id: data.user.id,
      ...(dateRanges.length > 0
        ? {
            OR: dateRanges.map((dateRange) => {
              return {
                visited_at: {
                  gte: dateRange?.startDate,
                  lt: dateRange?.endDate,
                },
              };
            }),
          }
        : {}),
    },
    select: {
      id: true,
      visited_at: true,
      sauna: { select: { id: true, name: true } },
      review_rating: true,
      comment: true,
      visit_companions: {
        select: { companion: { select: { name: true } } },
      },
    },
  });

  return visits.map((visit) => ({
    id: visit.id,
    visitedAt: visit.visited_at,
    sauna: {
      id: visit.sauna.id,
      name: visit.sauna.name,
    },
    rating: visit.review_rating,
    body: visit.comment,
    tagNames: visit.visit_companions.map(({ companion }) => companion.name),
  }));
}
