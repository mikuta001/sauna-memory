"use client";

import { useActionState, useState } from "react";
import { updatePassword, type UpdatePasswordState } from "./action";

const PasswordChangeForm = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const [showPasswordMessage, setShowPasswordMessage] = useState(false);
  const [showNewPasswordMessage, setShowNewPasswordMessage] = useState(false);
  const [showNewPasswordConfirmMessage, setShowNewPasswordConfirmMessage] =
    useState(false);
  const [showResultMessage, setShowResultMessage] = useState(false);

  const [passwordState, formAction, isPending] = useActionState<
    UpdatePasswordState,
    FormData
  >(
    async (previousState, formData) => {
      const result = await updatePassword(previousState, formData);
      setShowPasswordMessage(true);
      setShowNewPasswordMessage(true);
      setShowNewPasswordConfirmMessage(true);
      setShowResultMessage(true);

      if (result.status === "success") {
        setPassword("");
        setNewPassword("");
        setNewPasswordConfirm("");
        setIsEditing(false);
      }
      return result;
    },
    {
      status: "idle",
      message: "",
    },
  );

  return (
    <div>
      <p
        className={
          passwordState.status === "error" ? "text-red-600" : undefined
        }
      >
        {showResultMessage && !isPending ? passwordState.message : ""}
      </p>  
      {isEditing ? (
        <form action={formAction} className="flex flex-col gap-2">
          <label htmlFor="password">現在のパスワード</label>
          <input
            id="password"
            type="password"
            name="password"
            onChange={(e) => {
              setPassword(e.target.value);
              setShowPasswordMessage(false);
              setShowResultMessage(false);
            }}
            value={password}
            disabled={isPending}
            className="min-w-0 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-[var(--black)] outline-none focus:border-neutral-500 sm:w-auto sm:flex-1"
          />
          {passwordState.errors?.password && showPasswordMessage && (
            <p className="text-red-600">{passwordState.errors.password}</p>
          )}
          <label htmlFor="newPassword">新しいパスワード</label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            onChange={(e) => {
              setNewPassword(e.target.value);
              setShowNewPasswordMessage(false);
              setShowResultMessage(false);
            }}
            value={newPassword}
            disabled={isPending}
            className="min-w-0 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-[var(--black)] outline-none focus:border-neutral-500 sm:w-auto sm:flex-1"
          />
          {passwordState.errors?.newPassword && showNewPasswordMessage && (
            <p className="text-red-600">{passwordState.errors.newPassword}</p>
          )}
          <label htmlFor="newPasswordConfirm">新しいパスワード（確認用）</label>
          <input
            id="newPasswordConfirm"
            name="newPasswordConfirm"
            type="password"
            onChange={(e) => {
              setNewPasswordConfirm(e.target.value);
              setShowNewPasswordConfirmMessage(false);
              setShowResultMessage(false);
            }}
            value={newPasswordConfirm}
            disabled={isPending}
            className="min-w-0 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-[var(--black)] outline-none focus:border-neutral-500 sm:w-auto sm:flex-1"
          />
          {passwordState.errors?.newPasswordConfirm &&
            showNewPasswordConfirmMessage && (
              <p className="text-red-600">
                {passwordState.errors.newPasswordConfirm}
              </p>
            )}

          <div className="mt-3 flex flex-col gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="text-sm border border-gray-300 rounded-md bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
            >
              {isPending ? "更新中…" : "更新"}
            </button>
            <button
              type="button"
              disabled={isPending}
              className="text-sm border border-gray-300 rounded-md bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
              onClick={() => {
                setIsEditing(false);
                setPassword("");
                setNewPassword("");
                setNewPasswordConfirm("");
                setShowPasswordMessage(false);
                setShowNewPasswordMessage(false);
                setShowNewPasswordConfirmMessage(false);
                setShowResultMessage(false);
              }}
            >
              キャンセル
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => {
            setIsEditing(true);
            setShowResultMessage(false);
          }}
          className="w-full text-sm border border-gray-300 rounded-md bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
        >
          パスワードを変更する
        </button>
      )}
    </div>
  );
};

export default PasswordChangeForm;