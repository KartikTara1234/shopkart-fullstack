import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { ShopProvider, useShop } from "./context/ShopContext";
import Navbar from "./components/Navbar";
import { Loading, Empty } from "./components/States";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Auth from "./pages/Auth";
import ProductDetail from "./pages/ProductDetail";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
function Protected({ children }) {
  const { user, ready } = useShop();
  if (!ready) return <Loading />;
  return user ? children : <Navigate to="/login" replace />;
}
function Layout() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <Navbar />
      <div id="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Catalog />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Auth key="login" />} />
          <Route path="/register" element={<Auth key="register" register />} />
          <Route
            path="/home"
            element={
              <Protected>
                <Home account />
              </Protected>
            }
          />
          <Route
            path="/wishlist"
            element={
              <Protected>
                <Wishlist />
              </Protected>
            }
          />
          <Route
            path="/cart"
            element={
              <Protected>
                <Cart />
              </Protected>
            }
          />
          <Route
            path="/checkout"
            element={
              <Protected>
                <Checkout />
              </Protected>
            }
          />
          <Route
            path="/orders"
            element={
              <Protected>
                <Orders />
              </Protected>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <Protected>
                <Orders />
              </Protected>
            }
          />
          <Route
            path="*"
            element={
              <Empty
                title="This page took a detour."
                text="Let’s get you back to the good things."
              />
            }
          />
        </Routes>
      </div>
      <footer className="footer container">
        <div className="footer-main">
          <div>
            <Link className="logo" to="/">
              shopkart<span>✳</span>
            </Link>
            <p>Good things. Every day.</p>
          </div>
          <div>
            <span className="eyebrow">MAKE YOURSELF AT HOME</span>
            <Link to="/products">
              The collection <ArrowUpRight size={14} />
            </Link>
            <Link to="/wishlist">
              Your wishlist <ArrowUpRight size={14} />
            </Link>
            <Link to="/orders">
              Your orders <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="footer-message">
            A little upgrade.
            <br />
            <em>A better everyday.</em>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 ShopKart. A full-stack student project.</span>
          <span>DEMO STORE · RAZORPAY TEST MODE ONLY</span>
          <a href="#content">Back to top ↑</a>
        </div>
      </footer>
    </>
  );
}
export default function App() {
  return (
    <BrowserRouter>
      <ShopProvider>
        <Layout />
      </ShopProvider>
    </BrowserRouter>
  );
}
