"use client";

import Link from "next/link";
import Image from "next/image";
import Input from "@/app/components/Input";

export default function SigninPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12 sm:px-8">
      <div className="flex w-full max-w-sm flex-col items-center">
        <h1 className="sr-only">ログイン</h1>
        <div className="mb-10 w-full">
          <Image
            src="/sauna_memory_logo.svg"
            alt="Sauna Memory"
            width={1600}
            height={900}
            unoptimized
            loading="eager"
            className="h-auto w-full"
          />
        </div>
        <form
          aria-label="ログイン"
          noValidate
          onSubmit={(event) => event.preventDefault()}
          className="flex w-full flex-col items-center gap-6"
        >
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
            autoComplete="current-password"
            className="text-base sm:text-sm"
          />
          <button
            type="submit"
            className="mt-2 w-5/6 rounded-md bg-[var(--black)] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ログイン
          </button>
        </form>
        <Link
          href="/signup"
          className="mt-6 rounded-sm text-sm underline underline-offset-4 hover:text-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neutral-600"
        >
          新規登録はこちら
        </Link>
      </div>
    </main>
  );
}
