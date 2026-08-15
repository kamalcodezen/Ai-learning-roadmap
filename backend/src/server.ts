import app from "./app.js";
import env from "./config/env.js";

const server = app.listen(env.PORT, () => {
  console.log(`AI Learning Roadmap API is running on port ${env.PORT}`);
});

export default server;
