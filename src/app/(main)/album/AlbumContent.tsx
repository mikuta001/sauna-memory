"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import YearSelect from "@/app/components/YearSelect";
import SeasonSelect from "@/app/components/SeasonSelect";
import VisitSummaryDisplay from "@/app/components/VisitSummaryDisplay";
import NewSaunaVisitDisplay from "@/app/components/NewSaunaVisitDisplay";
import HighestRatingSaunaDisplay from "@/app/components/HighestRatingSaunaDisplay";
import SaunaFriendDisplay from "@/app/components/SaunaFriendDisplay";
import AIFeedbackDisplay from "@/app/components/AIFeedbackDisplay";
import { albumSampleData } from "./sample-data";
import {
  buildAlbumQuery,
  FIRST_ALBUM_YEAR,
  type AlbumSelection,
} from "./selection";
import { type VisitSummaryDisplayProps } from "@/app/components/VisitSummaryDisplay/type";
import { type NewSaunaVisitDisplayProps } from "@/app/components/NewSaunaVisitDisplay/type";
import { type HighestRatingSaunaDisplayProps } from "@/app/components/HighestRatingSaunaDisplay/type"; 
import { SaunaFriendDisplayProps } from "@/app/components/SaunaFriendDisplay/type";

type AlbumContentProps = AlbumSelection & {
  visitSummaryData: VisitSummaryDisplayProps,
  newSaunaVisitData: NewSaunaVisitDisplayProps,
  highestRatingSaunaData: HighestRatingSaunaDisplayProps,
  saunaFriendData: SaunaFriendDisplayProps
}

export default function AlbumContent({
  selectedYear,
  selectedSeason,
  visitSummaryData,
  newSaunaVisitData,
  highestRatingSaunaData,
  saunaFriendData
}: AlbumContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateSelection = (selection: AlbumSelection) => {
    if (isPending) return;
    const query = buildAlbumQuery(searchParams.toString(), selection);
    startTransition(() => {
      router.replace(`${pathname}?${query}`, {
        scroll: false,
      });
    });
  };

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-8 [overflow-wrap:anywhere]">
      <div className="space-y-4" aria-busy={isPending}>
        <div className="flex justify-end">
          <YearSelect
            id="album-year"
            firstRecordedYear={FIRST_ALBUM_YEAR}
            value={selectedYear}
            onChange={(year) =>
              updateSelection({ selectedYear: year, selectedSeason })
            }
            disabled={isPending}
          />
        </div>
        <div className="space-y-2 [&>div]:flex-wrap">
          <SeasonSelect
            value={selectedSeason}
            onChange={(season) =>
              updateSelection({ selectedYear, selectedSeason: season })
            }
            disabled={isPending}
          />
        </div>
      </div>

      <section aria-labelledby="album-summary-heading" className="space-y-3">
        <h2 id="album-summary-heading" className="text-lg font-bold">
          Sauna Summary
        </h2>
        <VisitSummaryDisplay {...visitSummaryData} />
      </section>

      <section aria-labelledby="album-new-sauna-heading" className="space-y-3">
        <h2 id="album-new-sauna-heading" className="text-lg font-bold">
          New Saunas Visited
        </h2>
        <NewSaunaVisitDisplay {...newSaunaVisitData} />
      </section>

      <section aria-labelledby="album-rating-heading" className="space-y-3">
        <h2 id="album-rating-heading" className="text-lg font-bold">
          Top-Rated Sauna Visits
        </h2>
        <HighestRatingSaunaDisplay {...highestRatingSaunaData}
        />
      </section>

      <section aria-labelledby="album-friend-heading" className="space-y-3">
        <h2 id="album-friend-heading" className="text-lg font-bold">
          Sauna Friends
        </h2>
        <SaunaFriendDisplay {...saunaFriendData} />
      </section>

      <section aria-labelledby="album-feedback-heading" className="space-y-3">
        <h2 id="album-feedback-heading" className="text-lg font-bold">
          AI Feedback
        </h2>
        <AIFeedbackDisplay feedback={albumSampleData.feedback} />
      </section>
    </div>
  );
}
