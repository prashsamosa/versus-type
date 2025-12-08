import type { ioSocket } from "@versus-type/shared";
import type { ExtendedError } from "socket.io";
import { auth } from "../auth/auth";

const userToSocket = new Map();

export async function authWithDuplicateCheck(
	socket: ioSocket,
	next: (err?: ExtendedError) => void,
) {
	const headers = new Headers(
		socket.handshake.headers as Record<string, string>,
	);

	const session = await auth.api.getSession({ headers });

	if (!session) {
		return next(new Error("Unauthorized"));
	}
	const userId = session.user.id;
	const username = session.user.name;

	const existingSocketId = userToSocket.get(userId);
	if (existingSocketId && existingSocketId !== socket.id) {
		next(new Error("User is already connected elsewhere"));
		return;
	}

	socket.data.userId = userId;
	socket.data.username = username;
	userToSocket.set(userId, socket.id);

	next();
}

export function removeFromUserSocket(userId: string) {
	userToSocket.delete(userId);
}

export function clearUserSocketMap() {
	userToSocket.clear();
}
