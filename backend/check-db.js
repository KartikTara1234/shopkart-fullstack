import mongoose from "mongoose";
import { connectDatabase } from "./config/database.js";

try {
  await connectDatabase();
  await mongoose.connection.db.command({ ping: 1 });
  console.log(
    "MongoDB Atlas connection verified. The database answered a ping.",
  );
} catch (error) {
  console.error(
    error.name === "Error"
      ? error.message
      : "Atlas connection check failed. Check database permissions and try again.",
  );
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
