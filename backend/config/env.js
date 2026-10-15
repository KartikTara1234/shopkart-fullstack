import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
dotenv.config({
  path: fileURLToPath(new URL("../../.env", import.meta.url)),
  quiet: true,
});
export function validateAtlasUri(uri = process.env.MONGODB_URI) {
  if (!uri || /[<>]/.test(uri))
    throw new Error(
      "Set your complete MongoDB Atlas MONGODB_URI in the root .env. See README.",
    );
  let parsed;
  try {
    parsed = new URL(uri);
  } catch {
    throw new Error(
      "MONGODB_URI must be a valid MongoDB Atlas connection string.",
    );
  }
  if (
    parsed.protocol !== "mongodb+srv:" ||
    !parsed.hostname.endsWith(".mongodb.net")
  )
    throw new Error(
      "Use the mongodb+srv:// connection string from Atlas Connect > Drivers. Local MongoDB is disabled.",
    );
  if (!parsed.username || !parsed.password || parsed.pathname.length < 2)
    throw new Error(
      "The Atlas URI needs a database username, encoded password and database name (for example /tara).",
    );
}
export function validateEnv() {
  validateAtlasUri();
  if (
    !process.env.JWT_SECRET ||
    process.env.JWT_SECRET.length < 32 ||
    process.env.JWT_SECRET.startsWith("replace-")
  )
    throw new Error(
      "Set JWT_SECRET to a random value of at least 32 characters.",
    );
}
