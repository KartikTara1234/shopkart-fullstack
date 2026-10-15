// Local development only: a real single-node MongoDB replica set, persisted on disk.
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";
import crypto from "node:crypto";
import net from "node:net";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import "./config/env.js";
import Product from "./models/product.model.js";
import { products } from "./seed-data.js";
import { createApp } from "./app.js";
if (process.env.NODE_ENV === "production")
  throw new Error("Demo mode is local development only.");
const dbPath = fileURLToPath(new URL("../.demo-data", import.meta.url));
await mkdir(dbPath, { recursive: true });
// A stable port is necessary because MongoDB persists replica-set member addresses.
// Fail clearly if another demo is running instead of silently choosing a new port.
await new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.once("error", () =>
    reject(
      new Error(
        "Demo MongoDB port 27029 is busy. Stop the other demo before restarting.",
      ),
    ),
  );
  probe.listen(27029, "127.0.0.1", () => probe.close(resolve));
});
const mongo = await MongoMemoryReplSet.create({
  replSet: { count: 1, storageEngine: "wiredTiger" },
  instanceOpts: [{ dbPath, port: 27029, launchTimeout: 60000 }],
});
process.env.JWT_SECRET =
  process.env.JWT_SECRET?.length >= 32 &&
  !process.env.JWT_SECRET.startsWith("replace-")
    ? process.env.JWT_SECRET
    : crypto.randomBytes(48).toString("hex");
await mongoose.connect(mongo.getUri("shopkart"));
for (const p of products)
  await Product.updateOne(
    { name: p.name },
    { $setOnInsert: p },
    { upsert: true },
  );
const server = createApp().listen(4000, "127.0.0.1", () =>
  console.log(
    "ShopKart local demo: http://localhost:4000 • MongoDB persists in .demo-data/",
  ),
);
async function close() {
  server.close();
  await mongoose.disconnect();
  await mongo.stop();
  process.exit(0);
}
process.on("SIGINT", close);
process.on("SIGTERM", close);
