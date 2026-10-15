import "./config/env.js";
import { validateEnv } from "./config/env.js";
import mongoose from "mongoose";
import { createApp } from "./app.js";
import { connectDatabase } from "./config/database.js";
try {
  validateEnv();
  await connectDatabase();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
const server = createApp().listen(
  process.env.PORT || 4000,
  process.env.HOST || "127.0.0.1",
  () =>
    console.log(
      `Tara ready: http://localhost:${process.env.PORT || 4000} • MongoDB Atlas connected`,
    ),
);
async function close() {
  server.close();
  await mongoose.disconnect();
  process.exit(0);
}
process.on("SIGINT", close);
process.on("SIGTERM", close);
