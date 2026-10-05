import "server-only";

import { redirect } from "next/navigation";
import type { RecordCardProps } from "@/app/components/RecordCard/type";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type HomeRecord = Pick<
  RecordCardProps,
  "title" | "rating" | "body" | "tagNames"
> & {
  id: number;
  visitedAt: Date;
};

export async function getHomeRecords(): Promise<HomeRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/signin");

  // Cookie で検証したユーザーに限定し、取得結果はキャッシュしない。
  const visits = await prisma.visits.findMany({
    where: { user_id: data.user.id },
    orderBy: [{ visited_at: "desc" }, { created_at: "desc" }, { id: "desc" }],
    select: {
      id: true,
      visited_at: true,
      sauna: { select: { name: true } },
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
    title: visit.sauna.name,
    rating: visit.review_rating.toNumber(),
    body: visit.comment,
    tagNames: visit.visit_companions.map(({ companion }) => companion.name),
  }));
}
