"use client";
import { useActionState } from "react";
import { signOut } from "./action";

const SignoutForm = () => {
  const [state, formAction, isPending] = useActionState(signOut, {
    status: "idle",
    message: "",
  });

  return (
    <div>
      <form action={formAction}>
        <button
          type="submit"
          disabled={isPending}
          className="w-full text-sm border border-gray-300 rounded-md bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          {isPending ? "ログアウト中…" : "ログアウト"}
        </button>
        { state.status === "error" && <p className="text-red-500 font-bold">{!isPending && state.message}</p>}
      </form>
    </div>
  );
};

export default SignoutForm;
