"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type signInState = { message: string };

const DEFAULT_ERROR_MESSAGE =
  "ログインできませんでした。時間をおいて再度お試しください。";

export async function signInWithEmail(
  _previousState: signInState,
  formData: FormData,
): Promise<signInState> {

  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email ||
    !password
  ) {
    return { message: "メールアドレスとパスワードを入力してください。" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    switch (error.code) {
      case "invalid_credentials":
        return {
          message:
            "メールアドレスまたはパスワードが正しくありません。入力内容を確認してください。",
        };
      case "email_not_confirmed":
        return {
          message:
            "メールアドレスの確認が完了していません。登録時の確認メールをご確認ください。",
        };
      case "over_request_rate_limit":
        return {
          message:
            "ログインの試行回数が上限に達しました。時間をおいて再度お試しください。",
        };
      default:
        return { message: DEFAULT_ERROR_MESSAGE };
    }
  }

  if (!data.user) {
    return {
      message: DEFAULT_ERROR_MESSAGE,
    };
  }
  redirect("/home");
}
