"use client";

import { AlertTriangle, ChevronLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfileError({ error }: { error: Error }) {
	return (
		<div className="container max-w-6xl mx-auto py-12 px-4">
			<div className="space-y-10">
				<Button variant="ghost" asChild className="-ml-2">
					<Link href="/">
						<ChevronLeft className="size-4" />
						Home
					</Link>
				</Button>

				<Card className="max-w-md mx-auto">
					<CardContent className="p-8 flex flex-col items-center gap-4 text-center">
						<div className="p-4 rounded-full bg-destructive/10">
							<AlertTriangle className="size-10 text-destructive" />
						</div>
						<h1 className="text-2xl font-bold">Error Loading Profile</h1>
						<p className="text-muted-foreground">{error.message}</p>
						<Button
							onClick={() => window.location.reload()}
							variant="secondary"
						>
							<RotateCcw className="size-4" />
							Try Again
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
