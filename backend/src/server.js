import { assertEnv, env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import app from "./app.js";

const bootstrap = async () => {
  assertEnv();
  await connectDB();

  app.listen(env.port, () => {
    console.log(`Backend running at http://localhost:${env.port}`);
  });
};

bootstrap().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
