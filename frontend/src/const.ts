export const SERVER_URL =
	process.env.NEXT_PUBLIC_HTTP_SERVER_URL || "http://localhost:4000";
export const API_URL = `${SERVER_URL}/api`;
export const WS_URL =
	process.env.NEXT_PUBLIC_WS_SERVER_URL || "http://localhost:4001";
export const DEFAULT_KEY_BUFFER_SIZE = 1;
