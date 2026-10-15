# Tara.

An everyday essentials store by Kartik Tara. Built with React, Express, MongoDB and Razorpay Test Mode for the ShopKart full-stack labs.

The interface uses a custom folded-T monogram, translucent glass panels, layered shadows and a responsive dark theme. Customers can register, browse and filter products, save a wishlist, manage their bag and check out through Razorpay.

## Run locally

Requires **Node.js 22+** and internet access for the first database download.

```bash
npm ci
npm run build
npm run demo
```

Open **http://localhost:4000** and create an account. The demo starts a real MongoDB replica set automatically and seeds the catalogue. Data persists locally in `.demo-data/`. Stop it with `Ctrl+C`; wait for shutdown before restarting.

No database account is required for this local setup. Images load from Unsplash. Fonts and the Tara brand mark are included in the source.

## Environment and payments

Copy `.env.example` to `.env` in the project root. Add your own Razorpay **Test Mode** key ID and secret to enable checkout:

```env
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
```

The rest of the store works without payment keys. The key secret stays on the backend. The app rejects Live Mode keys. See [Razorpay’s integration instructions](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/) for test checkout.

**Never commit `.env`, database files or credentials.** Only `.env.example` with empty values/placeholders belongs in the repository. Each person downloading the project supplies their own credentials.

For a persistent signing secret, generate one and set `JWT_SECRET` locally:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The automatic demo otherwise generates a fresh signing secret each run, requiring another sign-in after restart.

## Use your own MongoDB

Set `MONGODB_URI` and `JWT_SECRET` in `.env`. MongoDB must be a **replica set** (Atlas works) because order confirmation uses transactions.

```bash
npm run seed
npm run build
npm start
```

For development with your configured database, run `npm run dev` and open http://localhost:5173. To develop against the automatic local database, run `npm run demo` in one terminal and `npm run dev -w frontend` in another. Vite proxies `/api` to the backend on port 4000.

## Project structure

```text
backend/
  config/           Environment and payment configuration
  controllers/      Customer, product, shopping and order logic
  middlewares/      JWT cookie authentication
  models/           Mongoose schemas
  routes/           REST endpoints
  utils/            Tokens and common errors
  app.js            Express application and static frontend
  index.js          Server using your configured MongoDB
  demo.js           Automatic local MongoDB and server
  seed.js           Catalogue seeding
frontend/src/
  components/       Brand mark, navigation, product cards and states
  context/          Shared customer and cart state
  hooks/            Page-local wishlist loading
  pages/            Store, account, wishlist, bag, checkout and orders
  services/         Fetch client and currency formatting
  styles.css        Responsive layout, glass surfaces and depth
  App.jsx           Routes and protected pages
tests/              API integration tests
```

## API

Base URL: `http://localhost:4000/api`. JSON clients can also use the unprefixed lab routes; send `Accept: application/json` to distinguish them from frontend pages.

| Method | Endpoint | Authentication |
| --- | --- | --- |
| POST | `/customers/register` | Public |
| POST | `/customers/login` | Public |
| GET | `/customers/me` | Required |
| POST | `/customers/logout` | Required |
| GET, POST | `/products` | Public |
| GET | `/products/:id` | Public |
| GET | `/wishlist` | Required |
| POST, DELETE | `/wishlist/:productId` | Required |
| GET | `/cart` | Required |
| POST, PATCH, DELETE | `/cart/:productId` | Required |
| POST | `/orders/create-payment-order` | Required |
| POST | `/orders/verify-payment` | Required |
| GET | `/orders` | Required |
| GET | `/orders/:id` | Required |
| GET | `/health` | Public |

Registration accepts `fullName`, `email`, `password` and `phone`. Product listing supports `search` and `category`. Updating a cart item accepts `{ "quantity": 2 }`.

Checkout accepts `shippingAddress` containing `fullName`, `phone`, `addressLine1`, `city`, `state` and a six-digit `pincode`. The backend calculates the total using current product prices and creates a Razorpay order in paise. Verification accepts `shopKartOrderId` and the three Razorpay callback fields. The internal ShopKart field name follows the lab contract.

Passwords are bcrypt hashes. Sessions use JWTs in HttpOnly cookies. Wishlist, cart and order access are scoped to the authenticated customer. Orders keep purchase-time snapshots; a transaction confirms payment, updates stock and removes purchased quantities. Duplicate verification callbacks are idempotent.

## Checks

```bash
npm run build
npm test
```

Tests use an isolated MongoDB replica set and cover authentication, validation, catalogue filters, wishlist/cart persistence, stock limits, order ownership and payment-signature verification. They use local signature fixtures; complete an actual Razorpay Test Mode checkout separately with your own account keys.

## Scope

This is a Test Mode lab store with no real fulfilment or live payments. Product creation is open as specified in Lab 03; add admin authorization before public hosting. Production use also needs payment webhooks, reconciliation/refunds, stock reservations and monitoring. For a Node host, set `HOST=0.0.0.0`, `NODE_ENV=production`, your private environment variables and the host-provided `PORT`; serve the frontend and API from one HTTPS origin.

Third-party photographs, icons and fonts retain their respective licenses; see `THIRD_PARTY_NOTICES.txt`. The Tara brand mark is a custom SVG included in `frontend/public/tara-mark.svg`.
