import "./config/env.js";
import mongoose from "mongoose";
import Product from "./models/product.model.js";
import { products } from "./seed-data.js";
if (!process.env.MONGODB_URI) throw new Error("Configure MONGODB_URI first.");
await mongoose.connect(process.env.MONGODB_URI);
for (const p of products)
  await Product.updateOne(
    { name: p.name },
    { $setOnInsert: p },
    { upsert: true },
  );
console.log("Catalogue seeded without replacing existing data.");
await mongoose.disconnect();
