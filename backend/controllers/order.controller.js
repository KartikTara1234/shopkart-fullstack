import crypto from "node:crypto";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import { paymentClient } from "../config/razorpay.js";
import { fail } from "../utils/errors.js";
export async function createPayment(req, res) {
  const a = req.body.shippingAddress;
  if (
    !a ||
    !["fullName", "phone", "addressLine1", "city", "state", "pincode"].every(
      (k) => typeof a[k] === "string" && a[k].trim() && a[k].length <= 200,
    )
  )
    fail(400, "Complete all shipping details.");
  if (!/^\d{6}$/.test(a.pincode) || !/^\+?[\d\s-]{10,15}$/.test(a.phone))
    fail(400, "Enter a valid phone and six-digit Indian pincode.");
  await req.user.populate("cart.product");
  if (!req.user.cart.length) fail(400, "Your bag is empty.");
  const items = req.user.cart.map((i) => {
    if (!i.product || i.quantity > i.product.stock)
      fail(400, "An item is no longer available in the requested quantity.");
    return {
      product: i.product._id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
      image: i.product.image,
    };
  });
  const client = paymentClient();
  if (!client)
    fail(
      503,
      "Razorpay Test Mode is not configured. Add test keys to the backend .env to enable payment. Your bag is saved.",
    );
  const shippingAddress = Object.fromEntries(
    ["fullName", "phone", "addressLine1", "city", "state", "pincode"].map(
      (k) => [k, a[k].trim()],
    ),
  );
  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    totalAmount: items.reduce((s, i) => s + i.price * i.quantity, 0),
  });
  try {
    const payment = await client.orders.create({
      amount: Math.round(order.totalAmount * 100),
      currency: "INR",
      receipt: order._id.toString(),
    });
    order.razorpayOrderId = payment.id;
    await order.save();
    res
      .status(201)
      .json({
        success: true,
        shopKartOrderId: order._id,
        razorpayOrderId: payment.id,
        amount: payment.amount,
        currency: "INR",
        key: process.env.RAZORPAY_KEY_ID,
      });
  } catch (error) {
    order.paymentStatus = "FAILED";
    await order.save();
    fail(502, "Payment provider could not create an order. Please try again.");
  }
}
export async function verifyPayment(req, res) {
  const {
    shopKartOrderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;
  const order = await Order.findOne({
    _id: shopKartOrderId,
    user: req.user._id,
  });
  if (!order) fail(404, "Order not found.");
  if (!process.env.RAZORPAY_KEY_SECRET)
    fail(503, "Payments are not configured.");
  if (
    !order.razorpayOrderId ||
    razorpay_order_id !== order.razorpayOrderId ||
    typeof razorpay_payment_id !== "string" ||
    typeof razorpay_signature !== "string" ||
    !/^[a-f0-9]{64}$/.test(razorpay_signature)
  )
    fail(400, "Invalid payment signature.");
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
    .digest();
  if (!crypto.timingSafeEqual(expected, Buffer.from(razorpay_signature, "hex")))
    fail(400, "Invalid payment signature.");
  // A MongoDB transaction makes confirmation, stock decrement and cart clearing atomic.
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const current = await Order.findOne({
        _id: order._id,
        user: req.user._id,
      }).session(session);
      if (current.paymentStatus === "PAID") return;
      for (const i of current.items) {
        const r = await Product.updateOne(
          { _id: i.product, stock: { $gte: i.quantity } },
          { $inc: { stock: -i.quantity } },
          { session },
        );
        if (!r.modifiedCount)
          fail(
            409,
            "Stock changed after payment. Contact support with your payment ID for reconciliation.",
          );
      }
      current.paymentStatus = "PAID";
      current.status = "PLACED";
      current.razorpayPaymentId = razorpay_payment_id;
      await current.save({ session });
      // Remove purchased quantities while preserving anything added after checkout opened.
      const user = await Customer.findById(req.user._id).session(session);
      user.cart = user.cart.flatMap((i) => {
        const bought = current.items.find((p) => p.product.equals(i.product));
        const quantity = i.quantity - (bought?.quantity || 0);
        return quantity > 0 ? [{ product: i.product, quantity }] : [];
      });
      await user.save({ session });
    });
  } finally {
    await session.endSession();
  }
  res.json({ success: true, order: await Order.findById(order._id) });
}
export async function orders(req, res) {
  res.json({
    success: true,
    orders: await Order.find({ user: req.user._id }).sort({ createdAt: -1 }),
  });
}
export async function orderDetail(req, res) {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) fail(404, "Order not found.");
  res.json({ success: true, order });
}
