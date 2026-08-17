
// GameUserHistory.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllGamesAPI, getUserGameHistoryAPI, getUserDetailsAPI } from "../services/api";
import { toast } from "react-toastify";
import "../styles/GameUserHistory.css";

function GameUserHistory() {
  const navigate = useNavigate();
  
  // State Management
  const [games, setGames] = useState([]);
  const [users, setUsers] = useState([]);
  const [gameHistory, setGameHistory] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [view, setView] = useState("games"); // "games" | "users" | "history"
  const [userSearchTerm, setUserSearchTerm] = useState("");

  // Fetch all games on component mount
  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllGamesAPI();
      console.log("Games Response:", response);

      if (response.success) {
        const gamesData = response.data?.games || [];
        setGames(gamesData);
      } else {
        setError(response.message || "Failed to load games");
      }
    } catch (err) {
      console.error("Error fetching games:", err);
      setError(err.message || "Failed to load games");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for selected game
  const fetchUsersForGame = async (game) => {
    try {
      setLoadingUsers(true);
      setSelectedGame(game);
      
      // Get all users first (you might need a different API endpoint)
      // This assumes you have an API to get users by game ID
      const response = await getUserDetailsAPI();
      console.log("Users Response:", response);

      if (response.success && response.data) {
        // Filter users who participated in this game
        // You might need to filter based on game_id from your API
        setUsers(response.data);
        setView("users");
      } else {
        toast.error("Failed to load users for this game");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch game history for selected user
  const fetchUserGameHistory = async (user) => {
    try {
      setLoadingHistory(true);
      setSelectedUser(user);
      
      const response = await getUserGameHistoryAPI(user.user_id);
      console.log("Game History Response:", response);

      if (response.data) {
        // Filter history for the selected game
        const filteredHistory = response.data.filter(
          history => history.game_id === selectedGame.game_id
        );
        setGameHistory(filteredHistory);
        setView("history");
      } else {
        setGameHistory([]);
        toast.info("No game history found for this user");
      }
    } catch (err) {
      console.error("Error fetching game history:", err);
      toast.error(err.message || "Failed to load game history");
    } finally {
      setLoadingHistory(false);
    }
  };

  // Navigate back to previous view
  const goBack = () => {
    if (view === "history") {
      setView("users");
      setSelectedUser(null);
      setGameHistory([]);
    } else if (view === "users") {
      setView("games");
      setSelectedGame(null);
      setUsers([]);
      setUserSearchTerm("");
    }
  };

  // Filter games based on search and status
  const filteredGames = games.filter((g) => {
    const matchesSearch = g.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(g.game_id).includes(searchTerm);
    const matchesStatus = statusFilter === "all" || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter users based on search
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
    return fullName.includes(userSearchTerm.toLowerCase()) ||
      user.phone?.includes(userSearchTerm) ||
      user.referral_code?.toLowerCase().includes(userSearchTerm.toLowerCase());
  });

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: { class: "status-waiting", text: "UPCOMING", icon: "⏳" },
      live: { class: "status-live", text: "LIVE", icon: "🔴" },
      completed: { class: "status-ended", text: "COMPLETED", icon: "✅" },
    };
    return badges[status] || badges.upcoming;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata'
      });
    } catch {
      return dateString;
    }
  };

  const getResultBadge = (result) => {
    if (result === "win") {
      return <span className="result-badge win">🏆 Win</span>;
    } else if (result === "loss") {
      return <span className="result-badge loss">❌ Loss</span>;
    }
    return <span className="result-badge pending">⏳ Pending</span>;
  };

  // Loading States
  if (loading) {
    return (
      <div className="guh-container">
        <div className="guh-loading">
          <div className="guh-loader"></div>
          <p>Loading games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="guh-container">
      {/* Header */}
      <div className="guh-header">
        <div className="guh-header-content">
          {view !== "games" && (
            <button className="guh-back-btn" onClick={goBack}>
              ← Back
            </button>
          )}
          <h1 className="guh-title">
            {view === "games" && "🎮 Select Game"}
            {view === "users" && `👥 Users - ${selectedGame?.title || ""}`}
            {view === "history" && `📋 ${selectedUser?.first_name || ""} ${selectedUser?.last_name || ""}'s History`}
          </h1>
          <div className="guh-breadcrumb">
            {view === "users" && (
              <span className="guh-breadcrumb-item">
                {selectedGame?.title} → Users
              </span>
            )}
            {view === "history" && (
              <span className="guh-breadcrumb-item">
                {selectedGame?.title} → {selectedUser?.first_name || ""} {selectedUser?.last_name || ""} → History
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter - Games View */}
      {view === "games" && (
        <div className="guh-filters">
          <div className="guh-search-wrap">
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16" className="guh-search-icon">
              <circle cx="9" cy="9" r="6" stroke="#94A3B8" strokeWidth="1.8" />
              <path d="M13.5 13.5L17 17" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search by title or game ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="guh-search-input"
            />
            {searchTerm && (
              <button className="guh-search-clear" onClick={() => setSearchTerm("")}>✕</button>
            )}
          </div>
          <div className="guh-filter-tabs">
            <span className="guh-filter-label">Status:</span>
            {["all", "upcoming", "live", "completed"].map((s) => (
              <button
                key={s}
                className={`guh-filter-tab ${statusFilter === s ? "active" : ""}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search - Users View */}
      {view === "users" && (
        <div className="guh-filters">
          <div className="guh-search-wrap">
            <svg viewBox="0 0 20 20" fill="none" width="16" height="16" className="guh-search-icon">
              <circle cx="9" cy="9" r="6" stroke="#94A3B8" strokeWidth="1.8" />
              <path d="M13.5 13.5L17 17" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, phone or referral code..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              className="guh-search-input"
            />
            {userSearchTerm && (
              <button className="guh-search-clear" onClick={() => setUserSearchTerm("")}>✕</button>
            )}
          </div>
          <div className="guh-user-count">
            <span>{filteredUsers.length} users found</span>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="guh-content">
        {error ? (
          <div className="guh-error-state">
            <div className="guh-error-icon">⚠️</div>
            <h3>Failed to Load Data</h3>
            <p>{error}</p>
            <button onClick={fetchGames} className="guh-retry-btn">
              Try Again
            </button>
          </div>
        ) : view === "games" ? (
          // GAMES LIST VIEW
          <div className="guh-games-grid">
            {filteredGames.length === 0 ? (
              <div className="guh-no-data">
                <div className="guh-no-data-icon">🎮</div>
                <h3>No Games Found</h3>
                <p>{games.length === 0 ? "No games available" : "Try adjusting your filters"}</p>
              </div>
            ) : (
              filteredGames.map((game) => {
                const statusBadge = getStatusBadge(game.status);
                return (
                  <div
                    key={game.game_id}
                    className="guh-game-card"
                    onClick={() => fetchUsersForGame(game)}
                  >
                    <div className="guh-game-card-header">
                      <div className="guh-game-card-id">#{game.game_id}</div>
                      <span className={`guh-status-badge ${statusBadge.class}`}>
                        {statusBadge.icon} {statusBadge.text}
                      </span>
                    </div>
                    <div className="guh-game-card-title">{game.title}</div>
                    <div className="guh-game-card-details">
                      <div className="guh-game-detail">
                        <span className="guh-detail-label">📅 Date:</span>
                        <span className="guh-detail-value">{formatDate(game.start_datetime)}</span>
                      </div>
                      <div className="guh-game-detail">
                        <span className="guh-detail-label">🎫 Tickets:</span>
                        <span className="guh-detail-value">{game.total_tickets}</span>
                      </div>
                      <div className="guh-game-detail">
                        <span className="guh-detail-label">💰 Price:</span>
                        <span className="guh-detail-value">₹{game.ticket_price}</span>
                      </div>
                      <div className="guh-game-detail">
                        <span className="guh-detail-label">🏆 Winners:</span>
                        <span className="guh-detail-value">{game.total_winners || 0}</span>
                      </div>
                    </div>
                    <div className="guh-game-card-footer">
                      <span className="guh-view-users-btn">
                        View Users →
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : view === "users" ? (
          // USERS LIST VIEW
          <div className="guh-users-container">
            {loadingUsers ? (
              <div className="guh-loading-users">
                <div className="guh-loader"></div>
                <p>Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="guh-no-data">
                <div className="guh-no-data-icon">👥</div>
                <h3>No Users Found</h3>
                <p>No users have participated in this game yet</p>
              </div>
            ) : (
              <div className="guh-users-grid">
                {filteredUsers.map((user) => (
                  <div
                    key={user.user_id}
                    className="guh-user-card"
                    onClick={() => fetchUserGameHistory(user)}
                  >
                    <div className="guh-user-avatar">
                      {user.first_name?.[0] || "U"}
                      {user.last_name?.[0] || ""}
                    </div>
                    <div className="guh-user-info">
                      <div className="guh-user-name">
                        {user.first_name || ""} {user.last_name || ""}
                      </div>
                      <div className="guh-user-phone">📱 {user.phone || "N/A"}</div>
                      <div className="guh-user-details">
                        <span className="guh-user-ref">
                          🔑 {user.referral_code || "N/A"}
                        </span>
                        <span className={`guh-user-verify ${user.is_verified ? "verified" : "unverified"}`}>
                          {user.is_verified ? "✓ Verified" : "✗ Unverified"}
                        </span>
                      </div>
                    </div>
                    <div className="guh-user-stats">
                      <div className="guh-user-stat">
                        <span className="guh-stat-value">₹{(user.wallet || 0).toLocaleString()}</span>
                        <span className="guh-stat-label">Wallet</span>
                      </div>
                      <div className="guh-user-stat">
                        <span className="guh-stat-value">₹{(user.total_deposit || 0).toLocaleString()}</span>
                        <span className="guh-stat-label">Deposit</span>
                      </div>
                    </div>
                    <div className="guh-user-card-footer">
                      <span className="guh-view-history-btn">
                        View History →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : view === "history" ? (
          // GAME HISTORY VIEW
          <div className="guh-history-container">
            {loadingHistory ? (
              <div className="guh-loading-history">
                <div className="guh-loader"></div>
                <p>Loading game history...</p>
              </div>
            ) : gameHistory.length === 0 ? (
              <div className="guh-no-data">
                <div className="guh-no-data-icon">📋</div>
                <h3>No Game History</h3>
                <p>This user hasn't participated in this game</p>
              </div>
            ) : (
              <div className="guh-history-cards">
                {gameHistory.map((history) => (
                  <div key={history.booking_id} className="guh-history-card">
                    <div className="guh-history-header">
                      <div className="guh-history-game-title">
                        🎮 {history.game_title}
                      </div>
                      <div className="guh-history-badges">
                        {getResultBadge(history.result)}
                      </div>
                    </div>

                    <div className="guh-history-details-grid">
                      <div className="guh-history-detail">
                        <span className="guh-detail-label">Booking ID:</span>
                        <span className="guh-detail-value">#{history.booking_id}</span>
                      </div>
                      <div className="guh-history-detail">
                        <span className="guh-detail-label">Amount:</span>
                        <span className="guh-detail-value amount">₹{history.total_amount || 0}</span>
                      </div>
                      <div className="guh-history-detail">
                        <span className="guh-detail-label">Winning:</span>
                        <span className="guh-detail-value winning">₹{history.total_winning || 0}</span>
                      </div>
                      <div className="guh-history-detail">
                        <span className="guh-detail-label">Tickets:</span>
                        <span className="guh-detail-value">{history.total_user_tickets || 0}</span>
                      </div>
                      <div className="guh-history-detail">
                        <span className="guh-detail-label">Payment:</span>
                        <span className="guh-detail-value">{history.payment_status || "N/A"}</span>
                      </div>
                      <div className="guh-history-detail">
                        <span className="guh-detail-label">Method:</span>
                        <span className="guh-detail-value">{history.payment_method || "N/A"}</span>
                      </div>
                      <div className="guh-history-detail">
                        <span className="guh-detail-label">Time:</span>
                        <span className="guh-detail-value">{formatDate(history.booking_time)}</span>
                      </div>
                      <div className="guh-history-detail">
                        <span className="guh-detail-label">Status:</span>
                        <span className={`guh-history-status ${history.game_status || "unknown"}`}>
                          {history.game_status || "Unknown"}
                        </span>
                      </div>
                    </div>

                    {/* Tickets Section */}
                    {history.tickets && history.tickets.length > 0 && (
                      <div className="guh-history-tickets">
                        <div className="guh-tickets-header">
                          <span>🎫 Tickets ({history.tickets.length})</span>
                        </div>
                        <div className="guh-tickets-grid">
                          {history.tickets.map((ticket) => (
                            <div key={ticket.ticket_id} className="guh-ticket-item">
                              <div className="guh-ticket-number">
                                #{ticket.ticket_number || "N/A"}
                              </div>
                              <div className="guh-ticket-details">
                                <span>₹{ticket.price || 0}</span>
                                <span className={`guh-ticket-result ${ticket.result || "unknown"}`}>
                                  {ticket.result === "win" ? "🏆" : ticket.result === "loss" ? "❌" : "-"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default GameUserHistory;