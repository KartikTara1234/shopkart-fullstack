import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import router from "./routes/index.js";
export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "https://checkout.razorpay.com"],
          frameSrc: [
            "https://api.razorpay.com",
            "https://checkout.razorpay.com",
          ],
          connectSrc: [
            "'self'",
            "https://api.razorpay.com",
            "https://checkout.razorpay.com",
          ],
          imgSrc: [
            "'self'",
            "data:",
            "https://images.unsplash.com",
            "https://*.razorpay.com",
          ],
          styleSrc: ["'self'", "'unsafe-inline'"],
          upgradeInsecureRequests: null,
        },
      },
    }),
  );
  app.use(express.json({ limit: "32kb" }));
  app.use(cookieParser());
  // Same-origin browser requests plus HttpOnly/SameSite cookies; reject cross-origin writes.
  app.use((req, res, next) => {
    if (
      !["GET", "HEAD", "OPTIONS"].includes(req.method) &&
      req.headers.origin
    ) {
      try {
        if (new URL(req.headers.origin).host !== req.get("host"))
          return res
            .status(403)
            .json({ message: "Cross-origin request rejected." });
      } catch {
        return res.status(403).json({ message: "Invalid origin." });
      }
    }
    next();
  });
  app.get("/api/health", (req, res) =>
    res
      .status(mongoose.connection.readyState === 1 ? 200 : 503)
      .json({
        status: mongoose.connection.readyState === 1 ? "ok" : "unavailable",
        database: "MongoDB",
      }),
  );
  app.use("/api", router);
  // Unprefixed API contracts match the lab handouts, while /api avoids SPA URL collisions.
  app.use((req, res, next) => {
    const isApi = /^\/(customers|products|wishlist|cart|orders)(\/|$)/.test(
      req.path,
    );
    const isPage =
      req.method === "GET" && req.headers.accept?.includes("text/html");
    if (isApi && !isPage) return router(req, res, next);
    next();
  });
  const dist = fileURLToPath(new URL("../frontend/dist/", import.meta.url));
  app.use(express.static(dist));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api/"))
      return res.sendFile(path.join(dist, "index.html"));
    next();
  });
  app.use((req, res) =>
    res.status(404).json({ success: false, message: "Route not found." }),
  );
  app.use((error, req, res, next) => {
    let status = error.status || 500;
    let message = error.message;
    if (error.name === "VersionError") {
      status = 409;
      message = "Your bag changed in another request. Refresh and try again.";
    }
    if (error.code === 11000) {
      status = 409;
      message = "This email already has an account.";
    }
    if (error.name === "ValidationError" || error.name === "CastError") {
      status = 400;
      message =
        error.name === "CastError"
          ? "Invalid identifier."
          : "Invalid or missing fields.";
    }
    if (status >= 500 && status !== 503 && status !== 502)
      message = "Something went wrong. Please try again.";
    res.status(status).json({ success: false, message });
  });
  return app;
}
