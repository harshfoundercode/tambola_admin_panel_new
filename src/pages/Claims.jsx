import { useState } from "react";
import "../styles/players.css";

export default function Players() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [players, setPlayers] = useState([
    { id: 1, name: "Rahul Sharma", status: "Active", tickets: 5, amountSpent: 250, phone: "+91 98765 43210", joinDate: "2024-01-15", lastActive: "2024-01-20" },
    { id: 2, name: "Amit Kumar", status: "Inactive", tickets: 2, amountSpent: 100, phone: "+91 98765 43211", joinDate: "2024-01-10", lastActive: "2024-01-18" },
    { id: 3, name: "Sneha Patel", status: "Active", tickets: 7, amountSpent: 350, phone: "+91 98765 43212", joinDate: "2024-01-05", lastActive: "2024-01-20" },
    { id: 4, name: "Priya Singh", status: "Active", tickets: 12, amountSpent: 600, phone: "+91 98765 43213", joinDate: "2024-01-01", lastActive: "2024-01-20" },
    { id: 5, name: "Rajesh Verma", status: "Inactive", tickets: 1, amountSpent: 50, phone: "+91 98765 43214", joinDate: "2024-01-12", lastActive: "2024-01-15" },
    { id: 6, name: "Neha Gupta", status: "Active", tickets: 8, amountSpent: 400, phone: "+91 98765 43215", joinDate: "2024-01-08", lastActive: "2024-01-20" },
    { id: 7, name: "Vikram Mehta", status: "Active", tickets: 4, amountSpent: 200, phone: "+91 98765 43216", joinDate: "2024-01-14", lastActive: "2024-01-19" },
    { id: 8, name: "Pooja Yadav", status: "Inactive", tickets: 3, amountSpent: 150, phone: "+91 98765 43217", joinDate: "2024-01-09", lastActive: "2024-01-16" },
    { id: 9, name: "Ankit Jain", status: "Active", tickets: 15, amountSpent: 750, phone: "+91 98765 43218", joinDate: "2024-01-03", lastActive: "2024-01-20" },
    { id: 10, name: "Kavita Sharma", status: "Active", tickets: 6, amountSpent: 300, phone: "+91 98765 43219", joinDate: "2024-01-07", lastActive: "2024-01-19" },
  ]);

  // Stats
  const totalPlayers = players.length;
  const activePlayers = players.filter(p => p.status === "Active").length;
  const totalTicketsSold = players.reduce((sum, p) => sum + p.tickets, 0);
  const totalRevenue = players.reduce((sum, p) => sum + p.amountSpent, 0);

  // Filter players
  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          player.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || player.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);
  const paginatedPlayers = filteredPlayers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status) => {
    return status === "Active" ? "status-active" : "status-inactive";
  };

  return (
    <div className="players-container">
      {/* Header */}
      <div className="players-header">
        <div className="header-left">
          <h1 className="players-title">👥 Players Management</h1>
          <p className="players-subtitle">Manage and monitor all registered players</p>
        </div>
        <button className="btn-add-player">
          ➕ Add New Player
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">👥</div>
          <div className="stat-content">
            <h4>Total Players</h4>
            <p>{totalPlayers}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">🟢</div>
          <div className="stat-content">
            <h4>Active Players</h4>
            <p>{activePlayers}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">🎫</div>
          <div className="stat-content">
            <h4>Tickets Sold</h4>
            <p>{totalTicketsSold}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">💰</div>
          <div className="stat-content">
            <h4>Total Revenue</h4>
            <p>₹{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All
          </button>
          <button 
            className={`filter-tab ${statusFilter === "active" ? "active" : ""}`}
            onClick={() => setStatusFilter("active")}
          >
            Active
          </button>
          <button 
            className={`filter-tab ${statusFilter === "inactive" ? "active" : ""}`}
            onClick={() => setStatusFilter("inactive")}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Players Table */}
      <div className="table-card">
        <div className="table-header">
          <h3>📋 Player List</h3>
          <span className="table-count">{filteredPlayers.length} players found</span>
        </div>
        <div className="table-wrapper">
          <table className="players-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Player Name</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Tickets</th>
                <th>Amount Spent</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPlayers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    <span>📭</span>
                    <p>No players found</p>
                  </td>
                </tr>
              ) : (
                paginatedPlayers.map((player, index) => (
                  <tr key={player.id}>
                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="player-name">{player.name}</td>
                    <td>{player.phone}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadge(player.status)}`}>
                        {player.status}
                      </span>
                    </td>
                    <td className="tickets-count">{player.tickets}</td>
                    <td className="amount-spent">₹{player.amountSpent}</td>
                    <td>{player.joinDate}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-view" title="View Details">👁️</button>
                        <button className="action-edit" title="Edit">✏️</button>
                        <button className="action-delete" title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              ← Previous
            </button>
            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`page-number ${currentPage === page ? "active" : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            <button 
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}