import jwt from "jsonwebtoken";
export const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
});
export function generateToken(res, id) {
  res.cookie(
    "token",
    jwt.sign({ sub: id.toString() }, process.env.JWT_SECRET, {
      expiresIn: "7d",
      algorithm: "HS256",
    }),
    { ...cookieOptions(), maxAge: 7 * 86400000 },
  );
}
