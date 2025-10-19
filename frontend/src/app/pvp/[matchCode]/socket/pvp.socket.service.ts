import { socket } from "@/socket";
export function sendKeystroke(typedChar: string) {
	socket?.emit("pvp:key-press", typedChar);
}
export function sendBackspace(amount: number) {
	socket?.emit("pvp:backspace", amount);
}
