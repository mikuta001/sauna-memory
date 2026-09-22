"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { validateVisit } from "./validation";

export type VisitActionState = { message: string };

// 認証実装後は、サーバー側で取得したログインユーザーの ID に置き換える。
const DEVELOPMENT_USER = {
  id: -1,
  email: "sauna-memory-dev@example.invalid",
  name: "開発用ユーザー",
};

export async function createVisit(
  saunaId: number,
  _previousState: VisitActionState,
  formData: FormData,
): Promise<VisitActionState> {
  if (process.env.NODE_ENV !== "development") {
    return { message: "現在、投稿を利用できません。" };
  }

  const result = validateVisit(saunaId, formData);
  if (!result.success) return { message: result.message };

  const { visitedAt, comment, rating, companionNames } = result.data;

  try {
    const sauna = await prisma.saunas.findUnique({ where: { id: saunaId }, select: { id: true } });
    if (!sauna) return { message: "現在、投稿できません。時間をおいて、もう一度お試しください。" };

    // 記録と同行者をまとめて保存し、途中で失敗したらすべて取り消す。
    await prisma.$transaction(async (tx) => {
      const user = await tx.users.upsert({
        where: { id: DEVELOPMENT_USER.id },
        update: {},
        create: DEVELOPMENT_USER,
      });

      if (user.email !== DEVELOPMENT_USER.email) {
        throw new Error("開発用ユーザーの ID が別のユーザーに使用されています。");
      }

      const companionIds: number[] = [];
      for (const name of companionNames) {
        const existing = await tx.companions.findFirst({
          where: { user_id: user.id, name },
          orderBy: { id: "asc" },
        });
        const companion = existing ?? await tx.companions.create({
          data: { user_id: user.id, name },
        });
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
            create: companionIds.map((companionId) => ({ companion_id: companionId })),
          },
        },
      });
    });
  } catch (error) {
    console.error("保存に失敗しました。", error);
    return { message: "投稿に失敗しました。時間をおいて、もう一度お試しください。" };
  }

  revalidatePath("/home");
  redirect("/home");
}
