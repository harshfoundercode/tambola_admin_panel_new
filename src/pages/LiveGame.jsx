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
  const [isGameCompleted, setIsGameCompleted] = useState(false);

  // game / round selection
  const [allGames, setAllGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [selectedRoundId, setSelectedRoundId] = useState(null);
  const [showGameSelector, setShowGameSelector] = useState(true);
  const [gamesError, setGamesError] = useState(null);

  // Search and Tabs
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

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
  const isGameCompletedRef = useRef(false);

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

  // ── Filter Games ────────────────────────────────────────────────────────

  const getFilteredGames = useCallback(() => {
    let filtered = allGames;
    
    if (activeTab !== "all") {
      filtered = filtered.filter(game => {
        const status = game.status || "upcoming";
        if (activeTab === "live") return status === "live";
        if (activeTab === "upcoming") return status === "upcoming";
        if (activeTab === "completed") return status === "completed";
        return true;
      });
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(game => {
        const title = (game.title || "").toLowerCase();
        const id = String(game.game_id || "");
        return title.includes(term) || id.includes(term);
      });
    }
    
    return filtered;
  }, [allGames, activeTab, searchTerm]);

  const getTabCounts = useCallback(() => {
    const counts = { all: allGames.length, live: 0, upcoming: 0, completed: 0 };
    allGames.forEach(game => {
      const status = game.status || "upcoming";
      if (status === "live") counts.live++;
      else if (status === "upcoming") counts.upcoming++;
      else if (status === "completed") counts.completed++;
    });
    return counts;
  }, [allGames]);

  const filteredGames = getFilteredGames();
  const tabCounts = getTabCounts();

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

        // ✅ Check if game is completed
        if (called_numbers.length >= TOTAL_NUMBERS || game_status === 'completed') {
          console.log("🏁🏁🏁 GAME COMPLETED! 🏁🏁🏁");
          setIsGameCompleted(true);
          isGameCompletedRef.current = true;
          setIsRunning(false);
          isRunningRef.current = false;
          setNumbers(called_numbers);
          numbersRef.current = called_numbers;
          addAnnouncement("🎉🎉🎉 GAME COMPLETED! All 90 numbers have been called! 🎉🎉🎉", "success");
          return;
        }

        // ✅ ONLY update if called_numbers has MORE numbers than current
        const currentNumbers = numbersRef.current || [];
        if (called_numbers.length > currentNumbers.length) {
          console.log(`📊 Setting numbers from API: ${currentNumbers.length} → ${called_numbers.length}`);
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
        } else {
          console.log(`⏭️ Skipping API update: ${called_numbers.length} <= ${currentNumbers.length}`);
        }

        // ✅ Update isRunning only if game not completed
        if (!isGameCompletedRef.current) {
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
        }
      } else {
        console.error("❌ Failed to load game status:", res.message);
      }
    } catch (err) {
      console.error("❌ loadGameStatus error:", err);
    }
  }, [addAnnouncement]);

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

      if (isGameCompletedRef.current) {
        console.log("⏭️ Game already completed, ignoring number_called");
        return;
      }

      const calledNumber = data.number;
      console.log(`🎯 Number called: ${calledNumber}`);
      
      setCurrent(calledNumber);

      setNumbers((prev) => {
        if (prev.includes(calledNumber)) {
          console.log(`ℹ️ Number ${calledNumber} already called, skipping`);
          return prev;
        }
        
        const newNumbers = [...prev, calledNumber];
        console.log(`📊 Numbers: ${prev.length} → ${newNumbers.length}`);
        numbersRef.current = newNumbers;
        
        if (newNumbers.length >= TOTAL_NUMBERS) {
          console.log("🏁🏁🏁 GAME COMPLETED! All 90 numbers called! 🏁🏁🏁");
          setIsGameCompleted(true);
          isGameCompletedRef.current = true;
          setIsRunning(false);
          isRunningRef.current = false;
          addAnnouncement("🎉🎉🎉 GAME COMPLETED! All 90 numbers have been called! 🎉🎉🎉", "success");
        }
        
        setGameHistory((prevHistory) => {
          const newEntry = { number: calledNumber, time: new Date().toLocaleTimeString() };
          return [newEntry, ...prevHistory].slice(0, 20);
        });
        
        const allNumbers = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);
        const calledSet = new Set(newNumbers);
        setAvailableNumbers(allNumbers.filter(n => !calledSet.has(n)));
        return newNumbers;
      });

      if (!isRunningRef.current && !isGameCompletedRef.current) {
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

      if (isGameCompletedRef.current) {
        console.log("⏭️ Game already completed, ignoring old_numbers");
        return;
      }

      if (data?.calledNumbers && data.calledNumbers.length > 0) {
        const newNumbers = data.calledNumbers;
        const currentNumbers = numbersRef.current || [];
        
        // ✅ ONLY update if new numbers have MORE numbers
        if (newNumbers.length > currentNumbers.length) {
          console.log(`📊 Updating from old_numbers: ${currentNumbers.length} → ${newNumbers.length}`);
          setNumbers(newNumbers);
          numbersRef.current = newNumbers;

          if (newNumbers.length >= TOTAL_NUMBERS) {
            console.log("🏁🏁🏁 GAME COMPLETED! 🏁🏁🏁");
            setIsGameCompleted(true);
            isGameCompletedRef.current = true;
            setIsRunning(false);
            isRunningRef.current = false;
            addAnnouncement("🎉🎉🎉 GAME COMPLETED! All 90 numbers called! 🎉🎉🎉", "success");
          }

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

          setGameHistory(
            newNumbers
              .map((num) => ({ number: num, time: new Date().toLocaleTimeString() }))
              .reverse()
              .slice(0, 20)
          );
        } else {
          console.log(`⏭️ Skipping old_numbers: ${newNumbers.length} <= ${currentNumbers.length}`);
        }
      } else {
        console.log("⏭️ old_numbers has no data, keeping existing numbers");
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

      if (isRunningRef.current !== shouldBeRunning && !isGameCompletedRef.current) {
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
      if (!isRunningRef.current && !isGameCompletedRef.current) {
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
      if (!isRunningRef.current && !isGameCompletedRef.current) {
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
      setIsGameCompleted(true);
      isGameCompletedRef.current = true;
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
      setIsGameCompleted(true);
      isGameCompletedRef.current = true;
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
    setIsGameCompleted(false);
    isGameCompletedRef.current = false;
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
    setIsGameCompleted(false);
    isGameCompletedRef.current = false;
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

    if (gameStarted) {
      console.warn("⚠️ Game already started");
      addAnnouncement("⚠️ Game already started! Use Resume.", "warning");
      return;
    }

    if (isGameCompleted) {
      console.warn("⚠️ Game already completed");
      addAnnouncement("⚠️ Game already completed! Create a new round.", "warning");
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

    if (isGameCompleted) {
      console.warn("⚠️ Game already completed");
      addAnnouncement("⚠️ Game already completed!", "warning");
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

    if (isGameCompleted) {
      console.warn("⚠️ Game already completed");
      addAnnouncement("⚠️ Game already completed!", "warning");
      return;
    }

    if (!gameStarted) {
      console.warn("⚠️ Game not started yet");
      addAnnouncement("⚠️ Game not started yet! Use Start.", "warning");
      return;
    }

    if (isRunning) {
      console.warn("⚠️ Game is already running");
      addAnnouncement("⚠️ Game is already running! Use Pause.", "warning");
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

        if (calledNumbers.length >= TOTAL_NUMBERS) {
          console.log("🏁 Game is completed on server!");
          setIsGameCompleted(true);
          isGameCompletedRef.current = true;
          setIsRunning(false);
          isRunningRef.current = false;
          addAnnouncement("🏁 Game is already completed!", "info");
          setLoading(false);
          return;
        }

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

    if (isGameCompleted) {
      addAnnouncement("⚠️ Game already completed!", "warning");
      return;
    }

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
          
          if (newNumbers.length >= TOTAL_NUMBERS) {
            setIsGameCompleted(true);
            isGameCompletedRef.current = true;
            setIsRunning(false);
            isRunningRef.current = false;
            addAnnouncement("🎉🎉🎉 GAME COMPLETED! All 90 numbers have been called! 🎉🎉🎉", "success");
          }
          
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
    
    if (isGameCompleted) {
      addAnnouncement("⚠️ Game already completed!", "warning");
      return;
    }
    
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
    if (isGameCompleted) {
      addAnnouncement("⚠️ Game already completed!", "warning");
      return;
    }
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

    if (isGameCompleted) {
      addAnnouncement("⚠️ Game already completed!", "warning");
      return;
    }

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

      console.log("📤 Sending bulk call request:", payload);

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
      console.log("📥 Bulk announcement response:", result);

      if (response.ok) {
        console.log("✅ Bulk call successful!");
        
        const successMessage = result.message || "Bulk call successful!";
        addAnnouncement(`✅ ${successMessage} (${newNumbers.length} numbers)`, "success");

        if (newNumbers.length > 0) {
          const lastNumber = newNumbers[newNumbers.length - 1];
          setCurrent(lastNumber);
          setGameStarted(true);
          gameStartedRef.current = true;
        }

        setBulkCallStatus("success");
        
        setNumbers((prev) => {
          const updatedNumbers = [...prev, ...newNumbers];
          numbersRef.current = updatedNumbers;
          
          if (updatedNumbers.length >= TOTAL_NUMBERS) {
            setIsGameCompleted(true);
            isGameCompletedRef.current = true;
            setIsRunning(false);
            isRunningRef.current = false;
            addAnnouncement("🎉🎉🎉 GAME COMPLETED! All 90 numbers have been called! 🎉🎉🎉", "success");
          }
          
          const allNumbers = Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1);
          const calledSet = new Set(updatedNumbers);
          setAvailableNumbers(allNumbers.filter(n => !calledSet.has(n)));
          
          return updatedNumbers;
        });

        setGameHistory((prevHistory) => {
          const newEntries = newNumbers.map(num => ({
            number: num,
            time: new Date().toLocaleTimeString()
          }));
          return [...newEntries, ...prevHistory].slice(0, 20);
        });

        await loadGameStatus(selectedRoundId);
        setBulkNumbersInput("");
        setSelectedBulkNumbers(new Set());
        
        setTimeout(() => setBulkCallStatus(""), 2000);
      } else {
        console.error("❌ Bulk call failed:", result);
        const errorMessage = result.message || result.error || "Failed to call numbers";
        setBulkCallStatus(`error: ${errorMessage}`);
        addAnnouncement(`❌ ${errorMessage}`, "error");
        setTimeout(() => setBulkCallStatus(""), 3000);
      }
    } catch (error) {
      console.error("❌ Bulk call error:", error);
      const errorMessage = error.message || error.response?.data?.message || "Network error occurred";
      setBulkCallStatus(`error: ${errorMessage}`);
      addAnnouncement(`❌ ${errorMessage}`, "error");
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

  useEffect(() => {
    numbersRef.current = numbers;
  }, [numbers]);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    gameStartedRef.current = gameStarted;
  }, [gameStarted]);

  useEffect(() => {
    isGameCompletedRef.current = isGameCompleted;
  }, [isGameCompleted]);

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

  // Auto-sync via socket - ✅ Increased to 10 seconds and only if running
  useEffect(() => {
    if (!selectedRoundId || !socketRef.current || isGameCompletedRef.current) return;

    const syncInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.connected && isRunningRef.current && !isGameCompletedRef.current) {
        console.log(`🔄 Auto-sync: Requesting game data`);
        socketRef.current.emit("get_game_data", { game_id: selectedGameId });
      }
    }, 10000); // ✅ 10 seconds instead of 5

    return () => {
      clearInterval(syncInterval);
    };
  }, [selectedRoundId, selectedGameId]);

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

  console.log(`📊 Render: isRunning=${isRunning}, numbers=${numbers.length}, current=${current}, isGameCompleted=${isGameCompleted}`);

  // ════════════════════════════════════════════════════════════════════════
  // GAME SELECTOR VIEW
  // ════════════════════════════════════════════════════════════════════════

  if (showGameSelector) {
    return (
      <div className="live-game-container">
        <div className="live-header">
          <h1 className="live-title">🎮 Live Game Control</h1>
          <div className="live-status" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
            <span className="status-dot"></span>
            SELECT GAME
          </div>
        </div>
        
        <div className="game-selector">
          {/* Search Bar */}
          <div className="selector-search">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search by Game Name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="search-clear"
                  onClick={() => setSearchTerm("")}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="search-stats">
              <span>{filteredGames.length} of {allGames.length} games</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="selector-tabs">
            <button
              className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              📊 All <span className="tab-count">{tabCounts.all}</span>
            </button>
            <button
              className={`tab-btn ${activeTab === "live" ? "active" : ""}`}
              onClick={() => setActiveTab("live")}
            >
              🔴 Live <span className="tab-count live">{tabCounts.live}</span>
            </button>
            <button
              className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
              onClick={() => setActiveTab("upcoming")}
            >
              ⏳ Upcoming <span className="tab-count upcoming">{tabCounts.upcoming}</span>
            </button>
            <button
              className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
              onClick={() => setActiveTab("completed")}
            >
              ✅ Completed <span className="tab-count completed">{tabCounts.completed}</span>
            </button>
          </div>

          {/* Games List */}
          <div className="games-list">
            {gamesError ? (
              <div className="lg-error-wrap">
                <div className="lg-error-icon">⚠️</div>
                <h3 className="lg-error-title">Failed to Load Games</h3>
                <p className="lg-error-msg">{gamesError}</p>
                <button onClick={fetchAllGames} className="lg-error-btn">
                  🔄 Try Again
                </button>
              </div>
            ) : !allGames.length ? (
              <div className="no-games">
                <div className="no-games-icon">🎮</div>
                <p>No games available. Create a game first.</p>
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="no-games">
                <div className="no-games-icon">🔍</div>
                <p>No games match your search or filter.</p>
                <button 
                  className="clear-filters-btn"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveTab("all");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              filteredGames.map((game) => {
                const status = game.status || "upcoming";
                const isLive = status === "live";
                const isUpcoming = status === "upcoming";
                const isCompleted = status === "completed";
                
                return (
                  <div
                    key={game.game_id}
                    className={`game-selector-card ${isLive ? "live-card" : isUpcoming ? "upcoming-card" : "completed-card"}`}
                    onClick={() => handleGameSelect(game.game_id)}
                  >
                    <div className="game-selector-icon">
                      {isLive ? "🔴" : isUpcoming ? "⏳" : "✅"}
                    </div>
                    <div className="game-selector-info">
                      <h3>
                        {game.title || "Untitled"}
                        <span className={`game-status-badge status-${status}`}>
                          {isLive ? "🔴 LIVE" : isUpcoming ? "⏳ UPCOMING" : "✅ COMPLETED"}
                        </span>
                      </h3>
                      <p>
                        <span className="game-id">ID: {game.game_id}</span>
                        <span className="game-date">📅 {game.formattedDate || "No Date"}</span>
                        <span className="game-time">🕐 {game.formattedTime || "No Time"}</span>
                      </p>
                      <p className="game-meta">
                        <span>Created: {game.formattedCreatedAt || "N/A"}</span>
                      </p>
                    </div>
                    <button 
                      className={`select-game-btn ${isCompleted ? "disabled" : ""}`}
                      disabled={isCompleted}
                      title={isCompleted ? "Game is completed" : "Manage this game"}
                    >
                      {isCompleted ? "🔒 Completed" : "Manage →"}
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="selector-footer">
            <span className="footer-info">
              Total: {allGames.length} games | 
              Live: {tabCounts.live} | 
              Upcoming: {tabCounts.upcoming} | 
              Completed: {tabCounts.completed}
            </span>
            <button 
              className="refresh-games-btn"
              onClick={fetchAllGames}
              disabled={loading}
            >
              🔄 Refresh
            </button>
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
            {isGameCompleted && <span className="game-complete-badge"> 🏆 COMPLETED</span>}
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
          <div className={`live-status ${isGameCompleted ? "status-completed" : isRunning ? "status-live" : "status-paused"}`}>
            <span className="status-dot"></span>
            {isGameCompleted ? "🏆 COMPLETED" : isRunning ? "LIVE" : "PAUSED"}
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
                  <button key={num} onClick={() => toggleNumberSelection(num)} disabled={isAlreadyCalled || isGameCompleted}
                    style={{
                      padding: "8px 4px",
                      backgroundColor: isSelected ? "#28a745" : (isAlreadyCalled ? "#6c757d" : "#fff"),
                      color: isSelected ? "#fff" : (isAlreadyCalled ? "#fff" : "#000"),
                      border: isSelected ? "2px solid #1e7e34" : "1px solid #dee2e6",
                      borderRadius: "4px", cursor: (isAlreadyCalled || isGameCompleted) ? "not-allowed" : "pointer",
                      fontSize: "12px", fontWeight: "bold", opacity: (isAlreadyCalled || isGameCompleted) ? 0.6 : 1,
                    }}
                    title={isGameCompleted ? "Game completed" : isAlreadyCalled ? `Number ${num} already called` : `Select number ${num}`}
                  >{num}</button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
              <button onClick={() => {
                if (isGameCompleted) {
                  addAnnouncement("⚠️ Game already completed!", "warning");
                  return;
                }
                const allNumbers = new Set(selectedBulkNumbers);
                for (let i = 1; i <= TOTAL_NUMBERS; i++) {
                  if (!numbers.includes(i)) allNumbers.add(i);
                }
                setSelectedBulkNumbers(allNumbers);
                setBulkNumbersInput(Array.from(allNumbers).join(', '));
              }} disabled={isGameCompleted} style={{ background: "#17a2b8", color: "#fff", border: "none", borderRadius: "5px", fontSize: "12px", padding: "8px 12px", cursor: isGameCompleted ? "not-allowed" : "pointer" }}>
                Select All Remaining ({availableNumbers.length})
              </button>
              <button onClick={() => { setSelectedBulkNumbers(new Set()); setBulkNumbersInput(""); }}
                style={{ background: "#6c757d", color: "#fff", border: "none", borderRadius: "5px", fontSize: "12px", padding: "8px 12px", cursor: "pointer" }}>
                Clear All
              </button>
              <button onClick={handleQuickCallRandom} disabled={loading || availableNumbers.length === 0 || isGameCompleted}
                style={{ background: "#ffc107", color: "#000", border: "none", borderRadius: "5px", fontSize: "12px", padding: "8px 12px", cursor: (availableNumbers.length === 0 || isGameCompleted) ? "not-allowed" : "pointer" }}>
                🎲 Quick Random
              </button>
            </div>

            <button onClick={handleBulkNumbersCall} disabled={loading || selectedBulkNumbers.size === 0 || isGameCompleted}
              style={{
                width: "100%",
                background: isGameCompleted ? "#6c757d" :
                  bulkCallStatus === "success" ? "#28a745" :
                  bulkCallStatus?.startsWith("error:") ? "#dc3545" :
                  bulkCallStatus === "calling" ? "#ffc107" : "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "12px",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: (selectedBulkNumbers.size === 0 || isGameCompleted) ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "all 0.3s"
              }}
            >
              {isGameCompleted ? "✅ Game Completed" :
               loading ? "⏳ Calling..." :
               bulkCallStatus === "success" ? "✅ Done!" :
               bulkCallStatus?.startsWith("error:") ? `❌ ${bulkCallStatus.replace("error: ", "")}` :
               bulkCallStatus === "calling" ? "⏳ Processing..." :
               `📞 Call ${selectedBulkNumbers.size} Selected Number(s)`}
            </button>
          </div>

          <div className="admin-section">
            <h4>🎫 Declare Winner by Ticket Number</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input type="number" placeholder="Enter Ticket Number" value={winnerTicketId}
                onChange={(e) => setWinnerTicketId(e.target.value)} min="1"
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", borderRadius: "5px", fontSize: "14px" }} />
              <button onClick={handleDeclareWinnerByTicket} disabled={loading || !winnerTicketId.trim() || isGameCompleted}
                style={{ background: isGameCompleted ? "#6c757d" : "#28a745", color: "white", border: "none", padding: "12px 20px", borderRadius: "5px", cursor: isGameCompleted ? "not-allowed" : "pointer", fontWeight: "bold", width: "100%", fontSize: "14px" }}>
                {isGameCompleted ? "✅ Game Completed" : loading ? "⏳ Processing..." : "🏆 Declare Winner"}
              </button>
            </div>
            <small style={{ color: "#666", display: "block", marginTop: "8px" }}>
              💡 Enter ticket number and click to declare winner
            </small>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="game-stats-bar">
        <div className="stat-item">
          <span className="stat-label">Called:</span>
          <span className="stat-value">{numbers.length}/90</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Remaining:</span>
          <span className="stat-value">{90 - numbers.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Winners:</span>
          <span className="stat-value">{winners.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Status:</span>
          <span className="stat-value" style={{ 
            color: isGameCompleted ? '#28a745' : socketConnected ? '#17a2b8' : '#dc3545',
            fontWeight: 'bold'
          }}>
            {isGameCompleted ? '✅ COMPLETE' : socketConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>
      </div>

      {/* Main layout */}
      <div className="live-main">
        <div className="live-left">
          <div className={`current-card ${isGameCompleted ? "completed" : ""}`}>
            <div className="current-label">Current Number</div>
            <div className={`current-number ${isGameCompleted ? "completed" : ""}`}>
              {isGameCompleted ? "🎉" : current ?? "--"}
            </div>
            <div className="current-progress">
              <div className="progress-bar">
                <div className={`progress-fill ${isGameCompleted ? "completed" : ""}`} 
                  style={{ width: `${getProgress()}%` }} />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="control-panel">
            <h3>Controls</h3>
            <div className="control-buttons">
              <button 
                className="btn-start" 
                onClick={startGame}
                disabled={loading || !selectedRoundId || isRunning || gameStarted || isGameCompleted}
                title={
                  isGameCompleted ? "Game is completed" :
                  !selectedRoundId ? "No round selected" :
                  isRunning ? "Game is already running" :
                  gameStarted ? "Game already started - use Resume" :
                  "Start the game"
                }
              >
                {loading ? "..." : "▶ Start"}
              </button>

              <button 
                className="btn-pause" 
                onClick={pauseGame}
                disabled={loading || !selectedRoundId || (!isRunning && !gameStarted) || isGameCompleted}
                title={
                  isGameCompleted ? "Game is completed" :
                  !selectedRoundId ? "No round selected" :
                  (!isRunning && !gameStarted) ? "Game is not running" :
                  "Pause the game"
                }
              >
                ⏸ Pause
              </button>

              <button 
                className="btn-resume" 
                onClick={resumeGame}
                disabled={loading || !selectedRoundId || isRunning || !gameStarted || isGameCompleted}
                title={
                  isGameCompleted ? "Game is completed" :
                  !selectedRoundId ? "No round selected" :
                  isRunning ? "Game is already running" :
                  !gameStarted ? "Game not started yet" :
                  "Resume the game"
                }
              >
                ▶ Resume
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
          <div className="last-numbers">
            <h3>🔄 Last 10 Numbers</h3>
            <div className="last-numbers-grid">
              {lastTen.map((n, i) => (
                <span key={i} className="last-number">{n}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Numbers board */}
      <div className="numbers-grid-section">
        <h3>
          🔢 Numbers Board 
          {isGameCompleted && (
            <span style={{ 
              color: '#28a745', 
              marginLeft: '10px',
              fontSize: '18px',
              fontWeight: 'bold'
            }}>
              ✅ COMPLETE
            </span>
          )}
        </h3>
        <div className="numbers-grid">
          {Array.from({ length: TOTAL_NUMBERS }, (_, i) => {
            const n = i + 1;
            const called = numbers.includes(n);
            const isCurrent = current === n;
            return (
              <div 
                key={n} 
                className={`number-cell${called ? " called" : ""}${isCurrent ? " current" : ""}`}
              >
                {n}
              </div>
            );
          })}
        </div>
      </div>

      {/* 🎉 Game Completion Celebration Popup */}
      {isGameCompleted && (
        <div className="celebration-overlay">
          <div className="celebration-modal">
            <span className="celebration-icon">🏆</span>
            <h2 className="celebration-title">GAME COMPLETED! 🎉</h2>
            <p className="celebration-subtitle">All 90 numbers have been called!</p>
            <p className="celebration-winners">Total Winners: {winners.length}</p>
            <button
              className="celebration-close-btn"
              onClick={() => {
                setIsGameCompleted(false);
                isGameCompletedRef.current = false;
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}