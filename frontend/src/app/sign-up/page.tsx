"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { redirect, useRouter } from "next/navigation";

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    authClient.signUp.email(
      { email, password, name },
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
        <h1 className="text-4xl font-bold">Sign Up</h1>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Name"
            className="border border-solid rounded-full h-10 px-4 w-full"
            required
          />
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
            className="border border-solid invalid:border-red-400 rounded-full h-10 px-4 w-full"
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
            Sign Up
          </button>
        </form>
        <Link href="/sign-in" className="text-xl m-auto">
          Sign in instead
        </Link>
      </main>
    </div>
  );
}
