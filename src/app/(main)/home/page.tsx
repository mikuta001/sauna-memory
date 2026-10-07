import RecordCard from "@/app/components/RecordCard";
import RecordDateDisplay from "@/app/components/RecordDateDisplay";
import { getHomeRecords, type HomeRecord } from "./records";

export default async function Home() {
  const records = await getHomeRecords();
  const groups = new Map<string, HomeRecord[]>();

  for (const record of records) {
    // 保存時と同じ UTC 基準で日付を扱い、同日内は取得順を保つ。
    const dateKey = record.visitedAt.toISOString().slice(0, 10);
    const group = groups.get(dateKey);
    if (group) group.push(record);
    else groups.set(dateKey, [record]);
  }

  const dateGroups = [...groups.entries()].sort(([a], [b]) =>
    b.localeCompare(a),
  );

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-2xl flex-col gap-8 [overflow-wrap:anywhere]">
      {dateGroups.map(([dateKey, dateRecords]) => (
        <section key={dateKey}>
          <RecordDateDisplay visitedAt={new Date(`${dateKey}T00:00:00.000Z`)} />
          <div className="flex flex-col gap-4">
            {dateRecords.map((record) => (
              <RecordCard
                key={record.id}
                title={record.sauna.name}
                rating={record.rating}
                body={record.body}
                tagNames={record.tagNames}
                href={`/edit/visits/${record.id}/sauna`}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}