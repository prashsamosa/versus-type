import { socket } from "@/socket";
export function sendKeystrokes(chunk: string) {
	socket?.emit("pvp:keystrokes", chunk);
}
export function sendBackspace(amount: number) {
	socket?.emit("pvp:backspace", amount);
}
