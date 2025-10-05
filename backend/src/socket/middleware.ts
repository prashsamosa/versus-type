import type { ioSocket } from "@versus-type/shared";
import type { ExtendedError } from "socket.io";
import { auth } from "../auth/auth";

const userToSocket = new Map();

export async function authWithDuplicateCheck(
	socket: ioSocket,
	next: (err?: ExtendedError) => void,
) {
	const session = await auth.api.getSession({
		headers: new Headers(socket.handshake.headers as Record<string, string>),
	});
	if (!session) {
		return next(new Error("Unauthorized"));
	}
	const userId = session.user.id;
	console.log(`#### ${session.user.name} connected (${userId})`);

	// ensure one connection per userId
	const existingSocketId = userToSocket.get(userId);
	if (existingSocketId && existingSocketId !== socket.id) {
		next(new Error("User is already connected elsewhere"));
		return;
	}

	socket.data.userId = userId;
	userToSocket.set(userId, socket.id);

	next();
}

export function cleanupUserSocket(userId: string) {
	userToSocket.delete(userId);
}
