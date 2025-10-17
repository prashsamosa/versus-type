import { useEffect, useState } from "react";
import { registerSocketHandlers } from "@/lib/registerSocketHandlers";
import { socket } from "@/socket";
import Passage from "./Passage";

export function PvpGame() {
	const [passage, setPassage] = useState<string>("");
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		if (!socket) return;
		// TODO: if no passage received(should not happen), demand again?
		const unregister = registerSocketHandlers(socket, {
			"pvp:passage": (newPassage) => {
				setPassage(newPassage);
				setLoading(false);
			},
		});
		return unregister;
	}, []);
	if (loading) {
		return (
			<div className="border rounded p-4 mb-4 h-[50vh] w-[70vw] flex items-center justify-center">
				<p className="text-center text-gray-500">Loading...</p>
			</div>
		);
	}
	return <Passage words={passage.split(" ")} />;
}
