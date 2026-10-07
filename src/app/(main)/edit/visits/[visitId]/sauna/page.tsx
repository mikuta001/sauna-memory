import { notFound, redirect } from "next/navigation";
import SaunaSelectForm from "@/app/components/SaunaSelectForm";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function EditSaunaPage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/signin");

  const { visitId } = await params;
  const id = Number(visitId);
  // seed の負の ID も許可し、DB の Int の範囲内か確認する。
  if (!/^-?\d+$/.test(visitId) || !Number.isInteger(id) || id < -2147483648 || id > 2147483647) {
    notFound();
  }

  const visit = await prisma.visits.findUnique({
    where: { id, user_id: data.user.id },
    select: { sauna_id: true },
  });
  if (!visit) notFound();

  const saunas = await prisma.saunas.findMany({
    select: { id: true, name: true },
    orderBy: [{ name: "asc" }, { id: "asc" }],
  });
  const options = saunas.map((sauna) => ({
    id: String(sauna.id),
    name: sauna.name,
  }));

  return (
    <section className="mx-auto w-full max-w-sm space-y-6 py-8 text-[var(--black)] md:max-w-md md:py-20">
      <h1 className="text-2xl font-semibold">サウナを選択してください</h1>
      <SaunaSelectForm
        options={options}
        selectedValue={String(visit.sauna_id)}
        nextPathBase={`/edit/visits/${visitId}/sauna`}
      />
    </section>
  );
}
