"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;
    authClient.signIn.email(
      { email, password },
      {
        onRequest: () => {
          setLoading(true);
          setError(null);
        },
        onSuccess: () => {
          setLoading(false);
          router.push("/");
        },
        onError: (ctx) => {
          setLoading(false);
          setError("Unexpected error occurred");
          if (ctx.error.message) setError(ctx.error.message);
        },
      },
    );
  }
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Sign In</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="border border-solid invalid:border-red-400 rounded-full h-10 px-4 w-full"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="border border-solid border-black/[.08] dark:border-white/[.145] rounded-full h-10 px-4 w-full"
            required
          />
          <p
            className={
              "text-center text-red-500 text-xl" + (error || " hidden")
            }
          >
            {error}
          </p>
          <button
            type="submit"
            className={`rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto cursor-pointer ${loading ? "cursor-wait bg-gray-300" : ""}`}
          >
            Sign In
          </button>
        </form>
        <Link href="/sign-up" className="text-xl m-auto">
          Sign up instead
        </Link>
      </main>
    </div>
  );
}
