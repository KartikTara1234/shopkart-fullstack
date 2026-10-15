import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Check, Package } from "lucide-react";
import { api, money } from "../services/api";
import { Loading, Empty, ErrorState } from "../components/States";
export default function Orders() {
  const { id } = useParams(),
    [params] = useSearchParams();
  const [orders, setOrders] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  function load() {
    setLoading(true);
    setError("");
    api(id ? `/orders/${id}` : "/orders")
      .then((d) => setOrders(id ? [d.order] : d.orders))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }
  useEffect(load, [id]);
  return (
    <main className="container page">
      <div className="page-title">
        <span className="eyebrow">YOUR GOOD FINDS</span>
        <h1>
          {id ? "The details" : "Your orders"}
          <span>.</span>
        </h1>
        <p>A record of the things you’ve made yours.</p>
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} retry={load} />
      ) : !orders.length ? (
        <Empty
          title="The first of many good things."
          text="Your orders will appear here after checkout."
        />
      ) : (
        <div className="orders-list">
          {orders.map((o) => (
            <article className="order-card" key={o._id}>
              {params.has("success") && o.paymentStatus === "PAID" && (
                <div className="confirmation">
                  <Check size={24} />
                  <div>
                    <h2>Good things are on their way.</h2>
                    <p>
                      Your test payment was verified and your order is
                      confirmed.
                    </p>
                  </div>
                </div>
              )}
              <div className="order-top">
                <div>
                  <span className="eyebrow">
                    ORDER #{o._id.slice(-8).toUpperCase()}
                  </span>
                  <p>
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`status ${o.paymentStatus === "PAID" ? "paid" : ""}`}
                >
                  <Package size={14} />
                  {o.status.replaceAll("_", " ")}
                </span>
              </div>
              {o.items.map((i) => (
                <div className="order-product" key={i.product}>
                  <img src={i.image} alt={i.name} />
                  <div>
                    <h3>{i.name}</h3>
                    <p>
                      Quantity {i.quantity} · {money(i.price)} each
                    </p>
                  </div>
                  <strong>{money(i.price * i.quantity)}</strong>
                </div>
              ))}
              <div className="order-bottom">
                <span>Payment: {o.paymentStatus.toLowerCase()}</span>
                <strong>Total {money(o.totalAmount)}</strong>
                {!id && (
                  <Link className="text-link" to={`/orders/${o._id}`}>
                    View order
                    <ArrowUpRight size={17} />
                  </Link>
                )}
              </div>
              {id && (
                <div className="address">
                  <h3>Delivery address</h3>
                  <p>
                    {o.shippingAddress.fullName}
                    <br />
                    {o.shippingAddress.addressLine1}
                    <br />
                    {o.shippingAddress.city}, {o.shippingAddress.state}{" "}
                    {o.shippingAddress.pincode}
                    <br />
                    {o.shippingAddress.phone}
                  </p>
                  {o.razorpayPaymentId && (
                    <small>Payment reference: {o.razorpayPaymentId}</small>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
