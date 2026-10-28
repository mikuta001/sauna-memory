"use client";

import { useActionState, useState } from "react";
import {
  type UpdateNameState,
  type UpdateUserEmailState,
  updateUserName,
  updateUserEmail,
} from "./action";

type AccountInfoProps = {
  userName: string;
  userEmail?: string;
};

const AccountInfo = ({ userName, userEmail }: AccountInfoProps) => {
  const [editingField, setEditingField] = useState<"name" | "email" | null>(
    null,
  );
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail ?? "");
  const [showNameMessage, setShowNameMessage] = useState(false);

  const [nameState, nameUpdate, isPendingName] = useActionState<
    UpdateNameState,
    FormData
  >(
    async (previousState, formData) => {
      const result = await updateUserName(previousState, formData);
      setShowNameMessage(true);

      if (result.status === "success") {
        setEditingField(null);
      }

      return result;
    },
    {
      status: "idle",
      message: "",
    },
  );

  const [showEmailMessage, setShowEmailMessage] = useState(false);
  const [emailState, emailUpdate, isPendingEmail] = useActionState<
    UpdateUserEmailState,
    FormData
  >(
    async (previousState, formData) => {
      const result = await updateUserEmail(previousState, formData);
      setShowEmailMessage(true);

      // 確認待ちは「変更完了」とは区別し、案内を表示する。
      if (result.status === "success" || result.status === "pending") {
        setEditingField(null);
      }
      return result;
    },
    { status: "idle", message: "" },
  );

  return (
    <>
      <h3 id="name-label">名前</h3>
      <div className="px-4">
        {editingField === "name" ? (
          <form action={nameUpdate} className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              name="name"
              aria-labelledby="name-label"
              aria-describedby="name-message"
              aria-invalid={showNameMessage && nameState.status === "error"}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setShowNameMessage(false);
              }}
              disabled={isPendingName}
              className="min-w-0 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-[var(--black)] outline-none focus:border-neutral-500 sm:w-auto sm:flex-1"
            />
            <button
              type="button"
              disabled={isPendingName}
              className="text-sm border border-gray-300 rounded-md bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
              onClick={() => {
                setName(userName);
                setEditingField(null);
                setShowNameMessage(false);
              }}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isPendingName}
              onClick={() => {
                setShowNameMessage(false);
              }}
              className="text-sm border border-gray-300 rounded-md bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
            >
              {isPendingName ? "更新中…" : "更新"}
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 break-all">{userName}</p>
            <button
              type="button"
              className="shrink-0 text-sm border border-gray-300 rounded-md bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
              onClick={() => {
                setName(userName);
                setEditingField("name");
                setShowNameMessage(false);
              }}
              disabled={editingField !== null || isPendingName}
            >
              変更
            </button>
          </div>
        )}
        <p
          id="name-message"
          aria-live="polite"
          className={`mt-2 whitespace-pre-line text-sm empty:hidden ${nameState.status === "error" ? "text-red-600" : "text-gray-700"}`}
        >
          {showNameMessage && !isPendingName ? nameState.message : ""}
        </p>
      </div>
      <h3 id="email-label">メールアドレス</h3>
      <div className="px-4">
        {editingField === "email" ? (
          <form action={emailUpdate} className="flex flex-wrap items-center gap-2">
            <input
              type="email"
              name="email"
              autoComplete="email"
              aria-labelledby="email-label"
              aria-describedby="email-message"
              aria-invalid={showEmailMessage && emailState.status === "error"}
              value={email}
              required
              maxLength={255}
              onChange={(event) => {
                setEmail(event.target.value);
                setShowEmailMessage(false);
              }}
              disabled={isPendingEmail}
              className="min-w-0 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-[var(--black)] outline-none focus:border-neutral-500 sm:w-auto sm:flex-1"
            />
            <button
              type="button"
              disabled={isPendingEmail}
              className="text-sm border border-gray-300 rounded-md bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
              onClick={() => {
                setEmail(userEmail ?? "");
                setEditingField(null);
                setShowEmailMessage(false);
              }}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isPendingEmail}
              className="text-sm border border-gray-300 rounded-md bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
            >
              {isPendingEmail ? "更新中…" : "更新"}
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 break-all">{userEmail}</p>
            <button
              type="button"
              className="shrink-0 text-sm border border-gray-300 rounded-md bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
              onClick={() => {
                setEmail(userEmail ?? "");
                setShowEmailMessage(false);
                setEditingField("email");
              }}
              disabled={editingField !== null || isPendingEmail}
            >
              変更
            </button>
          </div>
        )}
        <p
          id="email-message"
          aria-live="polite"
          className={`mt-2 whitespace-pre-line text-sm empty:hidden ${emailState.status === "error" ? "text-red-600" : "text-gray-700"}`}
        >
          {showEmailMessage && !isPendingEmail ? emailState.message : ""}
        </p>
      </div>
    </>
  );
};

export default AccountInfo;
