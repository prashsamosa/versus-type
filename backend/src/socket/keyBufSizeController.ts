import { monitorEventLoopDelay } from "node:perf_hooks";
import type { ioServer } from "@versus-type/shared";
import { io } from "@/app";

export let KEY_BUFFER_SIZE = 1;

const CHECK_INTERVAL_MS = 5000;
const MAX_BUFFER = 6;
const MIN_BUFFER = 1;

const LAG_UP = 50;
const LAG_DOWN = 25;

let lastHighLoadTs = 0;
const COOLDOWN_MS = 22000; // wait COOLDOWN_MS of stability before lowering buffer

const histogram = monitorEventLoopDelay({ resolution: 5 });
histogram.enable();

setInterval(() => {
	updateKeyBufferSize(io);
}, CHECK_INTERVAL_MS);

function updateKeyBufferSize(io: ioServer) {
	let changed = false;
	const lag = histogram.percentile(95) / 1e6; // ms

	histogram.reset();

	if (lag > LAG_UP) {
		lastHighLoadTs = Date.now();
		if (KEY_BUFFER_SIZE < MAX_BUFFER) {
			KEY_BUFFER_SIZE++;
			changed = true;
			console.warn(
				`### HIGH LOAD (P95: ${lag.toFixed(2)}ms). Buffer size UP: ${KEY_BUFFER_SIZE}`,
			);
		}
	} else if (lag < LAG_DOWN) {
		const timeSinceHighLoad = Date.now() - lastHighLoadTs;
		if (KEY_BUFFER_SIZE > MIN_BUFFER && timeSinceHighLoad > COOLDOWN_MS) {
			KEY_BUFFER_SIZE--;
			changed = true;
			console.log(
				`### STABLE LOAD (P95: ${lag.toFixed(2)}ms). Buffer size DOWN: ${KEY_BUFFER_SIZE}`,
			);
		}
	}

	if (changed) io.emit("pvp:key-buffer-size", KEY_BUFFER_SIZE);
}
