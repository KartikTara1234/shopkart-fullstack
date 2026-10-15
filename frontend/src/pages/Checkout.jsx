import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { api, money } from "../services/api";
import { useShop } from "../context/ShopContext";
import { Summary } from "./Cart";
import { Empty, Loading, ErrorState } from "../components/States";
let scriptPromise;
function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  if (!scriptPromise)
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = resolve;
      s.onerror = () => {
        scriptPromise = null;
        s.remove();
        reject(
          new Error(
            "Could not load Razorpay. Check your connection and retry.",
          ),
        );
      };
      document.body.appendChild(s);
    });
  return scriptPromise;
}
export default function Checkout() {
  const { user, cart, setCart } = useShop(),
    navigate = useNavigate();
  const [form, setForm] = useState({
      fullName: user.fullName,
      phone: user.phone,
      addressLine1: "",
      city: "",
      state: "",
      pincode: "",
    }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    api("/cart")
      .then((d) => setCart(d.cart))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  async function pay(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await loadRazorpay();
      const d = await api("/orders/create-payment-order", {
        method: "POST",
        body: { shippingAddress: form },
      });
      const payment = new window.Razorpay({
        key: d.key,
        amount: d.amount,
        currency: d.currency,
        order_id: d.razorpayOrderId,
        name: "Tara",
        description: "Your everyday, upgraded · Test Mode",
        prefill: {
          name: form.fullName,
          email: user.email,
          contact: form.phone,
        },
        theme: { color: "#a8e7ce" },
        modal: {
          ondismiss: () => {
            setBusy(false);
            setError(
              "Checkout closed. Your bag is saved; no order has been confirmed.",
            );
          },
        },
        handler: async (response) => {
          try {
            const result = await api("/orders/verify-payment", {
              method: "POST",
              body: { shopKartOrderId: d.shopKartOrderId, ...response },
            });
            const updated = await api("/cart");
            setCart(updated.cart);
            navigate(`/orders/${result.order._id}?success=1`);
          } catch (e) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        },
      });
      payment.on("payment.failed", () => {
        setError("Payment failed. Your bag is still saved. You can try again.");
        setBusy(false);
      });
      payment.open();
    } catch (e) {
      setError(e.message);
      setBusy(false);
    }
  }
  if (loading) return <Loading />;
  if (!cart.length)
    return error ? (
      <ErrorState message={error} />
    ) : (
      <Empty
        title="Your bag is empty."
        text="Add an essential before checking out."
      />
    );
  return (
    <main className="container page">
      <div className="page-title">
        <span className="eyebrow">ONE LAST LITTLE STEP</span>
        <h1>
          Make it yours<span>.</span>
        </h1>
        <p>Complete your delivery details, then pay securely in Test Mode.</p>
      </div>
      <form className="cart-layout" onSubmit={pay}>
        <section className="shipping">
          <h2>Where’s it heading?</h2>
          <p>We currently support Indian shipping addresses.</p>
          <div className="form-grid">
            {[
              ["fullName", "Full name", "name"],
              ["phone", "Phone number", "tel"],
              ["addressLine1", "Street address", "street-address"],
              ["city", "City", "address-level2"],
              ["state", "State", "address-level1"],
              ["pincode", "Pincode", "postal-code"],
            ].map(([key, label, auto]) => (
              <label
                key={key}
                className={key === "addressLine1" ? "span-two" : ""}
              >
                {label}
                <input
                  required
                  disabled={busy}
                  maxLength={200}
                  autoComplete={auto}
                  value={form[key]}
                  type={key === "phone" ? "tel" : "text"}
                  pattern={
                    key === "pincode"
                      ? "[0-9]{6}"
                      : key === "phone"
                        ? "[+0-9 -]{10,15}"
                        : undefined
                  }
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </label>
            ))}
          </div>
          <div className="checkout-items">
            {cart.map((i) => (
              <div key={i.product._id}>
                <span>
                  {i.product.name} × {i.quantity}
                </span>
                <strong>{money(i.product.price * i.quantity)}</strong>
              </div>
            ))}
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="demo-note">
            <LockKeyhole size={18} />
            <p>
              This is a student demo. Razorpay Test Mode only; no real money is
              charged. Payment requires configured test credentials.
            </p>
          </div>
        </section>
        <Summary cart={cart}>
          <button className="button full" disabled={busy}>
            {busy ? "Waiting for payment…" : "Pay with Razorpay"}
            <ArrowUpRight size={17} />
          </button>
          <Link className="summary-back" to="/cart">
            Back to your bag
          </Link>
        </Summary>
      </form>
    </main>
  );
}
