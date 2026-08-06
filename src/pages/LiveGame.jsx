// import { useEffect, useState, useRef, useCallback } from "react";
// import {
//   startGameAPI,
//   stopGameAPI,
//   callNumberAPI,
//   getGameStatusAPI,
//   getWinnersListAPI,
//   getAllGamesAPI,
//   getCurrentRoundAPI,
//   forceWinnerByTicketNewAPI,
//   createRoundAPI,
// } from "../services/api";
// import { io } from "socket.io-client";
// import "../styles/liveGame.css";

// const TOTAL_NUMBERS = 90;
// const SOCKET_URL = "https://api.luckyfunda.com";

// console.log("🔌 Using Socket URL:", SOCKET_URL);
// console.log("🎮 LiveGame component initialized");

// // ─── helpers ────────────────────────────────────────────────────────────────

// const getGameStatus = (game) => {
//   console.log("📊 Getting game status for:", game?.game_id);
//   switch (game.status) {
//     case "completed":
//       return { status: "completed", label: "✅ COMPLETED", className: "status-completed" };
//     case "live":
//       return { status: "live", label: "🔴 LIVE", className: "status-live" };
//     case "upcoming":
//       return { status: "upcoming", label: "⏳ UPCOMING", className: "status-pending" };
//     default:
//       return { status: "unknown", label: "❓ UNKNOWN", className: "status-error" };
//   }
// };

// const formatGame = (game) => {
//   const formatted = {
//     ...game,
//     gameStatus: getGameStatus(game),
//     formattedDate: game.start_datetime
//       ? new Date(game.start_datetime).toLocaleDateString()
//       : "No Date Set",
//     formattedTime: game.start_datetime
//       ? new Date(game.start_datetime).toLocaleTimeString()
//       : "No Time Set",
//     formattedCreatedAt: game.created_at
//       ? new Date(game.created_at).toLocaleString()
//       : "Invalid Date",
//   };
//   console.log("📦 Formatted game:", formatted.game_id, formatted.title);
//   return formatted;
// };

// // ─── component ──────────────────────────────────────────────────────────────

// export default function LiveGame() {
//   console.log("🔄 LiveGame component rendering");

//   // core game state
//   const [numbers, setNumbers] = useState([]);
//   const [current, setCurrent] = useState(null);
//   const [isRunning, setIsRunning] = useState(false);
//   const [gameHistory, setGameHistory] = useState([]);
//   const [announcements, setAnnouncements] = useState([]);
//   const [winners, setWinners] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [availableNumbers, setAvailableNumbers] = useState([]);
//   const [gameStarted, setGameStarted] = useState(false);
//   const [socketConnected, setSocketConnected] = useState(false);

//   // game / round selection
//   const [allGames, setAllGames] = useState([]);
//   const [selectedGameId, setSelectedGameId] = useState(null);
//   const [selectedRoundId, setSelectedRoundId] = useState(null);
//   const [showGameSelector, setShowGameSelector] = useState(true);
//   const [gamesError, setGamesError] = useState(null);

//   // admin panel
//   const [showAdminPanel, setShowAdminPanel] = useState(false);
//   const [manualNumber, setManualNumber] = useState("");
//   const [manualNumberError, setManualNumberError] = useState("");
//   const [winnerTicketId, setWinnerTicketId] = useState("");
//   const [bulkNumbersInput, setBulkNumbersInput] = useState("");
//   const [selectedBulkNumbers, setSelectedBulkNumbers] = useState(new Set());
//   const [bulkCallStatus, setBulkCallStatus] = useState("");

//   // Refs for preventing duplicate updates
//   const socketRef = useRef(null);
//   const autoRefreshRef = useRef(null);
//   const gamesRefreshRef = useRef(null);
//   const reconnectTimeoutRef = useRef(null);
//   const isUpdatingRef = useRef(false);
//   const lastUpdateRef = useRef(null);
//   const numbersRef = useRef([]);
//   const isRunningRef = useRef(false);
//   const gameStartedRef = useRef(false);

//   // ── announcements helper ────────────────────────────────────────────────

//   const addAnnouncement = useCallback((msg, type = "info") => {
//     console.log(`📢 [${type}] ${msg}`);
//     setAnnouncements((prev) =>
//       [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 20)
//     );
//   }, []);

//   // ── game list ───────────────────────────────────────────────────────────

//   const fetchAllGames = useCallback(async () => {
//     console.log("🔄 Fetching all games...");
//     try {
//       setGamesError(null);
//       const response = await getAllGamesAPI();
//       console.log("📥 Games API Response:", response);
//       if (response.success && response.data?.games) {
//         const formattedGames = response.data.games.map(formatGame);
//         console.log("✅ Games loaded:", formattedGames.length);
//         setAllGames(formattedGames);
//       } else {
//         console.error("❌ Failed to load games:", response.message);
//         setGamesError(response.message || "Failed to load games");
//         setAllGames([]);
//       }
//     } catch (err) {
//       console.error("❌ Error fetching games:", err);
//       setGamesError(err.message || "Failed to load games");
//       setAllGames([]);
//     }
//   }, []);

//   // ── round helpers ───────────────────────────────────────────────────────

//   const createNewRound = async (gameId) => {
//     console.log(`🔄 Creating new round for game: ${gameId}`);
//     try {
//       const res = await createRoundAPI({ game_id: gameId, round_time: new Date().toISOString() });
//       console.log("📥 Create round response:", res);
//       if (res.success && res.data?.round_id) {
//         console.log(`✅ Round created: ${res.data.round_id}`);
//         return res.data.round_id;
//       }
//       console.error("❌ Failed to create round");
//       return null;
//     } catch (err) {
//       console.error("❌ Error creating round:", err);
//       return null;
//     }
//   };

//   const loadCurrentRound = async (gameId) => {
//     console.log(`🔄 Loading current round for game: ${gameId}`);
//     try {
//       const res = await getCurrentRoundAPI(gameId);
//       console.log("📥 Current round response:", res);
//       if (res.success && res.data?.round_id) {
//         console.log(`✅ Current round found: ${res.data.round_id}`);
//         setSelectedRoundId(res.data.round_id);
//         return res.data.round_id;
//       }
//       console.log("ℹ️ No current round found");
//       return null;
//     } catch (err) {
//       console.error("❌ Error loading current round:", err);
//       return null;
//     }
//   };

//   // ── game status ─────────────────────────────────────────────────────────

//   const loadGameStatus = useCallback(async (roundId) => {
//     console.log(`🔄 Loading game status for round: ${roundId}`);
//     if (!roundId) {
//       console.warn("⚠️ No roundId provided to loadGameStatus");
//       return;
//     }

//     // Prevent concurrent updates
//     if (isUpdatingRef.current) {
//       console.log("⏭️ Skipping loadGameStatus (update in progress)");
//       return;
//     }

//     isUpdatingRef.current = true;

//     try {
//       const res = await getGameStatusAPI(roundId);
//       console.log("📥 Game status response:", res);

//       if (res.success && res.data) {
//         const {
//           called_numbers = [],
//           is_running,
//           last_called_number,
//           game_status,
//           round_status
//         } = res.data;

//         console.log(`📊 Game status: called=${called_numbers.length}, is_running=${is_running}, game_status=${game_status}`);

//         // ✅ Only update numbers if they changed
//         const currentNumbers = numbersRef.current || [];
//         const numbersChanged = called_numbers.length !== currentNumbers.length ||
//           called_numbers.some((num, idx) => num !== currentNumbers[idx]);

//         if (numbersChanged) {
//           console.log(`📊 Numbers changed: ${currentNumbers.length} → ${called_numbers.length}`);
//           setNumbers(called_numbers);
//           numbersRef.current = called_numbers;

//           if (last_called_number) {
//             console.log(`🎯 Setting current number to last_called: ${last_called_number}`);
//             setCurrent(last_called_number);
//           } else if (called_numbers.length > 0) {
//             console.log(`🎯 Setting current number to last from array: ${called_numbers[called_numbers.length - 1]}`);
//             setCurrent(called_numbers[called_numbers.length - 1]);
//           }

//           setGameHistory(
//             called_numbers
//               .map((num) => ({ number: num, time: new Date().toLocaleTimeString() }))
//               .reverse()
//               .slice(0, 20)
//           );

//           const calledSet = new Set(called_numbers);
//           const available = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).filter((n) => !calledSet.has(n));
//           setAvailableNumbers(available);
//           console.log(`📊 Available numbers: ${available.length}`);
//         } else {
//           console.log("⏭️ Numbers unchanged, skipping update");
//         }

//         // ✅ Only update isRunning if changed
//         let shouldBeRunning = is_running;
//         if (typeof is_running === 'undefined' || is_running === null) {
//           shouldBeRunning = (game_status === 'live' || round_status === 'live');
//           console.log(`📊 is_running undefined, using game_status: ${game_status} → isRunning=${shouldBeRunning}`);
//         }

//         const shouldBeRunningBool = !!shouldBeRunning;
//         if (isRunningRef.current !== shouldBeRunningBool) {
//           console.log(`🔄 isRunning changed: ${isRunningRef.current} → ${shouldBeRunningBool}`);
//           setIsRunning(shouldBeRunningBool);
//           isRunningRef.current = shouldBeRunningBool;
//         }

//         if (shouldBeRunningBool) {
//           setGameStarted(true);
//           gameStartedRef.current = true;
//         }

//         if (called_numbers.length > 0 && !gameStartedRef.current) {
//           console.log("🎮 Game has numbers called, marking as started");
//           setGameStarted(true);
//           gameStartedRef.current = true;
//         }
//       } else {
//         console.error("❌ Failed to load game status:", res.message);
//       }
//     } catch (err) {
//       console.error("❌ loadGameStatus error:", err);
//     } finally {
//       isUpdatingRef.current = false;
//     }
//   }, []);

//   const loadWinnersList = useCallback(async (roundId) => {
//     console.log(`🔄 Loading winners for round: ${roundId}`);
//     if (!roundId) return;
//     try {
//       const res = await getWinnersListAPI(roundId);
//       console.log("📥 Winners response:", res);
//       if (res.success && res.data) {
//         console.log(`🏆 Winners loaded: ${res.data.length}`);
//         setWinners(res.data);
//       }
//     } catch (err) {
//       console.error("❌ loadWinnersList error:", err);
//     }
//   }, []);

//   // ── socket setup ─────────────────────────────────────────────────────────

//   const setupSocket = useCallback((gameId) => {
//     console.log(`🔌 Setting up socket for game: ${gameId}`);

//     // Clean up previous socket
//     if (socketRef.current) {
//       console.log("🧹 Cleaning up previous socket");
//       socketRef.current.disconnect();
//       socketRef.current = null;
//     }

//     // Clear any pending reconnect timeout
//     if (reconnectTimeoutRef.current) {
//       clearTimeout(reconnectTimeoutRef.current);
//       reconnectTimeoutRef.current = null;
//     }

//     console.log(`🔄 Creating new socket connection to: ${SOCKET_URL}`);

//     // Socket options
//     const SOCKET_OPTIONS = {
//       transports: ["polling", "websocket"],
//       reconnection: true,
//       reconnectionAttempts: 10,
//       reconnectionDelay: 1000,
//       reconnectionDelayMax: 5000,
//       timeout: 20000,
//       autoConnect: true,
//       secure: true,
//       rejectUnauthorized: false,
//       path: "/socket.io/",
//       upgrade: true,
//       rememberUpgrade: true,
//       forceNew: true,
//       multiplex: false,
//     };

//     const socket = io(SOCKET_URL, SOCKET_OPTIONS);
//     socketRef.current = socket;

//     // Check connection immediately
//     if (socket.connected) {
//       console.log("✅ Socket already connected!");
//       setSocketConnected(true);
//     }

//     // Also check after small delay
//     setTimeout(() => {
//       if (socket.connected) {
//         console.log("✅ Socket confirmed connected after delay");
//         setSocketConnected(true);
//       }
//     }, 100);

//     // =====================================
//     // SOCKET EVENT HANDLERS
//     // =====================================

//     // ── CONNECT ──────────────────────
//     socket.on("connect", () => {
//       console.log("✅ Socket connected successfully!");
//       setSocketConnected(true);

//       // Join game room first
//       console.log(`📤 Joining game room: game_${gameId}`);
//       socket.emit("join_game", { game_id: gameId });

//       // Then request game data
//       console.log(`📤 Emitting 'get_game_data' for game: ${gameId}`);
//       socket.emit("get_game_data", { game_id: gameId });

//       addAnnouncement("✅ Socket connected", "success");
//     });

//     // ── CONNECT ERROR ──────────────────
//     socket.on("connect_error", (error) => {
//       console.error("❌ Socket connection error:", error);
//       setSocketConnected(false);
//       addAnnouncement(`⚠️ Socket connection error: ${error.message}`, "error");

//       // Try polling if websocket fails
//       if (socket.io.opts.transports && socket.io.opts.transports[0] === "websocket") {
//         console.log("🔄 Trying to reconnect with polling...");
//         socket.io.opts.transports = ["polling", "websocket"];
//         socket.connect();
//       }
//     });

//     // ── DISCONNECT ────────────────────
//     socket.on("disconnect", (reason) => {
//       console.log("🔌 Socket disconnected:", reason);
//       setSocketConnected(false);
//       addAnnouncement(`⚠️ Socket disconnected: ${reason}`, "error");
//       if (reason === "io server disconnect") {
//         console.log("🔄 Server disconnected, attempting to reconnect...");
//         socket.connect();
//       }
//     });

//     // ── RECONNECT ─────────────────────
//     socket.on("reconnect", (attempt) => {
//       console.log(`🔄 Socket reconnected (attempt ${attempt})`);
//       setSocketConnected(true);

//       // Re-join game room
//       console.log(`📤 Re-joining game room: game_${gameId}`);
//       socket.emit("join_game", { game_id: gameId });

//       console.log(`📤 Re-emitting 'get_game_data' for game: ${gameId}`);
//       socket.emit("get_game_data", { game_id: gameId });
//       addAnnouncement("✅ Socket reconnected", "success");
//     });

//     // ── RECONNECT ATTEMPT ─────────────
//     socket.on("reconnect_attempt", (attempt) => {
//       console.log(`🔄 Socket reconnect attempt ${attempt}`);
//     });

//     // ── RECONNECT ERROR ───────────────
//     socket.on("reconnect_error", (error) => {
//       console.error("❌ Socket reconnect error:", error);
//     });

//     // ── RECONNECT FAILED ──────────────
//     socket.on("reconnect_failed", () => {
//       console.error("❌ Socket reconnect failed");
//       setSocketConnected(false);
//       addAnnouncement("❌ Socket connection failed. Please refresh.", "error");
//     });

//     // ── NUMBER CALLED ──────────────────
//     socket.on("number_called", (data) => {
//       console.log("📞 Number called event received:", data);
//       setSocketConnected(true);

//       if (data.game_id != gameId) {
//         console.log(`⏭️ Skipping number_called for different game: ${data.game_id} (expected: ${gameId})`);
//         return;
//       }

//       const calledNumber = data.number;
//       console.log(`🎯 Number called: ${calledNumber}`);
//       setCurrent(calledNumber);

//       setNumbers((prev) => {
//         // Check for duplicate update
//         const updateKey = `${prev.length}-${calledNumber}`;
//         if (lastUpdateRef.current === updateKey) {
//           console.log("⏭️ Skipping duplicate number_called update");
//           return prev;
//         }
//         lastUpdateRef.current = updateKey;

//         if (prev.includes(calledNumber)) {
//           console.log(`ℹ️ Number ${calledNumber} already called`);
//           return prev;
//         }

//         console.log(`➕ Adding number ${calledNumber} to called list`);
//         const newNumbers = [...prev, calledNumber];
//         numbersRef.current = newNumbers;
//         const allNumbers = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);
//         const calledSet = new Set(newNumbers);
//         setAvailableNumbers(allNumbers.filter(n => !calledSet.has(n)));
//         return newNumbers;
//       });

//       // Only update isRunning if not already running
//       if (!isRunningRef.current) {
//         console.log("▶️ Setting isRunning to true (number called)");
//         setIsRunning(true);
//         isRunningRef.current = true;
//       }
//       setGameStarted(true);
//       gameStartedRef.current = true;
//       addAnnouncement(`📢 Number Called: ${data.number}`, "success");
//     });

//     // ── OLD NUMBERS ────────────────────
//     socket.on("old_numbers", (data) => {
//       console.log("📜 Old numbers received:", data);
//       setSocketConnected(true);

//       // Prevent duplicate updates
//       const updateKey = `${data.calledNumbers?.length || 0}-${data.is_running || false}`;
//       if (lastUpdateRef.current === updateKey) {
//         console.log("⏭️ Skipping duplicate old_numbers update");
//         return;
//       }
//       lastUpdateRef.current = updateKey;

//       if (data?.calledNumbers) {
//         const newNumbers = data.calledNumbers;
//         const currentNumbers = numbersRef.current || [];

//         // Check if numbers actually changed
//         const numbersChanged = newNumbers.length !== currentNumbers.length ||
//           newNumbers.some((num, idx) => num !== currentNumbers[idx]);

//         if (numbersChanged) {
//           console.log(`📊 Setting called numbers: ${newNumbers.length} (was ${currentNumbers.length})`);
//           setNumbers(newNumbers);
//           numbersRef.current = newNumbers;

//           const calledSet = new Set(newNumbers);
//           setAvailableNumbers(
//             Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).filter((n) => !calledSet.has(n))
//           );

//           if (newNumbers.length > 0) {
//             const last = newNumbers[newNumbers.length - 1];
//             console.log(`🎯 Setting current number to: ${last}`);
//             setCurrent(last);
//             setGameStarted(true);
//             gameStartedRef.current = true;
//           }
//         } else {
//           console.log("⏭️ Numbers unchanged, skipping update");
//         }

//         // Better isRunning calculation
//         let shouldBeRunning = false;

//         if (typeof data.is_running !== 'undefined') {
//           shouldBeRunning = !!data.is_running;
//           console.log(`📡 Using backend is_running: ${shouldBeRunning}`);
//         }
//         else if (data.started && !data.paused && !data.completed) {
//           shouldBeRunning = true;
//           console.log(`📊 Calculated: started=true, paused=false, completed=false → isRunning=true`);
//         }
//         else if (data.paused) {
//           shouldBeRunning = false;
//           console.log(`⏸️ Game is paused, setting isRunning to false`);
//         }
//         else if (data.completed) {
//           shouldBeRunning = false;
//           console.log(`🏁 Game is completed, setting isRunning to false`);
//         }
//         else {
//           shouldBeRunning = false;
//           console.log(`📊 Default: no status info, setting isRunning to false`);
//         }

//         // Only update if changed
//         if (isRunningRef.current !== shouldBeRunning) {
//           console.log(`▶️ Setting isRunning from ${isRunningRef.current} to ${shouldBeRunning}`);
//           setIsRunning(shouldBeRunning);
//           isRunningRef.current = shouldBeRunning;
//         }

//         if (shouldBeRunning) {
//           setGameStarted(true);
//           gameStartedRef.current = true;
//         }
//       }
//     });

//     // ── GAME STARTED ────────────────────
//     socket.on("game_started", (data) => {
//       console.log("🎮 Game Started event received:", data);
//       setSocketConnected(true);
//       if (!isRunningRef.current) {
//         console.log("▶️ Setting isRunning to true (game_started)");
//         setIsRunning(true);
//         isRunningRef.current = true;
//       }
//       setGameStarted(true);
//       gameStartedRef.current = true;
//       addAnnouncement("🎮 Game Started", "success");
//     });

//     // ── GAME PAUSED ─────────────────────
//     socket.on("game_paused", (data) => {
//       console.log("⏸️ Game Paused event received:", data);
//       setSocketConnected(true);
//       if (isRunningRef.current) {
//         console.log("⏸️ Setting isRunning to false (game_paused)");
//         setIsRunning(false);
//         isRunningRef.current = false;
//       }
//       addAnnouncement("⏸️ Game Paused", "warning");
//     });

//     // ── GAME RESUMED ────────────────────
//     socket.on("game_resumed", (data) => {
//       console.log("▶️ Game Resumed event received:", data);
//       setSocketConnected(true);
//       if (!isRunningRef.current) {
//         console.log("▶️ Setting isRunning to true (game_resumed)");
//         setIsRunning(true);
//         isRunningRef.current = true;
//       }
//       setGameStarted(true);
//       gameStartedRef.current = true;
//       addAnnouncement("▶️ Game Resumed", "success");
//     });

//     // ── GAME OVER ───────────────────────
//     socket.on("game_over", (data) => {
//       console.log("🏁 Game Over event received:", data);
//       setSocketConnected(true);
//       if (isRunningRef.current) {
//         console.log("⏹️ Setting isRunning to false (game_over)");
//         setIsRunning(false);
//         isRunningRef.current = false;
//       }
//       addAnnouncement("🏁 Game Over", "info");
//     });

//     // ── ALL NUMBERS COMPLETED ──────────
//     socket.on("all_numbers_completed", (data) => {
//       console.log("🎯 All numbers completed event received:", data);
//       setSocketConnected(true);
//       if (isRunningRef.current) {
//         setIsRunning(false);
//         isRunningRef.current = false;
//       }
//       addAnnouncement("🎯 All numbers have been called!", "info");
//     });

//     // ── ERROR ───────────────────────────
//     socket.on("error", (error) => {
//       console.error("❌ Socket error:", error);
//     });

//     return socket;
//   }, [addAnnouncement]);

//   // ── game select / back ──────────────────────────────────────────────────

//   const handleGameSelect = async (gameId) => {
//     console.log(`🎯 Game selected: ${gameId}`);
//     setSelectedGameId(gameId);
//     setShowGameSelector(false);
//     setNumbers([]);
//     numbersRef.current = [];
//     setCurrent(null);
//     setGameHistory([]);
//     setWinners([]);
//     setAnnouncements([]);
//     setIsRunning(false);
//     isRunningRef.current = false;
//     setGameStarted(false);
//     gameStartedRef.current = false;
//     setSocketConnected(false);
//     setManualNumberError("");
//     setBulkNumbersInput("");
//     setSelectedBulkNumbers(new Set());
//     setBulkCallStatus("");

//     console.log("🔌 Setting up socket...");
//     setupSocket(gameId);

//     console.log("🔄 Loading current round...");
//     let roundId = await loadCurrentRound(gameId);
//     if (!roundId) {
//       console.log("ℹ️ No current round found, creating new round...");
//       addAnnouncement("Creating new round...", "info");
//       roundId = await createNewRound(gameId);
//       if (roundId) {
//         console.log(`✅ New round created: ${roundId}`);
//         setSelectedRoundId(roundId);
//         addAnnouncement("✅ New round created!", "success");
//       } else {
//         console.error("❌ Failed to create round");
//         addAnnouncement("❌ Failed to create round", "error");
//       }
//     }

//     if (roundId) {
//       console.log(`🔄 Loading game status for round: ${roundId}`);
//       setTimeout(() => {
//         loadGameStatus(roundId);
//         loadWinnersList(roundId);
//       }, 100);
//     }

//     const game = allGames.find((g) => g.game_id === gameId);
//     const gameTitle = game?.title || "Game";
//     console.log(`✅ Selected game: ${gameTitle} (${gameId})`);
//     addAnnouncement(`🎮 Selected: ${gameTitle}`, "success");
//   };

//   const handleBackToGames = () => {
//     console.log("🔙 Going back to games list");
//     if (autoRefreshRef.current) {
//       console.log("🧹 Clearing auto-refresh interval");
//       clearInterval(autoRefreshRef.current);
//     }
//     if (reconnectTimeoutRef.current) {
//       clearTimeout(reconnectTimeoutRef.current);
//       reconnectTimeoutRef.current = null;
//     }
//     if (socketRef.current) {
//       console.log("🔌 Disconnecting socket");
//       socketRef.current.disconnect();
//       socketRef.current = null;
//     }
//     setShowGameSelector(true);
//     setSelectedGameId(null);
//     setSelectedRoundId(null);
//     setShowAdminPanel(false);
//     setGameStarted(false);
//     gameStartedRef.current = false;
//     setSocketConnected(false);
//     console.log("🔄 Fetching games list");
//     fetchAllGames();
//   };

//   // ── controls ────────────────────────────────────────────────────────────

//   const startGame = async () => {
//     console.log("🎮 Start Game button clicked");
//     console.log(`📊 Current state: selectedRoundId=${selectedRoundId}, isRunning=${isRunning}, numbers=${numbers.length}, gameStarted=${gameStarted}, socketConnected=${socketConnected}`);

//     if (!selectedRoundId) {
//       console.error("❌ No active round found");
//       addAnnouncement("❌ No active round found", "error");
//       return;
//     }

//     if (isRunning) {
//       console.warn("⚠️ Game is currently running");
//       addAnnouncement("⚠️ Game is already running! Use Pause if needed.", "warning");
//       return;
//     }

//     // ✅ Allow restart if game was started before
//     if (gameStarted && !isRunning) {
//       console.log("ℹ️ Game was started before, attempting to restart...");
//     }

//     setLoading(true);
//     try {
//       console.log(`📤 Calling startGameAPI for round: ${selectedRoundId}`);
//       const res = await startGameAPI(selectedRoundId);
//       console.log("📥 Start game response:", res);

//       if (res.success) {
//         console.log("✅ Game started successfully");
//         console.log("▶️ Setting isRunning to true (startGame)");
//         setIsRunning(true);
//         isRunningRef.current = true;
//         setGameStarted(true);
//         gameStartedRef.current = true;
//         addAnnouncement("🎮 Game started! Auto-calling active", "success");

//         // Request game data to sync state
//         if (socketRef.current) {
//           console.log(`📤 Requesting game data to sync state`);
//           socketRef.current.emit("get_game_data", { game_id: selectedGameId });
//         }

//         // ✅ Reload game status after start
//         setTimeout(() => {
//           loadGameStatus(selectedRoundId);
//         }, 500);
//       } else {
//         console.error("❌ Failed to start game:", res.message);
//         addAnnouncement(`❌ ${res.message || "Failed to start"}`, "error");
//       }
//     } catch (err) {
//       console.error("❌ Error starting game:", err);
//       const errorMsg = err.response?.data?.message || err.message;
//       console.error("❌ Error message:", errorMsg);
//       addAnnouncement(`❌ ${errorMsg}`, "error");
//     } finally {
//       setLoading(false);
//       console.log("🔧 Loading state set to false");
//     }
//   };

//   const pauseGame = async () => {
//     console.log("⏸️ Pause Game button clicked");
//     console.log(`📊 Current state: selectedRoundId=${selectedRoundId}, isRunning=${isRunning}, socketConnected=${socketConnected}`);

//     if (!selectedRoundId) {
//       console.error("❌ No active round found");
//       addAnnouncement("❌ No active round found", "error");
//       return;
//     }

//     // ✅ Allow pause even if isRunning=false but gameStarted=true
//     if (!isRunning && !gameStarted) {
//       console.warn("⚠️ Game is not running");
//       addAnnouncement("⚠️ Game is not running", "warning");
//       return;
//     }

//     if (!window.confirm("Pause the game?")) {
//       console.log("⏸️ Pause canceled by user");
//       return;
//     }

//     setLoading(true);
//     try {
//       console.log(`📤 Calling stopGameAPI for round: ${selectedRoundId}`);
//       const res = await stopGameAPI(selectedRoundId);
//       console.log("📥 Stop game response:", res);

//       if (res.success) {
//         console.log("✅ Game paused successfully");
//         console.log("⏸️ Setting isRunning to false (pauseGame)");
//         setIsRunning(false);
//         isRunningRef.current = false;
//         addAnnouncement("⏸️ Game paused!", "warning");

//         // Emit 'pause_game' - Backend handles this
//         console.log(`📤 Emitting 'pause_game' via socket for game: ${selectedGameId}`);
//         if (socketRef.current) {
//           socketRef.current.emit("pause_game", { game_id: selectedGameId });
//         } else {
//           console.warn("⚠️ Socket not available, game may not sync");
//         }

//         // ✅ Reload game status after pause
//         setTimeout(() => {
//           loadGameStatus(selectedRoundId);
//         }, 500);
//       } else {
//         console.error("❌ Failed to pause game:", res.message);
//         addAnnouncement(`❌ ${res.message || "Failed to pause"}`, "error");
//       }
//     } catch (err) {
//       console.error("❌ Error pausing game:", err);
//       const errorMsg = err.response?.data?.message || err.message;
//       console.error("❌ Error message:", errorMsg);
//       addAnnouncement(`❌ ${errorMsg}`, "error");
//     } finally {
//       setLoading(false);
//       console.log("🔧 Loading state set to false");
//     }
//   };

//   // const resumeGame = async () => {
//   //   console.log("▶️ Resume Game button clicked");
//   //   console.log(`📊 Current state: selectedRoundId=${selectedRoundId}, isRunning=${isRunning}, gameStarted=${gameStarted}, socketConnected=${socketConnected}`);

//   //   if (!selectedRoundId) {
//   //     console.error("❌ No active round found");
//   //     addAnnouncement("❌ No active round found", "error");
//   //     return;
//   //   }

//   //   // First, check actual game status on server
//   //   setLoading(true);
//   //   try {
//   //     console.log(`📤 Checking game status before resume`);
//   //     const statusRes = await getGameStatusAPI(selectedRoundId);
//   //     console.log("📥 Status check before resume:", statusRes);

//   //     if (statusRes.success && statusRes.data) {
//   //       const serverRunning = statusRes.data.is_running || false;
//   //       const serverStatus = statusRes.data.status || 'unknown';
//   //       const calledNumbers = statusRes.data.called_numbers || [];

//   //       console.log(`📊 Server state: is_running=${serverRunning}, status=${serverStatus}, called=${calledNumbers.length}`);

//   //       // If game is already running on server, just update state
//   //       if (serverRunning) {
//   //         console.log("✅ Game is already running on server, updating state");
//   //         setIsRunning(true);
//   //         isRunningRef.current = true;
//   //         setGameStarted(true);
//   //         gameStartedRef.current = true;

//   //         // Update numbers if needed
//   //         if (calledNumbers.length > 0) {
//   //           setNumbers(calledNumbers);
//   //           numbersRef.current = calledNumbers;
//   //           setCurrent(calledNumbers[calledNumbers.length - 1]);
//   //         }

//   //         addAnnouncement("✅ Game is already running!", "success");
//   //         setLoading(false);
//   //         return;
//   //       }

//   //       // If game is completed, can't resume
//   //       if (serverStatus === 'completed' || statusRes.data.completed) {
//   //         console.warn("⚠️ Game is completed, cannot resume");
//   //         addAnnouncement("❌ Game is already completed", "error");
//   //         setLoading(false);
//   //         return;
//   //       }

//   //       // If game has called numbers but not started, sync state
//   //       if (calledNumbers.length > 0 && !serverRunning) {
//   //         console.log(`📊 Game has ${calledNumbers.length} numbers called but is not running`);
//   //         setNumbers(calledNumbers);
//   //         numbersRef.current = calledNumbers;
//   //         setCurrent(calledNumbers[calledNumbers.length - 1]);
//   //         setGameStarted(true);
//   //         gameStartedRef.current = true;

//   //         // Update available numbers
//   //         const calledSet = new Set(calledNumbers);
//   //         const available = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).filter((n) => !calledSet.has(n));
//   //         setAvailableNumbers(available);
//   //       }

//   //       // If game is not running and not completed, we can resume
//   //       if (!serverRunning) {
//   //         console.log("✅ Game is paused on server, resuming...");

//   //         // Emit resume via socket
//   //         if (socketRef.current && socketRef.current.connected) {
//   //           // Optimistic update
//   //           setIsRunning(true);
//   //           isRunningRef.current = true;
//   //           setGameStarted(true);
//   //           gameStartedRef.current = true;

//   //           socketRef.current.emit("resume_game", { game_id: selectedGameId });
//   //           addAnnouncement("▶️ Game resumed!", "success");

//   //           // Reload game status after resume
//   //           setTimeout(() => {
//   //             loadGameStatus(selectedRoundId);
//   //             loadWinnersList(selectedRoundId);
//   //           }, 500);
//   //         } else {
//   //           console.warn("⚠️ Socket not available, trying API fallback");
//   //           // Fallback: try to resume via API
//   //           try {
//   //             const startRes = await startGameAPI(selectedRoundId);
//   //             if (startRes.success) {
//   //               console.log("✅ Game resumed via API");
//   //               setIsRunning(true);
//   //               isRunningRef.current = true;
//   //               setGameStarted(true);
//   //               gameStartedRef.current = true;
//   //               addAnnouncement("▶️ Game resumed via API!", "success");

//   //               setTimeout(() => {
//   //                 loadGameStatus(selectedRoundId);
//   //               }, 500);
//   //             } else {
//   //               throw new Error(startRes.message || "Failed to resume");
//   //             }
//   //           } catch (apiErr) {
//   //             console.error("❌ API resume failed:", apiErr);
//   //             addAnnouncement(`❌ ${apiErr.message || "Failed to resume"}`, "error");
//   //           }
//   //         }
//   //       }
//   //     } else {
//   //       // If status check fails, try to resume anyway (optimistic)
//   //       console.log("⚠️ Status check failed, attempting optimistic resume");
//   //       if (socketRef.current && socketRef.current.connected) {
//   //         setIsRunning(true);
//   //         isRunningRef.current = true;
//   //         socketRef.current.emit("resume_game", { game_id: selectedGameId });
//   //         addAnnouncement("▶️ Attempting to resume game...", "info");

//   //         setTimeout(() => {
//   //           loadGameStatus(selectedRoundId);
//   //         }, 500);
//   //       } else {
//   //         addAnnouncement("⚠️ Cannot resume: Socket disconnected", "error");
//   //       }
//   //     }
//   //   } catch (err) {
//   //     console.error("❌ Error resuming game:", err);
//   //     addAnnouncement(`❌ ${err.message || "Failed to resume"}`, "error");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const resumeGame = async () => {
//     console.log("▶️ Resume Game button clicked");
//     console.log(`📊 Current state: selectedRoundId=${selectedRoundId}, selectedGameId=${selectedGameId}, isRunning=${isRunning}, gameStarted=${gameStarted}, socketConnected=${socketConnected}`);

//     // ✅ Check if gameId exists
//     if (!selectedGameId) {
//       console.error("❌ No game selected! selectedGameId is undefined");
//       addAnnouncement("❌ No game selected. Please select a game first.", "error");
//       return;
//     }

//     if (!selectedRoundId) {
//       console.error("❌ No active round found");
//       addAnnouncement("❌ No active round found", "error");
//       return;
//     }

//     // First, check actual game status on server
//     setLoading(true);
//     try {
//       console.log(`📤 Checking game status before resume for game: ${selectedGameId}, round: ${selectedRoundId}`);
//       const statusRes = await getGameStatusAPI(selectedRoundId);
//       console.log("📥 Status check before resume:", statusRes);

//       if (statusRes.success && statusRes.data) {
//         const serverRunning = statusRes.data.is_running || false;
//         const serverStatus = statusRes.data.status || 'unknown';
//         const calledNumbers = statusRes.data.called_numbers || [];

//         console.log(`📊 Server state: is_running=${serverRunning}, status=${serverStatus}, called=${calledNumbers.length}`);

//         // If game is already running on server, just update state
//         if (serverRunning) {
//           console.log("✅ Game is already running on server, updating state");
//           setIsRunning(true);
//           isRunningRef.current = true;
//           setGameStarted(true);
//           gameStartedRef.current = true;

//           // Update numbers if needed
//           if (calledNumbers.length > 0) {
//             setNumbers(calledNumbers);
//             numbersRef.current = calledNumbers;
//             setCurrent(calledNumbers[calledNumbers.length - 1]);
//           }

//           addAnnouncement("✅ Game is already running!", "success");
//           setLoading(false);
//           return;
//         }

//         // If game is completed, can't resume
//         if (serverStatus === 'completed' || statusRes.data.completed) {
//           console.warn("⚠️ Game is completed, cannot resume");
//           addAnnouncement("❌ Game is already completed", "error");
//           setLoading(false);
//           return;
//         }

//         // If game has called numbers but not started, sync state
//         if (calledNumbers.length > 0 && !serverRunning) {
//           console.log(`📊 Game has ${calledNumbers.length} numbers called but is not running`);
//           setNumbers(calledNumbers);
//           numbersRef.current = calledNumbers;
//           setCurrent(calledNumbers[calledNumbers.length - 1]);
//           setGameStarted(true);
//           gameStartedRef.current = true;

//           // Update available numbers
//           const calledSet = new Set(calledNumbers);
//           const available = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).filter((n) => !calledSet.has(n));
//           setAvailableNumbers(available);
//         }

//         // If game is not running and not completed, we can resume
//         if (!serverRunning) {
//           console.log(`✅ Game is paused on server, resuming game: ${selectedGameId}`);

//           // ✅ Check socket connection
//           if (socketRef.current && socketRef.current.connected) {
//             console.log(`📤 Emitting resume_game with game_id: ${selectedGameId}`);

//             // Optimistic update
//             setIsRunning(true);
//             isRunningRef.current = true;
//             setGameStarted(true);
//             gameStartedRef.current = true;

//             // ✅ Emit with correct game_id
//             socketRef.current.emit("resume_game", {
//               game_id: selectedGameId  // ✅ Ensure this is not undefined
//             });

//             addAnnouncement("▶️ Game resumed!", "success");

//             // Reload game status after resume
//             setTimeout(() => {
//               loadGameStatus(selectedRoundId);
//               loadWinnersList(selectedRoundId);
//             }, 500);
//           } else {
//             console.warn("⚠️ Socket not available, trying API fallback");

//             // ✅ Fallback: Use startGameAPI with round_id
//             try {
//               console.log(`📤 Calling startGameAPI for round: ${selectedRoundId}`);
//               const startRes = await startGameAPI(selectedRoundId);
//               console.log("📥 Start game response:", startRes);

//               if (startRes.success) {
//                 console.log("✅ Game resumed via API");
//                 setIsRunning(true);
//                 isRunningRef.current = true;
//                 setGameStarted(true);
//                 gameStartedRef.current = true;
//                 addAnnouncement("▶️ Game resumed via API!", "success");

//                 setTimeout(() => {
//                   loadGameStatus(selectedRoundId);
//                 }, 500);
//               } else {
//                 throw new Error(startRes.message || "Failed to resume");
//               }
//             } catch (apiErr) {
//               console.error("❌ API resume failed:", apiErr);
//               addAnnouncement(`❌ ${apiErr.message || "Failed to resume"}`, "error");
//             }
//           }
//         }
//       } else {
//         // If status check fails, try to resume anyway (optimistic)
//         console.log("⚠️ Status check failed, attempting optimistic resume");

//         if (socketRef.current && socketRef.current.connected) {
//           console.log(`📤 Optimistic resume with game_id: ${selectedGameId}`);
//           setIsRunning(true);
//           isRunningRef.current = true;
//           socketRef.current.emit("resume_game", {
//             game_id: selectedGameId  // ✅ Ensure this is not undefined
//           });
//           addAnnouncement("▶️ Attempting to resume game...", "info");

//           setTimeout(() => {
//             loadGameStatus(selectedRoundId);
//           }, 500);
//         } else {
//           addAnnouncement("⚠️ Cannot resume: Socket disconnected", "error");
//         }
//       }
//     } catch (err) {
//       console.error("❌ Error resuming game:", err);
//       addAnnouncement(`❌ ${err.message || "Failed to resume"}`, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const callNumber = async () => {
//     console.log("📞 Auto Call button clicked");
//     console.log(`📊 Current state: selectedRoundId=${selectedRoundId}, isRunning=${isRunning}, numbers=${numbers.length}, gameStarted=${gameStarted}`);

//     if (!selectedRoundId) {
//       console.error("❌ No active round found");
//       addAnnouncement("❌ No active round found. Please start game first.", "error");
//       return;
//     }

//     if (!isRunning) {
//       console.warn("⚠️ Game is not running");
//       addAnnouncement("⚠️ Game is not running. Please start or resume the game first.", "error");
//       return;
//     }

//     setLoading(true);
//     try {
//       console.log(`📤 Calling callNumberAPI for round: ${selectedRoundId}`);
//       const res = await callNumberAPI(selectedRoundId);
//       console.log("📥 Call number response:", res);

//       if (res.success) {
//         const calledNumber = res.data?.number;
//         if (calledNumber) {
//           console.log(`✅ Number called: ${calledNumber}`);
//           setCurrent(calledNumber);
//           setGameStarted(true);
//           gameStartedRef.current = true;
//           addAnnouncement(`📞 Number ${calledNumber} called!`, "success");
//         } else {
//           console.log("✅ Number called (no number in response)");
//           addAnnouncement(`📞 Number called!`, "success");
//         }

//         // ✅ Reload game status after call
//         setTimeout(() => {
//           loadGameStatus(selectedRoundId);
//         }, 300);
//       } else {
//         console.error("❌ Failed to call number:", res.message);
//         addAnnouncement(`❌ ${res.message || "Failed to call number"}`, "error");
//       }
//     } catch (err) {
//       console.error("❌ Error calling number:", err);
//       const errorMsg = err.response?.data?.message || err.message;
//       console.error("❌ Error message:", errorMsg);
//       addAnnouncement(`❌ ${errorMsg}`, "error");
//     } finally {
//       setLoading(false);
//       console.log("🔧 Loading state set to false");
//     }
//   };

//   // ── Force Refresh Status ───────────────────────────────────────────────

//   const forceRefreshStatus = async () => {
//     console.log("🔄 Force refreshing game status");
//     if (!selectedRoundId) {
//       addAnnouncement("❌ No round selected", "error");
//       return;
//     }

//     setLoading(true);
//     try {
//       await loadGameStatus(selectedRoundId);
//       await loadWinnersList(selectedRoundId);
//       addAnnouncement("✅ Status refreshed", "success");
//     } catch (err) {
//       console.error("❌ Refresh failed:", err);
//       addAnnouncement("❌ Failed to refresh status", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── admin actions ───────────────────────────────────────────────────────

//   const handleManualNumberCall = async (numOverride) => {
//     const num = parseInt(numOverride ?? manualNumber);
//     console.log(`🔢 Manual number call: ${num}`);

//     if (isNaN(num) || num < 1 || num > TOTAL_NUMBERS) {
//       console.warn(`⚠️ Invalid number: ${num}`);
//       return setManualNumberError(`Please enter a valid number between 1 and ${TOTAL_NUMBERS}`);
//     }
//     if (numbers.includes(num)) {
//       console.warn(`⚠️ Number ${num} already called`);
//       setManualNumberError(`❌ Number ${num} has already been called!`);
//       return addAnnouncement(`❌ Cannot call ${num} - Already called!`, "error");
//     }
//     setLoading(true);
//     setManualNumberError("");
//     try {
//       console.log(`📤 Admin calling number ${num} for round: ${selectedRoundId}`);
//       const res = await callNumberAPI(selectedRoundId, { number: num });
//       console.log("📥 Manual call response:", res);

//       if (res.success) {
//         console.log(`✅ Admin called number ${num}`);
//         addAnnouncement(`📞 Admin called number ${num}!`, "success");
//         setManualNumber("");

//         if (!numbers.includes(num)) {
//           const newNumbers = [...numbers, num];
//           console.log(`➕ Adding ${num} to called numbers:`, newNumbers);
//           setNumbers(newNumbers);
//           numbersRef.current = newNumbers;
//           const allNumbers = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);
//           const calledSet = new Set(newNumbers);
//           setAvailableNumbers(allNumbers.filter(n => !calledSet.has(n)));
//           setCurrent(num);
//           setGameStarted(true);
//           gameStartedRef.current = true;
//         }

//         await loadGameStatus(selectedRoundId);
//       } else {
//         console.error("❌ Failed manual call:", res.message);
//         addAnnouncement(`❌ ${res.message || "Failed to call number"}`, "error");
//       }
//     } catch (err) {
//       console.error("❌ Error in manual call:", err);
//       addAnnouncement(`❌ ${err.response?.data?.message || err.message}`, "error");
//     } finally {
//       setLoading(false);
//       console.log("🔧 Loading state set to false");
//     }
//   };

//   const handleQuickCallRandom = async () => {
//     console.log("🎲 Quick Random called");
//     const allNumbers = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);
//     const uncalledNumbers = allNumbers.filter(num => !numbers.includes(num));
//     console.log(`📊 Uncalled numbers: ${uncalledNumbers.length}`);

//     if (uncalledNumbers.length === 0) {
//       console.warn("⚠️ All numbers have been called");
//       addAnnouncement("❌ All numbers have been called!", "error");
//       return;
//     }

//     let count;
//     if (selectedBulkNumbers.size === 0) {
//       count = Math.min(10, uncalledNumbers.length);
//     } else {
//       count = Math.min(5, uncalledNumbers.length);
//     }
//     console.log(`🎲 Selecting ${count} random numbers`);

//     const shuffled = [...uncalledNumbers].sort(() => Math.random() - 0.5);
//     const randomNumbers = shuffled.slice(0, count);
//     console.log(`🎲 Random numbers selected: ${randomNumbers.join(', ')}`);

//     const newSelected = new Set(selectedBulkNumbers);
//     randomNumbers.forEach(num => newSelected.add(num));
//     setSelectedBulkNumbers(newSelected);

//     const selectedArray = Array.from(newSelected);
//     setBulkNumbersInput(selectedArray.join(', '));

//     const msg = selectedBulkNumbers.size === 0
//       ? `🎲 ${randomNumbers.length} random numbers selected: ${randomNumbers.join(', ')}`
//       : `🎲 Added ${randomNumbers.length} more random numbers: ${randomNumbers.join(', ')}`;
//     console.log(`📢 ${msg}`);
//     addAnnouncement(msg, "success");
//   };

//   // ── BULK NUMBERS ───────────────────────────────────────────────────────

//   const parseAndUpdateNumbers = (input) => {
//     console.log(`📝 Parsing bulk numbers input: ${input}`);
//     setBulkNumbersInput(input);

//     if (!input.trim()) {
//       setSelectedBulkNumbers(new Set());
//       return;
//     }

//     const newSelectedNumbers = new Set();
//     const parts = input.split(/[,\s]+/);

//     for (const part of parts) {
//       if (part.includes('-')) {
//         const [start, end] = part.split('-').map(n => parseInt(n));
//         if (!isNaN(start) && !isNaN(end) && start <= end) {
//           for (let i = start; i <= end; i++) {
//             if (i >= 1 && i <= TOTAL_NUMBERS) {
//               newSelectedNumbers.add(i);
//             }
//           }
//         }
//       } else {
//         const num = parseInt(part);
//         if (!isNaN(num) && num >= 1 && num <= TOTAL_NUMBERS) {
//           newSelectedNumbers.add(num);
//         }
//       }
//     }

//     console.log(`📊 Parsed ${newSelectedNumbers.size} numbers`);
//     setSelectedBulkNumbers(newSelectedNumbers);
//   };

//   const toggleNumberSelection = (num) => {
//     console.log(`🔄 Toggling number ${num}`);
//     const newSelected = new Set(selectedBulkNumbers);
//     if (newSelected.has(num)) {
//       newSelected.delete(num);
//       console.log(`❌ Removed ${num}`);
//     } else {
//       newSelected.add(num);
//       console.log(`✅ Added ${num}`);
//     }
//     setSelectedBulkNumbers(newSelected);
//     const selectedArray = Array.from(newSelected);
//     setBulkNumbersInput(selectedArray.join(', '));
//   };

//   const handleBulkNumbersCall = async () => {
//     console.log("📞 Bulk Numbers Call triggered");
//     console.log(`📊 Selected numbers: ${Array.from(selectedBulkNumbers).join(', ')}`);

//     if (selectedBulkNumbers.size === 0) {
//       console.warn("⚠️ No numbers selected");
//       setManualNumberError("Please select numbers to call");
//       return;
//     }

//     const numbersToCall = Array.from(selectedBulkNumbers);
//     const newNumbers = numbersToCall.filter(num => !numbers.includes(num));
//     console.log(`📊 New numbers to call: ${newNumbers.length}`);
//     console.log(`📊 Already called: ${numbersToCall.length - newNumbers.length}`);

//     if (newNumbers.length === 0) {
//       console.warn("⚠️ All selected numbers already called");
//       setManualNumberError("All selected numbers have already been called!");
//       return addAnnouncement("❌ All numbers already called!", "error");
//     }

//     const alreadyCalledCount = numbersToCall.length - newNumbers.length;
//     let confirmMessage = `Call ${newNumbers.length} number(s)?`;

//     if (alreadyCalledCount > 0) {
//       confirmMessage = `${alreadyCalledCount} number(s) already called (will be skipped).\n\nCall ${newNumbers.length} remaining number(s)?`;
//     }

//     if (newNumbers.length > 20) {
//       confirmMessage += `\n\nFirst 20: ${newNumbers.slice(0, 20).join(', ')}...`;
//     } else if (newNumbers.length > 0) {
//       confirmMessage += `\n\nNumbers: ${newNumbers.join(', ')}`;
//     }

//     if (!window.confirm(confirmMessage)) {
//       console.log("⏹️ Bulk call canceled by user");
//       return;
//     }

//     setLoading(true);
//     setManualNumberError("");
//     setBulkCallStatus("calling");

//     try {
//       const token = localStorage.getItem("token");
//       console.log(`🔑 Token present: ${!!token}`);

//       if (!token) {
//         console.error("❌ No token found");
//         addAnnouncement("❌ Please login first", "error");
//         setLoading(false);
//         setBulkCallStatus("error");
//         return;
//       }

//       const payload = {
//         game_id: parseInt(selectedGameId),
//         numbers: newNumbers,
//       };
//       console.log(`📤 Sending bulk call request:`, payload);

//       const response = await fetch(
//         "https://api.luckyfunda.com/api/game/set-bulk-announcement",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//       const result = await response.json();
//       console.log("📥 Bulk announcement response:", result);

//       if (response.ok && result.success) {
//         const calledCount = result.data?.called_count || newNumbers.length;
//         const failedNumbers = result.data?.failed_numbers || [];

//         console.log(`✅ Bulk call successful: ${calledCount} numbers called, ${failedNumbers.length} failed`);

//         if (failedNumbers.length > 0) {
//           console.warn(`⚠️ Failed numbers: ${failedNumbers.join(', ')}`);
//           addAnnouncement(
//             `⚠️ Partial success: ${calledCount} called, ${failedNumbers.length} failed (${failedNumbers.join(', ')})`,
//             "warning"
//           );
//         } else {
//           addAnnouncement(
//             `✅ Bulk call successful! ${calledCount} numbers called.`,
//             "success"
//           );
//         }

//         if (newNumbers.length > 0) {
//           const lastNumber = newNumbers[newNumbers.length - 1];
//           console.log(`🎯 Setting current to: ${lastNumber}`);
//           setCurrent(lastNumber);
//           setGameStarted(true);
//           gameStartedRef.current = true;
//         }

//         setBulkCallStatus("success");
//         await loadGameStatus(selectedRoundId);
//         setBulkNumbersInput("");
//         setSelectedBulkNumbers(new Set());
//         setTimeout(() => setBulkCallStatus(""), 2000);
//       } else {
//         throw new Error(result.message || "Failed to call numbers");
//       }
//     } catch (error) {
//       console.error("❌ Bulk call error:", error);
//       setBulkCallStatus("error");
//       addAnnouncement(`❌ ${error.message || "Failed to call numbers"}`, "error");
//       setTimeout(() => setBulkCallStatus(""), 3000);
//     } finally {
//       setLoading(false);
//       console.log("🔧 Loading state set to false");
//     }
//   };

//   // Winner by Ticket
//   const handleDeclareWinnerByTicket = async () => {
//     console.log("🏆 Declare Winner by Ticket triggered");
//     console.log(`📊 Current state: selectedGameId=${selectedGameId}, selectedRoundId=${selectedRoundId}`);

//     if (!selectedGameId) {
//       console.error("❌ No game selected");
//       addAnnouncement("❌ No game selected. Please select a game first.", "error");
//       return;
//     }

//     if (!winnerTicketId?.trim()) {
//       console.warn("⚠️ No ticket number entered");
//       addAnnouncement("Please enter a valid Ticket Number", "error");
//       return;
//     }

//     const ticketNumber = parseInt(winnerTicketId.trim());
//     if (isNaN(ticketNumber) || ticketNumber <= 0) {
//       console.warn(`⚠️ Invalid ticket number: ${winnerTicketId}`);
//       addAnnouncement("Please enter a valid ticket number", "error");
//       return;
//     }

//     console.log(`🎫 Declaring ticket #${ticketNumber} as winner for game ${selectedGameId}`);

//     if (!window.confirm(`Declare ticket #${ticketNumber} as winner?`)) {
//       console.log("⏹️ Winner declaration canceled by user");
//       return;
//     }

//     setLoading(true);
//     try {
//       console.log("📤 Declaring winner with API:", {
//         gameId: selectedGameId,
//         ticketNumber: ticketNumber
//       });

//       const res = await forceWinnerByTicketNewAPI({
//         game_id: selectedGameId,
//         ticket_number: ticketNumber
//       });

//       console.log("📥 Winner declaration response:", res);

//       if (res.success) {
//         console.log(`🏆 Ticket #${ticketNumber} declared winner!`);
//         addAnnouncement(`🏆 Ticket #${ticketNumber} declared winner! 🎉`, "winner");

//         if (selectedRoundId) {
//           console.log(`🔄 Reloading winners for round: ${selectedRoundId}`);
//           await loadWinnersList(selectedRoundId);
//         }

//         setWinnerTicketId("");
//       } else {
//         console.error("❌ Failed to declare winner:", res.message);
//         addAnnouncement(`❌ ${res.message || "Failed to declare winner"}`, "error");
//       }
//     } catch (err) {
//       console.error("❌ Error declaring winner:", err);
//       const errorMessage = err.response?.data?.message || err.message || "Failed to declare winner";
//       console.error("❌ Error message:", errorMessage);
//       addAnnouncement(`❌ ${errorMessage}`, "error");
//     } finally {
//       setLoading(false);
//       console.log("🔧 Loading state set to false");
//     }
//   };

//   // ── effects ─────────────────────────────────────────────────────────────

//   // Keep refs in sync with state
//   useEffect(() => {
//     numbersRef.current = numbers;
//   }, [numbers]);

//   useEffect(() => {
//     isRunningRef.current = isRunning;
//   }, [isRunning]);

//   useEffect(() => {
//     gameStartedRef.current = gameStarted;
//   }, [gameStarted]);

//   // Sync isRunning with actual game state
//   useEffect(() => {
//     console.log(`🔄 Effect: Syncing isRunning with game state - numbers.length=${numbers.length}, isRunning=${isRunning}, selectedRoundId=${selectedRoundId}, gameStarted=${gameStarted}`);

//     if (selectedRoundId) {
//       const checkGameStatus = async () => {
//         try {
//           console.log(`🔄 Checking game status for round: ${selectedRoundId}`);
//           const res = await getGameStatusAPI(selectedRoundId);
//           console.log("📥 Game status check response:", res);
//           if (res.success && res.data) {
//             const running = res.data.is_running || false;
//             if (isRunningRef.current !== running) {
//               console.log(`🔄 Updating isRunning from ${isRunningRef.current} to ${running}`);
//               setIsRunning(running);
//               isRunningRef.current = running;
//             }
//             if (res.data.is_running) {
//               setGameStarted(true);
//               gameStartedRef.current = true;
//             }
//           }
//         } catch (err) {
//           console.error("❌ Error checking game status:", err);
//         }
//       };
//       checkGameStatus();
//     }
//   }, [selectedRoundId]);

//   // Auto-refresh effect with debounce
//   useEffect(() => {
//     console.log(`🔄 Effect: Setting up auto-refresh for round: ${selectedRoundId}`);
//     if (!selectedRoundId) return;

//     if (autoRefreshRef.current) {
//       console.log("🧹 Clearing existing auto-refresh interval");
//       clearInterval(autoRefreshRef.current);
//     }

//     let isRefreshing = false;

//     autoRefreshRef.current = setInterval(() => {
//       if (isRefreshing) {
//         console.log("⏭️ Skipping auto-refresh (already in progress)");
//         return;
//       }

//       isRefreshing = true;
//       console.log(`🔄 Auto-refresh: Loading game status for round: ${selectedRoundId}`);

//       Promise.all([
//         loadGameStatus(selectedRoundId),
//         loadWinnersList(selectedRoundId)
//       ]).finally(() => {
//         isRefreshing = false;
//       });
//     }, 5000);

//     return () => {
//       console.log("🧹 Cleaning up auto-refresh interval");
//       clearInterval(autoRefreshRef.current);
//     };
//   }, [selectedRoundId, loadGameStatus, loadWinnersList]);

//   // Auto-sync game state every 5 seconds
//   useEffect(() => {
//     if (!selectedRoundId || !socketRef.current) {
//       console.log("⏭️ Skipping auto-sync: no roundId or socket");
//       return;
//     }

//     const syncInterval = setInterval(() => {
//       if (socketRef.current && socketRef.current.connected) {
//         console.log(`🔄 Auto-sync: Requesting game data`);
//         socketRef.current.emit("get_game_data", { game_id: selectedGameId });
//       }
//     }, 5000);

//     return () => {
//       console.log("🧹 Cleaning up auto-sync interval");
//       clearInterval(syncInterval);
//     };
//   }, [selectedRoundId, selectedGameId]);

//   useEffect(() => {
//     console.log("🔄 Effect: Fetching games list");
//     fetchAllGames();
//     gamesRefreshRef.current = setInterval(() => {
//       if (showGameSelector) {
//         console.log("🔄 Games refresh: Fetching games list");
//         fetchAllGames();
//       }
//     }, 10000);
//     return () => {
//       console.log("🧹 Cleaning up games refresh interval");
//       clearInterval(gamesRefreshRef.current);
//     };
//   }, [showGameSelector, fetchAllGames]);

//   useEffect(() => {
//     console.log("🔄 Effect: Cleaning up socket on unmount");
//     return () => {
//       if (reconnectTimeoutRef.current) {
//         clearTimeout(reconnectTimeoutRef.current);
//         reconnectTimeoutRef.current = null;
//       }
//       if (socketRef.current) {
//         console.log("🔌 Disconnecting socket on unmount");
//         socketRef.current.disconnect();
//       }
//     };
//   }, []);

//   // ── derived ──────────────────────────────────────────────────────────────

//   const getProgress = () => (numbers.length / TOTAL_NUMBERS) * 100;
//   const lastTen = numbers.slice(-10).reverse();

//   console.log(`📊 Render state: isRunning=${isRunning}, numbers=${numbers.length}, current=${current}, loading=${loading}, gameStarted=${gameStarted}, socketConnected=${socketConnected}`);

//   // ════════════════════════════════════════════════════════════════════════
//   // GAME SELECTOR VIEW
//   // ════════════════════════════════════════════════════════════════════════

//   if (showGameSelector) {
//     return (
//       <div className="live-game-container">
//         <div className="live-header">
//           <h1 className="live-title">Live Game Control</h1>
//         </div>
//         <div className="game-selector">
//           <h2>Available Games</h2>
//           <div className="games-list">
//             {gamesError ? (
//               <div className="lg-error-wrap">
//                 <div className="lg-error-icon">⚠️</div>
//                 <h3 className="lg-error-title">Failed to Load Games</h3>
//                 <p className="lg-error-msg">{gamesError}</p>
//                 <button onClick={fetchAllGames} className="lg-error-btn">
//                   <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
//                     <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
//                   </svg>
//                   Try Again
//                 </button>
//               </div>
//             ) : !allGames.length ? (
//               <p className="no-games">No games available. Create a game first.</p>
//             ) : (
//               allGames
//                 .filter((g) => g?.game_id)
//                 .map((game) => (
//                   <div
//                     key={game.game_id}
//                     className="game-selector-card"
//                     onClick={() => handleGameSelect(game.game_id)}
//                   >
//                     <div className="game-selector-icon">🎮</div>
//                     <div className="game-selector-info">
//                       <h3>{game.title || "Untitled"}</h3>
//                       <p>ID: {game.game_id} | Created: {game.formattedCreatedAt}</p>
//                       <p>Start Time: {game.formattedDate} {game.formattedTime}</p>
//                       <span className={`game-status ${game.gameStatus.className}`}>
//                         {game.gameStatus.label}
//                       </span>
//                     </div>
//                     <button className="select-game-btn">Manage →</button>
//                   </div>
//                 ))
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ════════════════════════════════════════════════════════════════════════
//   // LIVE GAME VIEW
//   // ════════════════════════════════════════════════════════════════════════

//   return (
//     <div className="live-game-container">
//       {/* Header */}
//       <div className="live-header">
//         <div className="header-info">
//           <button className="back-button" onClick={handleBackToGames}>← Back</button>
//           <h1 className="live-title">Live Game</h1>
//           <p className="live-subtitle">
//             Game ID: {selectedGameId} | Round: {selectedRoundId || "No Round"}
//             {!socketConnected && <span className="socket-status"> 🔴 Socket Disconnected</span>}
//           </p>
//         </div>
//         <div className="header-actions">
//           <button
//             className={`admin-toggle ${showAdminPanel ? "active" : ""}`}
//             onClick={() => {
//               console.log(`🔧 Admin panel toggled: ${!showAdminPanel}`);
//               setShowAdminPanel((v) => !v);
//             }}
//           >
//             {showAdminPanel ? "Hide Admin Panel" : "Show Admin Panel"}
//           </button>
//           <button
//             className="btn-refresh"
//             onClick={forceRefreshStatus}
//             disabled={loading || !selectedRoundId}
//             style={{
//               background: "#17a2b8",
//               color: "#fff",
//               border: "none",
//               borderRadius: "5px",
//               padding: "8px 15px",
//               cursor: "pointer",
//               fontSize: "14px",
//               fontWeight: "bold",
//               marginRight: "10px"
//             }}
//           >
//             🔄 Refresh
//           </button>
//           <div className={`live-status ${isRunning ? "status-live" : "status-paused"}`}>
//             <span className="status-dot"></span>
//             {isRunning ? "LIVE" : "PAUSED"}
//           </div>
//         </div>
//       </div>

//       {/* Admin Panel */}
//       {showAdminPanel && (
//         <div className="admin-panel">
//           {/* Bulk Numbers Call with Grid */}
//           <div className="admin-section">
//             <h4>📝 Bulk Numbers Call</h4>

//             <div style={{ marginBottom: "15px" }}>
//               <input
//                 type="text"
//                 placeholder="Type numbers: 1,2,3 or 1-10 or click on grid"
//                 value={bulkNumbersInput}
//                 onChange={(e) => parseAndUpdateNumbers(e.target.value)}
//                 style={{
//                   width: "100%",
//                   padding: "10px",
//                   border: "1px solid #ddd",
//                   borderRadius: "5px",
//                   fontSize: "14px"
//                 }}
//               />
//               <small style={{ color: "#666", display: "block", marginTop: "5px" }}>
//                 💡 Selected: {selectedBulkNumbers.size} number(s) |
//                 New (uncalled): {Array.from(selectedBulkNumbers).filter(n => !numbers.includes(n)).length} number(s)
//               </small>
//             </div>

//             <div style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(10, 1fr)",
//               gap: "5px",
//               marginBottom: "15px",
//               maxHeight: "300px",
//               overflowY: "auto",
//               padding: "10px",
//               background: "#f8f9fa",
//               borderRadius: "5px",
//               border: "1px solid #dee2e6"
//             }}>
//               {Array.from({ length: TOTAL_NUMBERS }, (_, i) => {
//                 const num = i + 1;
//                 const isSelected = selectedBulkNumbers.has(num);
//                 const isAlreadyCalled = numbers.includes(num);

//                 return (
//                   <button
//                     key={num}
//                     onClick={() => toggleNumberSelection(num)}
//                     disabled={isAlreadyCalled}
//                     style={{
//                       padding: "8px 4px",
//                       backgroundColor: isSelected ? "#28a745" : (isAlreadyCalled ? "#6c757d" : "#fff"),
//                       color: isSelected ? "#fff" : (isAlreadyCalled ? "#fff" : "#000"),
//                       border: isSelected ? "2px solid #1e7e34" : "1px solid #dee2e6",
//                       borderRadius: "4px",
//                       cursor: isAlreadyCalled ? "not-allowed" : "pointer",
//                       fontSize: "12px",
//                       fontWeight: "bold",
//                       transition: "all 0.2s",
//                       opacity: isAlreadyCalled ? 0.6 : 1,
//                     }}
//                     title={isAlreadyCalled ? `Number ${num} already called` : `Select number ${num}`}
//                   >
//                     {num}
//                   </button>
//                 );
//               })}
//             </div>

//             <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
//               <button
//                 onClick={() => {
//                   console.log("📊 Select All Remaining");
//                   const allNumbers = new Set();
//                   const currentSelected = Array.from(selectedBulkNumbers);
//                   currentSelected.forEach(num => allNumbers.add(num));

//                   for (let i = 1; i <= TOTAL_NUMBERS; i++) {
//                     if (!numbers.includes(i)) {
//                       allNumbers.add(i);
//                     }
//                   }

//                   console.log(`📊 Selected ${allNumbers.size} numbers`);
//                   setSelectedBulkNumbers(allNumbers);
//                   const selectedArray = Array.from(allNumbers);
//                   setBulkNumbersInput(selectedArray.join(', '));
//                 }}
//                 style={{
//                   background: "#17a2b8",
//                   color: "#fff",
//                   border: "none",
//                   borderRadius: "5px",
//                   fontSize: "12px",
//                   padding: "8px 12px",
//                   cursor: "pointer"
//                 }}
//               >
//                 Select All Remaining ({availableNumbers.length})
//               </button>
//               <button
//                 onClick={() => {
//                   console.log("🗑️ Clear All selected numbers");
//                   setSelectedBulkNumbers(new Set());
//                   setBulkNumbersInput("");
//                 }}
//                 style={{
//                   background: "#6c757d",
//                   color: "#fff",
//                   border: "none",
//                   borderRadius: "5px",
//                   fontSize: "12px",
//                   padding: "8px 12px",
//                   cursor: "pointer"
//                 }}
//               >
//                 Clear All
//               </button>
//               <button
//                 onClick={handleQuickCallRandom}
//                 disabled={loading || !isRunning || availableNumbers.length === 0}
//                 style={{
//                   background: "#ffc107",
//                   color: "#000",
//                   border: "none",
//                   borderRadius: "5px",
//                   fontSize: "12px",
//                   padding: "8px 12px",
//                   cursor: availableNumbers.length === 0 ? "not-allowed" : "pointer"
//                 }}
//               >
//                 🎲 Quick Random
//               </button>
//             </div>

//             <button
//               onClick={handleBulkNumbersCall}
//               disabled={loading || selectedBulkNumbers.size === 0}
//               style={{
//                 width: "100%",
//                 background: bulkCallStatus === "success" ? "#28a745" :
//                   bulkCallStatus === "error" ? "#dc3545" :
//                     bulkCallStatus === "calling" ? "#ffc107" : "#007bff",
//                 color: "#fff",
//                 border: "none",
//                 borderRadius: "8px",
//                 padding: "12px",
//                 fontSize: "14px",
//                 fontWeight: "bold",
//                 cursor: selectedBulkNumbers.size === 0 ? "not-allowed" : "pointer",
//                 opacity: loading ? 0.7 : 1,
//                 transition: "all 0.3s"
//               }}
//             >
//               {loading ? "⏳ Calling..." :
//                 bulkCallStatus === "success" ? "✅ Done!" :
//                   bulkCallStatus === "error" ? "❌ Failed - Try Again" :
//                     `📞 Call ${selectedBulkNumbers.size} Selected Number(s)`}
//             </button>
//           </div>

//           {/* Winner by Ticket */}
//           <div className="admin-section">
//             <h4>🎫 Declare Winner by Ticket Number</h4>
//             <div className="admin-input-group" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//               <input
//                 type="number"
//                 placeholder="Enter Ticket Number"
//                 value={winnerTicketId}
//                 onChange={(e) => {
//                   console.log(`📝 Ticket number input: ${e.target.value}`);
//                   setWinnerTicketId(e.target.value);
//                 }}
//                 min="1"
//                 style={{
//                   width: "100%",
//                   padding: "10px",
//                   border: "1px solid #ddd",
//                   borderRadius: "5px",
//                   fontSize: "14px"
//                 }}
//               />
//               <button
//                 onClick={handleDeclareWinnerByTicket}
//                 disabled={loading || !winnerTicketId.trim()}
//                 style={{
//                   background: "#28a745",
//                   color: "white",
//                   border: "none",
//                   padding: "12px 20px",
//                   borderRadius: "5px",
//                   cursor: "pointer",
//                   fontWeight: "bold",
//                   width: "100%",
//                   fontSize: "14px"
//                 }}
//               >
//                 {loading ? "⏳ Processing..." : "🏆 Declare Winner"}
//               </button>
//             </div>
//             <small style={{ color: "#666", display: "block", marginTop: "8px" }}>
//               💡 Enter ticket number and click to declare winner
//             </small>
//           </div>
//         </div>
//       )}

//       {/* Stats bar */}
//       <div className="game-stats-bar">
//         <div className="stat-item">
//           <span className="stat-label">Called:</span>
//           <span className="stat-value">{numbers.length}/90</span>
//         </div>
//         <div className="stat-item">
//           <span className="stat-label">Remaining:</span>
//           <span className="stat-value">{90 - numbers.length}</span>
//         </div>
//         <div className="stat-item">
//           <span className="stat-label">Winners:</span>
//           <span className="stat-value">{winners.length}</span>
//         </div>
//         <div className="stat-item">
//           <span className="stat-label">Socket:</span>
//           <span className="stat-value" style={{ color: socketConnected ? '#28a745' : '#dc3545' }}>
//             {socketConnected ? '🟢 Connected' : '🔴 Disconnected'}
//           </span>
//         </div>
//       </div>

//       {/* Main layout */}
//       <div className="live-main">
//         <div className="live-left">
//           {/* Current number */}
//           <div className="current-card">
//             <div className="current-label">Current Number</div>
//             <div className="current-number">{current ?? "--"}</div>
//             <div className="current-progress">
//               <div className="progress-bar">
//                 <div className="progress-fill" style={{ width: `${getProgress()}%` }} />
//               </div>
//             </div>
//           </div>

//           {/* Controls */}
//           <div className="control-panel">
//             <h3>Controls</h3>
//             <div className="control-buttons">
//               <button
//                 className="btn-start"
//                 onClick={startGame}
//                 disabled={
//                   loading ||
//                   !selectedRoundId ||
//                   isRunning ||
//                   (gameStarted && numbers.length > 5)
//                 }
//                 title={
//                   !selectedRoundId ? "No round selected" :
//                     isRunning ? "Game is already running" :
//                       gameStarted ? "Game already started - use Pause/Resume" :
//                         "Start the game"
//                 }
//               >
//                 {loading ? "..." : "▶ Start"}
//               </button>
//               <button
//                 className="btn-pause"
//                 onClick={pauseGame}
//                 disabled={
//                   loading ||
//                   !selectedRoundId ||
//                   (!isRunning && !gameStarted)
//                 }
//                 title={
//                   !selectedRoundId ? "No round selected" :
//                     "Pause the game"
//                 }
//               >
//                 ⏸ Pause
//               </button>
//               <button
//                 className="btn-resume"
//                 onClick={resumeGame}
//                 disabled={
//                   loading ||
//                   !selectedRoundId ||
//                   (isRunning && !gameStarted)
//                 }
//                 title={
//                   !selectedRoundId ? "No round selected" :
//                     isRunning ? "Game is already running" :
//                       "Resume the game"
//                 }
//               >
//                 ▶ Resume
//               </button>
//               <button
//                 className="btn-call"
//                 onClick={callNumber}
//                 disabled={loading || !isRunning || !selectedRoundId}
//                 title={
//                   !selectedRoundId ? "No round selected" :
//                     !isRunning ? "Game is not running" :
//                       "Call a number"
//                 }
//               >
//                 {loading ? "..." : "📞 Auto Call"}
//               </button>
//             </div>
//           </div>

//           {/* Winners */}
//           <div className="winners-panel">
//             <h3>🏆 Winners</h3>
//             <div className="winners-list">
//               {winners.length === 0 ? (
//                 <p className="no-winners">No winners yet</p>
//               ) : (
//                 winners.map((winner, i) => (
//                   <div key={i} className="winner-item">
//                     <span>🏆</span>
//                     <div>
//                       <strong>{winner.user_name || "User"}</strong>
//                       <small>{winner.win_type}</small>
//                       <span>₹{winner.amount || 0}</span>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="live-right">
//           {/* Recent calls */}
//           <div className="recent-calls">
//             <h3>📞 Recent Calls</h3>
//             <div className="calls-list">
//               {gameHistory.slice(0, 10).map((call, i) => (
//                 <div key={i} className="call-item">
//                   <span className="call-number">{call.number}</span>
//                   <span className="call-time">{call.time}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Last 10 */}
//           <div className="last-numbers">
//             <h3>🔄 Last 10</h3>
//             <div className="last-numbers-grid">
//               {lastTen.map((n, i) => (
//                 <span key={i} className="last-number">{n}</span>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Numbers board */}
//       <div className="numbers-grid-section">
//         <h3>🔢 Numbers Board</h3>
//         <div className="numbers-grid">
//           {Array.from({ length: TOTAL_NUMBERS }, (_, i) => {
//             const n = i + 1;
//             const called = numbers.includes(n);
//             const isCurrent = current === n;
//             return (
//               <div
//                 key={n}
//                 className={`number-cell${called ? " called" : ""}${isCurrent ? " current" : ""}`}
//               >
//                 {n}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }
import { useEffect, useState, useRef, useCallback } from "react";
import {
  startGameAPI,
  stopGameAPI,
  callNumberAPI,
  getGameStatusAPI,
  getWinnersListAPI,
  getAllGamesAPI,
  getCurrentRoundAPI,
  forceWinnerByTicketNewAPI,
  createRoundAPI,
} from "../services/api";
import { io } from "socket.io-client";
import "../styles/liveGame.css";

const TOTAL_NUMBERS = 90;
const SOCKET_URL = "https://api.luckyfunda.com";

console.log("🔌 Using Socket URL:", SOCKET_URL);
console.log("🎮 LiveGame component initialized");

// ─── helpers ────────────────────────────────────────────────────────────────

const getGameStatus = (game) => {
  console.log("📊 Getting game status for:", game?.game_id);
  switch (game.status) {
    case "completed":
      return { status: "completed", label: "✅ COMPLETED", className: "status-completed" };
    case "live":
      return { status: "live", label: "🔴 LIVE", className: "status-live" };
    case "upcoming":
      return { status: "upcoming", label: "⏳ UPCOMING", className: "status-pending" };
    default:
      return { status: "unknown", label: "❓ UNKNOWN", className: "status-error" };
  }
};

const formatGame = (game) => {
  const formatted = {
    ...game,
    gameStatus: getGameStatus(game),
    formattedDate: game.start_datetime
      ? new Date(game.start_datetime).toLocaleDateString()
      : "No Date Set",
    formattedTime: game.start_datetime
      ? new Date(game.start_datetime).toLocaleTimeString()
      : "No Time Set",
    formattedCreatedAt: game.created_at
      ? new Date(game.created_at).toLocaleString()
      : "Invalid Date",
  };
  console.log("📦 Formatted game:", formatted.game_id, formatted.title);
  return formatted;
};

// ─── component ──────────────────────────────────────────────────────────────

export default function LiveGame() {
  console.log("🔄 LiveGame component rendering");

  // core game state
  const [numbers, setNumbers] = useState([]);
  const [current, setCurrent] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // game / round selection
  const [allGames, setAllGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [selectedRoundId, setSelectedRoundId] = useState(null);
  const [showGameSelector, setShowGameSelector] = useState(true);
  const [gamesError, setGamesError] = useState(null);

  // admin panel
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [manualNumber, setManualNumber] = useState("");
  const [manualNumberError, setManualNumberError] = useState("");
  const [winnerTicketId, setWinnerTicketId] = useState("");
  const [bulkNumbersInput, setBulkNumbersInput] = useState("");
  const [selectedBulkNumbers, setSelectedBulkNumbers] = useState(new Set());
  const [bulkCallStatus, setBulkCallStatus] = useState("");

  // Refs
  const socketRef = useRef(null);
  const autoRefreshRef = useRef(null);
  const gamesRefreshRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const numbersRef = useRef([]);
  const isRunningRef = useRef(false);
  const gameStartedRef = useRef(false);

  // ── announcements helper ────────────────────────────────────────────────

  const addAnnouncement = useCallback((msg, type = "info") => {
    console.log(`📢 [${type}] ${msg}`);
    setAnnouncements((prev) =>
      [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 20)
    );
  }, []);

  // ── game list ───────────────────────────────────────────────────────────

  const fetchAllGames = useCallback(async () => {
    console.log("🔄 Fetching all games...");
    try {
      setGamesError(null);
      const response = await getAllGamesAPI();
      console.log("📥 Games API Response:", response);
      if (response.success && response.data?.games) {
        const formattedGames = response.data.games.map(formatGame);
        console.log("✅ Games loaded:", formattedGames.length);
        setAllGames(formattedGames);
      } else {
        console.error("❌ Failed to load games:", response.message);
        setGamesError(response.message || "Failed to load games");
        setAllGames([]);
      }
    } catch (err) {
      console.error("❌ Error fetching games:", err);
      setGamesError(err.message || "Failed to load games");
      setAllGames([]);
    }
  }, []);

  // ── round helpers ───────────────────────────────────────────────────────

  const createNewRound = async (gameId) => {
    console.log(`🔄 Creating new round for game: ${gameId}`);
    try {
      const res = await createRoundAPI({ game_id: gameId, round_time: new Date().toISOString() });
      console.log("📥 Create round response:", res);
      if (res.success && res.data?.round_id) {
        console.log(`✅ Round created: ${res.data.round_id}`);
        return res.data.round_id;
      }
      console.error("❌ Failed to create round");
      return null;
    } catch (err) {
      console.error("❌ Error creating round:", err);
      return null;
    }
  };

  const loadCurrentRound = async (gameId) => {
    console.log(`🔄 Loading current round for game: ${gameId}`);
    try {
      const res = await getCurrentRoundAPI(gameId);
      console.log("📥 Current round response:", res);
      if (res.success && res.data?.round_id) {
        console.log(`✅ Current round found: ${res.data.round_id}`);
        setSelectedRoundId(res.data.round_id);
        return res.data.round_id;
      }
      console.log("ℹ️ No current round found");
      return null;
    } catch (err) {
      console.error("❌ Error loading current round:", err);
      return null;
    }
  };

  // ── game status ─────────────────────────────────────────────────────────

  const loadGameStatus = useCallback(async (roundId) => {
    console.log(`🔄 Loading game status for round: ${roundId}`);
    if (!roundId) {
      console.warn("⚠️ No roundId provided to loadGameStatus");
      return;
    }

    try {
      const res = await getGameStatusAPI(roundId);
      console.log("📥 Game status response:", res);

      if (res.success && res.data) {
        const {
          called_numbers = [],
          is_running,
          last_called_number,
          game_status,
          round_status
        } = res.data;

        console.log(`📊 Game status: called=${called_numbers.length}, is_running=${is_running}, game_status=${game_status}`);

        // ✅ Direct update - no checks
        if (called_numbers.length > 0) {
          console.log(`📊 Setting numbers: ${called_numbers.length}`);
          setNumbers(called_numbers);
          numbersRef.current = called_numbers;

          if (last_called_number) {
            setCurrent(last_called_number);
          } else if (called_numbers.length > 0) {
            setCurrent(called_numbers[called_numbers.length - 1]);
          }

          setGameHistory(
            called_numbers
              .map((num) => ({ number: num, time: new Date().toLocaleTimeString() }))
              .reverse()
              .slice(0, 20)
          );

          const calledSet = new Set(called_numbers);
          const available = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).filter((n) => !calledSet.has(n));
          setAvailableNumbers(available);
        }

        // ✅ Update isRunning
        let shouldBeRunning = is_running;
        if (typeof is_running === 'undefined' || is_running === null) {
          shouldBeRunning = (game_status === 'live' || round_status === 'live');
        }

        const shouldBeRunningBool = !!shouldBeRunning;
        if (isRunningRef.current !== shouldBeRunningBool) {
          console.log(`🔄 isRunning changed: ${isRunningRef.current} → ${shouldBeRunningBool}`);
          setIsRunning(shouldBeRunningBool);
          isRunningRef.current = shouldBeRunningBool;
        }

        if (shouldBeRunningBool) {
          setGameStarted(true);
          gameStartedRef.current = true;
        }

        if (called_numbers.length > 0 && !gameStartedRef.current) {
          setGameStarted(true);
          gameStartedRef.current = true;
        }
      } else {
        console.error("❌ Failed to load game status:", res.message);
      }
    } catch (err) {
      console.error("❌ loadGameStatus error:", err);
    }
  }, []);

  const loadWinnersList = useCallback(async (roundId) => {
    console.log(`🔄 Loading winners for round: ${roundId}`);
    if (!roundId) return;
    try {
      const res = await getWinnersListAPI(roundId);
      console.log("📥 Winners response:", res);
      if (res.success && res.data) {
        console.log(`🏆 Winners loaded: ${res.data.length}`);
        setWinners(res.data);
      }
    } catch (err) {
      console.error("❌ loadWinnersList error:", err);
    }
  }, []);

  // ── socket setup ─────────────────────────────────────────────────────────

  const setupSocket = useCallback((gameId) => {
    console.log(`🔌 Setting up socket for game: ${gameId}`);

    if (socketRef.current) {
      console.log("🧹 Cleaning up previous socket");
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    console.log(`🔄 Creating new socket connection to: ${SOCKET_URL}`);

    const SOCKET_OPTIONS = {
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      secure: true,
      rejectUnauthorized: false,
      path: "/socket.io/",
      upgrade: true,
      rememberUpgrade: true,
      forceNew: true,
      multiplex: false,
    };

    const socket = io(SOCKET_URL, SOCKET_OPTIONS);
    socketRef.current = socket;

    if (socket.connected) {
      console.log("✅ Socket already connected!");
      setSocketConnected(true);
    }

    setTimeout(() => {
      if (socket.connected) {
        console.log("✅ Socket confirmed connected after delay");
        setSocketConnected(true);
      }
    }, 100);

    // =====================================
    // SOCKET EVENT HANDLERS
    // =====================================

    socket.on("connect", () => {
      console.log("✅ Socket connected successfully!");
      setSocketConnected(true);

      console.log(`📤 Joining game room: game_${gameId}`);
      socket.emit("join_game", { game_id: gameId });

      console.log(`📤 Emitting 'get_game_data' for game: ${gameId}`);
      socket.emit("get_game_data", { game_id: gameId });

      addAnnouncement("✅ Socket connected", "success");
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
      setSocketConnected(false);
      addAnnouncement(`⚠️ Socket connection error: ${error.message}`, "error");

      if (socket.io.opts.transports && socket.io.opts.transports[0] === "websocket") {
        console.log("🔄 Trying to reconnect with polling...");
        socket.io.opts.transports = ["polling", "websocket"];
        socket.connect();
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
      setSocketConnected(false);
      addAnnouncement(`⚠️ Socket disconnected: ${reason}`, "error");
      if (reason === "io server disconnect") {
        console.log("🔄 Server disconnected, attempting to reconnect...");
        socket.connect();
      }
    });

    socket.on("reconnect", (attempt) => {
      console.log(`🔄 Socket reconnected (attempt ${attempt})`);
      setSocketConnected(true);

      console.log(`📤 Re-joining game room: game_${gameId}`);
      socket.emit("join_game", { game_id: gameId });

      console.log(`📤 Re-emitting 'get_game_data' for game: ${gameId}`);
      socket.emit("get_game_data", { game_id: gameId });
      addAnnouncement("✅ Socket reconnected", "success");
    });

    socket.on("reconnect_attempt", (attempt) => {
      console.log(`🔄 Socket reconnect attempt ${attempt}`);
    });

    socket.on("reconnect_error", (error) => {
      console.error("❌ Socket reconnect error:", error);
    });

    socket.on("reconnect_failed", () => {
      console.error("❌ Socket reconnect failed");
      setSocketConnected(false);
      addAnnouncement("❌ Socket connection failed. Please refresh.", "error");
    });

    // ── NUMBER CALLED ──────────────────
    socket.on("number_called", (data) => {
      console.log("📞 Number called event received:", data);
      setSocketConnected(true);

      if (data.game_id != gameId) {
        console.log(`⏭️ Skipping for different game: ${data.game_id} (expected: ${gameId})`);
        return;
      }

      const calledNumber = data.number;
      console.log(`🎯 Number called: ${calledNumber}`);
      
      // ✅ Direct update - no checks
      setCurrent(calledNumber);

      setNumbers((prev) => {
        const newNumbers = [...prev, calledNumber];
        console.log(`📊 Numbers: ${prev.length} → ${newNumbers.length}`);
        numbersRef.current = newNumbers;
        
        const allNumbers = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);
        const calledSet = new Set(newNumbers);
        setAvailableNumbers(allNumbers.filter(n => !calledSet.has(n)));
        return newNumbers;
      });

      if (!isRunningRef.current) {
        console.log("▶️ Setting isRunning to true");
        setIsRunning(true);
        isRunningRef.current = true;
      }
      setGameStarted(true);
      gameStartedRef.current = true;
      addAnnouncement(`📢 Number Called: ${data.number}`, "success");
    });

    // ── OLD NUMBERS ────────────────────
    socket.on("old_numbers", (data) => {
      console.log("📜 Old numbers received:", data);
      setSocketConnected(true);

      if (data?.calledNumbers) {
        const newNumbers = data.calledNumbers;
        console.log(`📊 Setting numbers from old_numbers: ${newNumbers.length}`);
        
        // ✅ Direct update
        setNumbers(newNumbers);
        numbersRef.current = newNumbers;

        const calledSet = new Set(newNumbers);
        setAvailableNumbers(
          Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).filter((n) => !calledSet.has(n))
        );

        if (newNumbers.length > 0) {
          const last = newNumbers[newNumbers.length - 1];
          console.log(`🎯 Setting current number to: ${last}`);
          setCurrent(last);
          setGameStarted(true);
          gameStartedRef.current = true;
        }
      }

      // Update isRunning
      let shouldBeRunning = false;
      if (typeof data.is_running !== 'undefined') {
        shouldBeRunning = !!data.is_running;
      } else if (data.started && !data.paused && !data.completed) {
        shouldBeRunning = true;
      } else if (data.paused || data.completed) {
        shouldBeRunning = false;
      }

      if (isRunningRef.current !== shouldBeRunning) {
        console.log(`🔄 Setting isRunning from ${isRunningRef.current} to ${shouldBeRunning}`);
        setIsRunning(shouldBeRunning);
        isRunningRef.current = shouldBeRunning;
      }

      if (shouldBeRunning) {
        setGameStarted(true);
        gameStartedRef.current = true;
      }
    });

    // ── GAME STARTED ────────────────────
    socket.on("game_started", (data) => {
      console.log("🎮 Game Started event received:", data);
      setSocketConnected(true);
      if (!isRunningRef.current) {
        console.log("▶️ Setting isRunning to true (game_started)");
        setIsRunning(true);
        isRunningRef.current = true;
      }
      setGameStarted(true);
      gameStartedRef.current = true;
      addAnnouncement("🎮 Game Started", "success");
    });

    // ── GAME PAUSED ─────────────────────
    socket.on("game_paused", (data) => {
      console.log("⏸️ Game Paused event received:", data);
      setSocketConnected(true);
      if (isRunningRef.current) {
        console.log("⏸️ Setting isRunning to false (game_paused)");
        setIsRunning(false);
        isRunningRef.current = false;
      }
      addAnnouncement("⏸️ Game Paused", "warning");
    });

    // ── GAME RESUMED ────────────────────
    socket.on("game_resumed", (data) => {
      console.log("▶️ Game Resumed event received:", data);
      setSocketConnected(true);
      if (!isRunningRef.current) {
        console.log("▶️ Setting isRunning to true (game_resumed)");
        setIsRunning(true);
        isRunningRef.current = true;
      }
      setGameStarted(true);
      gameStartedRef.current = true;
      addAnnouncement("▶️ Game Resumed", "success");
    });

    // ── GAME OVER ───────────────────────
    socket.on("game_over", (data) => {
      console.log("🏁 Game Over event received:", data);
      setSocketConnected(true);
      if (isRunningRef.current) {
        console.log("⏹️ Setting isRunning to false (game_over)");
        setIsRunning(false);
        isRunningRef.current = false;
      }
      addAnnouncement("🏁 Game Over", "info");
    });

    // ── ALL NUMBERS COMPLETED ──────────
    socket.on("all_numbers_completed", (data) => {
      console.log("🎯 All numbers completed event received:", data);
      setSocketConnected(true);
      if (isRunningRef.current) {
        setIsRunning(false);
        isRunningRef.current = false;
      }
      addAnnouncement("🎯 All numbers have been called!", "info");
    });

    socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });

    return socket;
  }, [addAnnouncement]);

  // ── game select / back ──────────────────────────────────────────────────

  const handleGameSelect = async (gameId) => {
    console.log(`🎯 Game selected: ${gameId}`);
    setSelectedGameId(gameId);
    setShowGameSelector(false);
    setNumbers([]);
    numbersRef.current = [];
    setCurrent(null);
    setGameHistory([]);
    setWinners([]);
    setAnnouncements([]);
    setIsRunning(false);
    isRunningRef.current = false;
    setGameStarted(false);
    gameStartedRef.current = false;
    setSocketConnected(false);
    setManualNumberError("");
    setBulkNumbersInput("");
    setSelectedBulkNumbers(new Set());
    setBulkCallStatus("");

    console.log("🔌 Setting up socket...");
    setupSocket(gameId);

    console.log("🔄 Loading current round...");
    let roundId = await loadCurrentRound(gameId);
    if (!roundId) {
      console.log("ℹ️ No current round found, creating new round...");
      addAnnouncement("Creating new round...", "info");
      roundId = await createNewRound(gameId);
      if (roundId) {
        console.log(`✅ New round created: ${roundId}`);
        setSelectedRoundId(roundId);
        addAnnouncement("✅ New round created!", "success");
      } else {
        console.error("❌ Failed to create round");
        addAnnouncement("❌ Failed to create round", "error");
      }
    }

    if (roundId) {
      console.log(`🔄 Loading game status for round: ${roundId}`);
      setTimeout(() => {
        loadGameStatus(roundId);
        loadWinnersList(roundId);
      }, 100);
    }

    const game = allGames.find((g) => g.game_id === gameId);
    const gameTitle = game?.title || "Game";
    console.log(`✅ Selected game: ${gameTitle} (${gameId})`);
    addAnnouncement(`🎮 Selected: ${gameTitle}`, "success");
  };

  const handleBackToGames = () => {
    console.log("🔙 Going back to games list");
    if (autoRefreshRef.current) {
      console.log("🧹 Clearing auto-refresh interval");
      clearInterval(autoRefreshRef.current);
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (socketRef.current) {
      console.log("🔌 Disconnecting socket");
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setShowGameSelector(true);
    setSelectedGameId(null);
    setSelectedRoundId(null);
    setShowAdminPanel(false);
    setGameStarted(false);
    gameStartedRef.current = false;
    setSocketConnected(false);
    console.log("🔄 Fetching games list");
    fetchAllGames();
  };

  // ── controls ────────────────────────────────────────────────────────────

  const startGame = async () => {
    console.log("🎮 Start Game button clicked");

    if (!selectedRoundId) {
      console.error("❌ No active round found");
      addAnnouncement("❌ No active round found", "error");
      return;
    }

    if (isRunning) {
      console.warn("⚠️ Game is currently running");
      addAnnouncement("⚠️ Game is already running!", "warning");
      return;
    }

    setLoading(true);
    try {
      console.log(`📤 Calling startGameAPI for round: ${selectedRoundId}`);
      const res = await startGameAPI(selectedRoundId);
      console.log("📥 Start game response:", res);

      if (res.success) {
        console.log("✅ Game started successfully");
        setIsRunning(true);
        isRunningRef.current = true;
        setGameStarted(true);
        gameStartedRef.current = true;
        addAnnouncement("🎮 Game started! Auto-calling active", "success");

        if (socketRef.current) {
          socketRef.current.emit("get_game_data", { game_id: selectedGameId });
        }

        setTimeout(() => {
          loadGameStatus(selectedRoundId);
        }, 500);
      } else {
        console.error("❌ Failed to start game:", res.message);
        addAnnouncement(`❌ ${res.message || "Failed to start"}`, "error");
      }
    } catch (err) {
      console.error("❌ Error starting game:", err);
      addAnnouncement(`❌ ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const pauseGame = async () => {
    console.log("⏸️ Pause Game button clicked");

    if (!selectedRoundId) {
      console.error("❌ No active round found");
      addAnnouncement("❌ No active round found", "error");
      return;
    }

    if (!isRunning && !gameStarted) {
      console.warn("⚠️ Game is not running");
      addAnnouncement("⚠️ Game is not running", "warning");
      return;
    }

    if (!window.confirm("Pause the game?")) {
      console.log("⏸️ Pause canceled by user");
      return;
    }

    setLoading(true);
    try {
      console.log(`📤 Calling stopGameAPI for round: ${selectedRoundId}`);
      const res = await stopGameAPI(selectedRoundId);
      console.log("📥 Stop game response:", res);

      if (res.success) {
        console.log("✅ Game paused successfully");
        setIsRunning(false);
        isRunningRef.current = false;
        addAnnouncement("⏸️ Game paused!", "warning");

        if (socketRef.current) {
          socketRef.current.emit("pause_game", { game_id: selectedGameId });
        }

        setTimeout(() => {
          loadGameStatus(selectedRoundId);
        }, 500);
      } else {
        console.error("❌ Failed to pause game:", res.message);
        addAnnouncement(`❌ ${res.message || "Failed to pause"}`, "error");
      }
    } catch (err) {
      console.error("❌ Error pausing game:", err);
      addAnnouncement(`❌ ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const resumeGame = async () => {
    console.log("▶️ Resume Game button clicked");

    if (!selectedGameId) {
      console.error("❌ No game selected!");
      addAnnouncement("❌ No game selected. Please select a game first.", "error");
      return;
    }

    if (!selectedRoundId) {
      console.error("❌ No active round found");
      addAnnouncement("❌ No active round found", "error");
      return;
    }

    setLoading(true);
    try {
      console.log(`📤 Checking game status before resume`);
      const statusRes = await getGameStatusAPI(selectedRoundId);
      console.log("📥 Status check before resume:", statusRes);

      if (statusRes.success && statusRes.data) {
        const serverRunning = statusRes.data.is_running || false;
        const calledNumbers = statusRes.data.called_numbers || [];

        if (serverRunning) {
          console.log("✅ Game is already running on server");
          setIsRunning(true);
          isRunningRef.current = true;
          setGameStarted(true);
          gameStartedRef.current = true;

          if (calledNumbers.length > 0) {
            setNumbers(calledNumbers);
            numbersRef.current = calledNumbers;
            setCurrent(calledNumbers[calledNumbers.length - 1]);
          }

          addAnnouncement("✅ Game is already running!", "success");
          setLoading(false);
          return;
        }

        console.log(`✅ Game is paused on server, resuming...`);

        if (socketRef.current && socketRef.current.connected) {
          setIsRunning(true);
          isRunningRef.current = true;
          setGameStarted(true);
          gameStartedRef.current = true;

          socketRef.current.emit("resume_game", {
            game_id: selectedGameId
          });

          addAnnouncement("▶️ Game resumed!", "success");

          setTimeout(() => {
            loadGameStatus(selectedRoundId);
            loadWinnersList(selectedRoundId);
          }, 500);
        } else {
          console.warn("⚠️ Socket not available, trying API fallback");
          const startRes = await startGameAPI(selectedRoundId);
          if (startRes.success) {
            console.log("✅ Game resumed via API");
            setIsRunning(true);
            isRunningRef.current = true;
            setGameStarted(true);
            gameStartedRef.current = true;
            addAnnouncement("▶️ Game resumed via API!", "success");
          }
        }
      }
    } catch (err) {
      console.error("❌ Error resuming game:", err);
      addAnnouncement(`❌ ${err.message || "Failed to resume"}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const callNumber = async () => {
    console.log("📞 Auto Call button clicked");

    if (!selectedRoundId) {
      console.error("❌ No active round found");
      addAnnouncement("❌ No active round found. Please start game first.", "error");
      return;
    }

    if (!isRunning) {
      console.warn("⚠️ Game is not running");
      addAnnouncement("⚠️ Game is not running. Please start or resume the game first.", "error");
      return;
    }

    setLoading(true);
    try {
      console.log(`📤 Calling callNumberAPI for round: ${selectedRoundId}`);
      const res = await callNumberAPI(selectedRoundId);
      console.log("📥 Call number response:", res);

      if (res.success) {
        const calledNumber = res.data?.number;
        if (calledNumber) {
          console.log(`✅ Number called: ${calledNumber}`);
          setCurrent(calledNumber);
          setGameStarted(true);
          gameStartedRef.current = true;
          addAnnouncement(`📞 Number ${calledNumber} called!`, "success");
        } else {
          addAnnouncement(`📞 Number called!`, "success");
        }

        setTimeout(() => {
          loadGameStatus(selectedRoundId);
        }, 300);
      } else {
        console.error("❌ Failed to call number:", res.message);
        addAnnouncement(`❌ ${res.message || "Failed to call number"}`, "error");
      }
    } catch (err) {
      console.error("❌ Error calling number:", err);
      addAnnouncement(`❌ ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Force Refresh Status ───────────────────────────────────────────────

  const forceRefreshStatus = async () => {
    console.log("🔄 Force refreshing game status");
    if (!selectedRoundId) {
      addAnnouncement("❌ No round selected", "error");
      return;
    }

    setLoading(true);
    try {
      await loadGameStatus(selectedRoundId);
      await loadWinnersList(selectedRoundId);
      addAnnouncement("✅ Status refreshed", "success");
    } catch (err) {
      console.error("❌ Refresh failed:", err);
      addAnnouncement("❌ Failed to refresh status", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── admin actions ───────────────────────────────────────────────────────

  const handleManualNumberCall = async (numOverride) => {
    const num = parseInt(numOverride ?? manualNumber);
    console.log(`🔢 Manual number call: ${num}`);

    if (isNaN(num) || num < 1 || num > TOTAL_NUMBERS) {
      return setManualNumberError(`Please enter a valid number between 1 and ${TOTAL_NUMBERS}`);
    }
    if (numbers.includes(num)) {
      setManualNumberError(`❌ Number ${num} has already been called!`);
      return addAnnouncement(`❌ Cannot call ${num} - Already called!`, "error");
    }
    setLoading(true);
    setManualNumberError("");
    try {
      console.log(`📤 Admin calling number ${num} for round: ${selectedRoundId}`);
      const res = await callNumberAPI(selectedRoundId, { number: num });
      console.log("📥 Manual call response:", res);

      if (res.success) {
        console.log(`✅ Admin called number ${num}`);
        addAnnouncement(`📞 Admin called number ${num}!`, "success");
        setManualNumber("");

        if (!numbers.includes(num)) {
          const newNumbers = [...numbers, num];
          setNumbers(newNumbers);
          numbersRef.current = newNumbers;
          const allNumbers = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);
          const calledSet = new Set(newNumbers);
          setAvailableNumbers(allNumbers.filter(n => !calledSet.has(n)));
          setCurrent(num);
          setGameStarted(true);
          gameStartedRef.current = true;
        }

        await loadGameStatus(selectedRoundId);
      } else {
        console.error("❌ Failed manual call:", res.message);
        addAnnouncement(`❌ ${res.message || "Failed to call number"}`, "error");
      }
    } catch (err) {
      console.error("❌ Error in manual call:", err);
      addAnnouncement(`❌ ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCallRandom = async () => {
    console.log("🎲 Quick Random called");
    const allNumbers = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);
    const uncalledNumbers = allNumbers.filter(num => !numbers.includes(num));

    if (uncalledNumbers.length === 0) {
      addAnnouncement("❌ All numbers have been called!", "error");
      return;
    }

    let count = selectedBulkNumbers.size === 0 ? Math.min(10, uncalledNumbers.length) : Math.min(5, uncalledNumbers.length);
    const shuffled = [...uncalledNumbers].sort(() => Math.random() - 0.5);
    const randomNumbers = shuffled.slice(0, count);

    const newSelected = new Set(selectedBulkNumbers);
    randomNumbers.forEach(num => newSelected.add(num));
    setSelectedBulkNumbers(newSelected);
    setBulkNumbersInput(Array.from(newSelected).join(', '));

    addAnnouncement(`🎲 ${randomNumbers.length} random numbers selected: ${randomNumbers.join(', ')}`, "success");
  };

  // ── BULK NUMBERS ───────────────────────────────────────────────────────

  const parseAndUpdateNumbers = (input) => {
    console.log(`📝 Parsing bulk numbers input: ${input}`);
    setBulkNumbersInput(input);

    if (!input.trim()) {
      setSelectedBulkNumbers(new Set());
      return;
    }

    const newSelectedNumbers = new Set();
    const parts = input.split(/[,\s]+/);

    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n));
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= TOTAL_NUMBERS) {
              newSelectedNumbers.add(i);
            }
          }
        }
      } else {
        const num = parseInt(part);
        if (!isNaN(num) && num >= 1 && num <= TOTAL_NUMBERS) {
          newSelectedNumbers.add(num);
        }
      }
    }

    setSelectedBulkNumbers(newSelectedNumbers);
  };

  const toggleNumberSelection = (num) => {
    const newSelected = new Set(selectedBulkNumbers);
    if (newSelected.has(num)) {
      newSelected.delete(num);
    } else {
      newSelected.add(num);
    }
    setSelectedBulkNumbers(newSelected);
    setBulkNumbersInput(Array.from(newSelected).join(', '));
  };

  const handleBulkNumbersCall = async () => {
    console.log("📞 Bulk Numbers Call triggered");

    if (selectedBulkNumbers.size === 0) {
      setManualNumberError("Please select numbers to call");
      return;
    }

    const numbersToCall = Array.from(selectedBulkNumbers);
    const newNumbers = numbersToCall.filter(num => !numbers.includes(num));

    if (newNumbers.length === 0) {
      setManualNumberError("All selected numbers have already been called!");
      return addAnnouncement("❌ All numbers already called!", "error");
    }

    if (!window.confirm(`Call ${newNumbers.length} number(s)?`)) {
      return;
    }

    setLoading(true);
    setManualNumberError("");
    setBulkCallStatus("calling");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        addAnnouncement("❌ Please login first", "error");
        setLoading(false);
        setBulkCallStatus("error");
        return;
      }

      const payload = {
        game_id: parseInt(selectedGameId),
        numbers: newNumbers,
      };

      const response = await fetch(
        "https://api.luckyfunda.com/api/game/set-bulk-announcement",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        const calledCount = result.data?.called_count || newNumbers.length;
        addAnnouncement(`✅ Bulk call successful! ${calledCount} numbers called.`, "success");

        if (newNumbers.length > 0) {
          const lastNumber = newNumbers[newNumbers.length - 1];
          setCurrent(lastNumber);
          setGameStarted(true);
          gameStartedRef.current = true;
        }

        setBulkCallStatus("success");
        await loadGameStatus(selectedRoundId);
        setBulkNumbersInput("");
        setSelectedBulkNumbers(new Set());
        setTimeout(() => setBulkCallStatus(""), 2000);
      } else {
        throw new Error(result.message || "Failed to call numbers");
      }
    } catch (error) {
      console.error("❌ Bulk call error:", error);
      setBulkCallStatus("error");
      addAnnouncement(`❌ ${error.message || "Failed to call numbers"}`, "error");
      setTimeout(() => setBulkCallStatus(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Winner by Ticket
  const handleDeclareWinnerByTicket = async () => {
    console.log("🏆 Declare Winner by Ticket triggered");

    if (!selectedGameId) {
      addAnnouncement("❌ No game selected. Please select a game first.", "error");
      return;
    }

    if (!winnerTicketId?.trim()) {
      addAnnouncement("Please enter a valid Ticket Number", "error");
      return;
    }

    const ticketNumber = parseInt(winnerTicketId.trim());
    if (isNaN(ticketNumber) || ticketNumber <= 0) {
      addAnnouncement("Please enter a valid ticket number", "error");
      return;
    }

    if (!window.confirm(`Declare ticket #${ticketNumber} as winner?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await forceWinnerByTicketNewAPI({
        game_id: selectedGameId,
        ticket_number: ticketNumber
      });

      if (res.success) {
        addAnnouncement(`🏆 Ticket #${ticketNumber} declared winner! 🎉`, "winner");
        if (selectedRoundId) {
          await loadWinnersList(selectedRoundId);
        }
        setWinnerTicketId("");
      } else {
        addAnnouncement(`❌ ${res.message || "Failed to declare winner"}`, "error");
      }
    } catch (err) {
      console.error("❌ Error declaring winner:", err);
      addAnnouncement(`❌ ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── effects ─────────────────────────────────────────────────────────────

  // Keep refs in sync with state
  useEffect(() => {
    numbersRef.current = numbers;
  }, [numbers]);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    gameStartedRef.current = gameStarted;
  }, [gameStarted]);

  // Auto-refresh for winners only
  useEffect(() => {
    if (!selectedRoundId) return;

    if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current);
    }

    autoRefreshRef.current = setInterval(() => {
      console.log(`🔄 Auto-refresh: Loading winners`);
      loadWinnersList(selectedRoundId).catch(err => console.error("❌ Auto-refresh failed:", err));
    }, 5000);

    return () => {
      clearInterval(autoRefreshRef.current);
    };
  }, [selectedRoundId, loadWinnersList]);

  // Auto-sync via socket
  useEffect(() => {
    if (!selectedRoundId || !socketRef.current) return;

    const syncInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.connected) {
        console.log(`🔄 Auto-sync: Requesting game data`);
        socketRef.current.emit("get_game_data", { game_id: selectedGameId });
      }
    }, 5000);

    return () => {
      clearInterval(syncInterval);
    };
  }, [selectedRoundId, selectedGameId]);

  // Fetch games
  useEffect(() => {
    console.log("🔄 Effect: Fetching games list");
    fetchAllGames();
    gamesRefreshRef.current = setInterval(() => {
      if (showGameSelector) {
        fetchAllGames();
      }
    }, 10000);
    return () => {
      clearInterval(gamesRefreshRef.current);
    };
  }, [showGameSelector, fetchAllGames]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        console.log("🔌 Disconnecting socket on unmount");
        socketRef.current.disconnect();
      }
    };
  }, []);

  // ── derived ──────────────────────────────────────────────────────────────

  const getProgress = () => (numbers.length / TOTAL_NUMBERS) * 100;
  const lastTen = numbers.slice(-10).reverse();

  console.log(`📊 Render: isRunning=${isRunning}, numbers=${numbers.length}, current=${current}`);

  // ════════════════════════════════════════════════════════════════════════
  // GAME SELECTOR VIEW
  // ════════════════════════════════════════════════════════════════════════

  if (showGameSelector) {
    return (
      <div className="live-game-container">
        <div className="live-header">
          <h1 className="live-title">Live Game Control</h1>
        </div>
        <div className="game-selector">
          <h2>Available Games</h2>
          <div className="games-list">
            {gamesError ? (
              <div className="lg-error-wrap">
                <div className="lg-error-icon">⚠️</div>
                <h3 className="lg-error-title">Failed to Load Games</h3>
                <p className="lg-error-msg">{gamesError}</p>
                <button onClick={fetchAllGames} className="lg-error-btn">Try Again</button>
              </div>
            ) : !allGames.length ? (
              <p className="no-games">No games available. Create a game first.</p>
            ) : (
              allGames.filter((g) => g?.game_id).map((game) => (
                <div key={game.game_id} className="game-selector-card" onClick={() => handleGameSelect(game.game_id)}>
                  <div className="game-selector-icon">🎮</div>
                  <div className="game-selector-info">
                    <h3>{game.title || "Untitled"}</h3>
                    <p>ID: {game.game_id} | Created: {game.formattedCreatedAt}</p>
                    <p>Start Time: {game.formattedDate} {game.formattedTime}</p>
                    <span className={`game-status ${game.gameStatus.className}`}>{game.gameStatus.label}</span>
                  </div>
                  <button className="select-game-btn">Manage →</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // LIVE GAME VIEW
  // ════════════════════════════════════════════════════════════════════════

  return (
    <div className="live-game-container">
      {/* Header */}
      <div className="live-header">
        <div className="header-info">
          <button className="back-button" onClick={handleBackToGames}>← Back</button>
          <h1 className="live-title">Live Game</h1>
          <p className="live-subtitle">
            Game ID: {selectedGameId} | Round: {selectedRoundId || "No Round"}
            {!socketConnected && <span className="socket-status"> 🔴 Socket Disconnected</span>}
          </p>
        </div>
        <div className="header-actions">
          <button className={`admin-toggle ${showAdminPanel ? "active" : ""}`} onClick={() => setShowAdminPanel((v) => !v)}>
            {showAdminPanel ? "Hide Admin Panel" : "Show Admin Panel"}
          </button>
          <button className="btn-refresh" onClick={forceRefreshStatus} disabled={loading || !selectedRoundId} style={{
            background: "#17a2b8", color: "#fff", border: "none", borderRadius: "5px",
            padding: "8px 15px", cursor: "pointer", fontSize: "14px", fontWeight: "bold", marginRight: "10px"
          }}>🔄 Refresh</button>
          <div className={`live-status ${isRunning ? "status-live" : "status-paused"}`}>
            <span className="status-dot"></span>
            {isRunning ? "LIVE" : "PAUSED"}
          </div>
        </div>
      </div>

      {/* Admin Panel */}
      {showAdminPanel && (
        <div className="admin-panel">
          <div className="admin-section">
            <h4>📝 Bulk Numbers Call</h4>
            <div style={{ marginBottom: "15px" }}>
              <input type="text" placeholder="Type numbers: 1,2,3 or 1-10 or click on grid"
                value={bulkNumbersInput} onChange={(e) => parseAndUpdateNumbers(e.target.value)}
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "5px", fontSize: "14px" }} />
              <small style={{ color: "#666", display: "block", marginTop: "5px" }}>
                💡 Selected: {selectedBulkNumbers.size} number(s) | New: {Array.from(selectedBulkNumbers).filter(n => !numbers.includes(n)).length}
              </small>
            </div>

            <div style={{
              display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "5px",
              marginBottom: "15px", maxHeight: "300px", overflowY: "auto",
              padding: "10px", background: "#f8f9fa", borderRadius: "5px", border: "1px solid #dee2e6"
            }}>
              {Array.from({ length: TOTAL_NUMBERS }, (_, i) => {
                const num = i + 1;
                const isSelected = selectedBulkNumbers.has(num);
                const isAlreadyCalled = numbers.includes(num);
                return (
                  <button key={num} onClick={() => toggleNumberSelection(num)} disabled={isAlreadyCalled}
                    style={{
                      padding: "8px 4px",
                      backgroundColor: isSelected ? "#28a745" : (isAlreadyCalled ? "#6c757d" : "#fff"),
                      color: isSelected ? "#fff" : (isAlreadyCalled ? "#fff" : "#000"),
                      border: isSelected ? "2px solid #1e7e34" : "1px solid #dee2e6",
                      borderRadius: "4px", cursor: isAlreadyCalled ? "not-allowed" : "pointer",
                      fontSize: "12px", fontWeight: "bold", opacity: isAlreadyCalled ? 0.6 : 1,
                    }}
                    title={isAlreadyCalled ? `Number ${num} already called` : `Select number ${num}`}
                  >{num}</button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
              <button onClick={() => {
                const allNumbers = new Set(selectedBulkNumbers);
                for (let i = 1; i <= TOTAL_NUMBERS; i++) {
                  if (!numbers.includes(i)) allNumbers.add(i);
                }
                setSelectedBulkNumbers(allNumbers);
                setBulkNumbersInput(Array.from(allNumbers).join(', '));
              }} style={{ background: "#17a2b8", color: "#fff", border: "none", borderRadius: "5px", fontSize: "12px", padding: "8px 12px", cursor: "pointer" }}>
                Select All Remaining ({availableNumbers.length})
              </button>
              <button onClick={() => { setSelectedBulkNumbers(new Set()); setBulkNumbersInput(""); }}
                style={{ background: "#6c757d", color: "#fff", border: "none", borderRadius: "5px", fontSize: "12px", padding: "8px 12px", cursor: "pointer" }}>
                Clear All
              </button>
              <button onClick={handleQuickCallRandom} disabled={loading || !isRunning || availableNumbers.length === 0}
                style={{ background: "#ffc107", color: "#000", border: "none", borderRadius: "5px", fontSize: "12px", padding: "8px 12px", cursor: availableNumbers.length === 0 ? "not-allowed" : "pointer" }}>
                🎲 Quick Random
              </button>
            </div>

            <button onClick={handleBulkNumbersCall} disabled={loading || selectedBulkNumbers.size === 0}
              style={{
                width: "100%",
                background: bulkCallStatus === "success" ? "#28a745" : bulkCallStatus === "error" ? "#dc3545" : bulkCallStatus === "calling" ? "#ffc107" : "#007bff",
                color: "#fff", border: "none", borderRadius: "8px", padding: "12px", fontSize: "14px",
                fontWeight: "bold", cursor: selectedBulkNumbers.size === 0 ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1, transition: "all 0.3s"
              }}>
              {loading ? "⏳ Calling..." : bulkCallStatus === "success" ? "✅ Done!" : bulkCallStatus === "error" ? "❌ Failed - Try Again" :
                `📞 Call ${selectedBulkNumbers.size} Selected Number(s)`}
            </button>
          </div>

          <div className="admin-section">
            <h4>🎫 Declare Winner by Ticket Number</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input type="number" placeholder="Enter Ticket Number" value={winnerTicketId}
                onChange={(e) => setWinnerTicketId(e.target.value)} min="1"
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "5px", fontSize: "14px" }} />
              <button onClick={handleDeclareWinnerByTicket} disabled={loading || !winnerTicketId.trim()}
                style={{ background: "#28a745", color: "white", border: "none", padding: "12px 20px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", width: "100%", fontSize: "14px" }}>
                {loading ? "⏳ Processing..." : "🏆 Declare Winner"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="game-stats-bar">
        <div className="stat-item"><span className="stat-label">Called:</span><span className="stat-value">{numbers.length}/90</span></div>
        <div className="stat-item"><span className="stat-label">Remaining:</span><span className="stat-value">{90 - numbers.length}</span></div>
        <div className="stat-item"><span className="stat-label">Winners:</span><span className="stat-value">{winners.length}</span></div>
        <div className="stat-item"><span className="stat-label">Socket:</span>
          <span className="stat-value" style={{ color: socketConnected ? '#28a745' : '#dc3545' }}>
            {socketConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>
      </div>

      {/* Main layout */}
      <div className="live-main">
        <div className="live-left">
          <div className="current-card">
            <div className="current-label">Current Number</div>
            <div className="current-number">{current ?? "--"}</div>
            <div className="current-progress">
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${getProgress()}%` }} /></div>
            </div>
          </div>

          <div className="control-panel">
            <h3>Controls</h3>
            <div className="control-buttons">
              <button className="btn-start" onClick={startGame}
                disabled={loading || !selectedRoundId || isRunning || (gameStarted && numbers.length > 5)}>
                {loading ? "..." : "▶ Start"}
              </button>
              <button className="btn-pause" onClick={pauseGame}
                disabled={loading || !selectedRoundId || (!isRunning && !gameStarted)}>
                ⏸ Pause
              </button>
              <button className="btn-resume" onClick={resumeGame}
                disabled={loading || !selectedRoundId || (isRunning && !gameStarted)}>
                ▶ Resume
              </button>
              <button className="btn-call" onClick={callNumber}
                disabled={loading || !isRunning || !selectedRoundId}>
                {loading ? "..." : "📞 Auto Call"}
              </button>
            </div>
          </div>

          <div className="winners-panel">
            <h3>🏆 Winners</h3>
            <div className="winners-list">
              {winners.length === 0 ? <p className="no-winners">No winners yet</p> :
                winners.map((winner, i) => (
                  <div key={i} className="winner-item">
                    <span>🏆</span>
                    <div><strong>{winner.user_name || "User"}</strong><small>{winner.win_type}</small><span>₹{winner.amount || 0}</span></div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="live-right">
          <div className="recent-calls">
            <h3>📞 Recent Calls</h3>
            <div className="calls-list">
              {gameHistory.slice(0, 10).map((call, i) => (
                <div key={i} className="call-item">
                  <span className="call-number">{call.number}</span>
                  <span className="call-time">{call.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="last-numbers">
            <h3>🔄 Last 10</h3>
            <div className="last-numbers-grid">
              {lastTen.map((n, i) => <span key={i} className="last-number">{n}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* Numbers board */}
      <div className="numbers-grid-section">
        <h3>🔢 Numbers Board</h3>
        <div className="numbers-grid">
          {Array.from({ length: TOTAL_NUMBERS }, (_, i) => {
            const n = i + 1;
            const called = numbers.includes(n);
            const isCurrent = current === n;
            return <div key={n} className={`number-cell${called ? " called" : ""}${isCurrent ? " current" : ""}`}>{n}</div>;
          })}
        </div>
      </div>
    </div>
  );
}