# 🧵 Vastra — 15-Minute Clothing Delivery App

> Fashion delivered to your door in 15 minutes.
> Full-stack web app + **installable PWA** for Android & iOS.

---

## 🗂 Project Structure

```
vastra/
├── backend/                  ← Node.js + Express REST API (port 5000)
│   ├── config/db.js          ← In-memory store + 20 seeded products
│   ├── middleware/auth.js    ← JWT middleware
│   ├── routes/
│   │   ├── auth.js           ← Signup / Login / OTP / Profile
│   │   ├── products.js       ← Products, search, wishlist
│   │   ├── orders.js         ← Place order, live tracking, coupons
│   │   └── addresses.js      ← CRUD addresses
│   └── server.js
│
├── frontend/                 ← React 18 + Vite PWA (port 3000)
│   ├── public/
│   │   ├── manifest.json     ← PWA manifest
│   │   ├── sw.js             ← Service worker (offline + image cache)
│   │   └── icons/            ← App icons 72–512px
│   ├── src/
│   │   ├── screens/          ← 15 screens (Intro→Home→Checkout→Tracking…)
│   │   ├── components/
│   │   │   ├── shared.jsx    ← BottomNav, Toast, Icons, Cards…
│   │   │   └── InstallPrompt.jsx ← "Add to Home Screen" banner
│   │   ├── store/index.js    ← Zustand: auth, cart, wishlist, UI
│   │   ├── utils/api.js      ← Axios client with JWT interceptor
│   │   └── index.css         ← Mobile-first design system
│   └── vite.config.js        ← host:true (LAN) + /api proxy
│
└── package.json              ← Root concurrent dev script
```

---

## 🚀 Quick Start

```bash
unzip vastra.zip && cd vastra

# 1. Install all dependencies
npm install
npm run install:all

# 2. Copy and configure environment
cp backend/.env.example backend/.env

# 3. Start both servers
npm run dev
```

- **Backend:** `http://localhost:5000`
- **Frontend:** `http://localhost:3000`

---

## 📱 Using on a Real Phone

### Method 1 — Same Wi-Fi (recommended for development)

```bash
npm run dev
# Vite prints: "Network: http://192.168.x.x:3000"
```

Open that IP on your phone's browser. Works on Android and iOS.

> **iOS note:** You must run the backend on HTTPS for full PWA features.
> For local dev, the app works perfectly in Safari without HTTPS.

### Method 2 — Install as PWA on Android

1. Open the app URL in **Chrome for Android**
2. Tap the **"Add to Home Screen"** banner that appears, OR
3. Tap Chrome menu (⋮) → "Add to Home screen"
4. The app installs like a native app — full screen, no browser UI

### Method 3 — Install as PWA on iPhone / iPad

1. Open the app URL in **Safari** (must be Safari, not Chrome)
2. Tap the **Share** button (□↑)
3. Scroll down → tap **"Add to Home Screen"**
4. Tap **"Add"** — Vastra appears on your home screen with the teal icon

### Method 4 — Deploy to the internet (Vercel + Railway)

**Backend (Railway):**
```bash
# Push backend/ to GitHub, import into railway.app
# Set env vars: JWT_SECRET, NODE_ENV=production, FRONTEND_URL=https://your-vercel-app.vercel.app
```

**Frontend (Vercel):**
```bash
cd frontend
npm run build
# Drag the dist/ folder to vercel.com/new → instant deploy
# OR: npx vercel --prod
```

---

## 🛍 Products (20 items)

| # | Product | Category | Price |
|---|---------|----------|-------|
| 1 | Embroidered Mirror Kurti | Women | ₹1,299 |
| 2 | Premium Cotton Dress Shirt | Men | ₹899 |
| 3 | Floral Georgette Anarkali | Women | ₹2,499 |
| 4 | Stretch Slim Chinos | Men | ₹1,199 |
| 5 | Floral Wrap Sundress | Women | ₹1,599 |
| 6 | Kids Festive Kurta Set | Kids | ₹799 |
| 7 | Unstructured Linen Blazer | Men | ₹2,999 |
| 8 | Printed Palazzo Pants | Women | ₹899 |
| 9 | Classic Polo T-Shirt | Men | ₹699 |
| 10 | Silk Blend Zari Saree | Women | ₹3,499 |
| 11 | Classic Denim Jacket | Men | ₹1,799 |
| 12 | Rayon Maxi Dress | Women | ₹1,399 |
| 13 | Girls Smocked Frock | Kids | ₹649 |
| 14 | Wool Blend Formal Suit | Men | ₹5,999 |
| 15 | Boho Floral Co-ord Set | Women | ₹1,899 |
| 16 | Kids Denim Dungaree | Kids | ₹849 |
| 17 | Pastel Crop Hoodie | Women | ₹1,099 |
| 18 | Hand-Embroidered Phulkari Dupatta | Women | ₹699 |
| 19 | Cotton Blend Jogger Pants | Men | ₹799 |
| 20 | Bandhani Lehenga Choli Set | Women | ₹4,299 |

---

## 💡 Coupon Codes

| Code | Discount |
|------|----------|
| `WELCOME10` | 10% off (max ₹200) |
| `FIRST50` | ₹50 flat |
| `VASTRA20` | 20% off (max ₹500) |
| `SAVE100` | ₹100 off on orders ≥ ₹999 |

---

## 🔧 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, React Router v6 |
| State | Zustand (localStorage persisted) |
| HTTP | Axios + JWT interceptor |
| PWA | Web App Manifest + Service Worker |
| Backend | Node.js, Express 4 |
| Auth | bcryptjs + JWT (7-day expiry) |
| DB | In-memory (replace with MongoDB) |
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev