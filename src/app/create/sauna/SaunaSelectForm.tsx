"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import SaunaCombobox from "@/app/components/SaunaCombobox";
import type { SaunaOption } from "@/app/components/SaunaCombobox/type";

type SaunaSelectFormProps = {
  options: SaunaOption[];
};

export default function SaunaSelectForm({ options }: SaunaSelectFormProps) {
  const router = useRouter();
  const [saunaId, setSaunaId] = useState<string | null>(null);
  const selectedSauna = options.find((option) => option.id === saunaId);

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedSauna) return;

    // 記録作成画面はこの ID から施設情報を取得する。
    router.push(`/create/sauna/${encodeURIComponent(selectedSauna.id)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SaunaCombobox
        label="サウナ名"
        hideLabel
        options={options}
        value={saunaId}
        onChange={setSaunaId}
      />
      {options.length === 0 && (
        <p role="status" className="text-sm text-neutral-500">
          現在、サウナを選択できません。時間をおいて、もう一度お試しください。
        </p>
      )}
      <button
        type="submit"
        disabled={!selectedSauna}
        className="w-full rounded-md bg-[var(--black)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        次へ
      </button>
    </form>
  );
}
