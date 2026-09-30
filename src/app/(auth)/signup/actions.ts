"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

type SignUpField = "username" | "email" | "password" | "passwordConfirmation";

export type signUpState = {
  message: string;
  fieldErrors?: Partial<Record<SignUpField, string[]>>;
};

// Users.name / Users.email の VarChar 上限に合わせる。
const USERNAME_MAX_LENGTH = 50;
const EMAIL_MAX_LENGTH = 255;
const EMAIL_PATTERN =
  /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;

export async function signUpNewUser(
  _previousState: signUpState,
  formData: FormData,
): Promise<signUpState> {

  const getText = (field: SignUpField): string => {
    const value = formData.get(field);
    return typeof value === "string" ? value : "";
  };
  const username = getText("username");
  const email = getText("email");
  // パスワードは入力どおりに照合・送信するため、trim しない。
  const password = getText("password");
  const passwordConfirmation = getText("passwordConfirmation");
  const fieldErrors: NonNullable<signUpState["fieldErrors"]> = {};

  if (!username.trim()) {
    fieldErrors.username = ["ユーザ名を入力してください。"];
  } else if (Array.from(username).length > USERNAME_MAX_LENGTH) {
    // PostgreSQL の文字数に合わせ、絵文字などもコードポイント単位で数える。
    fieldErrors.username = ["ユーザ名は50文字以内で入力してください。"];
  }

  if (!email.trim()) {
    fieldErrors.email = ["メールアドレスを入力してください。"];
  } else if (Array.from(email).length > EMAIL_MAX_LENGTH) {
    fieldErrors.email = ["メールアドレスは255文字以内で入力してください。"];
  } else if (/\s/.test(email) || !EMAIL_PATTERN.test(email)) {
    fieldErrors.email = [
      "メールアドレスを確認してください。（例：name@example.com）",
    ];
  }

  if (!password.trim()) {
    fieldErrors.password = ["パスワードを入力してください。"];
  } else {
    const passwordErrors: string[] = [];
    if (Array.from(password).length < 6) {
      passwordErrors.push("パスワードは6文字以上で入力してください。");
    }
    if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[!-/:-@\[-`{-~]/.test(password)
    ) {
      passwordErrors.push(
        "パスワードには半角の英大文字・英小文字・数字・記号（例：!、@、#）をそれぞれ1文字以上含めてください。",
      );
    }
    if (passwordErrors.length > 0) {
      fieldErrors.password = passwordErrors;
    }
  }

  if (!passwordConfirmation.trim()) {
    fieldErrors.passwordConfirmation = ["確認用のパスワードを入力してください。"];
  } else if (password.trim() && password !== passwordConfirmation) {
    fieldErrors.passwordConfirmation = [
      "パスワードが一致していません。同じパスワードをもう一度入力してください。",
    ];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      message: Object.values(fieldErrors).flat().join("\n"),
      fieldErrors,
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });

  if (error) {
    return {
      message: error.message,
    };
  }

  if (!data.user) {
    return {
      message: "ユーザーの作成に失敗しました。",
    };
  }

  try {
    await prisma.users.create({
      data: {
        id: data.user.id,
        email,
        name: username,
      },
    });
  } catch {
    return {
      message: "ユーザー情報の保存に失敗しました。",
    };
  }

  redirect("/home");
}
