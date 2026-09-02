import { AIFeedbackDisplayProps } from "./type"

const AIFeedbackDisplay = ({feedback}:AIFeedbackDisplayProps ) => {
  return (
    <section className="animate-[visit-summary-rise_1200ms_ease-out] border border-gray-200 bg-[color:var(--white)] p-4">
      <div>
        <p className="whitespace-pre-line text-base leading-7 text-[var(--black)]">
          {feedback}
        </p>
      </div>
    </section>
  )
}

export default AIFeedbackDisplay
