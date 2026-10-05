"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { validateVisit } from "./validation";

export type VisitActionState = { message: string };

export async function createVisit(
  saunaId: number,
  _previousState: VisitActionState,
  formData: FormData,
): Promise<VisitActionState> {
  const result = validateVisit(saunaId, formData);
  if (!result.success) return { message: result.message };

  const { visitedAt, comment, rating, companionNames } = result.data;

  let userId: string;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return {
        message:
          "ログイン状態を確認できませんでした。再度ログインしてお試しください。",
      };
    }
    userId = data.user.id;
  } catch {
    return {
      message:
        "ログイン状態を確認できませんでした。再度ログインしてお試しください。",
    };
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!user)
      return { message: "ユーザー情報が見つからないため、投稿できません。" };

    const sauna = await prisma.saunas.findUnique({
      where: { id: saunaId },
      select: { id: true },
    });
    if (!sauna)
      return {
        message: "現在、投稿できません。時間をおいて、もう一度お試しください。",
      };

    // 記録と同行者をまとめて保存し、途中で失敗したらすべて取り消す。
    await prisma.$transaction(async (tx) => {
      const companionIds: number[] = [];
      for (const name of companionNames) {
        const existing = await tx.companions.findFirst({
          where: { user_id: user.id, name },
          orderBy: { id: "asc" },
        });
        const companion =
          existing ??
          (await tx.companions.create({
            data: { user_id: user.id, name },
          }));
        companionIds.push(companion.id);
      }

      await tx.visits.create({
        data: {
          sauna_id: saunaId,
          user_id: user.id,
          visited_at: visitedAt,
          comment,
          review_rating: rating,
          visit_companions: {
            create: companionIds.map((companionId) => ({
              companion_id: companionId,
            })),
          },
        },
      });
    });
  } catch (error) {
    console.error("保存に失敗しました。", error);
    return {
      message: "投稿に失敗しました。時間をおいて、もう一度お試しください。",
    };
  }

  revalidatePath("/home");
  redirect("/home");
}
