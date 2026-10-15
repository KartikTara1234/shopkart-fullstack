import Razorpay from "razorpay";
export function paymentClient() {
  if (
    !process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_") ||
    !process.env.RAZORPAY_KEY_SECRET
  )
    return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}
