# RouteSync 🚗⚡
> **One Platform. All Transportation Providers. The Smartest Ride.**

RouteSync is an end-to-end full-stack transportation aggregator platform built with **React**, **Node.js**, **Express**, and **MongoDB**. It allows users to search, compare, rank, and book rides across multiple registered transportation providers (**MetroRide**, **SwiftCab**, **EcoTransit**, **PrimeDrive**, and **QuickHop**) from a single interface.

---

## 🌟 Key Features

1. **Multi-Provider Vehicle Aggregation**:
   - Simultaneously scans available vehicles across multiple providers in the user's vicinity.
   - Calculates real-time distance between user and available vehicles using the **Haversine formula**.
   - Estimates exact journey distance and travel time to the destination.

2. **Smart Fare Estimation & Multi-Criteria Ranking Engine**:
   - Calculates transparent fare breakdowns: Base fare + Distance rate + Time rate + Platform fee.
   - Composite multi-objective ranking algorithm evaluating:
     - 40% Fare Price
     - 35% Pickup Arrival Speed (ETA)
     - 20% Driver & Provider Reputation Rating
     - 5% Eco-friendly Electric Incentive
   - Generates contextual highlight badges:
     - 🌟 **Best Match**: Optimal composite score
     - 💰 **Lowest Price**: Most economical ride
     - ⚡ **Fastest Pickup**: Lowest vehicle arrival ETA
     - 🌱 **100% Electric**: Zero-emission EV option
     - ⭐ **Top Rated Driver**: Driver rating $\ge$ 4.9★

3. **Side-by-Side Comparison Matrix**:
   - Compare 2 to 3 rides directly in an interactive comparison drawer.
   - Evaluates total fare, ETA, seats, vehicle model, cancellation policy, and eco-friendliness side-by-side.

4. **Instant Booking & Automated Fleet Availability**:
   - Cashless booking with the built-in **RouteSync Digital Wallet** (pre-loaded with $150 credit), Credit Card, or Cash.
   - Real-time vehicle availability management: Once booked, vehicle availability is immediately updated in MongoDB, preventing double bookings.

5. **Interactive Live Ride Simulation & Satellite Map**:
   - Built on **Leaflet** and **OpenStreetMap** (zero API keys required, works 100% reliably worldwide out of the box).
   - Features custom SVG vehicle pins color-coded by provider brand.
   - Live 5-phase trip progression simulation:
     `Driver Assigned` ➔ `Approaching Pickup` ➔ `Arrived Outside` ➔ `Trip In Progress` ➔ `Completed`.
   - Dedicated **Emergency SOS button** and **Share Live Trip** link.

6. **Provider Fleet & Market Analytics Dashboard**:
   - Powered by **Recharts**:
     - Weekly Revenue and Trip Volume trends (Area Chart)
     - Provider Fleet Share and Performance (Bar Chart)
     - Fleet Composition by Vehicle Type (Donut / Pie Chart)
   - Live Fleet Management Table with one-click **Online/Offline Availability Switch**.

7. **Ratings & Reviews System**:
   - Post-trip feedback modal with 5-star ratings, compliment tags, and written feedback.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide React, Recharts, Leaflet, React-Leaflet, Canvas-Confetti |
| **Backend** | Node.js, Express.js, RESTful API architecture, JWT Authentication, bcryptjs password hashing, Mongoose |
| **Database** | MongoDB (with 8 distinct schemas & seamless in-memory fallback for zero-configuration development) |
| **Mapping** | Leaflet + OpenStreetMap + Nominatim geocoding & realistic polyline road interpolation |

---

## 🗄️ MongoDB Schemas & Models

1. **User**: Credentials, authentication, role (`user`, `provider`, `admin`), wallet balance, saved locations.
2. **Provider**: Transportation company details (MetroRide, SwiftCab, EcoTransit, PrimeDrive, QuickHop), logo, brand color, commission rate, rating, cancellation policy.
3. **Vehicle**: Vehicle type (`Sedan`, `SUV`, `EV`, `Auto`, `Moto`, `Hatchback`), model, license plate, driver details, current coordinates, availability status, base fare, per-km rate.
4. **Booking**: Booking code, pickup/dropoff coordinates, route distance & duration, fare breakdown, status, payment status.
5. **Ride**: Live tracking coordinates, pickup/destination ETAs, route polyline, event timeline milestones.
6. **Location**: Pre-cached landmarks, transit hubs, and popularity ranking.
7. **Review**: Passenger ratings, driver feedback, tags.
8. **Notification**: In-app notifications for ride confirmations, arrivals, and wallet transactions.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ (tested with v24.19)
- **MongoDB** (Local instance or MongoDB Atlas cluster connection string)

### 2. Environment Configuration
Inspect or edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/routesync
JWT_SECRET=routesync_super_secret_jwt_key_2026_secure
NODE_ENV=development
```
> **Note on MongoDB**: If a local MongoDB instance is not running on port 27017, RouteSync automatically activates its embedded data service fallback so the entire application, database queries, and booking lifecycles remain 100% operational without crashing!

### 3. Starting the Application
From the root directory:
```bash
# Starts both Express API server (Port 5000) and React Vite Frontend (Port 5173)
npm run dev
```

Or run them individually in separate terminals:
```bash
# Terminal 1: Backend Server
cd server
npm run dev

# Terminal 2: React Frontend
cd client
npm run dev
```

Open your browser at:
👉 **`http://localhost:5173`**

---

## 👥 Demo Evaluation Accounts

Use the **Quick Role Switcher** dropdown in the navigation bar or log in with these credentials:

| Role | Email | Password | Features |
|---|---|---|---|
| **Passenger** | `user@routesync.com` | `password123` | Book rides, compare options, wallet ($150), live tracking |
| **Provider Manager** | `provider@routesync.com` | `password123` | Fleet management, toggle vehicle availability, review stats |
| **System Admin** | `admin@routesync.com` | `password123` | Complete platform analytics, revenue overview |

---

## 📡 REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register` | `POST` | Register a new user |
| `/api/auth/login` | `POST` | Authenticate user & get JWT |
| `/api/auth/me` | `GET` | Get current user profile & wallet balance |
| `/api/rides/search` | `POST` | Search & rank multi-provider rides based on route & preferences |
| `/api/rides/live/:bookingId` | `GET` | Get live tracking coordinates and trip milestone status |
| `/api/rides/live/:bookingId/advance` | `POST` | Simulate trip progression to the next phase |
| `/api/bookings` | `POST` | Confirm a ride booking and update vehicle availability |
| `/api/bookings/my` | `GET` | Retrieve user's booking history |
| `/api/bookings/:id/cancel` | `POST` | Cancel a booking and restore vehicle availability |
| `/api/vehicles` | `GET` | List vehicles with filters (provider, availability, type) |
| `/api/vehicles/:id/availability` | `PATCH` | Toggle vehicle availability (online/offline) |
| `/api/providers` | `GET` | List registered transportation providers |
| `/api/locations` | `GET` | List known city landmarks and query autocomplete |
| `/api/reviews` | `POST` | Submit post-trip rating and feedback |
| `/api/analytics/dashboard` | `GET` | Platform analytics for revenue, fleet, and provider volume |
