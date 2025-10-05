import { useEffect, useState } from "react";
import { registerSocketHandlers } from "@/lib/registerSocketHandlers";
import { socket } from "@/socket";

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
	return (
		<div className="border rounded p-4 mb-4 h-[50vh] w-[70vw] flex items-center justify-center">
			{loading ? (
				<p className="text-center text-gray-500">Loading...</p>
			) : (
				<p className="text-center text-gray-500">
					{passage ? passage : "Internal Server Error"}
				</p>
			)}
		</div>
	);
}
