import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { api } from "../services/api";
import { useShop } from "../context/ShopContext";
import useWishlist from "../hooks/useWishlist";
import ProductCard from "../components/ProductCard";
import { Loading, Empty, ErrorState } from "../components/States";
export default function Catalog() {
  const { user } = useShop();
  const savedIds = useWishlist(user);
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [sort, setSort] = useState("featured"),
    [retry, setRetry] = useState(0);
  const search = params.get("search") || "",
    category = params.get("category") || "";
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const timer = setTimeout(
      () =>
        api(`/products?${params}`)
          .then((d) => {
            if (active) setProducts(d.products);
          })
          .catch((e) => {
            if (active) setError(e.message);
          })
          .finally(() => {
            if (active) setLoading(false);
          }),
      200,
    );
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [params, retry]);
  function update(k, v) {
    const p = new URLSearchParams(params);
    v ? p.set(k, v) : p.delete(k);
    setParams(p, { replace: true });
  }
  const sorted = [...products].sort((a, b) =>
    sort === "low"
      ? a.price - b.price
      : sort === "high"
        ? b.price - a.price
        : 0,
  );
  return (
    <main className="container page">
      <div className="page-title">
        <span className="eyebrow">CURATED FOR YOUR EVERYDAY</span>
        <h1>
          The collection<span>.</span>
        </h1>
        <p>Good design. Useful things. Find your kind of essential.</p>
      </div>
      <div className="catalog-tools">
        <label className="search">
          <Search size={19} />
          <input
            aria-label="Search products"
            placeholder="Search for something good…"
            value={search}
            onChange={(e) => update("search", e.target.value)}
          />
          {search && (
            <button
              aria-label="Clear search"
              onClick={() => update("search", "")}
            >
              <X size={16} />
            </button>
          )}
        </label>
        <label className="sort">
          <SlidersHorizontal size={17} />
          <select
            aria-label="Sort products"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </label>
      </div>
      <div className="catalog-categories category-pills">
        {["", "Audio", "Tech", "Lifestyle", "Workspace"].map((c) => (
          <button
            className={category === c ? "active" : ""}
            key={c}
            onClick={() => update("category", c)}
          >
            {c || "All essentials"}
          </button>
        ))}
        <span>{products.length} considered essentials</span>
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={() => setRetry((x) => x + 1)} />
      ) : !products.length ? (
        <Empty
          title="No matches this time."
          text="Try another search or explore a different category."
        />
      ) : (
        <div className="product-grid">
          {sorted.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              saved={savedIds.includes(p._id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
