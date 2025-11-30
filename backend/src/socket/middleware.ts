import type { ioSocket } from "@versus-type/shared";
import type { ExtendedError } from "socket.io";
import { auth } from "../auth/auth";
import { rollingAvgWpmFromDB } from "./dbservice";

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
		console.log("No session found in socket connection");
		return next(new Error("Unauthorized"));
	}
	const userId = session.user.id;
	console.log(`#### ${session.user.name} connected (${userId})`);

	const existingSocketId = userToSocket.get(userId);
	if (existingSocketId && existingSocketId !== socket.id) {
		next(new Error("User is already connected elsewhere"));
		return;
	}

	socket.data.userId = userId;
	socket.data.rollAvgWpm = await rollingAvgWpmFromDB(userId);
	console.log(`ROLLING AVG WPM: ${socket.data.rollAvgWpm}`);
	userToSocket.set(userId, socket.id);

	next();
}

export function cleanupUserSocket(userId: string) {
	userToSocket.delete(userId);
}
