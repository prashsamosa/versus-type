import { httpServer } from "./app";
import env from "./env";

const port = env.PORT;
httpServer.listen(port, "0.0.0.0", () => {
	console.log(`Server is running on port ${port}`);
});
