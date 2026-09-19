import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient();

// 自動採番される正の ID と重ならない、seed 専用の固定 ID。
const saunas = [
  { id: -1, name: "【テスト】ととのいサウナ 渋谷" },
  { id: -2, name: "【テスト】ととのいサウナ 新宿" },
  { id: -3, name: "【テスト】森のサウナ" },
  { id: -4, name: "【テスト】海辺の湯" },
  { id: -5, name: "【テスト】天然温泉 やすらぎ" },
];

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("本番モードではテストデータを投入できません。");
  }

  // 途中で失敗した場合は、今回の投入をすべて取り消す。
  await prisma.$transaction(async (tx) => {
    for (const sauna of saunas) {
      const existing = await tx.saunas.findUnique({
        where: { id: sauna.id },
      });

      if (existing && existing.name !== sauna.name) {
        throw new Error(`施設 ID ${sauna.id} は別のデータに使用されています。`);
      }

      await tx.saunas.upsert({
        where: { id: sauna.id },
        update: {},
        create: { ...sauna, image_path: "/file.svg" },
      });
    }
  });

  console.log(`サウナ施設のテストデータ ${saunas.length} 件を準備しました。`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
