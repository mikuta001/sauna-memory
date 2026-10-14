"use client";

import { useState } from "react";
import YearSelect from "@/app/components/YearSelect";
import type { SelectedYear } from "@/app/components/YearSelect/type";
import SeasonSelect from "@/app/components/SeasonSelect";
import type { Season } from "@/app/components/SeasonSelect/type";
import VisitSummaryDisplay from "@/app/components/VisitSummaryDisplay";
import NewSaunaVisitDisplay from "@/app/components/NewSaunaVisitDisplay";
import HighestRatingSaunaDisplay from "@/app/components/HighestRatingSaunaDisplay";
import SaunaFriendDisplay from "@/app/components/SaunaFriendDisplay";
import AIFeedbackDisplay from "@/app/components/AIFeedbackDisplay";
import { albumSampleData } from "./sample-data";

export default function AlbumContent() {
  const [selectedYear, setSelectedYear] = useState<SelectedYear>(() =>
    new Date().getFullYear(),
  );
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-8 [overflow-wrap:anywhere]">
      <div className="space-y-4">
        <div className="flex justify-end">
          <YearSelect
            id="album-year"
            firstRecordedYear={2024}
            value={selectedYear}
            onChange={setSelectedYear}
          />
        </div>
        <div className="space-y-2 [&>div]:flex-wrap">
          <SeasonSelect value={selectedSeason} onChange={setSelectedSeason} />
        </div>
      </div>

      <section aria-labelledby="album-summary-heading" className="space-y-3">
        <h2 id="album-summary-heading" className="text-lg font-bold">
          Sauna Summary
        </h2>
        <VisitSummaryDisplay {...albumSampleData.summary} />
      </section>

      <section aria-labelledby="album-new-sauna-heading" className="space-y-3">
        <h2 id="album-new-sauna-heading" className="text-lg font-bold">
          New Saunas Visited
        </h2>
        <NewSaunaVisitDisplay visits={albumSampleData.newSaunaVisits} />
      </section>

      <section aria-labelledby="album-rating-heading" className="space-y-3">
        <h2 id="album-rating-heading" className="text-lg font-bold">
          Top-Rated Sauna Visits
        </h2>
        <HighestRatingSaunaDisplay
          records={albumSampleData.highestRatingRecords}
        />
      </section>

      <section aria-labelledby="album-friend-heading" className="space-y-3">
        <h2 id="album-friend-heading" className="text-lg font-bold">
          Sauna Friends
        </h2>
        <SaunaFriendDisplay friend={albumSampleData.friend} />
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
