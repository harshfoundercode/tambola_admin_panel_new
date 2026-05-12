// import { useEffect, useState, useRef, useCallback } from "react";
// import {
//   startGameAPI,
//   stopGameAPI,
//   callNumberAPI,
//   getGameStatusAPI,
//   getWinnersListAPI,
//   getAllGamesAPI,
//   getCurrentRoundAPI,
//   forceWinnerByNumberAPI,
//   forceWinnerByTicketAPI,
//   adminAnnounceAPI,
// } from "../services/api";
// import { io } from "socket.io-client";
// import "../styles/liveGame.css";

// const TOTAL_NUMBERS = 90;
// const SOCKET_URL = "https://testingtambola.honeywithmoon.com";

// console.log("Using Socket URL:", SOCKET_URL);

// // ─── helpers ────────────────────────────────────────────────────────────────

// const getGameStatus = (game) => {
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

// const formatGame = (game) => ({
//   ...game,
//   gameStatus: getGameStatus(game),
//   formattedDate: game.start_datetime
//     ? new Date(game.start_datetime).toLocaleDateString()
//     : "No Date Set",
//   formattedTime: game.start_datetime
//     ? new Date(game.start_datetime).toLocaleTimeString()
//     : "No Time Set",
//   formattedCreatedAt: game.created_at
//     ? new Date(game.created_at).toLocaleString()
//     : "Invalid Date",
// });

// // ─── component ──────────────────────────────────────────────────────────────

// export default function LiveGame() {
//   // core game state
//   const [numbers, setNumbers]           = useState([]);
//   const [current, setCurrent]           = useState(null);
//   const [isRunning, setIsRunning]       = useState(false);
//   const [gameHistory, setGameHistory]   = useState([]);
//   const [announcements, setAnnouncements] = useState([]);
//   const [winners, setWinners]           = useState([]);
//   const [loading, setLoading]           = useState(false);
//   const [availableNumbers, setAvailableNumbers] = useState([]);

//   // game / round selection
//   const [allGames, setAllGames]           = useState([]);
//   const [selectedGameId, setSelectedGameId] = useState(null);
//   const [selectedRoundId, setSelectedRoundId] = useState(null);
//   const [showGameSelector, setShowGameSelector] = useState(true);
//   const [gamesError, setGamesError]       = useState(null);

//   // admin panel
//   const [showAdminPanel, setShowAdminPanel]   = useState(false);
//   const [manualNumber, setManualNumber]       = useState("");
//   const [manualNumberError, setManualNumberError] = useState("");
//   const [winnerTicketId, setWinnerTicketId]   = useState("");
//   const [winnerNumber, setWinnerNumber]       = useState("");
//   const [winnerType, setWinnerType]           = useState("full_house");
//   const [adminAnnouncement, setAdminAnnouncement] = useState("");

//   const socketRef        = useRef(null);
//   const autoRefreshRef   = useRef(null);
//   const gamesRefreshRef  = useRef(null);

//   // ── announcements helper ────────────────────────────────────────────────

//   const addAnnouncement = useCallback((msg, type = "info") => {
//     setAnnouncements((prev) =>
//       [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 20)
//     );
//   }, []);

//   // ── game list ───────────────────────────────────────────────────────────

//   const fetchAllGames = useCallback(async () => {
//     try {
//       setGamesError(null);
//       const response = await getAllGamesAPI();
//       if (response.success && response.data?.games) {
//         setAllGames(response.data.games.map(formatGame));
//       } else {
//         setGamesError(response.message || "Failed to load games");
//         setAllGames([]);
//       }
//     } catch (err) {
//       setGamesError(err.message || "Failed to load games");
//       setAllGames([]);
//     }
//   }, []);

//   // ── round helpers ───────────────────────────────────────────────────────

//   const createNewRound = async (gameId) => {
//     try {
//       const res = await createRoundAPI({ game_id: gameId, round_time: new Date().toISOString() });
//       return res.success ? res.data?.round_id ?? null : null;
//     } catch {
//       return null;
//     }
//   };

//   const loadCurrentRound = async (gameId) => {
//     try {
//       const res = await getCurrentRoundAPI(gameId);
//       if (res.success && res.data?.round_id) {
//         setSelectedRoundId(res.data.round_id);
//         return res.data.round_id;
//       }
//       return null;
//     } catch {
//       return null;
//     }
//   };

//   // ── game status ─────────────────────────────────────────────────────────

//   const loadGameStatus = useCallback(async (roundId) => {
//     if (!roundId) return;
//     try {
//       const res = await getGameStatusAPI(roundId);
//       if (res.success && res.data) {
//         const { called_numbers = [], is_running } = res.data;
//         setNumbers(called_numbers);
//         setGameHistory(
//           called_numbers
//             .map((num) => ({ number: num, time: new Date().toLocaleTimeString() }))
//             .reverse()
//             .slice(0, 20)
//         );
//         const calledSet = new Set(called_numbers);
//         setAvailableNumbers(
//           Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).filter((n) => !calledSet.has(n))
//         );
//         if (is_running !== undefined) setIsRunning(is_running);
//       }
//     } catch (err) {
//       console.error("loadGameStatus:", err);
//     }
//   }, []);

//   const loadWinnersList = useCallback(async (roundId) => {
//     if (!roundId) return;
//     try {
//       const res = await getWinnersListAPI(roundId);
//       if (res.success && res.data) setWinners(res.data);
//     } catch (err) {
//       console.error("loadWinnersList:", err);
//     }
//   }, []);

//   // ── socket setup ─────────────────────────────────────────────────────────
//   // FIX: server emits game_started/paused/resumed/over WITHOUT a data object
//   // (same as the reference user HTML). So we must NOT do `data && data.game_id == gameId`.
//   // We simply listen and update state.

//   const setupSocket = useCallback((gameId) => {
//     // Clean up any previous socket
//     if (socketRef.current) {
//       socketRef.current.disconnect();
//       socketRef.current = null;
//     }

//     const socket = io(SOCKET_URL, { transports: ["websocket"] });
//     socketRef.current = socket;

//     // Request history
//     socket.emit("get_game_data", { game_id: gameId });

//     // Live number
//     socket.on("number_called", (data) => {
//       if (data.game_id != gameId) return;
//       setCurrent(data.number);
//       setNumbers((prev) =>
//         prev.includes(data.number) ? prev : [...prev, data.number]
//       );
//       setAvailableNumbers((prev) => prev.filter((n) => n !== data.number));
//       addAnnouncement(`📢 Number Called: ${data.number}`, "success");
//     });

//     // Old numbers (sent after get_game_data)
//     socket.on("old_numbers", (data) => {
//       if (data?.calledNumbers) setNumbers(data.calledNumbers);
//     });

//     // ── FIX: Accept events with OR without a payload ──────────────────────
//     const gameEvent = (onData) => (data) => {
//       // Server may emit with no args, or with {game_id, ...}
//       // Only filter if game_id is actually present in the payload
//       if (data && data.game_id !== undefined && data.game_id != gameId) return;
//       onData(data);
//     };

//     socket.on("game_started", gameEvent(() => {
//       setIsRunning(true);
//       addAnnouncement("🎮 Game Started", "success");
//     }));

//     socket.on("game_paused", gameEvent(() => {
//       setIsRunning(false);
//       addAnnouncement("⏸️ Game Paused", "warning");
//     }));

//     socket.on("game_resumed", gameEvent(() => {
//       setIsRunning(true);
//       addAnnouncement("▶️ Game Resumed", "success");
//     }));

//     socket.on("game_over", gameEvent(() => {
//       setIsRunning(false);
//       addAnnouncement("🏁 Game Over", "info");
//     }));

//     return socket;
//   }, [addAnnouncement]);

//   // ── game select / back ──────────────────────────────────────────────────

//   const handleGameSelect = async (gameId) => {
//     setSelectedGameId(gameId);
//     setShowGameSelector(false);
//     setNumbers([]);
//     setCurrent(null);
//     setGameHistory([]);
//     setWinners([]);
//     setAnnouncements([]);
//     setIsRunning(false);
//     setManualNumberError("");

//     setupSocket(gameId);

//     let roundId = await loadCurrentRound(gameId);
//     if (!roundId) {
//       addAnnouncement("Creating new round...", "info");
//       roundId = await createNewRound(gameId);
//       if (roundId) {
//         setSelectedRoundId(roundId);
//         addAnnouncement("✅ New round created!", "success");
//       } else {
//         addAnnouncement("❌ Failed to create round", "error");
//       }
//     }

//     if (roundId) {
//       await loadGameStatus(roundId);
//       await loadWinnersList(roundId);
//     }

//     const game = allGames.find((g) => g.game_id === gameId);
//     addAnnouncement(`🎮 Selected: ${game?.title || "Game"}`, "success");
//   };

//   const handleBackToGames = () => {
//     if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
//     if (socketRef.current) {
//       socketRef.current.disconnect();
//       socketRef.current = null;
//     }
//     setShowGameSelector(true);
//     setSelectedGameId(null);
//     setSelectedRoundId(null);
//     setShowAdminPanel(false);
//     fetchAllGames();
//   };

//   // ── controls ────────────────────────────────────────────────────────────

//   const startGame = async () => {
//     if (!selectedRoundId) return addAnnouncement("❌ No active round found", "error");
//     setLoading(true);
//     try {
//       const res = await startGameAPI(selectedRoundId);
//       if (res.success) {
//         setIsRunning(true);
//         addAnnouncement("🎮 Game started! Auto-calling active", "success");
//         socketRef.current?.emit("start_game", { game_id: selectedGameId, round_id: selectedRoundId });
//       } else {
//         addAnnouncement(`❌ ${res.message || "Failed to start"}`, "error");
//       }
//     } catch (err) {
//       addAnnouncement(`❌ ${err.response?.data?.message || err.message}`, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const stopGame = async () => {
//     if (!selectedRoundId) return;
//     if (!window.confirm("Pause the game?")) return;
//     setLoading(true);
//     try {
//       const res = await stopGameAPI(selectedRoundId);
//       if (res.success) {
//         setIsRunning(false);
//         addAnnouncement("⏸ Game paused!", "warning");
//         socketRef.current?.emit("pause_game", { game_id: selectedGameId, round_id: selectedRoundId });
//       } else {
//         addAnnouncement(`❌ ${res.message || "Failed to pause"}`, "error");
//       }
//     } catch (err) {
//       addAnnouncement(`❌ ${err.response?.data?.message || err.message}`, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const callNumber = async () => {
//     if (!selectedRoundId)
//       return addAnnouncement("❌ No active round found. Please start game first.", "error");
//     setLoading(true);
//     try {
//       const res = await callNumberAPI(selectedRoundId);
//       if (res.success) {
//         addAnnouncement(`📞 Number ${res.data?.number || "called"}!`, "success");
//       } else {
//         addAnnouncement(`❌ ${res.message || "Failed to call number"}`, "error");
//       }
//     } catch (err) {
//       addAnnouncement(`❌ ${err.response?.data?.message || err.message}`, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── admin actions ───────────────────────────────────────────────────────

//   const handleManualNumberCall = async (numOverride) => {
//     const num = parseInt(numOverride ?? manualNumber);
//     if (isNaN(num) || num < 1 || num > TOTAL_NUMBERS) {
//       return setManualNumberError(`Please enter a valid number between 1 and ${TOTAL_NUMBERS}`);
//     }
//     if (numbers.includes(num)) {
//       setManualNumberError(`❌ Number ${num} has already been called!`);
//       return addAnnouncement(`❌ Cannot call ${num} - Already called!`, "error");
//     }
//     setLoading(true);
//     setManualNumberError("");
//     try {
//       const res = await callNumberAPI(selectedRoundId, { number: num });
//       if (res.success) {
//         addAnnouncement(`📞 Admin called number ${num}!`, "success");
//         setManualNumber("");
//         await loadGameStatus(selectedRoundId);
//       } else {
//         addAnnouncement(`❌ ${res.message || "Failed to call number"}`, "error");
//       }
//     } catch (err) {
//       addAnnouncement(`❌ ${err.response?.data?.message || err.message}`, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleQuickCallRandom = async () => {
//     if (!availableNumbers.length)
//       return addAnnouncement("❌ All numbers have been called!", "error");
//     const randomNum = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
//     await handleManualNumberCall(randomNum);
//   };

//   const handleDeclareWinnerByNumber = async () => {
//     const num = parseInt(winnerNumber);
//     if (isNaN(num) || num < 1 || num > TOTAL_NUMBERS)
//       return addAnnouncement("Please enter a valid number to declare as winner", "error");
//     if (!window.confirm(`Declare ALL players who completed number ${num} as winners?`)) return;
//     setLoading(true);
//     try {
//       const res = await forceWinnerByNumberAPI(selectedRoundId, { number: num, win_type: winnerType });
//       if (res.success) {
//         addAnnouncement(`🏆 Winners declared for number ${num}! 🎉`, "winner");
//         await loadWinnersList(selectedRoundId);
//         setWinnerNumber("");
//       } else {
//         addAnnouncement(`❌ ${res.message || "Failed to declare winners"}`, "error");
//       }
//     } catch (err) {
//       addAnnouncement(`❌ ${err.response?.data?.message || err.message}`, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeclareWinnerByTicket = async () => {
//     if (!winnerTicketId?.trim())
//       return addAnnouncement("Please enter a valid Ticket ID", "error");
//     if (!window.confirm(`Declare ticket ${winnerTicketId} as winner for ${winnerType}?`)) return;
//     setLoading(true);
//     try {
//       const res = await forceWinnerByTicketAPI(selectedRoundId, {
//         ticket_id: winnerTicketId,
//         win_type: winnerType,
//       });
//       if (res.success) {
//         addAnnouncement(`🏆 Ticket ${winnerTicketId} declared winner for ${winnerType}! 🎉`, "winner");
//         await loadWinnersList(selectedRoundId);
//         setWinnerTicketId("");
//       } else {
//         addAnnouncement(`❌ ${res.message || "Failed to declare winner"}`, "error");
//       }
//     } catch (err) {
//       addAnnouncement(`❌ ${err.response?.data?.message || err.message}`, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAdminAnnounce = async () => {
//     if (!adminAnnouncement?.trim())
//       return addAnnouncement("Please enter an announcement message", "error");
//     setLoading(true);
//     try {
//       const res = await adminAnnounceAPI(selectedRoundId, {
//         message: adminAnnouncement,
//         type: "admin",
//       });
//       if (res.success) {
//         addAnnouncement(`📢 ADMIN: ${adminAnnouncement}`, "admin");
//         setAdminAnnouncement("");
//       } else {
//         addAnnouncement(`❌ ${res.message || "Failed to send announcement"}`, "error");
//       }
//     } catch (err) {
//       addAnnouncement(`❌ ${err.response?.data?.message || err.message}`, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── effects ─────────────────────────────────────────────────────────────

//   // Auto-refresh game status every 5s when a round is active
//   useEffect(() => {
//     if (!selectedRoundId) return;
//     if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
//     autoRefreshRef.current = setInterval(() => {
//       loadGameStatus(selectedRoundId);
//       loadWinnersList(selectedRoundId);
//     }, 5000);
//     return () => clearInterval(autoRefreshRef.current);
//   }, [selectedRoundId, loadGameStatus, loadWinnersList]);

//   // Load game list on mount; refresh every 10s while selector is visible
//   useEffect(() => {
//     fetchAllGames();
//     gamesRefreshRef.current = setInterval(() => {
//       if (showGameSelector) fetchAllGames();
//     }, 10000);
//     return () => clearInterval(gamesRefreshRef.current);
//   }, [showGameSelector, fetchAllGames]);

//   // Cleanup socket on unmount
//   useEffect(() => {
//     return () => {
//       if (socketRef.current) socketRef.current.disconnect();
//     };
//   }, []);

//   // ── derived ──────────────────────────────────────────────────────────────

//   const getProgress = () => (numbers.length / TOTAL_NUMBERS) * 100;
//   const lastTen = numbers.slice(-10).reverse();

//   // ── win-type select (reused in two places) ───────────────────────────────

//   const WinTypeSelect = ({ value, onChange }) => (
//     <select value={value} onChange={(e) => onChange(e.target.value)}>
//       <option value="full_house">Full House</option>
//       <option value="early_five">Early Five</option>
//       <option value="top_line">Top Line</option>
//       <option value="middle_line">Middle Line</option>
//       <option value="bottom_line">Bottom Line</option>
//     </select>
//   );

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
//           </p>
//         </div>
//         <div className="header-actions">
//           <button
//             className={`admin-toggle ${showAdminPanel ? "active" : ""}`}
//             onClick={() => setShowAdminPanel((v) => !v)}
//           >
//             {showAdminPanel ? "Hide Admin Panel" : "Show Admin Panel"}
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
//           <h3>Admin Control Panel</h3>

//           {/* Manual call */}
//           <div className="admin-section">
//             <h4>📞 Manual Number Call</h4>
//             <div className="admin-input-group">
//               <input
//                 type="number"
//                 placeholder={`Enter number (1–${TOTAL_NUMBERS})`}
//                 value={manualNumber}
//                 onChange={(e) => { setManualNumber(e.target.value); setManualNumberError(""); }}
//                 min="1"
//                 max={TOTAL_NUMBERS}
//               />
//               <button onClick={() => handleManualNumberCall()} disabled={loading}>
//                 Call Number
//               </button>
//               <button onClick={handleQuickCallRandom} disabled={loading || !isRunning}>
//                 Random
//               </button>
//             </div>
//             {manualNumberError && <p className="error-text">{manualNumberError}</p>}
//             {availableNumbers.length > 0 && (
//               <p className="info-text">✅ Available: {availableNumbers.length} remaining</p>
//             )}
//           </div>

//           {/* Winner by number */}
//           {/* <div className="admin-section">
//             <h4>🏆 Winner by Number</h4>
//             <div className="admin-input-group">
//               <input
//                 type="number"
//                 placeholder="Number that triggered win"
//                 value={winnerNumber}
//                 onChange={(e) => setWinnerNumber(e.target.value)}
//                 min="1"
//                 max={TOTAL_NUMBERS}
//               />
//               <WinTypeSelect value={winnerType} onChange={setWinnerType} />
//               <button onClick={handleDeclareWinnerByNumber} disabled={loading}>
//                 Declare Winners
//               </button>
//             </div>
//           </div> */}

//           {/* Winner by ticket */}
//           <div className="admin-section">
//             <h4>🎫 Winner by Ticket ID</h4>
//             <div className="admin-input-group">
//               <input
//                 type="text"
//                 placeholder="Enter Ticket ID"
//                 value={winnerTicketId}
//                 onChange={(e) => setWinnerTicketId(e.target.value)}
//               />
//               <WinTypeSelect value={winnerType} onChange={setWinnerType} />
//               <button onClick={handleDeclareWinnerByTicket} disabled={loading}>
//                 Declare Winner
//               </button>
//             </div>
//           </div>

//           {/* Admin announcement */}
//           <div className="admin-section">
//             <h4>📢 Admin Announcement</h4>
//             <div className="admin-input-group">
//               <input
//                 type="text"
//                 placeholder="Enter announcement message"
//                 value={adminAnnouncement}
//                 onChange={(e) => setAdminAnnouncement(e.target.value)}
//                 maxLength="200"
//               />
//               <button onClick={handleAdminAnnounce} disabled={loading}>
//                 Announce
//               </button>
//             </div>
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

//           {/* Controls
//               FIX: Pause button was disabled when game not running.
//               Now: Start shown when paused, Pause shown when running, always enabled when roundId exists. */}
//           <div className="control-panel">
//             <h3>Controls</h3>
//             <div className="control-buttons">
//               <button
//                 className="btn-start"
//                 onClick={startGame}
//                 disabled={loading || !selectedRoundId || isRunning}
//               >
//                 {loading ? "..." : "▶ Start"}
//               </button>
//               <button
//                 className="btn-pause"
//                 onClick={stopGame}
//                 disabled={loading || !selectedRoundId || !isRunning}
//               >
//                 ⏸ Pause
//               </button>
//               <button
//                 className="btn-call"
//                 onClick={callNumber}
//                 disabled={loading || !isRunning || !selectedRoundId}
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

//           {/* Announcements */}
//           <div className="announcements-panel">
//             <h3>📢 Announcements</h3>
//             <div className="announcements-list">
//               {announcements.length === 0 ? (
//                 <p>No announcements</p>
//               ) : (
//                 announcements.map((item, i) => (
//                   <div key={i} className={`announcement-item ${item.type}`}>
//                     <span>
//                       {item.type === "winner" ? "🏆" : item.type === "admin" ? "📢" : "✅"}
//                     </span>
//                     <span>{item.msg}</span>
//                     <small>{item.time}</small>
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
  forceWinnerByNumberAPI,
  forceWinnerByTicketAPI,
  adminAnnounceAPI,
  createRoundAPI,
} from "../services/api";
import { io } from "socket.io-client";
import "../styles/liveGame.css";

const TOTAL_NUMBERS = 90;
const SOCKET_URL = "https://testingtambola.honeywithmoon.com";

console.log("Using Socket URL:", SOCKET_URL);

// ─── helpers ────────────────────────────────────────────────────────────────

const getGameStatus = (game) => {
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

const formatGame = (game) => ({
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
});

// ─── component ──────────────────────────────────────────────────────────────

export default function LiveGame() {
  // core game state
  const [numbers, setNumbers]           = useState([]);
  const [current, setCurrent]           = useState(null);
  const [isRunning, setIsRunning]       = useState(false);
  const [gameHistory, setGameHistory]   = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [winners, setWinners]           = useState([]);
  const [loading, setLoading]           = useState(false);
  const [availableNumbers, setAvailableNumbers] = useState([]);

  // game / round selection
  const [allGames, setAllGames]           = useState([]);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [selectedRoundId, setSelectedRoundId] = useState(null);
  const [showGameSelector, setShowGameSelector] = useState(true);
  const [gamesError, setGamesError]       = useState(null);

  // admin panel
  const [showAdminPanel, setShowAdminPanel]   = useState(false);
  const [manualNumber, setManualNumber]       = useState("");
  const [manualNumberError, setManualNumberError] = useState("");
  const [winnerTicketId, setWinnerTicketId]   = useState("");
  const [winnerNumber, setWinnerNumber]       = useState("");
  const [winnerType, setWinnerType]           = useState("full_house");
  const [adminAnnouncement, setAdminAnnouncement] = useState("");
  const [bulkNumbersInput, setBulkNumbersInput] = useState("");
  const [selectedBulkNumbers, setSelectedBulkNumbers] = useState(new Set());

  const socketRef        = useRef(null);
  const autoRefreshRef   = useRef(null);
  const gamesRefreshRef  = useRef(null);

  // ── announcements helper ────────────────────────────────────────────────

  const addAnnouncement = useCallback((msg, type = "info") => {
    setAnnouncements((prev) =>
      [{ msg, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 20)
    );
  }, []);

  // ── game list ───────────────────────────────────────────────────────────

  const fetchAllGames = useCallback(async () => {
    try {
      setGamesError(null);
      const response = await getAllGamesAPI();
      if (response.success && response.data?.games) {
        setAllGames(response.data.games.map(formatGame));
      } else {
        setGamesError(response.message || "Failed to load games");
        setAllGames([]);
      }
    } catch (err) {
      setGamesError(err.message || "Failed to load games");
      setAllGames([]);
    }
  }, []);

  // ── round helpers ───────────────────────────────────────────────────────

  const createNewRound = async (gameId) => {
    try {
      const res = await createRoundAPI({ game_id: gameId, round_time: new Date().toISOString() });
      return res.success ? res.data?.round_id ?? null : null;
    } catch {
      return null;
    }
  };

  const loadCurrentRound = async (gameId) => {
    try {
      const res = await getCurrentRoundAPI(gameId);
      if (res.success && res.data?.round_id) {
        setSelectedRoundId(res.data.round_id);
        return res.data.round_id;
      }
      return null;
    } catch {
      return null;
    }
  };

  // ── game status ─────────────────────────────────────────────────────────

  const loadGameStatus = useCallback(async (roundId) => {
    if (!roundId) return;
    try {
      const res = await getGameStatusAPI(roundId);
      if (res.success && res.data) {
        const { called_numbers = [], is_running } = res.data;
        setNumbers(called_numbers);
        setGameHistory(
          called_numbers
            .map((num) => ({ number: num, time: new Date().toLocaleTimeString() }))
            .reverse()
            .slice(0, 20)
        );
        const calledSet = new Set(called_numbers);
        setAvailableNumbers(
          Array.from({ length: TOTAL_NUMBERS }, (_, i) => i + 1).filter((n) => !calledSet.has(n))
        );
        if (is_running !== undefined) setIsRunning(is_running);
      }
    } catch (err) {
      console.error("loadGameStatus:", err);
    }
  }, []);

  const loadWinnersList = useCallback(async (roundId) => {
    if (!roundId) return;
    try {
      const res = await getWinnersListAPI(roundId);
      if (res.success && res.data) setWinners(res.data);
    } catch (err) {
      console.error("loadWinnersList:", err);
    }
  }, []);

  // ── socket setup ─────────────────────────────────────────────────────────

  const setupSocket = useCallback((gameId) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("get_game_data", { game_id: gameId });

    socket.on("number_called", (data) => {
      if (data.game_id != gameId) return;
      setCurrent(data.number);
      setNumbers((prev) =>
        prev.includes(data.number) ? prev : [...prev, data.number]
      );
      setAvailableNumbers((prev) => prev.filter((n) => n !== data.number));
      addAnnouncement(`📢 Number Called: ${data.number}`, "success");
    });

    socket.on("old_numbers", (data) => {
      if (data?.calledNumbers) setNumbers(data.calledNumbers);
    });

    const gameEvent = (onData) => (data) => {
      if (data && data.game_id !== undefined && data.game_id != gameId) return;
      onData(data);
    };

    socket.on("game_started", gameEvent(() => {
      setIsRunning(true);
      addAnnouncement("🎮 Game Started", "success");
    }));

    socket.on("game_paused", gameEvent(() => {
      setIsRunning(false);
      addAnnouncement("⏸️ Game Paused", "warning");
    }));

    socket.on("game_resumed", gameEvent(() => {
      setIsRunning(true);
      addAnnouncement("▶️ Game Resumed", "success");
    }));

    socket.on("game_over", gameEvent(() => {
      setIsRunning(false);
      addAnnouncement("🏁 Game Over", "info");
    }));

    return socket;
  }, [addAnnouncement]);

  // ── game select / back ──────────────────────────────────────────────────

  const handleGameSelect = async (gameId) => {
    setSelectedGameId(gameId);
    setShowGameSelector(false);
    setNumbers([]);
    setCurrent(null);
    setGameHistory([]);
    setWinners([]);
    setAnnouncements([]);
    setIsRunning(false);
    setManualNumberError("");

    setupSocket(gameId);

    let roundId = await loadCurrentRound(gameId);
    if (!roundId) {
      addAnnouncement("Creating new round...", "info");
      roundId = await createNewRound(gameId);
      if (roundId) {
        setSelectedRoundId(roundId);
        addAnnouncement("✅ New round created!", "success");
      } else {
        addAnnouncement("❌ Failed to create round", "error");
      }
    }

    if (roundId) {
      await loadGameStatus(roundId);
      await loadWinnersList(roundId);
    }

    const game = allGames.find((g) => g.game_id === gameId);
    addAnnouncement(`🎮 Selected: ${game?.title || "Game"}`, "success");
  };

  const handleBackToGames = () => {
    if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setShowGameSelector(true);
    setSelectedGameId(null);
    setSelectedRoundId(null);
    setShowAdminPanel(false);
    fetchAllGames();
  };

  // ── controls ────────────────────────────────────────────────────────────

  const startGame = async () => {
    if (!selectedRoundId) return addAnnouncement("❌ No active round found", "error");
    setLoading(true);
    try {
      const res = await startGameAPI(selectedRoundId);
      if (res.success) {
        setIsRunning(true);
        addAnnouncement("🎮 Game started! Auto-calling active", "success");
        socketRef.current?.emit("start_game", { game_id: selectedGameId, round_id: selectedRoundId });
      } else {
        addAnnouncement(`❌ ${res.message || "Failed to start"}`, "error");
      }
    } catch (err) {
      addAnnouncement(`❌ ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const stopGame = async () => {
    if (!selectedRoundId) return;
    if (!window.confirm("Pause the game?")) return;
    setLoading(true);
    try {
      const res = await stopGameAPI(selectedRoundId);
      if (res.success) {
        setIsRunning(false);
        addAnnouncement("⏸ Game paused!", "warning");
        socketRef.current?.emit("pause_game", { game_id: selectedGameId, round_id: selectedRoundId });
      } else {
        addAnnouncement(`❌ ${res.message || "Failed to pause"}`, "error");
      }
    } catch (err) {
      addAnnouncement(`❌ ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const callNumber = async () => {
    if (!selectedRoundId)
      return addAnnouncement("❌ No active round found. Please start game first.", "error");
    setLoading(true);
    try {
      const res = await callNumberAPI(selectedRoundId);
      if (res.success) {
        addAnnouncement(`📞 Number ${res.data?.number || "called"}!`, "success");
      } else {
        addAnnouncement(`❌ ${res.message || "Failed to call number"}`, "error");
      }
    } catch (err) {
      addAnnouncement(`❌ ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── admin actions ───────────────────────────────────────────────────────

  const handleManualNumberCall = async (numOverride) => {
    const num = parseInt(numOverride ?? manualNumber);
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
      const res = await callNumberAPI(selectedRoundId, { number: num });
      if (res.success) {
        addAnnouncement(`📞 Admin called number ${num}!`, "success");
        setManualNumber("");
        await loadGameStatus(selectedRoundId);
      } else {
        addAnnouncement(`❌ ${res.message || "Failed to call number"}`, "error");
      }
    } catch (err) {
      addAnnouncement(`❌ ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // Parse numbers from input and update grid selection
  const parseAndUpdateNumbers = (input) => {
    setBulkNumbersInput(input);
    
    if (!input.trim()) {
      setSelectedBulkNumbers(new Set());
      return;
    }
    
    const newSelectedNumbers = new Set();
    
    // Split by comma or space
    const parts = input.split(/[,\s]+/);
    
    for (const part of parts) {
      if (part.includes('-')) {
        // Handle range like "1-10"
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

  // Toggle number selection in grid
  const toggleNumberSelection = (num) => {
    const newSelected = new Set(selectedBulkNumbers);
    if (newSelected.has(num)) {
      newSelected.delete(num);
    } else {
      newSelected.add(num);
    }
    setSelectedBulkNumbers(newSelected);
    
    // Update input text
    const sortedNumbers = Array.from(newSelected).sort((a, b) => a - b);
    setBulkNumbersInput(sortedNumbers.join(', '));
  };

  const handleBulkNumbersCall = async () => {
    if (selectedBulkNumbers.size === 0) {
      setManualNumberError("Please select numbers to call");
      return;
    }
    
    const numbersToCall = Array.from(selectedBulkNumbers).sort((a, b) => a - b);
    
    // Filter out already called numbers
    const newNumbers = numbersToCall.filter(num => !numbers.includes(num));
    
    if (newNumbers.length === 0) {
      setManualNumberError("All selected numbers have already been called!");
      return addAnnouncement("❌ All numbers already called!", "error");
    }
    
    if (newNumbers.length !== numbersToCall.length) {
      const duplicateCount = numbersToCall.length - newNumbers.length;
      if (!window.confirm(`${duplicateCount} number(s) have already been called. Continue with ${newNumbers.length} remaining numbers?`)) {
        return;
      }
    }
    
    if (!window.confirm(`Call ${newNumbers.length} number(s)?\n\nNumbers: ${newNumbers.join(', ')}`)) {
      return;
    }
    
    setLoading(true);
    setManualNumberError("");
    
    let calledCount = 0;
    let failedCount = 0;
    
    try {
      for (const num of newNumbers) {
        try {
          const res = await callNumberAPI(selectedRoundId, { number: num });
          if (res.success) {
            calledCount++;
            addAnnouncement(`📞 Called number ${num}`, "success");
            await new Promise(resolve => setTimeout(resolve, 100));
          } else {
            failedCount++;
          }
        } catch (err) {
          failedCount++;
        }
      }
      
      addAnnouncement(
        `✅ Called ${calledCount} numbers successfully!${failedCount > 0 ? ` Failed: ${failedCount}` : ''}`,
        "success"
      );
      
      if (calledCount > 0) {
        await loadGameStatus(selectedRoundId);
      }
      
      // Reset
      setBulkNumbersInput("");
      setSelectedBulkNumbers(new Set());
    } catch (err) {
      addAnnouncement(`❌ Error: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCallRandom = async () => {
    if (!availableNumbers.length)
      return addAnnouncement("❌ All numbers have been called!", "error");
    const randomNum = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
    await handleManualNumberCall(randomNum);
  };

  const handleDeclareWinnerByNumber = async () => {
    const num = parseInt(winnerNumber);
    if (isNaN(num) || num < 1 || num > TOTAL_NUMBERS)
      return addAnnouncement("Please enter a valid number to declare as winner", "error");
    if (!window.confirm(`Declare ALL players who completed number ${num} as winners?`)) return;
    setLoading(true);
    try {
      const res = await forceWinnerByNumberAPI(selectedRoundId, { number: num, win_type: winnerType });
      if (res.success) {
        addAnnouncement(`🏆 Winners declared for number ${num}! 🎉`, "winner");
        await loadWinnersList(selectedRoundId);
        setWinnerNumber("");
      } else {
        addAnnouncement(`❌ ${res.message || "Failed to declare winners"}`, "error");
      }
    } catch (err) {
      addAnnouncement(`❌ ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeclareWinnerByTicket = async () => {
    if (!winnerTicketId?.trim())
      return addAnnouncement("Please enter a valid Ticket ID", "error");
    if (!window.confirm(`Declare ticket ${winnerTicketId} as winner for ${winnerType}?`)) return;
    setLoading(true);
    try {
      const res = await forceWinnerByTicketAPI(selectedRoundId, {
        ticket_id: winnerTicketId,
        win_type: winnerType,
      });
      if (res.success) {
        addAnnouncement(`🏆 Ticket ${winnerTicketId} declared winner for ${winnerType}! 🎉`, "winner");
        await loadWinnersList(selectedRoundId);
        setWinnerTicketId("");
      } else {
        addAnnouncement(`❌ ${res.message || "Failed to declare winner"}`, "error");
      }
    } catch (err) {
      addAnnouncement(`❌ ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAnnounce = async () => {
    if (!adminAnnouncement?.trim())
      return addAnnouncement("Please enter an announcement message", "error");
    setLoading(true);
    try {
      const res = await adminAnnounceAPI(selectedRoundId, {
        message: adminAnnouncement,
        type: "admin",
      });
      if (res.success) {
        addAnnouncement(`📢 ADMIN: ${adminAnnouncement}`, "admin");
        setAdminAnnouncement("");
      } else {
        addAnnouncement(`❌ ${res.message || "Failed to send announcement"}`, "error");
      }
    } catch (err) {
      addAnnouncement(`❌ ${err.response?.data?.message || err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── effects ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!selectedRoundId) return;
    if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    autoRefreshRef.current = setInterval(() => {
      loadGameStatus(selectedRoundId);
      loadWinnersList(selectedRoundId);
    }, 5000);
    return () => clearInterval(autoRefreshRef.current);
  }, [selectedRoundId, loadGameStatus, loadWinnersList]);

  useEffect(() => {
    fetchAllGames();
    gamesRefreshRef.current = setInterval(() => {
      if (showGameSelector) fetchAllGames();
    }, 10000);
    return () => clearInterval(gamesRefreshRef.current);
  }, [showGameSelector, fetchAllGames]);

  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // ── derived ──────────────────────────────────────────────────────────────

  const getProgress = () => (numbers.length / TOTAL_NUMBERS) * 100;
  const lastTen = numbers.slice(-10).reverse();

  // ── win-type select ─────────────────────────────────────────────────────

  const WinTypeSelect = ({ value, onChange }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="full_house">Full House</option>
      <option value="early_five">Early Five</option>
      <option value="top_line">Top Line</option>
      <option value="middle_line">Middle Line</option>
      <option value="bottom_line">Bottom Line</option>
    </select>
  );

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
                <button onClick={fetchAllGames} className="lg-error-btn">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Try Again
                </button>
              </div>
            ) : !allGames.length ? (
              <p className="no-games">No games available. Create a game first.</p>
            ) : (
              allGames
                .filter((g) => g?.game_id)
                .map((game) => (
                  <div
                    key={game.game_id}
                    className="game-selector-card"
                    onClick={() => handleGameSelect(game.game_id)}
                  >
                    <div className="game-selector-icon">🎮</div>
                    <div className="game-selector-info">
                      <h3>{game.title || "Untitled"}</h3>
                      <p>ID: {game.game_id} | Created: {game.formattedCreatedAt}</p>
                      <p>Start Time: {game.formattedDate} {game.formattedTime}</p>
                      <span className={`game-status ${game.gameStatus.className}`}>
                        {game.gameStatus.label}
                      </span>
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
          </p>
        </div>
        <div className="header-actions">
          <button
            className={`admin-toggle ${showAdminPanel ? "active" : ""}`}
            onClick={() => setShowAdminPanel((v) => !v)}
          >
            {showAdminPanel ? "Hide Admin Panel" : "Show Admin Panel"}
          </button>
          <div className={`live-status ${isRunning ? "status-live" : "status-paused"}`}>
            <span className="status-dot"></span>
            {isRunning ? "LIVE" : "PAUSED"}
          </div>
        </div>
      </div>

      {/* Admin Panel */}
      {showAdminPanel && (
        <div className="admin-panel">
          {/* <h3>Admin Control Panel</h3> */}

          {/* Single Number Call
          <div className="admin-section">
            <h4>📞 Single Number Call</h4>
            <div className="admin-input-group">
              <input
                type="number"
                placeholder="Enter number (1-90)"
                value={manualNumber}
                onChange={(e) => { setManualNumber(e.target.value); setManualNumberError(""); }}
                min="1"
                max={TOTAL_NUMBERS}
              />
              <button onClick={() => handleManualNumberCall()} disabled={loading}>
                Call Number
              </button>
              <button onClick={handleQuickCallRandom} disabled={loading || !isRunning}>
                Random
              </button>
            </div>
            {manualNumberError && <p className="error-text">{manualNumberError}</p>}
          </div> */}

          {/* Bulk Numbers Call with Grid */}
          <div className="admin-section">
            <h4>📝 Bulk Numbers Call</h4>
            
            {/* Input Field */}
            <div style={{ marginBottom: "15px" }}>
              <input
                type="text"
                placeholder="Type numbers: 1,2,3 or 1-10 or click on grid"
                value={bulkNumbersInput}
                onChange={(e) => parseAndUpdateNumbers(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  fontSize: "14px"
                }}
              />
              <small style={{ color: "#666", display: "block", marginTop: "5px" }}>
                💡 Selected: {selectedBulkNumbers.size} number(s)
              </small>
            </div>

            {/* Numbers Grid 1-90 */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(10, 1fr)",
              gap: "5px",
              marginBottom: "15px",
              maxHeight: "300px",
              overflowY: "auto",
              padding: "10px",
              background: "#f8f9fa",
              borderRadius: "5px",
              border: "1px solid #dee2e6"
            }}>
              {Array.from({ length: TOTAL_NUMBERS }, (_, i) => {
                const num = i + 1;
                const isSelected = selectedBulkNumbers.has(num);
                const isAlreadyCalled = numbers.includes(num);
                
                return (
                  <button
                    key={num}
                    onClick={() => toggleNumberSelection(num)}
                    disabled={isAlreadyCalled}
                    style={{
                      padding: "8px 4px",
                      backgroundColor: isSelected ? "#28a745" : (isAlreadyCalled ? "#6c757d" : "#fff"),
                      color: isSelected ? "#fff" : (isAlreadyCalled ? "#fff" : "#000"),
                      border: "1px solid #dee2e6",
                      borderRadius: "4px",
                      cursor: isAlreadyCalled ? "not-allowed" : "pointer",
                      fontSize: "12px",
                      fontWeight: "bold",
                      transition: "all 0.2s"
                    }}
                    title={isAlreadyCalled ? `Number ${num} already called` : `Select number ${num}`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
              <button 
                onClick={() => {
                  const allNumbers = new Set();
                  for (let i = 1; i <= TOTAL_NUMBERS; i++) {
                    if (!numbers.includes(i)) {
                      allNumbers.add(i);
                    }
                  }
                  setSelectedBulkNumbers(allNumbers);
                  setBulkNumbersInput(Array.from(allNumbers).sort((a,b) => a-b).join(', '));
                }}
                style={{ background: "#17a2b8", fontSize: "12px", padding: "5px 10px" }}
              >
                Select All Remaining ({availableNumbers.length})
              </button>
              <button 
                onClick={() => {
                  setSelectedBulkNumbers(new Set());
                  setBulkNumbersInput("");
                }}
                style={{ background: "#dc3545", fontSize: "12px", padding: "5px 10px" }}
              >
                Clear All
              </button>
            </div>

            {/* Call Button */}
            <button 
              onClick={handleBulkNumbersCall} 
              disabled={loading || selectedBulkNumbers.size === 0}
              style={{ width: "100%", background: "#28a745", padding: "10px" }}
            >
              Call {selectedBulkNumbers.size} Selected Number(s)
            </button>
          </div>

          {/* Winner by ticket */}
          <div className="admin-section">
            <h4>🎫 Winner by Ticket ID</h4>
            <div className="admin-input-group">
              <input
                type="text"
                placeholder="Enter Ticket ID"
                value={winnerTicketId}
                onChange={(e) => setWinnerTicketId(e.target.value)}
              />
              <WinTypeSelect value={winnerType} onChange={setWinnerType} />
              <button onClick={handleDeclareWinnerByTicket} disabled={loading}>
                Declare Winner
              </button>
            </div>
          </div>

          {/* Admin announcement */}
          {/* <div className="admin-section">
            <h4>📢 Admin Announcement</h4>
            <div className="admin-input-group">
              <input
                type="text"
                placeholder="Enter announcement message"
                value={adminAnnouncement}
                onChange={(e) => setAdminAnnouncement(e.target.value)}
                maxLength="200"
              />
              <button onClick={handleAdminAnnounce} disabled={loading}>
                Announce
              </button>
            </div>
          </div> */}
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
      </div>

      {/* Main layout */}
      <div className="live-main">
        <div className="live-left">
          {/* Current number */}
          <div className="current-card">
            <div className="current-label">Current Number</div>
            <div className="current-number">{current ?? "--"}</div>
            <div className="current-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${getProgress()}%` }} />
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
                disabled={loading || !selectedRoundId || isRunning}
              >
                {loading ? "..." : "▶ Start"}
              </button>
              <button
                className="btn-pause"
                onClick={stopGame}
                disabled={loading || !selectedRoundId || !isRunning}
              >
                ⏸ Pause
              </button>
              <button
                className="btn-call"
                onClick={callNumber}
                disabled={loading || !isRunning || !selectedRoundId}
              >
                {loading ? "..." : "📞 Auto Call"}
              </button>
            </div>
          </div>

          {/* Winners */}
          <div className="winners-panel">
            <h3>🏆 Winners</h3>
            <div className="winners-list">
              {winners.length === 0 ? (
                <p className="no-winners">No winners yet</p>
              ) : (
                winners.map((winner, i) => (
                  <div key={i} className="winner-item">
                    <span>🏆</span>
                    <div>
                      <strong>{winner.user_name || "User"}</strong>
                      <small>{winner.win_type}</small>
                      <span>₹{winner.amount || 0}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

         
        </div>

        <div className="live-right">
          {/* Recent calls */}
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

          {/* Last 10 */}
          <div className="last-numbers">
            <h3>🔄 Last 10</h3>
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
        <h3>🔢 Numbers Board</h3>
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
    </div>
  );
}