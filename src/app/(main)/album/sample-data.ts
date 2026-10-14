import type { HighestRatingSaunaRecord } from "@/app/components/HighestRatingSaunaDisplay/type";
import type { NewSaunaVisit } from "@/app/components/NewSaunaVisitDisplay/type";
import type { SaunaFriend } from "@/app/components/SaunaFriendDisplay/type";
import type { VisitSummaryDisplayProps } from "@/app/components/VisitSummaryDisplay/type";

// 画面構成の確認用。年・季節の選択にかかわらず同じ内容を表示する。
export const albumSampleData: {
  summary: VisitSummaryDisplayProps;
  newSaunaVisits: NewSaunaVisit[];
  highestRatingRecords: HighestRatingSaunaRecord[];
  friend: SaunaFriend;
  feedback: string;
} = {
  summary: {
    periodLabel: "2026年",
    visitCount: 24,
    comparison: { label: "2025年", visitCount: 18 },
  },
  newSaunaVisits: [
    {
      id: "sample-new-forest",
      name: "森のサウナ",
      imageUrl: null,
      visitedAt: "2026-04-12",
    },
    {
      id: "sample-new-seaside",
      name: "海辺の湯",
      imageUrl: null,
      visitedAt: "2026-08-23",
    },
  ],
  highestRatingRecords: [
    {
      id: "sample-rating-forest",
      name: "森のサウナ",
      rating: 5,
      visitedAt: "2026-04-12",
      imagePath: null,
    },
    {
      id: "sample-rating-seaside",
      name: "海辺の湯",
      rating: 5,
      visitedAt: "2026-08-23",
      imagePath: null,
    },
  ],
  friend: { name: "たろう", visitCount: 8 },
  feedback:
    "2026年は24回のサ活を楽しみ、前年より6回多く足を運びました。初めて訪れた森のサウナと海辺の湯は、どちらも最高評価の5点。たろうさんとも8回一緒に過ごしました。お気に入りの場所と新しい出会いが増えた一年ですね。",
};
