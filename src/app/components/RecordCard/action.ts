"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type DeleteState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function deleteVisitRecord(
  _previousState: DeleteState,
  formData: FormData,
): Promise<DeleteState> {
  let userId;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return {
        status: "error",
        message:
          "ログイン状態を確認できませんでした。再度ログインしてお試しください。",
      };
    }

    userId = data.user.id;
  } catch {
    return {
      status: "error",
      message:
        "ログイン状態を確認できませんでした。再度ログインしてお試しください。",
    };
  }

  const rawId = formData.get("id");
  const visitId = typeof rawId === "string" ? Number(rawId) : NaN;

  if (!Number.isInteger(visitId) || visitId <= 0 || visitId > 2147483647) {
    return {
      status: "error",
      message: "記録のIDが不正です。選び直してください。",
    };
  }

  try {
    const result = await prisma.$transaction<DeleteState>(async (tx) => {
      const visit = await tx.visits.findUnique({
        where: { id: visitId, user_id: userId },
        select: { id: true },
      });
      if (!visit) {
        return {
          status: "error",
          message: "削除対象が見つかりませんでした。",
        };
      }

      await tx.visit_images.deleteMany({
        where: { visit_id: visitId },
      });
      await tx.visit_companions.deleteMany({
        where: { visit_id: visitId },
      });
      await tx.visits.delete({
        where: {
          id: visitId,
          user_id: userId,
        },
      });

      return {
        status: "success",
        message: "レコードを削除しました。",
      };
    });

    if (result.status == "success") {
      revalidatePath("/home");
      revalidatePath("/album");
    }

    return result;
  } catch {
    return {
      status: "error",
      message:
        "記録の削除に失敗しました。時間をおいて、もう一度お試しください。",
    };
  }
}
