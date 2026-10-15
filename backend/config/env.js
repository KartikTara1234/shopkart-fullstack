import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
dotenv.config({
  path: fileURLToPath(new URL("../../.env", import.meta.url)),
  quiet: true,
});
export function validateEnv() {
  if (!process.env.MONGODB_URI)
    throw new Error("Set MONGODB_URI in the root .env. See README.");
  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32 ||
    process.env.JWT_SECRET.startsWith("replace-")
  )
    throw new Error(
      "Set JWT_SECRET to a random value of at least 32 characters.",
    );
}
