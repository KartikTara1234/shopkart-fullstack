import BrandMark from "../components/BrandMark";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Truck,
  ShieldCheck,
  PackageCheck,
  Headphones,
} from "lucide-react";
import { api } from "../services/api";
import { useShop } from "../context/ShopContext";
import useWishlist from "../hooks/useWishlist";
import ProductCard from "../components/ProductCard";
import { Loading, ErrorState } from "../components/States";
export default function Home({ account = false }) {
  const [products, setProducts] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const { user } = useShop();
  const savedIds = useWishlist(user);
  function load() {
    setError("");
    setLoading(true);
    api("/products")
      .then((d) => setProducts(d.products))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);
  return (
    <>
      {account && (
        <section className="account-banner container">
          <span className="eyebrow">YOUR LITTLE CORNER</span>
          <h2>Welcome back, {user?.fullName}.</h2>
          <p>
            {user?.email} · {user?.phone}
          </p>
          <Link to="/orders">
            View your orders <ArrowUpRight size={15} />
          </Link>
        </section>
      )}
      <section className="hero container">
        <div className="hero-copy">
          <span className="eyebrow">
            <i />
            THE TARA EDIT / BY KARTIK TARA
          </span>
          <h1>
            Life, in your
            <br />
            own <em>rhythm.</em>
          </h1>
          <p>
            Things that fit your days. And your taste.
            <br />
            Audio, objects and everyday upgrades, with a point of view.
          </p>
          <Link className="button" to="/products">
            Find your rhythm <ArrowUpRight size={19} />
          </Link>
          <div className="hero-foot">
            <span className="collection-seal">
              KT<span>01</span>
            </span>
            <span>
              Less noise.
              <br />
              <b>More of what matters.</b>
            </span>
          </div>
        </div>
        <div className="hero-visual">
          <span className="hero-index">THE LISTENING ROOM — EDIT 01</span>
          <img
            className="hero-headphones"
            src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=90"
            alt="Studio headphones on a warm neutral background"
          />
          <span className="vertical-note">DESIGNED FOR YOUR EVERYDAY</span>
          <div className="glass-card">
            <span>
              <small>SOUND ON. WORLD OFF.</small>
              <strong>Studio Wireless</strong>
              <b>
                ₹4,999 <span> / Pure listening.</span>
              </b>
            </span>
            <Link to="/products?category=Audio" aria-label="Explore audio">
              <ArrowUpRight size={24} />
            </Link>
          </div>
          <div className="hero-signature">
            <BrandMark />
            <span>
              THE TARA
              <br />
              SELECTION
            </span>
          </div>
        </div>
      </section>
      <div className="values container">
        <span>
          <Truck size={20} />
          Free delivery on every order
        </span>
        <span>
          <ShieldCheck size={20} />
          Secure test checkout
        </span>
        <span>
          <PackageCheck size={20} />
          Thoughtfully selected essentials
        </span>
        <span>
          <Headphones size={20} />
          Made for the everyday
        </span>
      </div>
      <section className="collection container">
        <div className="section-heading">
          <div>
            <span className="eyebrow">THE GOOD STUFF</span>
            <h2>
              The everyday. <span>With an edge.</span>
            </h2>
          </div>
          <Link className="text-link" to="/products">
            Shop the collection <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="category-pills">
          <Link className="active" to="/products">
            All essentials <span>↗</span>
          </Link>
          {["Audio", "Tech", "Lifestyle", "Workspace"].map((c) => (
            <Link key={c} to={`/products?category=${c}`}>
              {c}
            </Link>
          ))}
        </div>
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} retry={load} />
        ) : (
          <div className="product-grid">
            {products.slice(0, 4).map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                saved={savedIds.includes(p._id)}
              />
            ))}
          </div>
        )}
      </section>
      <section className="editorial container">
        <div>
          <span className="eyebrow">A LITTLE LESS, A LITTLE BETTER.</span>
          <h2>
            Objects you’ll reach for.
            <br />
            <em>Every single day.</em>
          </h2>
          <p>
            The idea behind Tara is simple: find the things you’ll actually use,
            choose them well, and make a little space for your own style.
          </p>
          <Link className="text-link" to="/products?category=Lifestyle">
            Meet your daily essentials <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="editorial-art">
          <span>
            FEWER.
            <br />
            BETTER.
            <br />
            <em>YOURS.</em>
          </span>
          <div className="glass-sculpture" aria-hidden="true">
            <div />
            <div />
            <BrandMark />
          </div>
          <span className="art-caption">
            KARTIK TARA / A PERSONAL PERSPECTIVE
          </span>
        </div>
      </section>
    </>
  );
}
