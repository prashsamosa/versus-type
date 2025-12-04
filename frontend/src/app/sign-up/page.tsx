"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
		<div className="min-h-screen flex flex-col items-center justify-center p-4 gap-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<div className="flex items-center">
						<Button variant="ghost" size="icon" asChild className="-ml-2">
							<Link href="/">
								<ChevronLeft className="size-4" />
							</Link>
						</Button>
						<CardTitle className="text-2xl flex-1 text-center pr-8">
							Sign Up
						</CardTitle>
					</div>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								name="name"
								placeholder="Enter your name"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								placeholder="Enter your email"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								name="password"
								type="password"
								placeholder="Enter your password"
								required
							/>
						</div>

						{error && (
							<div className="text-destructive text-sm text-center">
								{error}
							</div>
						)}

						<Button type="submit" disabled={loading} className="w-full">
							{loading ? "Creating Account..." : "Sign Up"}
						</Button>
					</form>

					<div className="text-center mt-4">
						<Link
							href="/sign-in"
							className="text-sm text-muted-foreground hover:underline"
						>
							Already have an account? Sign in
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
