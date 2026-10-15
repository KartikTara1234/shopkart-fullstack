export async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      credentials: "include",
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new Error(
      "Cannot reach ShopKart. Check that the backend is running.",
    );
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const e = new Error(data.message || "Request failed. Please try again.");
    e.status = response.status;
    throw e;
  }
  return data;
}
export const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
