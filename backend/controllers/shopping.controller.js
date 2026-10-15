import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import { fail } from "../utils/errors.js";
export async function wishlist(req, res) {
  await req.user.populate("wishlist");
  res.json({ success: true, wishlist: req.user.wishlist.filter(Boolean) });
}
export async function saveWish(req, res) {
  if (!(await Product.exists({ _id: req.params.productId })))
    fail(404, "Product not found.");
  await Customer.updateOne(
    { _id: req.user._id },
    { $addToSet: { wishlist: req.params.productId } },
  );
  res.json({ success: true });
}
export async function removeWish(req, res) {
  await Customer.updateOne(
    { _id: req.user._id },
    { $pull: { wishlist: req.params.productId } },
  );
  res.json({ success: true });
}
export async function cart(req, res) {
  await req.user.populate("cart.product");
  const items = req.user.cart.filter((i) => i.product);
  res.json({
    success: true,
    cart: items,
    subtotal: items.reduce((s, i) => s + i.product.price * i.quantity, 0),
  });
}
export async function updateCart(req, res) {
  const product = await Product.findById(req.params.productId);
  if (!product) fail(404, "Product not found.");
  const item = req.user.cart.find((i) => i.product.equals(product._id));
  const quantity =
    req.method === "POST" ? (item?.quantity || 0) + 1 : req.body.quantity;
  if (!Number.isInteger(quantity) || quantity < 1)
    fail(400, "Quantity must be a positive integer.");
  if (quantity > product.stock)
    fail(400, "That quantity is not available in stock.");
  if (item) item.quantity = quantity;
  else req.user.cart.push({ product: product._id, quantity });
  await req.user.save();
  await cart(req, res);
}
export async function removeCart(req, res) {
  req.user.cart = req.user.cart.filter(
    (i) => i.product.toString() !== req.params.productId,
  );
  await req.user.save();
  await cart(req, res);
}
