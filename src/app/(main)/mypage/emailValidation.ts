// 登録画面と同じ形式を許容し、Users.emailの上限に合わせる。
const EMAIL_PATTERN =
  /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/;

type EmailValidationResult =
  | { success: true; email: string }
  | { success: false; message: string };

export function validateEmailChange(value: unknown): EmailValidationResult {
  if (typeof value !== "string" || !value.trim()) {
    return { success: false, message: "メールアドレスを入力してください。" };
  }
  const email = value.trim().toLowerCase();
  if (Array.from(email).length > 255) {
    return { success: false, message: "メールアドレスは255文字以内で入力してください。" };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { success: false, message: "メールアドレスを確認してください。（例：name@example.com）" };
  }
  return { success: true, email };
}
