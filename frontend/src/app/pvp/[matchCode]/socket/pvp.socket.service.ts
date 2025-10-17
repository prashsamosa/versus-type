import { socket } from "@/socket";
export function sendKeystroke(typedChar: string) {
	socket?.emit("pvp:key-press", typedChar);
}
