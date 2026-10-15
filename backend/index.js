import "./config/env.js";
import { validateEnv } from "./config/env.js";
import mongoose from "mongoose";
import { createApp } from "./app.js";
validateEnv();
await mongoose.connect(process.env.MONGODB_URI);
const server = createApp().listen(
  process.env.PORT || 4000,
  process.env.HOST || "127.0.0.1",
  () =>
    console.log(`ShopKart ready: http://localhost:${process.env.PORT || 4000}`),
);
async function close() {
  server.close();
  await mongoose.disconnect();
  process.exit(0);
}
process.on("SIGINT", close);
process.on("SIGTERM", close);
