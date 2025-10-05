import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SocketErrorPage({ message }: { message: string }) {
	return (
		<div className="flex flex-col justify-center bg-background min-h-screen m-auto">
			<Card className="w-[350px] mx-auto mb-4 p-4">
				<div className="text-center text-2xl font-bold">{message}</div>
			</Card>
			<Button asChild className="w-auto mx-auto">
				<Link href="/">Go to Home</Link>
			</Button>
		</div>
	);
}
