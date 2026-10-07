import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import SaunaSelectForm from "@/app/components/SaunaSelectForm";

export default async function SaunaSelect() {
  // ビルド時ではなく、アクセス時に施設一覧を取得する。
  await connection();

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
      <h1 className="text-2xl font-semibold">今回のサウナは？</h1>
      <SaunaSelectForm
        options={options}
        selectedValue={null}
        nextPathBase="/create/sauna"
      />
    </section>
  );
}
