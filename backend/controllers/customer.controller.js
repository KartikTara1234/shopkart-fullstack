import bcrypt from "bcrypt";
import Customer from "../models/customer.model.js";
import { fail, safeCustomer } from "../utils/errors.js";
import { generateToken, cookieOptions } from "../utils/generateToken.js";
export async function register(req, res) {
  const { fullName, email, password, phone } = req.body;
  if (
    ![fullName, email, password, phone].every(
      (v) => typeof v === "string" && v.trim(),
    )
  )
    fail(400, "All fields are required.");
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !/^\+?[\d\s-]{10,15}$/.test(phone)
  )
    fail(400, "Enter a valid email and phone number.");
  if (password.length < 6 || Buffer.byteLength(password) > 72)
    fail(400, "Password must be 6–72 bytes long.");
  if (await Customer.exists({ email: email.trim().toLowerCase() }))
    fail(409, "This email already has an account.");
  const customer = await Customer.create({
    fullName,
    email,
    password: await bcrypt.hash(password, 12),
    phone,
  });
  res
    .status(201)
    .json({
      success: true,
      message: "Account created. Please sign in.",
      customer: safeCustomer(customer),
    });
}
export async function login(req, res) {
  const { email, password } = req.body;
  if (typeof email !== "string" || typeof password !== "string")
    fail(400, "Email and password are required.");
  const c = await Customer.findOne({
    email: email.trim().toLowerCase(),
  }).select("+password");
  if (!c || !(await bcrypt.compare(password, c.password)))
    fail(401, "Invalid credentials.");
  generateToken(res, c._id);
  res.json({ success: true, customer: safeCustomer(c) });
}
export function me(req, res) {
  res.json(safeCustomer(req.user));
}
export function logout(req, res) {
  res.clearCookie("token", cookieOptions());
  res.json({ success: true });
}
