"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { validateEmailChange } from "./emailValidation";

type SignOutState = {
  status: "idle" | "error";
  message: string;
};

export async function signOut(): Promise<SignOutState> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (error) {
      return {
        status: "error",
        message: "ログアウトできませんでした。時間をおいて再度お試しください。",
      };
    }
  } catch {
    return {
      status: "error",
      message: "ログアウトできませんでした。時間をおいて再度お試しください。",
    };
  }

  redirect("/signin");
}

export type UpdateNameState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function updateUserName(
  _previousState: UpdateNameState,
  formData: FormData,
): Promise<UpdateNameState> {
  const value = formData.get("name");

  if (typeof value !== "string" || !value.trim()) {
    return { status: "error", message: "名前を入力してください。" };
  }

  const name = value.trim();

  if (Array.from(name).length > 50) {
    return { status: "error", message: "名前は50文字以内で入力してください。" };
  }

  let userId: string;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return {
        status: "error",
        message:
          "ログイン状態を確認できませんでした。再度ログインしてお試しください。",
      };
    }
    userId = data.user.id;
  } catch {
    return {
      status: "error",
      message:
        "ログイン状態を確認できませんでした。再度ログインしてお試しください。",
    };
  }
  try {
    await prisma.users.update({
      where: { id: userId },
      data: { name: name },
    });

    revalidatePath("/mypage");

    return {
      status: "success",
      message: "更新に成功しました。",
    };
  } catch {
    return {
      status: "error",
      message: "更新に失敗しました。時間をおいて、もう一度お試しください。",
    };
  }
}

export type UpdateUserEmailState = {
  status: "idle" | "success" | "pending" | "warning" | "error";
  message: string;
};

export async function updateUserEmail(
  _previousState: UpdateUserEmailState,
  formData: FormData,
): Promise<UpdateUserEmailState> {
  const validation = validateEmailChange(formData.get("email"));
  if (!validation.success) {
    return { status: "error", message: validation.message };
  }
  const email = validation.email;

  const authFailure: UpdateUserEmailState = {
    status: "error",
    message:
      "ログイン状態を確認できませんでした。時間をおいて再度お試しください。",
  };

  let supabase;
  let authUser;
  try {
    supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return authFailure;
    authUser = data.user;
  } catch {
    return authFailure;
  }

  // Authを変更する前に、同期先のプロフィールが存在することを確認する。
  let profile;
  try {
    profile = await prisma.users.findUnique({
      where: { id: authUser.id },
      select: { email: true },
    });
  } catch {
    return {
      status: "error",
      message:
        "アカウント情報を取得できませんでした。時間をおいて再度お試しください。",
    };
  }
  if (!profile) {
    return {
      status: "error",
      message: "アカウント情報が見つからないため、変更できませんでした。",
    };
  }

  // 同一アドレスの再送信ではAuthを更新しない。
  // 前回Authだけ成功したケースでも、DB同期だけを再試行できる。
  const unchanged = authUser.email?.toLowerCase() === email;
  let confirmedEmail = authUser.email;
  if (!unchanged) {
    try {
      const { data, error } = await supabase.auth.updateUser({ email });
      if (error) {
        switch (error.code) {
          case "email_exists":
          case "user_already_exists":
            return {
              status: "error",
              message:
                "このメールアドレスには変更できません。別のアドレスをお試しください。",
            };
          case "email_address_invalid":
          case "validation_failed":
            return {
              status: "error",
              message: "有効なメールアドレスを入力してください。",
            };
          case "over_request_rate_limit":
          case "over_email_send_rate_limit":
            return {
              status: "error",
              message:
                "操作回数が上限に達しました。時間をおいて再度お試しください。",
            };
          default:
            return {
              status: "error",
              message:
                "メールアドレスを変更できませんでした。時間をおいて再度お試しください。",
            };
        }
      }

      // 設定変更などで確認待ちになっても、申請した値をDBに先行保存しない。
      if (data.user?.email?.toLowerCase() !== email) {
        return {
          status: "pending",
          message:
            "メールアドレスの変更はまだ確定していません。確認メールが届いている場合は内容をご確認ください。",
        };
      }
      confirmedEmail = data.user.email;
    } catch {
      // 通信が途切れた場合、Auth側だけ変更済みの可能性もある。
      return {
        status: "error",
        message:
          "変更結果を確認できませんでした。ページを再読み込みして現在のメールアドレスをご確認ください。",
      };
    }
  }

  if (!confirmedEmail) return authFailure;

  let syncFailed = false;
  try {
    if (profile.email !== confirmedEmail) {
      await prisma.users.update({
        where: { id: authUser.id },
        data: { email: confirmedEmail },
      });
    }
  } catch {
    syncFailed = true;
  }

  // 同期失敗時も、画面のログイン用メールはAuthの確定値を表示する。
  revalidatePath("/mypage");
  if (syncFailed) {
    return {
      status: "warning",
      message:
        "ログイン用メールアドレスは変更済みですが、アカウント情報への反映に失敗しました。入力を変えずに「更新」を押すと反映を再試行できます。",
    };
  }
  return {
    status: "success",
    message: unchanged
      ? "現在のメールアドレスと同じです。アカウント情報への反映を確認しました。"
      : "メールアドレスを変更しました。次回から新しいメールアドレスでログインしてください。",
  };
}

export type UpdatePasswordState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Partial<Record<PasswordField, string[]>>;
};

type PasswordField = "password" | "newPassword" | "newPasswordConfirm";

export async function updatePassword(
  _previousState: UpdatePasswordState,
  formData: FormData,
): Promise<UpdatePasswordState> {
  const getText = (field: PasswordField): string => {
    const value = formData.get(field);
    return typeof value === "string" ? value : "";
  };
  const password = getText("password");
  const newPassword = getText("newPassword");
  const newPasswordConfirm = getText("newPasswordConfirm");
  const errors: UpdatePasswordState["errors"] = {};

  // password validation
  if (!password.trim()) {
    errors.password = ["パスワードを入力してください。"];
  }

  if (!newPassword.trim()) {
    errors.newPassword = ["パスワードを入力してください。"];
  } else {
    const passwordErrors: string[] = [];
    if (Array.from(newPassword).length < 6) {
      passwordErrors.push("パスワードは6文字以上で入力してください。");
    }
    if (
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/[0-9]/.test(newPassword) ||
      !/[!-/:-@\[-`{-~]/.test(newPassword)
    ) {
      passwordErrors.push(
        "パスワードには半角の英大文字・英小文字・数字・記号（例：!、@、#）をそれぞれ1文字以上含めてください。",
      );
    }
    if (passwordErrors.length > 0) {
      errors.newPassword = passwordErrors;
    }
  }

  if (!newPasswordConfirm.trim()) {
    errors.newPasswordConfirm = ["確認用のパスワードを入力してください。"];
  } else if (newPassword.trim() && newPassword !== newPasswordConfirm) {
    errors.newPasswordConfirm = [
      "パスワードが一致していません。同じパスワードをもう一度入力してください。",
    ];
  }

  // validationエラーがある場合は処理を止める
  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "入力内容を確認してください。",
      errors,
    };
  }

  try {
    const supabase = await createClient();
    const { data, error: authError } = await supabase.auth.getUser();

    if (authError || !data.user) {
      return {
        status: "error",
        message:
          "ログイン状態を確認できませんでした。再度ログインしてお試しください。",
      };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      current_password: password,
      password: newPassword,
    });

    if (updateError) {
      return {
        status: "error",
        message: "パスワードを変更できませんでした。入力内容をご確認ください。",
      };
    }

    return { status: "success", message: "パスワードを変更しました。" };
  } catch {
    return {
      status: "error",
      message:
        "変更結果を確認できませんでした。時間をおいて再度お試しください。",
    };
  }
}
