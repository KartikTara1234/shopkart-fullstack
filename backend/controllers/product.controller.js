import Product from "../models/product.model.js";
import { fail } from "../utils/errors.js";
export async function list(req, res) {
  const filter = {};
  const { search, category } = req.query;
  if (typeof search === "string" && search.trim())
    filter.name = {
      $regex: search
        .trim()
        .slice(0, 100)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      $options: "i",
    };
  if (typeof category === "string" && category) filter.category = category;
  const products = await Product.find(filter).sort({ createdAt: 1 });
  res.json({ success: true, count: products.length, products });
}
export async function detail(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) fail(404, "Product not found.");
  res.json({ success: true, product });
}
export async function create(req, res) {
  const { name, description, price, category, image, stock } = req.body;
  if (
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price <= 0 ||
    !Number.isInteger(stock) ||
    stock < 0
  )
    fail(400, "Price must be positive and stock a non-negative integer.");
  const product = await Product.create({
    name,
    description,
    price,
    category,
    image,
    stock,
  });
  res.status(201).json({ success: true, product });
}
