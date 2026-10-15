import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import request from "supertest";
import bcrypt from "bcrypt";
import { createApp } from "../backend/app.js";
import Customer from "../backend/models/customer.model.js";
import Product from "../backend/models/product.model.js";
import Order from "../backend/models/order.model.js";
let mongo, app, agent, other, product;
const shippingAddress = {
  fullName: "Test Customer",
  phone: "9876543210",
  addressLine1: "22 MG Road",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560001",
};
before(async () => {
  process.env.JWT_SECRET = crypto.randomBytes(48).toString("hex");
  process.env.RAZORPAY_KEY_SECRET = crypto.randomBytes(24).toString("hex");
  delete process.env.RAZORPAY_KEY_ID;
  mongo = await MongoMemoryReplSet.create({
    replSet: { count: 1 },
    instanceOpts: [{ launchTimeout: 60000 }],
  });
  await mongoose.connect(mongo.getUri());
  app = createApp();
  agent = request.agent(app);
  other = request.agent(app);
});
after(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});
test("six-lab API flow and failure cases", async (t) => {
  await t.test(
    "authentication rejects anonymous requests and stores only bcrypt hashes",
    async () => {
      await request(app).get("/api/customers/me").expect(401);
      await agent
        .post("/api/customers/register")
        .send({
          fullName: "Test Customer",
          email: "test@example.com",
          password: "secret123",
          phone: "9876543210",
        })
        .expect(201);
      await agent
        .post("/api/customers/register")
        .send({
          fullName: "Test",
          email: "test@example.com",
          password: "secret123",
          phone: "9876543210",
        })
        .expect(409);
      await agent
        .post("/api/customers/login")
        .send({ email: "test@example.com", password: "incorrect" })
        .expect(401);
      const r = await agent
        .post("/api/customers/login")
        .send({ email: "test@example.com", password: "secret123" })
        .expect(200);
      assert.match(r.headers["set-cookie"][0], /HttpOnly/);
      assert.equal(r.body.customer.password, undefined);
      const c = await Customer.findOne({ email: "test@example.com" }).select(
        "+password",
      );
      assert.ok(await bcrypt.compare("secret123", c.password));
      const profile = await agent.get("/api/customers/me").expect(200);
      assert.equal(profile.body.email, "test@example.com");
      assert.equal(profile.body.password, undefined);
    },
  );
  await t.test(
    "product validation, literal search and category filters",
    async () => {
      await request(app)
        .post("/api/products")
        .send({ price: -1, stock: 1 })
        .expect(400);
      const r = await request(app)
        .post("/products")
        .send({
          name: "Studio [Wireless]",
          description: "A test product",
          price: 4999,
          stock: 3,
          category: "Audio",
          image: "/favicon.svg",
        })
        .expect(201);
      product = r.body.product;
      const r2 = await request(app)
        .get("/api/products?search=%5Bwireless%5D&category=Audio")
        .expect(200);
      assert.equal(r2.body.count, 1);
      await request(app).get("/api/products/invalid").expect(400);
      await request(app)
        .get(`/api/products/${new mongoose.Types.ObjectId()}`)
        .expect(404);
    },
  );
  await t.test("wishlist is persistent, idempotent and private", async () => {
    await agent.post(`/api/wishlist/${product._id}`).expect(200);
    await agent.post(`/api/wishlist/${product._id}`).expect(200);
    const r = await agent.get("/api/wishlist").expect(200);
    assert.equal(r.body.wishlist.length, 1);
    await other.get("/api/wishlist").expect(401);
    await agent.delete(`/api/wishlist/${product._id}`).expect(200);
    assert.equal((await agent.get("/api/wishlist")).body.wishlist.length, 0);
  });
  await t.test(
    "cart increments, validates stock and refuses fractional quantities",
    async () => {
      await agent.post(`/api/cart/${product._id}`).expect(200);
      await agent.post(`/api/cart/${product._id}`).expect(200);
      assert.equal((await agent.get("/api/cart")).body.cart[0].quantity, 2);
      await agent
        .patch(`/api/cart/${product._id}`)
        .send({ quantity: 4 })
        .expect(400);
      await agent
        .patch(`/api/cart/${product._id}`)
        .send({ quantity: 1.5 })
        .expect(400);
      await agent
        .patch(`/api/cart/${product._id}`)
        .send({ quantity: 1 })
        .expect(200);
    },
  );
  await t.test(
    "checkout validates address; unavailable keys preserve cart",
    async () => {
      await agent.post("/api/orders/create-payment-order").send({}).expect(400);
      await agent
        .post("/api/orders/create-payment-order")
        .send({ shippingAddress, totalAmount: 1 })
        .expect(503);
      assert.equal((await agent.get("/api/cart")).body.cart.length, 1);
    },
  );
  await t.test(
    "fake signatures fail, valid HMAC confirms atomically, repeat callbacks are idempotent",
    async () => {
      const customer = await Customer.findOne({ email: "test@example.com" });
      const order = await Order.create({
        user: customer._id,
        items: [
          {
            product: product._id,
            name: product.name,
            price: product.price,
            quantity: 1,
          },
        ],
        shippingAddress,
        totalAmount: 4999,
        razorpayOrderId: "order_test_fixture",
      });
      const payload = {
        shopKartOrderId: order._id.toString(),
        razorpay_order_id: "order_test_fixture",
        razorpay_payment_id: "pay_test_fixture",
        razorpay_signature: "0".repeat(64),
      };
      await agent.post("/api/orders/verify-payment").send(payload).expect(400);
      assert.equal((await agent.get("/api/cart")).body.cart.length, 1);
      await other
        .post("/api/customers/register")
        .send({
          fullName: "Other",
          email: "other@example.com",
          password: "secret123",
          phone: "9876543211",
        })
        .expect(201);
      await other
        .post("/api/customers/login")
        .send({ email: "other@example.com", password: "secret123" })
        .expect(200);
      await other.get(`/api/orders/${order._id}`).expect(404);
      await other.post("/api/orders/verify-payment").send(payload).expect(404);
      payload.razorpay_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update("order_test_fixture|pay_test_fixture")
        .digest("hex");
      await agent.post("/api/orders/verify-payment").send(payload).expect(200);
      await agent.post("/api/orders/verify-payment").send(payload).expect(200);
      assert.equal((await Product.findById(product._id)).stock, 2);
      assert.equal((await agent.get("/api/cart")).body.cart.length, 0);
      const history = await agent.get("/api/orders").expect(200);
      assert.equal(history.body.orders[0].status, "PLACED");
      await Product.updateOne({ _id: product._id }, { $set: { price: 6000 } });
      assert.equal((await Order.findById(order._id)).items[0].price, 4999);
    },
  );
  await t.test("cross-origin writes and logout protection", async () => {
    await agent
      .post("/api/customers/logout")
      .set("Origin", "https://untrusted.example")
      .expect(403);
    await agent.post("/api/customers/logout").expect(200);
    await agent.get("/api/customers/me").expect(401);
  });
});
