import mongoose from "mongoose";
export default mongoose.model(
  "Product",
  new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true },
      description: { type: String, required: true },
      price: { type: Number, required: true, min: 0.01 },
      category: { type: String, required: true },
      image: { type: String, required: true },
      stock: {
        type: Number,
        required: true,
        min: 0,
        validate: Number.isInteger,
      },
      label: String,
      color: String,
    },
    { timestamps: true },
  ),
);
