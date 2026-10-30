"use client";

import { type DeleteVisitButtonProps } from "./type";
import { useState, useActionState } from "react";
import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { deleteVisitRecord, type DeleteState } from "./action";

const DeleteVisitButton = ({ visitId }: DeleteVisitButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteState, formAction, isPending] = useActionState<DeleteState, FormData>(
    deleteVisitRecord,
    { status: "idle", message: "" },
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="self-end text-sm border border-gray-300 rounded-md p-2 inline-flex items-center justify-center bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        削除
      </button>
      <Dialog
        open={isOpen}
        onClose={() => {
          if (!isPending) setIsOpen(false);
        }}
        className="relative z-50"
      >
        <DialogBackdrop className="fixed inset-0 bg-black/40" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow-xl">
            <DialogTitle className="text-lg font-bold text-[var(--black)]">
              この記録を削除しますか？
            </DialogTitle>

            <Description className="text-sm text-gray-600">
              この操作は取り消せません。
            </Description>

            <form action={formAction} aria-busy={isPending} className="space-y-4">
              <input type="hidden" value={visitId} name="id" />
              {deleteState.status === "error" && (
                <p role="alert" className="text-sm text-red-600">
                  {deleteState.message}
                </p>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  data-autofocus
                  disabled={isPending}
                  onClick={() => setIsOpen(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm disabled:cursor-wait disabled:opacity-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-md bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 disabled:cursor-wait disabled:opacity-50"
                >
                  {isPending ? "削除中…" : "削除する"}
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
};

export default DeleteVisitButton;
