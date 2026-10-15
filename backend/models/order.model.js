import mongoose from "mongoose";
export default mongoose.model(
  "Order",
  new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
      },
      items: [
        {
          _id: false,
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          name: String,
          price: Number,
          quantity: Number,
          image: String,
        },
      ],
      shippingAddress: {
        fullName: String,
        phone: String,
        addressLine1: String,
        city: String,
        state: String,
        pincode: String,
      },
      totalAmount: { type: Number, required: true },
      paymentStatus: {
        type: String,
        enum: ["PENDING", "PAID", "FAILED"],
        default: "PENDING",
      },
      status: {
        type: String,
        enum: [
          "PENDING_PAYMENT",
          "PLACED",
          "CONFIRMED",
          "SHIPPED",
          "DELIVERED",
        ],
        default: "PENDING_PAYMENT",
      },
      razorpayOrderId: String,
      razorpayPaymentId: String,
    },
    { timestamps: true },
  ),
);
