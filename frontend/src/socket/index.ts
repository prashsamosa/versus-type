import type {
	ClientToServerEvents,
	JoinResponse,
	ServerToClientEvents,
} from "@versus-type/shared";
import { io, type Socket } from "socket.io-client";
import { SERVER_URL } from "@/const";

export let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
	null;

export async function setupSocketAndJoin(
	username: string,
	roomCode: string,
): Promise<JoinResponse> {
	return new Promise((resolve, reject) => {
		socket = io(SERVER_URL, { withCredentials: true });

		socket.on("connect", async () => {
			try {
				console.log("Connected to server, joining match as ", {
					username,
					roomCode,
				});
				const response = (await socket?.emitWithAck("pvp:join", {
					username,
					roomCode,
				})) as JoinResponse;
				resolve(response);
			} catch (error) {
				reject(error);
			}
		});

		socket.on("connect_error", (error) => {
			reject(error);
		});
	});
}

export function disconnectSocket() {
	console.log("Disconnecting socket");
	if (socket) {
		socket.disconnect();
		socket = null;
	}
}
