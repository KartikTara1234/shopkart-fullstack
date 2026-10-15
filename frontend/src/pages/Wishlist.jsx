import { useEffect, useState } from "react";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
import { Loading, Empty, ErrorState } from "../components/States";
export default function Wishlist() {
  const [items, setItems] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  function load() {
    setError("");
    api("/wishlist")
      .then((d) => setItems(d.wishlist))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);
  return (
    <main className="container page">
      <div className="page-title">
        <span className="eyebrow">KEEP THE GOOD ONES CLOSE</span>
        <h1>
          Your wishlist<span>.</span>
        </h1>
        <p>A little collection of things you love. Saved for later.</p>
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={load} />
      ) : !items.length ? (
        <Empty
          title="Something will catch your eye."
          text="Tap the heart on any product to save it here."
        />
      ) : (
        <div className="product-grid">
          {items.map((p) => (
            <ProductCard key={p._id} product={p} saved onSaved={load} />
          ))}
        </div>
      )}
    </main>
  );
}
