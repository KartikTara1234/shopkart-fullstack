import { Router } from "express";
import rateLimit from "express-rate-limit";
import auth from "../middlewares/auth.middleware.js";
import * as customer from "../controllers/customer.controller.js";
import * as product from "../controllers/product.controller.js";
import * as shopping from "../controllers/shopping.controller.js";
import * as order from "../controllers/order.controller.js";
const router = Router();
const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
router.post("/customers/register", loginLimit, customer.register);
router.post("/customers/login", loginLimit, customer.login);
router.get("/customers/me", auth, customer.me);
router.post("/customers/logout", auth, customer.logout);
router.get("/products", product.list);
// Open product creation is explicitly allowed by Lab 03; disable in public deployments.
router.post("/products", product.create);
router.get("/products/:id", product.detail);
router.get("/wishlist", auth, shopping.wishlist);
router.post("/wishlist/:productId", auth, shopping.saveWish);
router.delete("/wishlist/:productId", auth, shopping.removeWish);
router.get("/cart", auth, shopping.cart);
router.post("/cart/:productId", auth, shopping.updateCart);
router.patch("/cart/:productId", auth, shopping.updateCart);
router.delete("/cart/:productId", auth, shopping.removeCart);
router.post("/orders/create-payment-order", auth, order.createPayment);
router.post("/orders/verify-payment", auth, order.verifyPayment);
router.get("/orders", auth, order.orders);
router.get("/orders/:id", auth, order.orderDetail);
export default router;
