"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function SignUp() {
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

				<h1 className="text-2xl font-bold mb-7">Create Account</h1>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							name="name"
							placeholder="Your name"
							className="bg-input/60"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="your@email.com"
							className="bg-input/60"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							name="password"
							type="password"
							placeholder="••••••••"
							required
							className="bg-input/60"
						/>
					</div>

					{error && (
						<div className="text-destructive text-sm text-center bg-destructive/10 p-2 rounded">
							{error}
						</div>
					)}

					<Button type="submit" disabled={loading} className="w-full mt-2">
						{loading ? "Creating Account..." : "Sign Up"}
					</Button>
				</form>

				<div className="text-center text-sm">
					<span className="text-muted-foreground">
						Already have an account?{" "}
					</span>
					<Link href="/sign-in" className="font-medium hover:underline">
						Sign in
					</Link>
				</div>
			</div>
		</div>
	);
}
