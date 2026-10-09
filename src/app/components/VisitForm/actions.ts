"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { validateVisit } from "./validation";
import type { VisitActionState } from "./type";

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

export async function updateVisit(
  visitId: number,
  saunaId: number,
  _previousState: VisitActionState,
  formData: FormData,
): Promise<VisitActionState> {
  if (!Number.isInteger(visitId) || visitId < -2147483648 || visitId > 2147483647) {
    return { message: "記録が見つかりません。選び直してください。" };
  }
  const result = validateVisit(saunaId, formData);
  if (!result.success) return { message: result.message };

  let userId: string;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return { message: "ログイン状態を確認できませんでした。再度ログインしてお試しください。" };
    }
    userId = data.user.id;
  } catch {
    return { message: "ログイン状態を確認できませんでした。再度ログインしてお試しください。" };
  }

  const { visitedAt, comment, rating, companionNames } = result.data;
  try {
    await prisma.$transaction(async (tx) => {
      const visit = await tx.visits.findUnique({
        where: { id: visitId, user_id: userId },
        select: { id: true },
      });
      const sauna = await tx.saunas.findUnique({
        where: { id: saunaId },
        select: { id: true },
      });
      if (!visit || !sauna) throw new Error("更新対象が見つかりません。");

      // 先に対象行を更新してロックし、同じ記録への保存を順番に処理する。
      // 所有者・作成日時・画像は変更しない。
      await tx.visits.update({
        where: { id: visitId, user_id: userId },
        data: {
          sauna_id: saunaId,
          visited_at: visitedAt,
          comment,
          review_rating: rating,
        },
      });

      const companionIds: number[] = [];
      for (const name of companionNames) {
        const existing = await tx.companions.findFirst({
          where: { user_id: userId, name },
          orderBy: { id: "asc" },
        });
        const companion = existing ?? await tx.companions.create({
          data: { user_id: userId, name },
        });
        companionIds.push(companion.id);
      }

      // マスタと他の記録の関連を残し、対象記録の関連だけを置換する。
      await tx.visit_companions.deleteMany({ where: { visit_id: visitId } });
      await tx.visit_companions.createMany({
        data: companionIds.map((companionId) => ({
          visit_id: visitId,
          companion_id: companionId,
        })),
      });
    });
  } catch (error) {
    console.error("更新に失敗しました。", error);
    return { message: "更新に失敗しました。時間をおいて、もう一度お試しください。" };
  }

  revalidatePath("/home");
  redirect("/home");
}
