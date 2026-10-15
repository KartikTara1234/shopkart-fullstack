import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";
const ShopContext = createContext(null);
export function ShopProvider({ children }) {
  const [user, setUser] = useState(null),
    [ready, setReady] = useState(false),
    [cart, setCart] = useState([]),
    [toast, setToast] = useState("");
  useEffect(() => {
    api("/customers/me")
      .then(setUser)
      .catch((e) => {
        if (e.status !== 401) setToast(e.message);
      })
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (user)
      api("/cart")
        .then((d) => setCart(d.cart))
        .catch((e) => setToast(e.message));
    else setCart([]);
  }, [user]);
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(""), 4000);
      return () => clearTimeout(id);
    }
  }, [toast]);
  async function changeCart(id, method = "POST", quantity) {
    const d = await api(`/cart/${id}`, {
      method,
      body: quantity === undefined ? {} : { quantity },
    });
    setCart(d.cart);
    if (method === "POST") setToast("Added to your bag.");
  }
  async function logout() {
    await api("/customers/logout", { method: "POST" });
    setUser(null);
    setCart([]);
  }
  return (
    <ShopContext.Provider
      value={{
        user,
        setUser,
        ready,
        cart,
        setCart,
        changeCart,
        logout,
        notify: setToast,
      }}
    >
      {children}
      {toast && (
        <div className="toast" role="status">
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            ×
          </button>
        </div>
      )}
    </ShopContext.Provider>
  );
}
export const useShop = () => useContext(ShopContext);
