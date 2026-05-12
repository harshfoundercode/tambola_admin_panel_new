import { useState, useEffect } from "react";
import { getAllGamesAPI, getAllTicketsAPI } from "../services/api";
import "../styles/tickets.css";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [games, setGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch all games on load
  useEffect(() => {
    fetchGames();
  }, []);

  // Fetch tickets when game is selected
  useEffect(() => {
    if (selectedGameId) {
      const game = games.find(g => g.game_id === selectedGameId);
      setSelectedGame(game || null);
      fetchTickets(selectedGameId);
    }
  }, [selectedGameId, games]);

  const fetchGames = async () => {
    setGamesLoading(true);
    try {
      const response = await getAllGamesAPI();
      if (response.success && response.data?.games) {
        const gamesList = response.data.games;
        setGames(gamesList);
        if (gamesList.length > 0) {
          setSelectedGameId(gamesList[0].game_id);
          setSelectedGame(gamesList[0]);
        }
      } else {
        setGames([]);
      }
    } catch (error) {
      console.error("Error fetching games:", error);
      setGames([]);
    } finally {
      setGamesLoading(false);
    }
  };

  // Helper function to parse grid data
  const parseGridData = (grid) => {
    if (!grid) return null;
    if (Array.isArray(grid)) return grid;
    if (typeof grid === 'string') {
      try {
        return JSON.parse(grid);
      } catch (e) {
        console.error("Error parsing grid:", e);
        return null;
      }
    }
    return null;
  };

  const fetchTickets = async (gameId) => {
    setLoading(true);
    try {
      const response = await getAllTicketsAPI(gameId);
      if (response.success && response.data?.tickets) {
        const ticketsData = response.data.tickets;
        
        const formattedTickets = ticketsData.map((ticket) => {
          let gridData = null;
          if (ticket.grid) {
            gridData = parseGridData(ticket.grid);
          } else if (ticket.ticket_data) {
            gridData = parseGridData(ticket.ticket_data);
          }
          
          // Use ticket price if available, otherwise use game price
          let ticketPrice = ticket.price;
          if (!ticketPrice || ticketPrice === "N/A" || ticketPrice === null) {
            // If no individual ticket price, use game's ticket price
            const currentGame = games.find(g => g.game_id === gameId);
            ticketPrice = currentGame?.ticket_price || "N/A";
          }
          
          return {
            id: ticket.ticket_id,
            ticketNumber: ticket.ticket_number,
            price: ticketPrice,
            status: ticket.status,
            ticketData: gridData,
            playerName: ticket.player_name || "-",
            phone: ticket.phone || "-",
          };
        });
        setTickets(formattedTickets);
      } else {
        console.log("No tickets found");
        setTickets([]);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const totalTickets = tickets.length;
  const soldTickets = tickets.filter((t) => t.status === "sold").length;
  const availableTickets = tickets.filter((t) => t.status === "available").length;
  const reservedTickets = tickets.filter((t) => t.status === "reserved").length;
  const totalRevenue = tickets
    .filter((t) => t.status === "sold")
    .reduce((acc, curr) => acc + (typeof curr.price === 'number' ? curr.price : 0), 0);

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticketNumber.toString().includes(searchTerm) ||
      ticket.playerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "sold":
        return "ticket-sold";
      case "available":
        return "ticket-available";
      case "reserved":
        return "ticket-reserved";
      default:
        return "ticket-available";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "sold":
        return "✅ Sold";
      case "available":
        return "📦 Available";
      case "reserved":
        return "🔒 Reserved";
      default:
        return status;
    }
  };

  return (
    <div className="tickets-container">
      {/* Header */}
      <div className="tickets-header">
        <div className="header-left">
          <h1 className="tickets-title"> Tickets Management</h1>
          <p className="tickets-subtitle">Manage and monitor all game tickets</p>
        </div>
      </div>

      {/* Game Selector */}
      <div className="game-selector-section">
        <label className="game-selector-label">Select Game:</label>
        <div className="game-selector-buttons">
          {gamesLoading ? (
            <p className="no-games">Loading games...</p>
          ) : games.length > 0 ? (
            games.map((game) => (
              <button
                key={game.game_id}
                className={`game-btn ${selectedGameId === game.game_id ? "active" : ""}`}
                onClick={() => setSelectedGameId(game.game_id)}
              >
                {game.title}
              </button>
            ))
          ) : (
            <p className="no-games">No games available</p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"></div>
          <div className="stat-content">
            <h4>Total Tickets</h4>
            <p>{totalTickets}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-content">
            <h4>Sold Tickets</h4>
            <p>{soldTickets}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">🔒</div>
          <div className="stat-content">
            <h4>Reserved</h4>
            <p>{reservedTickets}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">📦</div>
          <div className="stat-content">
            <h4>Available</h4>
            <p>{availableTickets}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon revenue"></div>
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
            placeholder="Search by Ticket Number or Player Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="sold">✅ Sold</option>
            <option value="available">📦 Available</option>
            <option value="reserved">🔒 Reserved</option>
          </select>
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="tickets-grid-section">
        <div className="section-header">
          <h3> Ticket Collection</h3>
          <span className="ticket-count">{filteredTickets.length} tickets</span>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="no-data">
            <span>📭</span>
            <p>No tickets found</p>
            <p className="no-data-hint">Select a game to view tickets</p>
          </div>
        ) : (
          <div className="tickets-grid">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className={`ticket-card ${getStatusColor(ticket.status)}`}
              >
                <div className="ticket-header">
                  <div className="ticket-number-section">
                    <span className="ticket-number">{ticket.ticketNumber}</span>
                    <span className="ticket-price-badge">
                      {ticket.price && ticket.price !== "N/A" ? ` ₹${ticket.price}` : " Price N/A"}
                    </span>
                  </div>
                  <span className={`ticket-status-badge ${getStatusColor(ticket.status)}`}>
                    {getStatusText(ticket.status)}
                  </span>
                </div>

                {ticket.playerName !== "-" && (
                  <div className="ticket-player">
                    <span className="player-icon">👤</span>
                    <span>{ticket.playerName}</span>
                  </div>
                )}

                {ticket.phone !== "-" && (
                  <div className="ticket-phone">
                    <span className="phone-icon">📞</span>
                    <span>{ticket.phone}</span>
                  </div>
                )}

                {/* Ticket Numbers Grid - 3x9 */}
                {ticket.ticketData && Array.isArray(ticket.ticketData) && ticket.ticketData.length > 0 && (
                  <div className="ticket-numbers-grid">
                    {ticket.ticketData.map((row, rowIdx) => (
                      <div key={rowIdx} className="ticket-row">
                        {Array.isArray(row) ? row.map((num, colIdx) => (
                          <div
                            key={colIdx}
                            className={`ticket-number-cell ${num === null || num === undefined ? "empty" : "filled"}`}
                          >
                            {num !== null && num !== undefined ? num : ""}
                          </div>
                        )) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}