import { io } from "socket.io-client";
import { SERVER_URL } from "@/const";

export let socket: ReturnType<typeof io> | null = null;

type socketResponse = {
	success: boolean;
	message: string;
};

export async function setupSocketAndJoin(
	username: string,
	matchCode: string,
	isHost: boolean,
): Promise<socketResponse> {
	return new Promise((resolve, reject) => {
		socket = io(SERVER_URL);

		socket.on("connect", async () => {
			try {
				console.log("Connected to server, joining match as ", {
					username,
					matchCode,
					isHost,
				});
				console.log(socket);
				const event = isHost ? "pvp:join-as-host" : "pvp:join";
				const response = (await socket?.emitWithAck(event, {
					username,
					matchCode,
				})) as socketResponse;
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
