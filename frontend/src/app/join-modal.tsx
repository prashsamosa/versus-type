import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export function JoinModal({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const ref = useRef<HTMLInputElement>(null);
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		try {
			const session = await authClient.getSession();
			if (!session.data) {
				await authClient.signIn.anonymous();
			}
			const roomCode = ref.current?.value.trim();
			router.push(`/pvp/${roomCode}`);
		} catch (_err) {
			setLoading(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[350px]">
				<DialogHeader>
					<DialogTitle className="text-center">Join a Match</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<Input placeholder="Match Code" ref={ref} />
					<Button type="submit" className="w-full mt-4" disabled={loading}>
						{loading ? "Joining..." : "Join Match"}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
