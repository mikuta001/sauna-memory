"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Input from "@/app/components/Input";

export default function SignupPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center px-6 py-20 sm:px-8">
      <Link
        href="/signin"
        aria-label="ログイン画面に戻る"
        className="absolute left-4 top-4 flex size-11 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 sm:left-8 sm:top-6"
      >
        <ChevronLeft size={24} aria-hidden="true" />
      </Link>
      <div className="flex w-full max-w-sm flex-col items-center">
        <h1 className="mb-8 text-2xl font-bold">登録する</h1>
        <form
          aria-label="新規アカウント登録"
          noValidate
          onSubmit={(event) => event.preventDefault()}
          className="flex w-full flex-col items-center gap-6"
        >
          <Input
            label="ユーザ名"
            name="username"
            type="text"
            autoComplete="username"
            className="text-base sm:text-sm"
          />
          <Input
            label="メールアドレス"
            name="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            className="text-base sm:text-sm"
          />
          <Input
            label="パスワード"
            name="password"
            type="password"
            autoComplete="new-password"
            className="text-base sm:text-sm"
          />
          <Input
            label="パスワード（確認用）"
            name="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            className="text-base sm:text-sm"
          />
          <button
            type="submit"
            className="mt-2 w-5/6 rounded-md bg-[var(--black)] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            アカウントを作成する
          </button>
        </form>
      </div>
    </main>
  );
}
