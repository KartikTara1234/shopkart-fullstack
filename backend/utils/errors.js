export function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}
export function safeCustomer(c) {
  return { _id: c._id, fullName: c.fullName, email: c.email, phone: c.phone };
}
