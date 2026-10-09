import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ChevronLeft } from "lucide-react";
import VisitForm from "@/app/components/VisitForm";
import { updateVisit } from "@/app/components/VisitForm/actions";
import { createClient } from "@/lib/supabase/server";


export default async function EditVisitPage({
  params,
}: {
  params: Promise<{ visitId: string; saunaId: string }>;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/signin");

  const { visitId, saunaId } = await params;
  const visitIdNumber = Number(visitId);
  const saunaIdNumber = Number(saunaId);
  const ids: [string, number][] = [
    [visitId, visitIdNumber],
    [saunaId, saunaIdNumber],
  ];

  if (
    ids.some(
      ([rawId, id]) =>
        !/^-?\d+$/.test(rawId) ||
        !Number.isInteger(id) ||
        id < -2147483648 ||
        id > 2147483647,
    )
  ) {
    notFound();
  }

  const visit = await prisma.visits.findUnique({
    where: { id: visitIdNumber, user_id: data.user.id },
    select: {
      visited_at: true,
      comment: true,
      review_rating: true,
      visit_companions: {
        select: { companion: { select: { id: true, name: true } } },
      },
    },
  });
  if (!visit) notFound();

  const sauna = await prisma.saunas.findUnique({
    where: { id: saunaIdNumber },
    select: { id: true, name: true },
  });
  if (!sauna) notFound();

  const today = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Tokyo",
  });


  return (
    <section className="mx-auto w-full max-w-sm py-4 text-[var(--black)] md:max-w-md md:py-20">
      <Link
        href={`/edit/visits/${visitId}/sauna`}
        aria-label="サウナ選択に戻る"
        className="mb-3 flex size-11 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <ChevronLeft size={24} aria-hidden="true" />
      </Link>
      <h1 className="mb-4 text-xl font-bold leading-snug text-neutral-800 [overflow-wrap:anywhere]">
        {sauna.name}
      </h1>
      <VisitForm
        today={today}
        initialValues={{
          visitedAt: visit.visited_at.toISOString().slice(0, 10),
          comment: visit.comment,
          rating: visit.review_rating.toNumber(),
          companions: visit.visit_companions.map(({ companion }) => ({
            id: String(companion.id),
            name: companion.name,
          })),
        }}
        submitAction={updateVisit.bind(null, visitIdNumber, saunaIdNumber)}
        submitLabel="更新する"
        pendingLabel="更新中…"
      />
    </section>
  );
}
