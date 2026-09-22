import { MAX_RATING } from "@/app/constants/rating";

export type VisitInput = {
  saunaId: number;
  visitedAt: Date;
  comment: string;
  rating: number;
  companionNames: string[];
};

export type ValidationResult =
  | { success: true; data: VisitInput }
  | { success: false; message: string };

export function validateVisit(
  saunaId: number,
  formData: FormData,
  today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tokyo" }),
): ValidationResult {
  const dateText = formData.get("visitedAt");
  const comment = formData.get("comment");
  const ratingText = formData.get("rating");
  const companions = formData.getAll("companions");

  if (!Number.isInteger(saunaId) || saunaId < -2147483648 || saunaId > 2147483647) {
    return { success: false, message: "サウナを選び直してください。" };
  }

  if (typeof dateText !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    return { success: false, message: "訪問日を選択してください。" };
  }
  // 日付だけの値として、時刻を UTC 0 時にそろえて保存する。
  const visitedAt = new Date(`${dateText}T00:00:00.000Z`);
  if (
    Number.isNaN(visitedAt.getTime()) ||
    visitedAt.toISOString().slice(0, 10) !== dateText ||
    dateText < "0001-01-01" || dateText > today
  ) {
    return { success: false, message: "訪問日は今日までの正しい日付を選択してください。" };
  }

  if (typeof comment !== "string" || comment.length > 140) {
    return { success: false, message: "感想は140文字以内で入力してください。" };
  }

  const rating = typeof ratingText === "string" && ratingText.trim() !== "" ? Number(ratingText) : NaN;
  if (!Number.isFinite(rating) || rating < 0 || rating > MAX_RATING || !Number.isInteger(rating * 2)) {
    return { success: false, message: "サウナの評価を0〜5の0.5刻みで選択してください。" };
  }

  if (companions.some((name) => typeof name !== "string" || !name.trim() || name.trim().length > 50)) {
    return { success: false, message: "同行者名は1〜50文字で入力してください。" };
  }
  const companionNames = [...new Set(companions.map((name) => (name as string).trim()))];

  return { success: true, data: { saunaId, visitedAt, comment, rating, companionNames } };
}
