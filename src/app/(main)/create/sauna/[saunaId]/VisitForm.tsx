"use client";

import { useActionState, useState } from "react";
import { Paperclip } from "lucide-react";
import CompanionInput from "@/app/components/CompanionInput";
import RatingSlider from "@/app/components/RatingSlider";
import type { Companion } from "@/app/components/CompanionInput/type";
import { createVisit } from "./actions";

const MAX_COMMENT_LENGTH = 140;

export default function VisitForm({
  saunaId,
  today,
}: {
  saunaId: number;
  today: string;
}) {
  const [visitedAt, setVisitedAt] = useState(today);
  const [comment, setComment] = useState("");
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [state, formAction, pending] = useActionState(
    createVisit.bind(null, saunaId),
    { message: "" },
  );

  return (
    <form action={formAction} aria-busy={pending}>
      <fieldset disabled={pending} className="min-w-0 space-y-8">
        <input type="hidden" name="rating" value={rating ?? ""} />
        {companions.map((companion) => (
          <input key={companion.id} type="hidden" name="companions" value={companion.name} />
        ))}
        <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-[0_4px_8px_-2px_rgba(120,80,20,0.12),0_12px_24px_-8px_rgba(120,80,20,0.22)]">
          <div className="space-y-1">
            <div className="w-fit shrink-0 rounded-full border border-amber-200/60 bg-amber-100/30 px-3">
              <label htmlFor="visited-at" className="sr-only">訪問日</label>
              <input
                id="visited-at"
                name="visitedAt"
                type="date"
                required
                value={visitedAt}
                max={today}
                onChange={(event) => setVisitedAt(event.target.value)}
                className="min-h-11 w-32 min-w-0 rounded-full bg-transparent text-sm font-normal text-neutral-600 focus-visible:outline-2"
              />
            </div>
          </div>

          <label htmlFor="visit-comment" className="sr-only">感想</label>
          <textarea
            id="visit-comment"
            name="comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={MAX_COMMENT_LENGTH}
            rows={6}
            placeholder="サウナの感想をひとこと…"
            aria-describedby="comment-count"
            className="block min-h-40 w-full resize-y rounded-md bg-transparent px-2 py-2 text-base leading-7 font-normal text-neutral-800 outline-none placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-300"
          />

          <div className="flex items-center justify-between">
            <span id="comment-count" className="text-xs text-neutral-400">{comment.length} / {MAX_COMMENT_LENGTH}</span>
            <button
              type="button"
              disabled
              aria-label="画像を添付（準備中）"
              title="画像の添付は準備中です"
              className="flex size-11 cursor-not-allowed items-center justify-center rounded-full text-neutral-300"
            >
              <Paperclip size={22} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <CompanionInput companions={companions} onChange={setCompanions} />
          <RatingSlider value={rating} onChange={setRating} label="サウナの評価" />
        </div>

        <div className="space-y-3">
          {state.message && <p role="alert" className="text-sm text-red-600">{state.message}</p>} 
          <button type="submit" disabled={pending} className="min-h-12 w-full rounded-lg bg-[var(--black)] text-sm font-bold text-white hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-40">
            {pending ? "投稿中…" : "投稿する"}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
