import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";
import { fail } from "../utils/errors.js";
export default async function auth(req, res, next) {
  let payload;
  try {
    payload = jwt.verify(req.cookies.token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch {
    fail(401, "Please sign in to continue.");
  }
  const customer = await Customer.findById(payload.sub);
  if (!customer) fail(401, "Please sign in to continue.");
  req.user = customer;
  next();
}
