"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

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
					setError(ctx.error.message || "Unexpected error occurred");
				},
			},
		);
	}

	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-4">
			<div className="w-full max-w-sm space-y-4">
				<Button variant="ghost" asChild className="-ml-2">
					<Link href="/">
						<ChevronLeft className="size-4" />
						Back
					</Link>
				</Button>

				<h1 className="text-2xl font-bold mb-7">Sign In</h1>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="your@email.com"
							required
							className="bg-input/60"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							name="password"
							type="password"
							placeholder="••••••••"
							className="bg-input/60"
							required
						/>
					</div>

					{error && (
						<div className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded">
							{error}
						</div>
					)}

					<Button type="submit" disabled={loading} className="w-full mt-2">
						{loading ? "Signing In..." : "Sign In"}
					</Button>
				</form>

				<div className="text-center text-sm">
					<span className="text-muted-foreground">Don't have an account? </span>
					<Link href="/sign-up" className="font-medium hover:underline">
						Sign up
					</Link>
				</div>
			</div>
		</div>
	);
}
