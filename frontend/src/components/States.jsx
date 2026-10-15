import { Link } from "react-router-dom";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
export function Loading() {
  return (
    <div className="state" role="status">
      <div className="spinner" />
      Getting the good things ready…
    </div>
  );
}
export function Empty({
  title = "Nothing here just yet.",
  text = "Find something that feels like you.",
  action = "Explore the collection",
  to = "/products",
}) {
  return (
    <div className="state">
      <ShoppingBag size={36} strokeWidth={1} />
      <h2>{title}</h2>
      <p>{text}</p>
      <Link className="button" to={to}>
        {action}
        <ArrowUpRight size={17} />
      </Link>
    </div>
  );
}
export function ErrorState({ message, retry }) {
  return (
    <div className="state" role="alert">
      <h2>Let’s try that again.</h2>
      <p>{message}</p>
      {retry && (
        <button className="button" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
