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

/// live game ============================

# LiveGame Component - Documentation

## 📋 Overview

The **LiveGame** component is a real-time game management system built with React that manages live bingo/tambola-style games. It provides both player-facing displays and admin control panels for managing game state, calling numbers, declaring winners, and monitoring real-time updates via WebSocket connections.

---

## 🎯 Purpose & Use Cases

### Why Use This Component?

1. **Real-Time Game Management**: Synchronize game state across multiple clients instantly
2. **Admin Control Panel**: Manage game lifecycle (start, pause, resume, stop)
3. **Live Number Calling**: Call numbers manually, automatically, or in bulk
4. **Winner Declaration**: Declare winners by ticket number and track prizes
5. **Live Updates**: WebSocket-based real-time synchronization without page refresh
6. **Multi-Game Support**: Manage multiple games and switch between them
7. **Game History**: Track all called numbers and maintain audit trail

### Typical Scenarios

- **Online Bingo/Tambola Events**: Conduct live games with multiple participants
- **Lottery Systems**: Real-time number calling and winner declaration
- **Game Shows**: Live audience participation with number-based gameplay
- **Educational Games**: Interactive learning with live number sequences

---

## 🏗️ Architecture & Components

### Main Sections

```
LiveGame Component
├── Game Selector View (Initial)
│   └── Display available games and allow selection
├── Live Game View (Main Interface)
│   ├── Header (Navigation & Status)
│   ├── Admin Panel (Conditional)
│   │   ├── Bulk Numbers Call
│   │   └── Declare Winner by Ticket
│   ├── Stats Bar (Real-time Statistics)
│   ├── Main Layout
│   │   ├── Left Panel
│   │   │   ├── Current Number Display
│   │   │   ├── Control Buttons
│   │   │   └── Winners List
│   │   └── Right Panel
│   │       ├── Recent Calls
│   │       └── Last 10 Numbers
│   └── Numbers Grid (90 numbers board)
└── WebSocket Manager (Background)
    └── Real-time event handling
```

---

## 🔌 WebSocket Connection

### Socket Events (Received)

| Event | Purpose | Payload |
|-------|---------|---------|
| `connect` | Socket established | - |
| `disconnect` | Socket closed | reason (string) |
| `number_called` | Number was called | `{game_id, number, timestamp}` |
| `old_numbers` | Historical numbers load | `{calledNumbers, is_running}` |
| `game_started` | Game started event | `{game_id}` |
| `game_paused` | Game paused event | `{game_id}` |
| `game_resumed` | Game resumed event | `{game_id}` |
| `game_over` | Game ended | `{game_id}` |
| `all_numbers_completed` | All 90 numbers called | `{game_id}` |

### Socket Events (Emitted)

| Event | Purpose | Payload |
|-------|---------|---------|
| `join_game` | Join game room | `{game_id}` |
| `get_game_data` | Request current state | `{game_id}` |
| `pause_game` | Pause the game | `{game_id}` |
| `resume_game` | Resume the game | `{game_id}` |

---

## 📊 State Management

### Core State Variables

#### Game State
```javascript
const [numbers, setNumbers] = useState([]);              // Called numbers array
const [current, setCurrent] = useState(null);            // Current number
const [isRunning, setIsRunning] = useState(false);       // Game running status
const [gameStarted, setGameStarted] = useState(false);   // Game ever started
const [availableNumbers, setAvailableNumbers] = useState([]); // Uncalled numbers
```

#### UI State
```javascript
const [showGameSelector, setShowGameSelector] = useState(true);  // Screen view toggle
const [showAdminPanel, setShowAdminPanel] = useState(false);     // Admin panel toggle
const [loading, setLoading] = useState(false);                   // Loading indicator
const [socketConnected, setSocketConnected] = useState(false);   // Socket status
```

#### Selection & Input State
```javascript
const [selectedGameId, setSelectedGameId] = useState(null);      // Active game
const [selectedRoundId, setSelectedRoundId] = useState(null);    // Active round
const [selectedBulkNumbers, setSelectedBulkNumbers] = useState(new Set()); // Bulk call numbers
```

#### Notification & Winners
```javascript
const [announcements, setAnnouncements] = useState([]);   // Toast messages
const [winners, setWinners] = useState([]);               // Winners list
const [gameHistory, setGameHistory] = useState([]);       // Called numbers history
```

### Reference Variables (for optimization)

```javascript
const numbersRef = useRef([]);           // Avoid stale state in listeners
const isRunningRef = useRef(false);      // Track actual running status
const gameStartedRef = useRef(false);    // Track if game was started
```

---

## 🎮 Game Lifecycle

### Flow Diagram

```
1. Load Games
   ↓
2. Select Game
   ↓
3. Load/Create Round
   ↓
4. Connect WebSocket
   ↓
5. Load Game Status
   ├─→ Start Game
   │   ├─→ Pause Game
   │   └─→ Resume Game
   │       └─→ (back to start)
   └─→ Game Over
```

### State Transitions

```javascript
// Game Status Flow
IDLE → STARTED → PAUSED → RESUMED → COMPLETED

// Conditions:
- Can only START if: roundId exists, game not already running
- Can only PAUSE if: game is running or was started
- Can only RESUME if: game was started but is paused
- Can only CALL if: game is running and round exists
```

---

## 🔑 Key Conditions & Logic

### Game Start Conditions
```javascript
// Button is ENABLED when:
✓ selectedRoundId exists
✓ isRunning === false
✓ NOT (gameStarted && numbers.length > 5)  // Can't restart mid-game
✓ loading === false
```

### Game Pause Conditions
```javascript
// Button is ENABLED when:
✓ selectedRoundId exists
✓ (isRunning === true OR gameStarted === true)
✓ loading === false
```

### Game Resume Conditions
```javascript
// Button is ENABLED when:
✓ selectedRoundId exists
✓ NOT (isRunning && gameStarted)  // Can't resume while running
✓ loading === false
```

### Number Call Conditions
```javascript
// Button is ENABLED when:
✓ selectedRoundId exists
✓ isRunning === true
✓ loading === false
```

### Bulk Number Call Conditions
```javascript
// Validation rules:
✓ At least one number selected
✓ Selected number not already called
✓ Valid number range (1-90)
✓ User confirmation required for batch calls
```

### Winner Declaration Conditions
```javascript
// Prerequisites:
✓ selectedGameId must exist
✓ Ticket number must be valid integer > 0
✓ Ticket number format validation
✓ User confirmation required
```

---

## 🔄 API Endpoints Used

### Game Management APIs

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `getAllGamesAPI()` | GET | Fetch all available games | ✓ |
| `getGameStatusAPI(roundId)` | GET | Get current game state | ✓ |
| `getWinnersListAPI(roundId)` | GET | Fetch winners list | ✓ |
| `getCurrentRoundAPI(gameId)` | GET | Get active round | ✓ |
| `createRoundAPI(data)` | POST | Create new game round | ✓ |
| `startGameAPI(roundId)` | POST | Start the game | ✓ |
| `stopGameAPI(roundId)` | POST | Pause the game | ✓ |
| `callNumberAPI(roundId, data)` | POST | Call a number | ✓ |
| `forceWinnerByTicketNewAPI(data)` | POST | Declare winner | ✓ |

### Bulk Operations Endpoint

```javascript
// Bulk Number Call
POST /api/game/set-bulk-announcement
Headers: Authorization: Bearer {token}
Payload: { game_id, numbers: [] }
Response: { success, data: { called_count, failed_numbers } }
```

---

## 🔌 Socket Configuration

### Socket URL
```javascript
const SOCKET_URL = "https://api.luckyfunda.com";
```

### Connection Options
```javascript
const SOCKET_OPTIONS = {
  transports: ["polling", "websocket"],    // Fallback support
  reconnection: true,                       // Auto-reconnect
  reconnectionAttempts: 10,                 // Max retry attempts
  reconnectionDelay: 1000,                  // Initial delay
  reconnectionDelayMax: 5000,               // Max delay
  timeout: 20000,                           // Connection timeout
  autoConnect: true,                        // Auto-connect on init
  secure: true,                             // HTTPS/WSS
  path: "/socket.io/",                      // Socket.io path
  upgrade: true,                            // Protocol upgrade
  forceNew: true,                           // Force new connection
  multiplex: false,                         // No multiplexing
};
```

---

## ⚙️ Auto-Refresh & Sync

### 1. Winners Auto-Refresh
```javascript
// Every 5 seconds
useEffect(() => {
  const interval = setInterval(() => {
    loadWinnersList(selectedRoundId);
  }, 5000);
  return () => clearInterval(interval);
}, [selectedRoundId]);
```

### 2. WebSocket Auto-Sync
```javascript
// Every 5 seconds
useEffect(() => {
  const interval = setInterval(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("get_game_data", { game_id: selectedGameId });
    }
  }, 5000);
  return () => clearInterval(interval);
}, [selectedRoundId, selectedGameId]);
```

### 3. Games List Refresh
```javascript
// Every 10 seconds (only on game selector)
useEffect(() => {
  if (showGameSelector) {
    const interval = setInterval(() => {
      fetchAllGames();
    }, 10000);
    return () => clearInterval(interval);
  }
}, [showGameSelector]);
```

---

## 📱 Admin Panel Features

### 1. Bulk Numbers Call
**Features:**
- Input field for comma-separated numbers (e.g., "1,2,3" or "1-10")
- Visual grid of 90 numbers (clickable toggles)
- Select/Clear all functionality
- Quick random selection
- Real-time status feedback

**Validation:**
```javascript
// Individual numbers:
✓ Must be 1-90
✓ Must not be already called
✓ Must be valid integer

// Bulk call:
✓ At least one number selected
✓ Confirmation required
✓ Partial success handling (some numbers may fail)
```

### 2. Winner Declaration
**Features:**
- Enter ticket number
- Declare as winner
- Automatic winners list refresh
- Prize tracking

**Validation:**
```javascript
✓ Ticket number is positive integer
✓ Ticket number is not empty
✓ User confirmation required
```

---

## 🎯 Number Calling Methods

### 1. Auto Call
```javascript
// Single number call
await callNumberAPI(selectedRoundId);
// Server returns next available number
```

### 2. Manual Call (Admin)
```javascript
// Specific number call
await callNumberAPI(selectedRoundId, { number: 42 });
// Must not be already called
```

### 3. Bulk Call (Admin)
```javascript
// Multiple numbers call
POST /api/game/set-bulk-announcement
Payload: { game_id, numbers: [1, 2, 3, ...] }
// Can handle partial failures
```

---

## 📊 Data Structures

### Game Object
```javascript
{
  game_id: number,
  title: string,
  status: "live" | "upcoming" | "completed",
  start_datetime: ISO8601,
  created_at: ISO8601,
  gameStatus: { status, label, className },
  formattedDate: string,
  formattedTime: string,
  formattedCreatedAt: string
}
```

### Round Object
```javascript
{
  round_id: number,
  game_id: number,
  round_time: ISO8601,
  status: "active" | "completed"
}
```

### Game Status Response
```javascript
{
  called_numbers: number[],
  is_running: boolean,
  last_called_number: number,
  game_status: string,
  round_status: string,
  total_winners: number
}
```

### Winner Object
```javascript
{
  user_id: number,
  user_name: string,
  ticket_id: number,
  win_type: string,
  amount: number,
  timestamp: ISO8601
}
```

---

## 🔒 Authentication & Security

### Required
```javascript
// Token stored in localStorage
const token = localStorage.getItem("token");

// Included in all API calls
headers: {
  Authorization: `Bearer ${token}`
}
```

### Validation
- Token presence check before API calls
- Game ID validation before operations
- Round ID validation
- Number range validation (1-90)
- Ticket number validation

---

## ⚠️ Error Handling

### Connection Errors
```javascript
// Socket fallback: WebSocket → Polling
if (websocket fails) {
  try polling transport
}

// Reconnection attempts: max 10 tries with exponential backoff
reconnectionDelay: 1000ms → 5000ms (max)
```

### API Errors
```javascript
// Try-catch for all async operations
// Error messages displayed in announcements
// User-friendly error notifications
```

### Duplicate Prevention
```javascript
// Prevent duplicate updates in state
// Check for changes before setting state
// Use refs to track actual values
```

---

## 🎨 UI States & Indicators

### Status Indicators
```javascript
// Live Status
isRunning ? "🔴 LIVE" : "⏸ PAUSED"

// Socket Status
socketConnected ? "🟢 Connected" : "🔴 Disconnected"

// Game Status
"✅ COMPLETED" | "🔴 LIVE" | "⏳ UPCOMING"
```

### Loading States
```javascript
// Buttons show "..." or "⏳" during operations
// Disabled state during loading
// Color changes for different statuses
```

### Announcements (Toast-like)
```javascript
// Types: "info", "success", "warning", "error", "winner"
// Auto-dismiss after operations
// Scrollable history (last 20)
```

---

## 📈 Performance Optimizations

### 1. Ref-Based State Tracking
```javascript
// Avoid stale closures in event listeners
numbersRef.current = numbers;
isRunningRef.current = isRunning;
```

### 2. Conditional Updates
```javascript
// Only update state if values actually changed
if (newValue !== oldValue) {
  setState(newValue);
}
```

### 3. Debounced Auto-Refresh
```javascript
// Check if refresh already in progress
if (isRefreshing) return;
isRefreshing = true;
// ... perform refresh
isRefreshing = false;
```

### 4. Efficient Filtering
```javascript
// Use Set for O(1) lookups
const calledSet = new Set(called_numbers);
const available = allNumbers.filter(n => !calledSet.has(n));
```

---

## 🧹 Cleanup & Unmounting

### Socket Cleanup
```javascript
useEffect(() => {
  return () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };
}, []);
```

### Interval Cleanup
```javascript
useEffect(() => {
  const interval = setInterval(...);
  return () => clearInterval(interval);
}, []);
```

### Timeout Cleanup
```javascript
if (reconnectTimeoutRef.current) {
  clearTimeout(reconnectTimeoutRef.current);
}
```

---

## 🚀 Usage Example

### Basic Setup

```javascript
import LiveGame from './components/LiveGame';

function App() {
  return (
    <div>
      <LiveGame />
    </div>
  );
}

export default App;
```

### Prerequisites
1. User must be authenticated (token in localStorage)
2. API endpoints must be accessible
3. WebSocket server must be running
4. At least one game must exist in the system

---

## 🔍 Common Issues & Solutions

### Issue: Socket Disconnected
**Cause:** Network issue or server down
**Solution:** Auto-reconnect kicks in, user can refresh
**Indicator:** Red socket status badge

### Issue: Numbers Not Updating
**Cause:** Real-time sync missed, auto-refresh can catch it
**Solution:** Click "🔄 Refresh" button
**Fallback:** Socket auto-sync every 5 seconds

### Issue: Button Disabled
**Cause:** Missing required state or ongoing operation
**Solution:** Check game round exists, game state is correct
**Debug:** See button title attribute for reason

### Issue: Bulk Call Fails
**Cause:** Some numbers already called or server error
**Solution:** Already-called numbers are skipped, retry others
**Info:** Partial success shows which numbers failed

---

## 📝 Best Practices

### For Operators
1. ✅ Always create round before starting
2. ✅ Keep socket connected (check green indicator)
3. ✅ Refresh manually if numbers lag
4. ✅ Confirm before bulk operations
5. ✅ Check winners list periodically

### For Developers
1. ✅ Always check selectedRoundId before API calls
2. ✅ Use refs to prevent stale closures
3. ✅ Cleanup intervals and timeouts
4. ✅ Handle partial failures in bulk operations
5. ✅ Log important state changes

---

## 📞 Support & Debugging

### Debug Logs
- Console shows detailed operation logs with emoji prefix
- All state changes are logged
- API calls are logged with request/response
- Socket events are logged with event name

### Key Log Patterns
```javascript
🔌 Socket connection events
📞 Number calling operations
🎮 Game state changes
📤 API requests
📥 API responses
🔄 Auto-refresh cycles
```

---

## 📦 Dependencies

```javascript
"react": "^18.x",
"socket.io-client": "^4.x"
```

### Custom Services (Imported)
- `startGameAPI`
- `stopGameAPI`
- `callNumberAPI`
- `getGameStatusAPI`
- `getWinnersListAPI`
- `getAllGamesAPI`
- `getCurrentRoundAPI`
- `forceWinnerByTicketNewAPI`
- `createRoundAPI`

---

## 📄 CSS Classes Used

- `.live-game-container` - Main container
- `.live-header` - Header section
- `.admin-panel` - Admin controls section
- `.game-stats-bar` - Statistics display
- `.current-card` - Current number display
- `.control-panel` - Game control buttons
- `.winners-panel` - Winners list
- `.numbers-grid` - 90-number board
- `.status-live` / `.status-paused` - Status indicators

---

**Last Updated:** August 2026
**Version:** 1.0
**Author:** Development Team
