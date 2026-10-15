import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowUpRight, ShieldCheck } from "lucide-react";
import { api, money } from "../services/api";
import { useShop } from "../context/ShopContext";
import { Loading, Empty, ErrorState } from "../components/States";
export function Summary({ cart, children }) {
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  return (
    <aside className="order-summary">
      <span className="eyebrow">THE GOOD THINGS ADD UP</span>
      <h2>Order summary</h2>
      <div>
        <span>Subtotal</span>
        <strong>{money(subtotal)}</strong>
      </div>
      <div>
        <span>Delivery</span>
        <span className="green">On us</span>
      </div>
      <div className="summary-total">
        <strong>Total</strong>
        <strong>{money(subtotal)}</strong>
      </div>
      <p>Inclusive of all taxes. No hidden extras.</p>
      {children}
      <small>
        <ShieldCheck size={15} />
        Secure checkout · Razorpay Test Mode
      </small>
    </aside>
  );
}
export default function Cart() {
  const { cart, setCart, changeCart } = useShop();
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [busy, setBusy] = useState("");
  function load() {
    setLoading(true);
    setError("");
    api("/cart")
      .then((d) => setCart(d.cart))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);
  async function update(id, method, quantity) {
    setBusy(id);
    setError("");
    try {
      await changeCart(id, method, quantity);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }
  return (
    <main className="container page">
      <div className="page-title">
        <span className="eyebrow">GOOD CHOICES, ALL AROUND</span>
        <h1>
          Your bag<span>.</span>
        </h1>
        <p>
          {cart.reduce((s, i) => s + i.quantity, 0)} little upgrades to your
          everyday.
        </p>
      </div>
      {loading ? (
        <Loading />
      ) : !cart.length ? (
        error ? (
          <ErrorState message={error} retry={load} />
        ) : (
          <Empty
            title="Room for something good."
            text="Your bag is empty. Let’s find your next favourite."
          />
        )
      ) : (
        <>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="cart-layout">
            <div className="cart-list">
              {cart.map(({ product: p, quantity }) => (
                <article className="cart-item" key={p._id}>
                  <Link to={`/products/${p._id}`}>
                    <img src={p.image} alt={p.name} />
                  </Link>
                  <div className="cart-item-copy">
                    <small>{p.category}</small>
                    <Link to={`/products/${p._id}`}>
                      <h3>{p.name}</h3>
                    </Link>
                    <span>{money(p.price)}</span>
                    <div className="quantity">
                      <button
                        aria-label={`Decrease ${p.name} quantity`}
                        disabled={quantity === 1 || busy === p._id}
                        onClick={() => update(p._id, "PATCH", quantity - 1)}
                      >
                        <Minus size={14} />
                      </button>
                      <span>{quantity}</span>
                      <button
                        aria-label={`Increase ${p.name} quantity`}
                        disabled={quantity >= p.stock || busy === p._id}
                        onClick={() => update(p._id, "PATCH", quantity + 1)}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    {quantity > p.stock && (
                      <p className="error">
                        Stock changed; reduce quantity or remove this item.
                      </p>
                    )}
                  </div>
                  <div className="cart-end">
                    <strong>{money(p.price * quantity)}</strong>
                    <button
                      disabled={busy === p._id}
                      aria-label={`Remove ${p.name}`}
                      onClick={() => update(p._id, "DELETE")}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
              <Link className="text-link" to="/products">
                Keep exploring <ArrowUpRight size={16} />
              </Link>
            </div>
            <Summary cart={cart}>
              <Link className="button full" to="/checkout">
                Proceed to checkout <ArrowUpRight size={17} />
              </Link>
            </Summary>
          </div>
        </>
      )}
    </main>
  );
}
