# Tara.

An everyday essentials store by Kartik Tara. Built with React, Express, MongoDB and Razorpay Test Mode for the ShopKart full-stack labs.

The interface uses a custom folded-T monogram, translucent glass panels, layered shadows and a responsive dark theme. Customers can register, browse and filter products, save a wishlist, manage their bag and check out through Razorpay.

## Run with MongoDB Atlas

Requires **Node.js 22+**, internet access and a MongoDB Atlas cluster. The website runs on your computer; its application data is stored online in Atlas. There is no local database fallback.

1. Sign in at https://cloud.mongodb.com and create a cluster (choose the Free option if available).
2. Create a **database user** with `readWrite` access to the `tara` database. This is separate from your Atlas sign-in.
3. In **Network Access**, add your current public IP address. On deployment, add the application server's outbound IP address.
4. Select **Connect → Drivers → Node.js** and copy the connection string.
5. Copy `.env.example` to `.env` in the project root. Put the Atlas URI in `MONGODB_URI`, replace the username/password placeholders, and use `/tara` before `?`. URL-encode any special characters in the database password. Do not share the completed URI or commit `.env`.

Example format (placeholders only):

```env
MONGODB_URI=mongodb+srv://<database-user>:<encoded-password>@<cluster-host>/tara?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-random-secret-of-at-least-32-characters
```

Generate a signing secret and paste its output into your local `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Install, check the Atlas connection, seed the catalogue, build and start:

```bash
npm ci
npm run db:check
npm run seed
npm run build
npm start
```

Open **http://localhost:4000** and create an account. Seeding inserts missing catalogue products without overwriting existing records. Existing data from an older local demo is not automatically transferred; Atlas starts with its own users, carts, wishlists and orders. Stop the server with `Ctrl+C`.

For development, run `npm run dev` and open http://localhost:5173. Vite proxies `/api` to the backend on port 4000, which connects to Atlas.

If the connection check fails, verify the cluster is running, the database user's credentials, the encoded password and the current IP access-list entry. See [MongoDB's official connection guide](https://www.mongodb.com/docs/atlas/driver-connection/). The app requires an Atlas replica set because order confirmation uses transactions.

Images load from Unsplash. Fonts and the Tara brand mark are included in the source.

## Payments and secrets

Add your own Razorpay **Test Mode** key ID and secret to `.env` to enable checkout:

```env
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
```

The rest of the store works without payment keys. The key secret stays on the backend. The app rejects Live Mode keys. See [Razorpay's integration instructions](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/) for test checkout.

**Never commit `.env`, database files or credentials.** Only `.env.example` with placeholders belongs in the repository. Each person downloading the project supplies their own Atlas and payment credentials.

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
  index.js          Server using your MongoDB Atlas cluster
  check-db.js       Atlas connectivity check
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
