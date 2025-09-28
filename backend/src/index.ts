import { httpServer } from "./app";
import env from "./env";

const port = env.PORT;
httpServer.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
