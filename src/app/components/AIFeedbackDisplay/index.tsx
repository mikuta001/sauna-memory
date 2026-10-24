import { AIFeedbackDisplayProps } from "./type";
import { useActionState } from "react";
import { generateAIFeedback } from "@/app/(main)/album/action";
import { type FeedbackState } from "@/app/(main)/album/action";

const AIFeedbackDisplay = ({ feedback, selection }: AIFeedbackDisplayProps) => {
  const { selectedYear, selectedSeason } = selection;
  const [state, formAction, isPending] = useActionState<FeedbackState, FormData>(
    generateAIFeedback,
    { status: "idle" },
  );

  return (
    <section className="animate-[visit-summary-rise_1200ms_ease-out]">
      <form action={formAction}>
        <input type="hidden" name="selectedYear" value={selectedYear} />
        {selectedSeason && (
          <input type="hidden" name="selectedSeason" value={selectedSeason} />
        )}
        <button
          disabled={isPending}
          className="w-full text-sm border border-gray-300 rounded-md p-2 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          {isPending ? "generating..." : "generate feedback"}
        </button>
      </form>

      {state.status === "success" && (
        <div className="w-full border border-gray-200 bg-[color:var(--white)] p-4">
          <p className="whitespace-pre-line text-base leading-7 text-[var(--black)]">
            {state.feedback}
          </p>
        </div>
      )}

      {state.status === "error" && (
        <div className="w-full border border-gray-200 bg-[color:var(--white)] p-4">
          <p className="whitespace-pre-line text-base leading-7 text-[var(--black)] text-red-500 font-bold">
            {state.message}
          </p>
        </div>
      )}

    </section>
  );
};

export default AIFeedbackDisplay;
