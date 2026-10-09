import type { Companion } from "@/app/components/CompanionInput/type";

export type VisitFormInitialValues = {
  visitedAt: string;
  comment: string;
  companions: Companion[];
  rating: number | null;
};

export type VisitActionState = { message: string };

export type VisitAction = (
  previousState: VisitActionState,
  formData: FormData,
) => Promise<VisitActionState>;

export type VisitFormProps = {
  today: string;
  initialValues: VisitFormInitialValues;
  submitAction: VisitAction;
  submitLabel: string;
  pendingLabel: string;
};
