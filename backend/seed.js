import "./config/env.js";
import mongoose from "mongoose";
import Product from "./models/product.model.js";
import { products } from "./seed-data.js";
import { connectDatabase } from "./config/database.js";
try {
  await connectDatabase();
  for (const p of products)
    await Product.updateOne(
      { name: p.name },
      { $setOnInsert: p },
      { upsert: true },
    );
  console.log("Catalogue seeded without replacing existing data.");
} catch (error) {
  console.error(
    error.name === "Error"
      ? error.message
      : "Atlas catalogue seeding failed. Check database permissions and try again.",
  );
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
