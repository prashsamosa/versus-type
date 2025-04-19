import env from "./env";
import app from "./app";

const port = env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
