"use client";

import Link from "next/link";
import Image from "next/image";
import Input from "@/app/components/Input";
import { signInWithEmail, type signInState } from "./actions";
import { useActionState, useState, type SubmitEvent } from "react";
import { unstable_rethrow } from "next/navigation";

type EmailError = { kind: "required" | "validation"; message: string };

const EMAIL_PATTERN =
  /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;

function validateEmail(value: string): string | undefined {
  if (!value.trim()) return;
  if (Array.from(value).length > 255) {
    return "メールアドレスは255文字以内で入力してください。";
  }
  if (/\s/.test(value) || !EMAIL_PATTERN.test(value)) {
    return "メールアドレスの形式が正しくありません。正しい形式で入力してください。（例：name@example.com）";
  }
}

export default function SigninPage() {
  const [emailError, setEmailError] = useState<EmailError>();
  const [passwordError, setPasswordError] = useState("");
  const [systemError, setSystemError] = useState("");
  const [, formAction, pending] = useActionState(
    async (
      previousState: signInState,
      formData: FormData,
    ): Promise<signInState> => {
      try {
        const result = await signInWithEmail(previousState, formData);
        setSystemError(result.message);
        return result;
      } catch (error) {
        // 成功時の redirect など、Next.js の制御用例外は握りつぶさない。
        unstable_rethrow(error);
        const message =
          "ログイン処理を完了できませんでした。通信環境を確認して、もう一度お試しください。";
        setSystemError(message);
        return { message };
      }
    },
    { message: "" },
  );

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    if (pending) {
      event.preventDefault();
      return;
    }
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const message = validateEmail(email);
    const nextError: EmailError | undefined = !email.trim()
      ? { kind: "required", message: "メールアドレスを入力してください。" }
      : message
        ? { kind: "validation", message }
        : undefined;
    setEmailError(nextError);
    const password = String(formData.get("password") ?? "");
    const nextPasswordError = !password.trim()
      ? "パスワードを入力してください。"
      : "";
    setPasswordError(nextPasswordError);
    setSystemError("");
    if (nextError || nextPasswordError) event.preventDefault();
  };

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
          action={formAction}
          onSubmit={handleSubmit}
          aria-busy={pending}
          className="flex w-full flex-col items-center gap-6"
        >
          <p
            role="alert"
            className="w-full whitespace-pre-line text-sm text-red-600 empty:hidden"
          >
            {pending ? "" : systemError}
          </p>
          <Input
            label="メールアドレス"
            name="email"
            type="email"
            required
            errorMessage={emailError?.message}
            onChange={(event) => {
              const value = event.currentTarget.value;
              setEmailError((current) =>
                current?.kind === "required" && !value.trim()
                  ? current
                  : undefined,
              );
            }}
            onBlur={(event) => {
              const value = event.currentTarget.value;
              const message = validateEmail(value);
              setEmailError((current) => {
                if (current?.kind === "required" && !value.trim()) return current;
                return message ? { kind: "validation", message } : undefined;
              });
            }}
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            disabled={pending}
            className="text-base sm:text-sm"
          />
          <Input
            label="パスワード"
            name="password"
            type="password"
            required
            errorMessage={passwordError}
            onChange={(event) => {
              if (event.currentTarget.value.trim()) setPasswordError("");
            }}
            autoComplete="current-password"
            disabled={pending}
            className="text-base sm:text-sm"
          />
          <button
            type="submit"
            disabled={pending}
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
