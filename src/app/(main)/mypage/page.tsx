import { redirect } from "next/navigation";
import { isAuthSessionMissingError } from "@supabase/supabase-js";
import SignoutForm from "./SignoutForm";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import AccountInfo from "./AccountInfo";

const MyPage = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    const needSignIn =
      isAuthSessionMissingError(error) ||
      error.code === "session_not_found" ||
      error.code === "session_expired" ||
      error.code === "refresh_token_not_found" ||
      error.code === "refresh_token_already_used" ||
      error.code === "bad_jwt" ||
      error.code === "user_not_found";

    if (needSignIn) {
      redirect("/signin");
    }

    // 通信障害・サーバ障害等
    return (
      <p>
        ログイン状態を確認できませんでした。時間をおいて再度お試しください。
      </p>
    );
  }

  if (!data.user) {
    redirect("/signin");
  }

  const userId = data.user.id;
  let user: { name: string } | null = null;
  let profileLoadFailed = false;

  try {
    user = await prisma.users.findUnique({
      where: { id: userId },
      select: { name: true },
    });
  } catch {
    profileLoadFailed = true;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-bold text-xl">マイページ</h1>
      <section className="flex flex-col gap-3">
        <h2>アカウント情報</h2>
        <hr />

        {profileLoadFailed ? (
          <p>
            アカウント情報を取得できませんでした。時間をおいて再度お試しください。
          </p>
        ) : user ? (
          <AccountInfo userName={user.name} userEmail={data.user.email} />
        ) : (
          <p>アカウント情報が見つかりませんでした。</p>
        )}
      </section>
      <section className="mt-3 flex flex-col gap-3">
        <h2>セキュリティ</h2>
        <hr />
      </section>
      <div className="mx-auto w-full md:max-w-sm">
        <SignoutForm />
      </div>
    </div>
  );
};

export default MyPage;
