import app, { httpServer } from "./app";
import env from "./env";

const port = env.PORT;
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
httpServer.listen(env.PORT);
