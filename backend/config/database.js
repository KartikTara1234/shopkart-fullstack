import mongoose from "mongoose";
import { validateAtlasUri } from "./env.js";

export async function connectDatabase() {
  validateAtlasUri();
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
  } catch {
    // Driver errors can contain connection details, so never print the raw error.
    throw new Error(
      "Cannot connect to MongoDB Atlas. Check your cluster, database user/password, network access list and internet connection.",
    );
  }
}
