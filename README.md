# 🎱 Tambola Admin Panel

React + Vite based admin panel for managing Tambola Lottery games.

---

## 🚀 Tech Stack

- **React 18** + **Vite**
- **React Router DOM v6** — routing
- **Axios** — API calls
- **Recharts** — dashboard charts
- **React Icons** — icons

---

## 🎨 Theme / Color Palette

| Role           | Color     |
|----------------|-----------|
| Primary Blue   | `#1E3A8A` |
| Accent Blue    | `#3B82F6` |
| Gold / Yellow  | `#FBBF24` |
| Background     | `#F8FAFC` |
| White          | `#FFFFFF` |
| Muted Text     | `#64748B` |
| Border         | `#E2E8F0` |

---

## 🔌 API

**Base URL:** `https://tambola.honeywithmoon.com/api`

Auth: Bearer token via `localStorage` — attached automatically via Axios interceptor.

---

## 📁 File Structure

```
Tambola-admin-panel/
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── assets/                  # Static images
│   │   └── hero.png
│   │
│   ├── components/              # Reusable layout components
│   │   ├── Layout.jsx           # Sidebar + Navbar wrapper
│   │   ├── Navbar.jsx           # Top navigation bar
│   │   ├── ProtectedRoute.jsx   # Auth guard (sessionStorage check)
│   │   └── Sidebar.jsx          # Left sidebar with menu links
│   │
│   ├── pages/                   # One file per route/page
│   │   ├── Login.jsx            # /  (public)
│   │   ├── Dashboard.jsx        # /dashboard
│   │   ├── CreateGame.jsx       # /create-game
│   │   ├── Games.jsx            # /games
│   │   ├── LiveGame.jsx         # /live-game
│   │   ├── Tickets.jsx          # /tickets
│   │   ├── Claims.jsx           # /players
│   │   ├── Winners.jsx          # /winners
│   │   ├── Prizes.jsx           # /prizes
│   │   ├── AddOffer.jsx         # /add-offer
│   │   ├── AddBanner.jsx        # /add-banner
│   │   ├── PolicyPage.jsx       # /policies
│   │   ├── PlayerDetails.jsx    # /player-details
│   │   ├── UserDetailsPage.jsx  # /user-details
│   │   ├── Agents.jsx           # /agents
│   │   └── Videos.jsx           # /videos
│   │
│   ├── services/
│   │   └── api.js               # All Axios API functions
│   │
│   ├── styles/                  # Per-page CSS files
│   │   ├── login.css
│   │   ├── dashboard.css
│   │   ├── sidebar.css
│   │   ├── navbar.css
│   │   ├── createGame.css
│   │   ├── ManageGames.css
│   │   ├── liveGame.css
│   │   ├── tickets.css
│   │   ├── winners.css
│   │   ├── prizes.css
│   │   ├── AddOffer.css
│   │   ├── AddBanner.css
│   │   ├── ManagePolicies.css
│   │   ├── players.css
│   │   ├── PlayersDetail.css
│   │   ├── UserDetailsPage.css
│   │   ├── agentManage.css
│   │   └── VideoManagement.css
│   │
│   ├── App.jsx                  # Routes definition
│   ├── App.css
│   ├── main.jsx                 # React entry point
│   └── index.css
│
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## 🔐 Auth Flow

1. Admin logs in via `/` (Login page)
2. Token saved in `localStorage` → used in every API request
3. `isAdmin` flag saved in `sessionStorage`
4. `ProtectedRoute` checks `sessionStorage.isAdmin` — redirects to `/` if missing

---

## 🗺️ Routes

| Path             | Page              | Protected |
|------------------|-------------------|-----------|
| `/`              | Login             | ❌        |
| `/dashboard`     | Dashboard         | ✅        |
| `/create-game`   | Create Game       | ✅        |
| `/games`         | Manage Games      | ✅        |
| `/live-game`     | Live Game         | ✅        |
| `/tickets`       | Tickets           | ✅        |
| `/players`       | Claims            | ✅        |
| `/winners`       | Winners           | ✅        |
| `/prizes`        | Manage Prizes     | ✅        |
| `/add-offer`     | Add Offer         | ✅        |
| `/add-banner`    | Add Banner        | ✅        |
| `/policies`      | Policy Page       | ✅        |
| `/player-details`| Player Details    | ✅        |
| `/user-details`  | User Details      | ✅        |
| `/agents`        | Agents            | ✅        |
| `/videos`        | Videos            | ✅        |

---

## ▶️ Run Locally

```bash
npm install
npm run dev
```
