import type {
	ClientToServerEvents,
	ServerToClientEvents,
	SocketResponse,
} from "@versus-type/types";
import { io, type Socket } from "socket.io-client";
import { SERVER_URL } from "@/const";

export let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
	null;

export async function setupSocketAndJoin(
	username: string,
	matchCode: string,
	isHost: boolean,
): Promise<SocketResponse> {
	return new Promise((resolve, reject) => {
		socket = io(SERVER_URL, { withCredentials: true });

		socket.on("connect", async () => {
			try {
				console.log("Connected to server, joining match as ", {
					username,
					matchCode,
					isHost,
				});
				const event = isHost ? "pvp:join-as-host" : "pvp:join";
				const response = (await socket?.emitWithAck(event, {
					username,
					matchCode,
				})) as SocketResponse;
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
