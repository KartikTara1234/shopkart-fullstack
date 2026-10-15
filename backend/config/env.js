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
  let hosts;
  try {
    const match = uri.match(
      /^(mongodb(?:\+srv)?):\/\/([^/?#]+)(\/[^?#]*)?(\?[^#]*)?$/,
    );
    if (!match) throw new Error();
    const authority = match[2];
    const separator = authority.lastIndexOf("@");
    hosts = authority.slice(separator + 1).split(",");
    parsed = new URL(
      `${match[1]}://${authority.slice(0, separator + 1)}${hosts[0]}${match[3] || "/"}${match[4] || ""}`,
    );
    if (
      !hosts.every((host) =>
        new URL(`mongodb://${host}`).hostname.endsWith(".mongodb.net"),
      )
    )
      throw new Error();
  } catch {
    throw new Error(
      "MONGODB_URI must be a valid MongoDB Atlas connection string.",
    );
  }
  if (
    !["mongodb+srv:", "mongodb:"].includes(parsed.protocol) ||
    (parsed.protocol === "mongodb+srv:" && hosts.length !== 1)
  )
    throw new Error(
      "Use the connection string from Atlas Connect > Drivers. Local MongoDB is disabled.",
    );
  if (
    parsed.protocol === "mongodb:" &&
    parsed.searchParams.get("tls") !== "true"
  )
    throw new Error("Standard Atlas connection strings must include tls=true.");
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
