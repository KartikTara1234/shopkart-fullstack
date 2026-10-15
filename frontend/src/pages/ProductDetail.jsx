import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Heart,
  Truck,
  ShieldCheck,
  Check,
} from "lucide-react";
import { api, money } from "../services/api";
import { useShop } from "../context/ShopContext";
import { Loading, ErrorState } from "../components/States";
export default function ProductDetail() {
  const { id } = useParams(),
    navigate = useNavigate(),
    { user, changeCart, notify } = useShop();
  const [p, setP] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [saved, setSaved] = useState(false);
  useEffect(() => {
    let active = true;
    setP(null);
    setError("");
    api(`/products/${id}`)
      .then((d) => {
        if (active) setP(d.product);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    if (user)
      api("/wishlist")
        .then((d) => {
          if (active) setSaved(d.wishlist.some((x) => x._id === id));
        })
        .catch(() => {});
    return () => {
      active = false;
    };
  }, [id, user]);
  if (error) return <ErrorState message={error} />;
  if (!p) return <Loading />;
  return (
    <main className="container page">
      <Link className="text-link back" to="/products">
        <ArrowLeft size={16} />
        Back to collection
      </Link>
      <div className="detail-grid">
        <div className="detail-image" style={{ background: p.color }}>
          <img src={p.image} alt={p.name} />
          {p.label && <span className="product-label">{p.label}</span>}
        </div>
        <div className="detail-copy">
          <span className="eyebrow">{p.category} / THE TARA EDIT</span>
          <h1>
            {p.name}
            <span>.</span>
          </h1>
          <div className="detail-price">
            {money(p.price)}
            <span>Inclusive of all taxes</span>
          </div>
          <p>{p.description}</p>
          <span className={`stock ${!p.stock ? "unavailable" : ""}`}>
            <i />
            {p.stock
              ? `In stock · ${p.stock} available`
              : "Currently out of stock"}
          </span>
          <div className="detail-buttons">
            <button
              className="button"
              disabled={busy || !p.stock}
              onClick={async () => {
                if (!user) return navigate("/login");
                setBusy(true);
                try {
                  await changeCart(id);
                } catch (e) {
                  notify(e.message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Adding…" : "Add to your bag"}
              <ArrowUpRight size={20} />
            </button>
            <button
              className={`outline-button ${saved ? "saved" : ""}`}
              disabled={busy}
              aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
              onClick={async () => {
                if (!user) return navigate("/login");
                setBusy(true);
                try {
                  await api(`/wishlist/${id}`, {
                    method: saved ? "DELETE" : "POST",
                  });
                  setSaved(!saved);
                } catch (e) {
                  notify(e.message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Heart size={21} fill={saved ? "currentColor" : "none"} />
            </button>
          </div>
          <div className="detail-benefits">
            <span>
              <Truck size={19} />
              Complimentary delivery
            </span>
            <span>
              <ShieldCheck size={19} />
              Secure Razorpay test checkout
            </span>
            <span>
              <Check size={19} />
              Selected for everyday use
            </span>
          </div>
          <div className="fine-print">
            A considered essential. Product images are illustrative; this is a
            student demonstration store.
          </div>
        </div>
      </div>
    </main>
  );
}
