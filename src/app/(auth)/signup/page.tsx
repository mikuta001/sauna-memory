"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import Input from "@/app/components/Input";
import { signUpNewUser, type signUpState } from "./actions";
import {
  useActionState,
  useState,
  type ChangeEvent,
  type SubmitEvent,
} from "react";
import { unstable_rethrow } from "next/navigation";

type Field = "username" | "email" | "password" | "passwordConfirmation";
type SignupValues = Record<Field, string>;
type FieldError = {
  kind: "required" | "validation" | "confirmation" | "server";
  message: string;
};
type FieldErrors = Partial<Record<Field, FieldError>>;

const REQUIRED_MESSAGES: Record<Field, string> = {
  username: "ユーザ名を入力してください。",
  email: "メールアドレスを入力してください。",
  password: "パスワードを入力してください。",
  passwordConfirmation: "確認用のパスワードを入力してください。",
};
const EMAIL_PATTERN =
  /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;

function validateValue(field: Field, value: string): string | undefined {
  if (!value.trim()) return;

  const length = Array.from(value).length;
  if (field === "username" && length > 50) {
    return "ユーザ名は50文字以内で入力してください。";
  }
  if (field === "email") {
    if (length > 255) return "メールアドレスは255文字以内で入力してください。";
    if (/\s/.test(value) || !EMAIL_PATTERN.test(value)) {
      return "メールアドレスの形式が正しくありません。正しい形式で入力してください。（例：name@example.com）";
    }
  }
  if (field === "password") {
    const messages: string[] = [];
    if (length < 6) messages.push("パスワードは6文字以上で入力してください。");
    if (
      !/[A-Z]/.test(value) ||
      !/[a-z]/.test(value) ||
      !/[0-9]/.test(value) ||
      !/[!-/:-@\[-`{-~]/.test(value)
    ) {
      messages.push(
        "パスワードには半角の英大文字・英小文字・数字・記号（例：!、@、#）をそれぞれ1文字以上含めてください。",
      );
    }
    return messages.length ? messages.join("\n") : undefined;
  }
}

function validateSignup(values: SignupValues): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of Object.keys(REQUIRED_MESSAGES) as Field[]) {
    const value = values[field];
    if (!value.trim()) {
      errors[field] = { kind: "required", message: REQUIRED_MESSAGES[field] };
    } else {
      const message = validateValue(field, value);
      if (message) errors[field] = { kind: "validation", message };
    }
  }
  const { password, passwordConfirmation } = values;
  if (
    password.trim() &&
    passwordConfirmation.trim() &&
    password !== passwordConfirmation
  ) {
    errors.passwordConfirmation = {
      kind: "confirmation",
      message:
        "パスワードが一致していません。同じパスワードをもう一度入力してください。",
    };
  }
  return errors;
}

function getErrorAfterChange(
  currentError: FieldError | undefined,
  value: string,
): FieldError | undefined {
  if (currentError?.kind === "confirmation") {
    return currentError;
  }

  if (currentError?.kind === "required" && !value.trim()) {
    return currentError;
  }

  return undefined;
}

function getErrorAfterBlur(
  currentError: FieldError | undefined,
  value: string,
  validationMessage: string | undefined,
): FieldError | undefined {
  if (currentError?.kind === "required" && !value.trim()) {
    return currentError;
  }

  if (validationMessage) {
    return { kind: "validation", message: validationMessage };
  }

  if (currentError?.kind === "server") {
    return currentError;
  }

  return undefined;
}

export default function SignupPage() {
  const [values, setValues] = useState<SignupValues>({
    username: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [systemError, setSystemError] = useState("");
  const [, formAction, pending] = useActionState(
    async (
      previousState: signUpState,
      formData: FormData,
    ): Promise<signUpState> => {
      try {
        const result = await signUpNewUser(previousState, formData);
        const serverErrors: FieldErrors = {};
        for (const field of Object.keys(REQUIRED_MESSAGES) as Field[]) {
          const messages = result.fieldErrors?.[field];
          if (messages?.length) {
            serverErrors[field] = {
              kind: "server",
              message: messages.join("\n"),
            };
          }
        }
        setErrors(serverErrors);
        setSystemError(Object.keys(serverErrors).length ? "" : result.message);
        return result;
      } catch (error) {
        // 成功時の redirect など、Next.js の制御用例外は握りつぶさない。
        unstable_rethrow(error);
        const message =
          "アカウントを作成できませんでした。時間をおいて再度お試しください。";
        setSystemError(message);
        return { message };
      }
    },
    { message: "" },
  );

  function handleChange(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const error = getErrorAfterChange(current[field], value);
      if (error === current[field]) return current;

      const next = { ...current };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  }

  function handleBlur(field: "email" | "password", value: string) {
    const message = validateValue(field, value);

    setErrors((current) => {
      const error = getErrorAfterBlur(current[field], value, message);
      if (error === current[field]) return current;

      const next = { ...current };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    if (pending) {
      event.preventDefault();
      return;
    }
    const formData = new FormData(event.currentTarget);
    const next = validateSignup({
      username: String(formData.get("username") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      passwordConfirmation: String(formData.get("passwordConfirmation") ?? ""),
    });
    setErrors(next);
    setSystemError("");
    if (Object.keys(next).length) event.preventDefault();
  }

  function inputProps(field: Field) {
    return {
      value: values[field],
      onChange: (event: ChangeEvent<HTMLInputElement>) =>
        handleChange(field, event.currentTarget.value),
      errorMessage: errors[field]?.message,
      required: true,
      disabled: pending,
    };
  }

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
          action={formAction}
          onSubmit={handleSubmit}
          aria-busy={pending}
          className="flex w-full flex-col items-center gap-6"
        >
          <p
            role="alert"
            className="w-full whitespace-pre-line text-sm text-red-600 empty:hidden"
          >
            {systemError}
          </p>
          <Input
            {...inputProps("username")}
            label="ユーザ名"
            name="username"
            type="text"
            autoComplete="username"
            className="text-base sm:text-sm"
          />
          <Input
            {...inputProps("email")}
            onBlur={(event) => handleBlur("email", event.currentTarget.value)}
            label="メールアドレス"
            name="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            className="text-base sm:text-sm"
          />
          <Input
            {...inputProps("password")}
            onBlur={(event) =>
              handleBlur("password", event.currentTarget.value)
            }
            label="パスワード"
            name="password"
            type="password"
            autoComplete="new-password"
            className="text-base sm:text-sm"
          />
          <Input
            {...inputProps("passwordConfirmation")}
            label="パスワード（確認用）"
            name="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            className="text-base sm:text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="mt-2 w-5/6 rounded-md bg-[var(--black)] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            アカウントを作成する
          </button>
        </form>
      </div>
    </main>
  );
}
