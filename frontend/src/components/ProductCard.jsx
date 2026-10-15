import { Link, useNavigate } from "react-router-dom";
import { Heart, Plus, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useShop } from "../context/ShopContext";
import { api, money } from "../services/api";
export default function ProductCard({ product: p, saved = false, onSaved }) {
  const { user, changeCart, notify } = useShop(),
    navigate = useNavigate();
  const [busy, setBusy] = useState(false),
    [liked, setLiked] = useState(saved);
  useEffect(() => setLiked(saved), [saved, user]);
  async function wish() {
    if (!user) return navigate("/login");
    setBusy(true);
    try {
      await api(`/wishlist/${p._id}`, { method: liked ? "DELETE" : "POST" });
      setLiked(!liked);
      onSaved?.();
      notify(liked ? "Removed from wishlist." : "Saved to your wishlist.");
    } catch (e) {
      notify(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="product-card">
      <div
        className="product-image"
        style={{ background: p.color || "#dedbd4" }}
      >
        <Link to={`/products/${p._id}`} aria-label={`View ${p.name}`}>
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/favicon.svg";
            }}
          />
        </Link>
        {p.label && <span className="product-label">{p.label}</span>}
        <button
          className={`heart ${liked ? "saved" : ""}`}
          disabled={busy}
          onClick={wish}
          aria-label={`${liked ? "Remove" : "Save"} ${p.name} ${liked ? "from" : "to"} wishlist`}
        >
          <Heart size={17} fill={liked ? "currentColor" : "none"} />
        </button>
        <Link className="quick-view" to={`/products/${p._id}`}>
          A closer look <ArrowUpRight size={17} />
        </Link>
      </div>
      <div className="product-meta">
        <div>
          <small>{p.category}</small>
          <Link to={`/products/${p._id}`}>
            <h3>{p.name}</h3>
          </Link>
          <p>{money(p.price)}</p>
        </div>
        <button
          className="add-button"
          disabled={!p.stock || busy}
          aria-label={`Add ${p.name} to bag`}
          onClick={async () => {
            if (!user) return navigate("/login");
            setBusy(true);
            try {
              await changeCart(p._id);
            } catch (e) {
              notify(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Plus size={20} />
        </button>
      </div>
    </article>
  );
}
