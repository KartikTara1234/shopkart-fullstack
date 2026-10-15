import { useEffect, useState } from "react";
import { api } from "../services/api";
// Page-local wishlist state; MongoDB remains the persistent source of truth.
export default function useWishlist(user) {
  const [ids, setIds] = useState([]);
  useEffect(() => {
    let active = true;
    if (!user) {
      setIds([]);
      return;
    }
    api("/wishlist")
      .then((d) => {
        if (active) setIds(d.wishlist.map((p) => p._id));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user]);
  return ids;
}
