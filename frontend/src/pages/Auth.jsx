import BrandMark from "../components/BrandMark";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Eye, EyeOff } from "lucide-react";
import { api } from "../services/api";
import { useShop } from "../context/ShopContext";
export default function Auth({ register = false }) {
  const { setUser } = useShop(),
    navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
      fullName: "",
      email: "",
      password: "",
      phone: "",
    }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [show, setShow] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await api(`/customers/${register ? "register" : "login"}`, {
        method: "POST",
        body: form,
      });
      if (register) navigate("/login?registered=1");
      else {
        setUser(data.customer);
        navigate("/home");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page container">
      <div className="auth-art">
        <span className="eyebrow">YOUR EVERYDAY STARTS HERE</span>
        <h1>
          A little more
          <br />
          <em>you.</em>
        </h1>
        <div className="auth-monogram">
          <BrandMark />
        </div>
        <p>
          A place for good things.
          <br />
          And the people who appreciate them.
        </p>
        <span className="auth-number">TARA / KARTIK TARA / 2026</span>
      </div>
      <section className="auth-form">
        <span className="eyebrow">
          {register ? "JOIN THE GOOD SIDE" : "GOOD TO SEE YOU AGAIN"}
        </span>
        <h2>{register ? "Make yourself at home." : "Welcome back."}</h2>
        <p>
          {register
            ? "Your next favourite is waiting."
            : "Sign in to pick up where you left off."}
        </p>
        {params.has("registered") && !register && (
          <div className="success" role="status">
            Account created. Sign in to start exploring.
          </div>
        )}
        <form onSubmit={submit}>
          {register && (
            <label>
              Full name
              <input
                required
                autoComplete="name"
                value={form.fullName}
                maxLength={100}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Your full name"
              />
            </label>
          )}
          <label>
            Email address
            <input
              required
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </label>
          {register && (
            <label>
              Phone number
              <input
                required
                type="tel"
                autoComplete="tel"
                pattern="[+0-9 -]{10,15}"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="9876543210"
              />
            </label>
          )}
          <label>
            Password
            <div className="password-field">
              <input
                required
                minLength={6}
                maxLength={72}
                type={show ? "text" : "password"}
                autoComplete={register ? "new-password" : "current-password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={
                  register ? "At least 6 characters" : "Your password"
                }
              />
              <button
                type="button"
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow(!show)}
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <button className="button full" disabled={busy}>
            {busy ? "One moment…" : register ? "Create account" : "Sign in"}
            <ArrowUpRight size={18} />
          </button>
        </form>
        <p className="auth-switch">
          {register ? "Already part of the club?" : "New around here?"}{" "}
          <Link to={register ? "/login" : "/register"}>
            {register ? "Sign in" : "Create an account"}
          </Link>
        </p>
        <small className="auth-note">
          Your account, wishlist and bag stay safely in sync.
        </small>
      </section>
    </main>
  );
}
