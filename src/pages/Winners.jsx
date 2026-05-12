import { useState, useEffect } from "react";
import { getWinnersListAPI } from "../services/api";
import "../styles/winners.css";

export default function Winners() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [gameFilter, setGameFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [gameId, setGameId] = useState(""); // Game ID for filtering

  // Get unique games for filter
  const games = ["all", ...new Set(winners.map(w => w.game_title))];

  // Fetch winners from API
const fetchWinners = async (selectedGameId = "") => {
  setLoading(true);
  try {
    let response;

    // ✅ ALWAYS API CALL
    response = await getWinnersListAPI(selectedGameId);

    if (response.success && response.data) {
      const transformedWinners = response.data.map((winner) => ({
        id: winner.winner_id,
        playerName: winner.user_name || "Unknown User",
        game: winner.game_title,
        prize: winner.amount,
        category: formatWinType(winner.win_type),
        date: new Date().toISOString().split("T")[0],
        ticketId: `TKT-${winner.ticket_number}`,
        status: "Pending",
        phone: winner.phone,
        prize_name: winner.prize_name,
        win_type: winner.win_type,
        ticket_number: winner.ticket_number,
      }));

      setWinners(transformedWinners);
    } else {
      setWinners([]);
    }
  } catch (err) {
    console.error("Error fetching winners:", err);
    setWinners([]);
  } finally {
    setLoading(false);
  }
};

  // Format win type for display
  const formatWinType = (winType) => {
    const types = {
      "FULL": "Full House",
      "TOP": "Top Line",
      "MIDDLE": "Middle Line",
      "BOTTOM": "Bottom Line",
      "EARLY5": "Early Five",
      "CORNERS": "Corners"
    };
    return types[winType] || winType;
  };

  // Load winners on component mount
  useEffect(() => {
    fetchWinners();
  }, []);

  // Handle game filter change
  const handleGameFilterChange = (selectedGame) => {
    setGameFilter(selectedGame);
    if (selectedGame !== "all") {
      // You might need to fetch winners for specific game
      // For now, filter locally
    }
  };

  // Stats calculations
  const totalWinners = winners.length;
  const totalPrizeDistributed = winners.reduce((sum, w) => sum + w.prize, 0);
  const claimedWinners = winners.filter(w => w.status === "Claimed").length;
  const pendingWinners = winners.filter(w => w.status === "Pending").length;
  const avgPrize = totalWinners > 0 ? Math.round(totalPrizeDistributed / totalWinners) : 0;
  const highestPrize = totalWinners > 0 ? Math.max(...winners.map(w => w.prize)) : 0;

  // Filter winners based on search and filters
  const filteredWinners = winners.filter(winner => {
    const matchesSearch = winner.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          winner.ticketId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGame = gameFilter === "all" || winner.game === gameFilter;
    const matchesStatus = statusFilter === "all" || winner.status === statusFilter;
    return matchesSearch && matchesGame && matchesStatus;
  });

  // Update status (local only - need API endpoint for this)
  const handleStatusChange = (id, newStatus) => {
    setWinners(winners.map(w => 
      w.id === id ? { ...w, status: newStatus } : w
    ));
    // TODO: Add API call to update status if backend supports it
  };

  // Delete winner (local only)
  const handleDeleteWinner = (id) => {
    if (window.confirm("Are you sure you want to delete this winner record?")) {
      setWinners(winners.filter(w => w.id !== id));
      // TODO: Add API call to delete winner
    }
  };

  // View details
  const handleViewDetails = (winner) => {
    setSelectedWinner(winner);
    setShowDetailsModal(true);
  };

  // Export report
  const handleExportReport = () => {
    const csvContent = [
      ["Player Name", "Game", "Category", "Prize", "Ticket ID", "Status", "Phone"],
      ...filteredWinners.map(w => [
        w.playerName,
        w.game,
        w.category,
        w.prize,
        w.ticketId,
        w.status,
        w.phone || "N/A"
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `winners_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    return status === "Claimed" ? "status-claimed" : "status-pending";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      "Full House": "🏆",
      "Top Line": "⬆️",
      "Middle Line": "⏺️",
      "Bottom Line": "⬇️",
      "Corners": "🔲",
      "Early Five": "⚡",
    };
    return icons[category] || "🎯";
  };

  if (loading) {
    return (
      <div className="winners-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading winners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="winners-container">
      {/* Header */}
      <div className="winners-header">
        <div className="header-left">
          <h1 className="winners-title">🏆 Winners Management</h1>
          <p className="winners-subtitle">Track and manage all game winners</p>
        </div>
        <button className="btn-export" onClick={handleExportReport}>
          📥 Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">🏆</div>
          <div className="stat-content">
            <h4>Total Winners</h4>
            <p>{totalWinners}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-content">
            <h4>Claimed</h4>
            <p>{claimedWinners}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">⏳</div>
          <div className="stat-content">
            <h4>Pending</h4>
            <p>{pendingWinners}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon revenue">💰</div>
          <div className="stat-content">
            <h4>Total Prize</h4>
            <p>₹{totalPrizeDistributed.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Second Row Stats */}
      <div className="stats-row-two">
        <div className="stat-card-small">
          <span className="stat-label">Average Prize</span>
          <span className="stat-value-small">₹{avgPrize.toLocaleString()}</span>
        </div>
        <div className="stat-card-small">
          <span className="stat-label">Highest Prize</span>
          <span className="stat-value-small">₹{highestPrize.toLocaleString()}</span>
        </div>
        <div className="stat-card-small">
          <span className="stat-label">This Month</span>
          <span className="stat-value-small">{winners.filter(w => {
            const winnerDate = new Date(w.date);
            const now = new Date();
            return winnerDate.getMonth() === now.getMonth() && 
                   winnerDate.getFullYear() === now.getFullYear();
          }).length}</span>
        </div>
        <div className="stat-card-small">
          <span className="stat-label">Games Played</span>
          <span className="stat-value-small">{games.length - 1}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by Player Name or Ticket ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select 
            className="filter-select"
            value={gameFilter}
            onChange={(e) => handleGameFilterChange(e.target.value)}
          >
            {games.map(game => (
              <option key={game} value={game}>
                {game === "all" ? "All Games" : game}
              </option>
            ))}
          </select>
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Claimed">Claimed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Winners Table */}
      <div className="table-card">
        <div className="table-header">
          <h3>📋 Winners List</h3>
          <span className="table-count">{filteredWinners.length} winners found</span>
        </div>
        <div className="table-wrapper">
          <table className="winners-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player Name</th>
                <th>Ticket ID</th>
                <th>Game</th>
                <th>Category</th>
                <th>Prize</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWinners.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">
                    <span>🏆</span>
                    <p>No winners found</p>
                   </td>
                </tr>
              ) : (
                filteredWinners.map((winner, index) => (
                  <tr key={winner.id}>
                    <td>{index + 1}</td>
                    <td className="player-name">
                      {winner.playerName}
                      {winner.phone && <small className="player-phone">📞 {winner.phone}</small>}
                    </td>
                    <td className="ticket-id">{winner.ticketId}</td>
                    <td>{winner.game}</td>
                    <td>
                      <span className="category-badge">
                        {getCategoryIcon(winner.category)} {winner.category}
                      </span>
                    </td>
                    <td className="prize-amount">₹{winner.prize.toLocaleString()}</td>
                    <td>{winner.date}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(winner.status)}`}>
                        {winner.status}
                      </span>
                      {/* <select
                        className={`status-badge ${getStatusBadge(winner.status)}`}
                        value={winner.status}
                        onChange={(e) => handleStatusChange(winner.id, e.target.value)}
                      >
                        <option value="Claimed">Claimed ✅</option>
                        <option value="Pending">Pending ⏳</option>
                      </select> */}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-view" onClick={() => handleViewDetails(winner)}>
                          👁️
                        </button>
                       
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Winner Details Modal */}
      {showDetailsModal && selectedWinner && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🏆 Winner Details</h3>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="winner-detail-card">
                <div className="detail-avatar">
                  <div className="avatar-icon">🏆</div>
                </div>
                <div className="detail-info">
                  <h2>{selectedWinner.playerName}</h2>
                  <p className="detail-category">{getCategoryIcon(selectedWinner.category)} {selectedWinner.category}</p>
                </div>
              </div>
              
              <div className="details-grid">
                <div className="detail-item">
                  <label>Ticket ID</label>
                  <span>{selectedWinner.ticketId}</span>
                </div>
                <div className="detail-item">
                  <label>Ticket Number</label>
                  <span>{selectedWinner.ticket_number || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <label>Game Name</label>
                  <span>{selectedWinner.game}</span>
                </div>
                <div className="detail-item">
                  <label>Win Type</label>
                  <span>{selectedWinner.win_type || selectedWinner.category}</span>
                </div>
                <div className="detail-item">
                  <label>Prize Amount</label>
                  <span className="highlight">₹{selectedWinner.prize.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>Winning Date</label>
                  <span>{selectedWinner.date}</span>
                </div>
                <div className="detail-item">
                  <label>Phone Number</label>
                  <span>{selectedWinner.phone || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span className={`status-badge ${getStatusBadge(selectedWinner.status)}`}>
                    {selectedWinner.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-close" onClick={() => setShowDetailsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}