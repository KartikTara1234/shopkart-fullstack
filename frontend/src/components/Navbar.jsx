import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Heart,
  UserRound,
  ArrowUpRight,
  LogOut,
} from "lucide-react";
import { useShop } from "../context/ShopContext";
export default function Navbar() {
  const { user, cart, logout, notify } = useShop();
  const navigate = useNavigate();
  return (
    <>
      <div className="announcement">
        A little upgrade to your everyday.{" "}
        <Link to="/products">
          Explore the collection <ArrowUpRight size={12} />
        </Link>
        <span>THOUGHTFULLY PICKED. FAIRLY PRICED.</span>
      </div>
      <header className="header">
        <Link className="logo" to="/">
          shopkart<span>✳</span>
        </Link>
        <nav aria-label="Main navigation">
          <NavLink to="/products">Shop all</NavLink>
          <NavLink to="/products?category=Audio">Audio</NavLink>
          <NavLink to="/products?category=Tech">Tech</NavLink>
          <NavLink to="/products?category=Lifestyle">Lifestyle</NavLink>
        </nav>
        <div className="nav-actions">
          <Link to="/wishlist" aria-label="Wishlist">
            <Heart size={20} />
          </Link>
          <Link to={user ? "/home" : "/login"} aria-label="Your account">
            <UserRound size={20} />
          </Link>
          <Link
            className="bag-link"
            to="/cart"
            aria-label={`Shopping bag, ${cart.reduce((s, i) => s + i.quantity, 0)} items`}
          >
            <ShoppingBag size={19} />
            <span className="bag-label">Bag</span>
            <b>{cart.reduce((s, i) => s + i.quantity, 0)}</b>
          </Link>
          {user && (
            <button
              className="icon-button logout"
              aria-label="Sign out"
              onClick={async () => {
                try {
                  await logout();
                  navigate("/login");
                } catch (e) {
                  notify(e.message);
                }
              }}
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </header>
    </>
  );
}
