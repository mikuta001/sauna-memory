import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import VisitForm from "@/app/components/VisitForm";
import { createVisit } from "@/app/components/VisitForm/actions";

export default async function CreateVisitPage({
  params,
}: {
  params: Promise<{ saunaId: string }>;
}) {
  const { saunaId } = await params;
  // seed の負の ID も許可し、DB の Int の範囲内か確認する。
  const id = Number(saunaId);
  if (
    !/^-?\d+$/.test(saunaId) ||
    !Number.isInteger(id) ||
    id < -2147483648 ||
    id > 2147483647
  ) {
    notFound();
  }

  const sauna = await prisma.saunas.findUnique({
    where: { id },
    select: { id: true, name: true },
  });
  if (!sauna) notFound();

  const today = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Tokyo",
  });

  return (
    <section className="mx-auto w-full max-w-sm py-4 text-[var(--black)] md:max-w-md md:py-20">
      <Link
        href="/create/sauna"
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
        initialValues={{ visitedAt: today, comment: "", companions: [], rating: null }}
        submitAction={createVisit.bind(null, sauna.id)}
        submitLabel="投稿する"
        pendingLabel="投稿中…"
      />
    </section>
  );
}
