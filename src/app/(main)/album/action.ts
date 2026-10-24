"use server";
import { createClient } from "@/lib/supabase/server";
import { getUserVisitRecords } from "./records";
import { parseAlbumSelection } from "./selection";
import { getAIFeedback } from "./aiFeedback";

export type FeedbackState =
  | { status: "idle" }
  | { status: "success"; feedback: string }
  | { status: "error"; message: string };

export async function generateAIFeedback(
  previousState: FeedbackState,
  formData: FormData,
): Promise<FeedbackState> {
  const year = formData.get("selectedYear");
  const season = formData.get("selectedSeason");

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw new Error();
    }
  } catch {
    return {
      status: "error",
      message:
        "ログイン状態を確認できませんでした。再度ログインしてお試しください。",
    };
  }

  try {
    const selection = parseAlbumSelection({
      year: typeof year === "string" ? year : undefined,
      season: typeof season === "string" ? season : undefined,
    });

    const userRecords = await getUserVisitRecords(selection);

    const aiFeedbackScript = await getAIFeedback(userRecords);

    return { status: "success", feedback: aiFeedbackScript };
  } catch {
    return { status: "error", message: "generate is fail..." };
  }
}
