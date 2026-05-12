import { useState, useEffect } from "react";
import { getAllGamesAPI, createGameAPI, updateGameAPI } from "../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../styles/ManageGames.css";

export default function Games() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editFormData, setEditFormData] = useState({
    title: "",
    start_datetime: "",
    ticket_price: "",
    total_tickets: "",
    agent_commission: "",
    bonus_name: "",
    bonus_amount: "",
    prizes: []
  });

  // Helper function to convert HH:MM:SS to HH:MM
  const formatTimeForInput = (time) => {
    if (!time) return "";
    if (time.split(':').length === 3) {
      return time.split(':').slice(0, 2).join(':');
    }
    return time;
  };

  // Helper function to display time in table
  const formatTimeForDisplay = (time) => {
    if (!time) return "N/A";
    if (time.split(':').length === 3) {
      return time.split(':').slice(0, 2).join(':');
    }
    return time;
  };

  // Fetch games from API
  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await getAllGamesAPI();
      console.log("get All Game Response:", response);

      if (response.success) {
        const gamesData = response.data?.games || [];
        console.log("Games data:", gamesData);
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

  useEffect(() => {
    fetchGames();
  }, []);

  // View Game Details
  const handleViewGame = (game) => {
    setSelectedGame(game);
    setShowViewModal(true);
  };

  // Stats Calculation
  const totalGames = games.length;
  const liveGames = games.filter(g => g.status === "live").length;
  const upcomingGames = games.filter(g => g.status === "upcoming").length;
  const completedGames = games.filter(g => g.status === "completed").length;


  // Add New Game
  const addNewGame = () => {
    setSelectedGame(null);
    setEditFormData({
      title: "",
      start_datetime: "",
      ticket_price: "",
      total_tickets: "",
      agent_commission: "",
      bonus_name: "",
      bonus_amount: "",
      prizes: []
    });
    setShowEditModal(true);
  };

  // Save Game (Create or Update)
  const handleSaveGame = async () => {
    if (!editFormData.title || !editFormData.start_datetime || !editFormData.ticket_price) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      if (selectedGame) {
        // Update existing game
        const updatePayload = {
          title: editFormData.title,
          start_datetime: editFormData.start_datetime.replace('T', ' ') + ':00',
          ticket_price: parseInt(editFormData.ticket_price),
          total_tickets: parseInt(editFormData.total_tickets) || 100,
          agent_commission: parseFloat(editFormData.agent_commission) || 5,
          bonus_name: editFormData.bonus_name || "",
          bonus_amount: parseFloat(editFormData.bonus_amount) || 0,
          prizes: editFormData.prizes || []
        };

        console.log("Updating game:", selectedGame.game_id, updatePayload);
        const response = await updateGameAPI(selectedGame.game_id, updatePayload);

        if (response.success) {
          await fetchGames();
          toast.success(response?.message || "Game updated successfully!");
          setShowEditModal(false);
          setSelectedGame(null);
        } else {
          toast.error(response?.message || "Failed to update game");
        }
      } else {
        // Create new game
        const createPayload = {
          title: editFormData.title,
          start_datetime: editFormData.start_datetime.replace('T', ' ') + ':00',
          ticket_price: parseInt(editFormData.ticket_price),
          total_tickets: parseInt(editFormData.total_tickets) || 100
        };

        console.log("Creating new game:", createPayload);
        const response = await createGameAPI(createPayload);

        if (response.success) {
          await fetchGames();
          toast.success(response?.message || "Game created successfully!");
          setShowEditModal(false);
        } else {
          toast.error(response?.message || "Failed to create game");
        }
      }
    } catch (err) {
      console.error("Error saving game:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to save game");
    }
  };

const filteredGames = games.filter((g) => {
  const matchesSearch = g.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(g.game_id).includes(searchTerm);
  const matchesStatus = statusFilter === "all" || g.status === statusFilter;
  return matchesSearch && matchesStatus;
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
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
  } catch (error) {
    return dateString;
  }
};

const formatDateTime = (dateString) => {
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
  } catch (error) {
    return dateString;
  }
};

if (loading) {
  return (
    <div className="games-container">
      <div className="loading-spinner">Loading games...</div>
    </div>
  );
}

return (
  <div className="games-container">

    {/* Header with Add Button */}
    <div className="games-header">
      <div className="header-title">
        <h1>🎮 Game Management Dashboard</h1>
      </div>

    </div>

    {/* Stats Cards */}
    <div className="stats-grid">
      <div className="stat-card blue">
        <div className="stat-icon">🎮</div>
        <div className="stat-info">
          <h3>Total Games</h3>
          <p>{totalGames}</p>
        </div>
      </div>
      <div className="stat-card red">
        <div className="stat-icon">🔴</div>
        <div className="stat-info">
          <h3>Live Now</h3>
          <p>{liveGames}</p>
        </div>
      </div>
      <div className="stat-card orange">
        <div className="stat-icon">⏳</div>
        <div className="stat-info">
          <h3>Upcoming</h3>
          <p>{upcomingGames}</p>
        </div>
      </div>
      <div className="stat-card green">
        <div className="stat-icon">🏁</div>
        <div className="stat-info">
          <h3>Completed</h3>
          <p>{completedGames}</p>
        </div>
      </div>
    </div>

    {/* Filter Bar */}
    <div className="games-filter-bar">
      <div className="games-search-wrap">
        <svg viewBox="0 0 20 20" fill="none" width="15" height="15" className="games-search-icon">
          <circle cx="9" cy="9" r="6" stroke="#94A3B8" strokeWidth="1.8" />
          <path d="M13.5 13.5L17 17" stroke="#94A3B8" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search by title or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="games-search-input"
        />
        {searchTerm && (
          <button className="games-search-clear" onClick={() => setSearchTerm("")}>✕</button>
        )}
      </div>
      <div className="games-filter-tabs">
        <span className="games-filter-label">Status:</span>
        {["all", "upcoming", "live", "completed"].map((s) => (
          <button
            key={s}
            className={`games-filter-tab ${statusFilter === s ? "active" : ""} ${s}`}
            onClick={() => setStatusFilter(s)}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
    </div>

    {/* Games Table */}
    <div className="games-table-container">
      {error ? (
        <div className="error-state-wrap">
          <div className="error-state-icon">⚠️</div>
          <h3 className="error-state-title">Failed to Load Games</h3>
          <p className="error-state-msg">{error}</p>
          <button onClick={fetchGames} className="error-state-btn">
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Try Again
          </button>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="no-games">
          <p>{games.length === 0 ? 'No games found.' : 'No games match your filter.'}</p>
        </div>
      ) : (
        <div className="games-table-wrapper">
          <table className="games-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Date & Time</th>
                <th>Tickets</th>
                <th>Price</th>
                <th>Status</th>
                <th>Winners</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGames.map((game) => {
                const statusBadge = getStatusBadge(game.status);
                return (
                  <tr key={game.game_id}>
                    <td className="game-id">#{game.game_id}</td>
                    <td className="game-title">
                      <div className="title-wrapper">
                        <span className="title">{game.title}</span>
                        <span className="bonus-info">{game.bonus_name}</span>
                      </div>
                    </td>
                    <td className="game-datetime">{formatDateTime(game.start_datetime)}</td>
                    <td className="tickets-info">
                      <div className="tickets-wrapper">
                        <span className="total">{game.total_tickets}</span>
                        <span className="cycle">Max: {game.max_ticket_cycle}</span>
                      </div>
                    </td>
                    {/* <td className="price-info"> */}
                    <td className="">
                      <div className="price-wrapper">
                        <span className="price">₹{game.ticket_price}</span>
                        <span className="commission">{game.agent_commission}% comm</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${statusBadge.class}`}>
                        {statusBadge.icon} {statusBadge.text}
                      </span>
                    </td>
                    <td className="winners-count">{game.total_winners || 0}</td>
                    <td className="actions-cell">
                      <button
                        className="action-view"
                        onClick={() => handleViewGame(game)}
                        title="View Details"
                      >
                        👁️ View
                      </button>
                      <button
                        className="action-edit"
                        onClick={() => {
                          console.log("Editing game:", game); // Debug log
                          navigate("/create-game", { state: { editGame: game } });
                        }}
                        title="Edit Game"
                      >
                        ✏️ Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {/* View Game Details Modal */}
    {showViewModal && selectedGame && (
      <div id="viewModalOverlay" onClick={() => setShowViewModal(false)}>
        <div id="viewModalContent" onClick={(e) => e.stopPropagation()}>
          <div id="viewModalHeader">
            <div id="viewModalHeaderLeft">
              <div id="viewModalIconBox">
                <span>🎮</span>
              </div>
              <div>
                <h2>Game Details</h2>
                <p>{selectedGame.title}</p>
              </div>
            </div>
            <button id="viewModalClose" onClick={() => setShowViewModal(false)}>✕</button>
          </div>

          <div id="viewModalBody">
            <div id="gameDetailsGrid">
              <div className="detail-card">
                <h4>🎯 Basic Info</h4>
                <div className="detail-row">
                  <span>Game ID:</span>
                  <span>#{selectedGame.game_id}</span>
                </div>
                <div className="detail-row">
                  <span>Title:</span>
                  <span>{selectedGame.title}</span>
                </div>
                <div className="detail-row">
                  <span>Status:</span>
                  <span className={`status-badge ${getStatusBadge(selectedGame.status).class}`}>
                    {getStatusBadge(selectedGame.status).icon} {getStatusBadge(selectedGame.status).text}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Start Time:</span>
                  <span>{formatDateTime(selectedGame.start_datetime)}</span>
                </div>
              </div>

              <div className="detail-card">
                <h4>🎫 Ticket Info</h4>
                <div className="detail-row">
                  <span>Total Tickets:</span>
                  <span>{selectedGame.total_tickets}</span>
                </div>
                <div className="detail-row">
                  <span>Ticket Price:</span>
                  <span>₹{selectedGame.ticket_price}</span>
                </div>
                <div className="detail-row">
                  <span>Max Cycle:</span>
                  <span>{selectedGame.max_ticket_cycle}</span>
                </div>
                <div className="detail-row">
                  <span>Agent Commission:</span>
                  <span>{selectedGame.agent_commission}%</span>
                </div>
              </div>

              <div className="detail-card">
                <h4>🎁 Bonus & Winners</h4>
                <div className="detail-row">
                  <span>Bonus Name:</span>
                  <span>{selectedGame.bonus_name || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span>Bonus Amount:</span>
                  <span>₹{selectedGame.bonus_amount || '0'}</span>
                </div>
                <div className="detail-row">
                  <span>Total Winners:</span>
                  <span>{selectedGame.total_winners || 0}</span>
                </div>
                <div className="detail-row">
                  <span>Current Number:</span>
                  <span>{selectedGame.current_called_number || 'Not Started'}</span>
                </div>
              </div>

              {selectedGame.prizes && selectedGame.prizes.length > 0 && (
                <div className="detail-card prizes-card">
                  <h4>🏆 Prizes ({selectedGame.prizes.length})</h4>
                  <div className="prizes-list">
                    {selectedGame.prizes.map((prize) => (
                      <div key={prize.prize_id} className="prize-item">
                        <div className="prize-header">
                          <span className="prize-name">{prize.prize_name}</span>
                          <span className={`prize-status ${prize.is_active ? 'active' : 'inactive'}`}>
                            {prize.is_active ? '✅' : '❌'}
                          </span>
                        </div>
                        <div className="prize-details">
                          <span>Amount: ₹{prize.prize_amount}</span>
                          <span>Max Winners: {prize.max_winners}</span>
                          <span>Claimed: {prize.claimed_count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
}