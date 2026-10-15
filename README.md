# ShopKart — Good things. Every day.

A complete MERN shopping project implementing the six [ShopKart engineering labs](https://github.com/mrinal1224/Lab-2029-Problem-Statements). An original dark storefront with warm orange accents, editorial typography, a frosted product feature, responsive layouts, and gentle motion with reduced-motion support.

**React · Express · MongoDB · Mongoose · JWT cookies · Razorpay Test Mode**

![ShopKart storefront](docs/storefront.png)

## Quick start — no database account needed

Install Node.js 22 or newer. Open a terminal inside this folder, then run:

```bash
npm ci
npm run build
npm run demo
```

Open **http://localhost:4000**. Register your own account, then sign in. On macOS you can also double-click `Start ShopKart.command` to build and start the demo.

The demo command starts a **real MongoDB replica set** locally, seeds eight products, and serves the built React app and API together. It downloads the MongoDB binary on first use, so internet access is required initially. Accounts, wishlists, bags and orders are stored under the ignored `.demo-data/` folder and retained between runs. Stop with `Ctrl+C`. The automatically generated demo JWT signing secret changes on restart, so sign in again after restarting.

Payment is intentionally unavailable until you configure your own **Razorpay Test Mode keys**. There is no fake payment-success shortcut. All other shopping features work without payment credentials.

## Labs covered

| Lab | Implementation |
| --- | --- |
| 01 — Authentication backend | Registration, bcrypt hashes, login, signed JWT in HttpOnly cookie, protected profile, logout, MVC structure |
| 02 — React authentication | Controlled registration/login forms, validation, protected `/home`, profile details, logout navigation |
| 03 — Catalogue | Mongoose product model, create/list/detail APIs, case-insensitive literal search, category filters, loading/error/empty states |
| 04 — Wishlist | MongoDB references, idempotent add, removal, per-customer ownership, page-local React state |
| 05 — Cart | Persistent product references and quantities, increment/update/remove, stock checks, Context cart state, live quantity badge and derived subtotal |
| 06 — Checkout and orders | Shipping validation, server totals, purchase-time snapshots, pending orders, Razorpay Orders API, Standard Checkout, backend HMAC verification, transactional stock/cart updates, private order history/details |

## Connect your own MongoDB and Razorpay

1. Copy `.env.example` to **`.env` in the project root**. This file is ignored by Git.
2. For your own database, create a MongoDB Atlas cluster or a local replica set. Put its connection string into `MONGODB_URI`. Atlas requires a database user and a network access entry for your machine. Use a replica set because payment confirmation uses transactions.
3. Generate a signing secret and paste the output into `JWT_SECRET`:

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```

4. In the Razorpay Dashboard, switch to **Test Mode**, generate API keys, and set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`. The application only accepts `rzp_test_` key IDs. Never put the secret into React or commit it.
5. For your own MongoDB, run:

   ```bash
   npm run seed
   npm run build
   npm start
   ```

   For the automatic local database, keep using `npm run demo`; it still reads Razorpay keys from `.env`.

Follow the [official Razorpay integration guide](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/) for account setup and test payment methods. Enable automatic capture in the Test Mode dashboard. No real payment details are needed for test checkout.

## Development

With your own MongoDB configured, run `npm run dev` and open **http://localhost:5173**. Vite proxies `/api` to port 4000. If using the automatic demo database instead, run `npm run demo` in one terminal and `npm run dev -w frontend` in another. Avoid running two backend servers on port 4000.

The built app uses one origin for frontend and backend. No CORS configuration or browser token storage is needed. Fetch sends cookies using `credentials: 'include'`.

## Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install locked dependency versions |
| `npm run build` | Build the React frontend |
| `npm run demo` | Start local persistent MongoDB, seed catalogue and serve built app |
| `npm run dev` | Start backend watcher and Vite with your configured database |
| `npm start` | Serve built frontend and API using configured MongoDB |
| `npm run seed` | Insert missing seed products without replacing existing records |
| `npm test` | Run API integration tests against an isolated MongoDB replica set |

## Structure

```text
backend/
  config/           Environment loading and Razorpay configuration
  controllers/      Authentication, products, wishlist, cart and order logic
  middlewares/      Cookie/JWT authentication
  models/           Customer, Product and Order Mongoose schemas
  routes/           HTTP route definitions
  utils/            Token generation and common errors
  app.js            Express app, security headers and static frontend
  index.js          Configured database server
  demo.js           Automatic local MongoDB server
  seed.js           Idempotent catalogue seed
frontend/src/
  components/       Navbar, product cards, shared loading/error/empty states
  context/          Auth and cart Context (wishlist remains page-local)
  pages/            Landing, catalogue, auth, details, wishlist, cart, checkout, orders
  services/         Central Fetch client and currency formatting
  styles.css        Responsive design and motion
  App.jsx           Routes and protected pages
tests/              Integration tests
.github/workflows/  Build and test workflow for GitHub
```

## API

Use **http://localhost:4000/api** as the base URL. The same routes are also available without `/api` for JSON clients such as Postman. HTML requests to `/products`, `/cart`, `/wishlist` and `/orders` serve the React pages. Set `Accept: application/json` when using those unprefixed APIs.

| Method | Path | Auth | Body / purpose |
| --- | --- | --- | --- |
| POST | `/customers/register` | No | `fullName`, `email`, `password`, `phone` |
| POST | `/customers/login` | No | `email`, `password`; sets cookie |
| GET | `/customers/me` | Yes | Current profile, never password |
| POST | `/customers/logout` | Yes | Clears cookie |
| GET | `/products` | No | Optional `search` and `category` query strings |
| POST | `/products` | No* | `name`, `description`, `price`, `category`, `image`, `stock` |
| GET | `/products/:id` | No | Single product |
| GET | `/wishlist` | Yes | Current customer's saved products |
| POST | `/wishlist/:productId` | Yes | Add once |
| DELETE | `/wishlist/:productId` | Yes | Remove |
| GET | `/cart` | Yes | Populated cart and subtotal |
| POST | `/cart/:productId` | Yes | Add one / increment existing |
| PATCH | `/cart/:productId` | Yes | `{ "quantity": 2 }` |
| DELETE | `/cart/:productId` | Yes | Remove |
| POST | `/orders/create-payment-order` | Yes | `{ "shippingAddress": { ... } }` |
| POST | `/orders/verify-payment` | Yes | ShopKart order ID plus Razorpay callback fields |
| GET | `/orders` | Yes | Current customer's order history |
| GET | `/orders/:id` | Yes | Own order only |
| GET | `/health` | No | Database health |

*Open product creation is permitted by Lab 03. Restrict it with admin authorization before exposing a store publicly.*

Shipping address fields: `fullName`, `phone`, `addressLine1`, `city`, `state`, `pincode`. Every field is required. Pincode must be six digits.

Payment verification fields: `shopKartOrderId`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`.

Import [the Postman collection](docs/ShopKart.postman_collection.json) to exercise the APIs with its cookie jar.

## Payment and data integrity

The backend reloads the authenticated customer's cart and products, checks stock, computes the amount and persists an order snapshot. It creates a Razorpay order in paise and returns only the public key ID. Opening checkout leaves the bag untouched. A successful browser callback is sent back to the backend, which verifies an HMAC using the database's trusted Razorpay order ID and the backend secret. An atomic MongoDB transaction marks the order paid/placed, decrements stock and removes purchased quantities from the cart. Repeated callbacks do not double-decrement stock. New quantities added after checkout opened are preserved.

## Verification

`npm test` covers registration, duplicate emails, password hashing, HttpOnly cookies, anonymous access, login/logout, product validation and filters, wishlist persistence/idempotency, cart stock and quantity validation, missing payment configuration, forged payment rejection, cross-customer isolation, valid HMAC confirmation, callback idempotency and immutable order price snapshots. The payment verification test uses a locally generated signature fixture and does **not** claim to make a Razorpay payment.

**A real Razorpay Test Mode checkout must still be run with your account keys before final submission.** The source integration is included; external provider checkout cannot be verified without credentials.

## Demonstration scope and limitations

This is a student lab application. It has no real fulfilment, refunds, admin dashboard, email delivery or production payment webhooks. A callback lost after payment needs manual reconciliation. Stock is checked at checkout and confirmation; a stock conflict after payment reports a reconciliation error rather than falsely confirming. Live payment keys are rejected. Public browsing is allowed; account, wishlist, cart, checkout and orders require login. Free delivery is a demo store rule.

In production, add admin authorization, payment webhooks/reconciliation, reservations/refunds, email verification and operational monitoring. Use HTTPS (`NODE_ENV=production` enables Secure cookies), and configure your Node host's bind address as described below.

## Optional hosting

Deploy the **whole Node application** to a Node-compatible host and use MongoDB Atlas. Run `npm ci && npm run build` as the build command, `npm start` as the start command, and configure the environment variables privately on the host. Set `HOST=0.0.0.0`, `NODE_ENV=production` and the provided `PORT`. Frontend and API should share one HTTPS origin. Do not deploy only `frontend/dist` and expect backend features to work. A public deployment was not created as part of this local project.

## Submission

See [docs/SUBMISSION.md](docs/SUBMISSION.md) for GitHub upload, final checks and form submission steps, and [docs/VIVA.md](docs/VIVA.md) for a concise walkthrough of the implementation.

Product imagery is loaded from Unsplash and requires an internet connection. Fonts are self-hosted; their licenses are included in `frontend/public/fonts/`. See [third-party notices](docs/THIRD-PARTY-NOTICES.txt).
