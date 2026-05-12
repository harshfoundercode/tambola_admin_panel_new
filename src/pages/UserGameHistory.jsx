import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getUserGameHistoryAPI } from "../services/api";
import { toast } from "react-toastify";
import "../styles/UserGameHistory.css";

function UserGameHistory() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get("userId");
  const userName = searchParams.get("userName");
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      toast.error("User ID is required");
      navigate("/player-details");
      return;
    }
    fetchGameHistory();
  }, [userId]);

  const fetchGameHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserGameHistoryAPI(userId);
      if (response.data) {
        setData(response.data);
      } else {
        setError("No game history found");
      }
    } catch (err) {
      console.error("Error fetching game history:", err);
      setError(err.message || "Failed to load game history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getGameStatusBadge = (status) => {
    const statusMap = {
      upcoming: { text: "🕐 Upcoming", class: "upcoming" },
      live: { text: "🔴 Live", class: "live" },
      completed: { text: "✅ Completed", class: "completed" },
      cancelled: { text: "❌ Cancelled", class: "cancelled" }
    };
    const statusInfo = statusMap[status] || { text: status, class: "default" };
    return <span className={`game-status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const getResultBadge = (result) => {
    return (
      <span className={`result-badge ${result}`}>
        {result === "win" ? "🏆 Win" : "❌ Loss"}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading game history...</p>
      </div>
    );
  }

  return (
    <div className="game-history-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate("/player-details")}>
          ← Back to Players
        </button>
        <h2>Game History - {userName || `User #${userId}`}</h2>
      </div>

      {error ? (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={fetchGameHistory} className="retry-btn">
            Try Again
          </button>
        </div>
      ) : data.length === 0 ? (
        <div className="no-data-container">
          <div className="no-data-icon">🎮</div>
          <h3>No Game History</h3>
          <p>This user hasn't participated in any games yet.</p>
        </div>
      ) : (
        <div className="games-container">
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-number">{data.length}</span>
              <span className="stat-label">Total Games</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{data.filter(g => g.result === "win").length}</span>
              <span className="stat-label">Games Won</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">₹{data.reduce((sum, g) => sum + g.total_amount, 0)}</span>
              <span className="stat-label">Total Spent</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">₹{data.reduce((sum, g) => sum + g.total_winning, 0)}</span>
              <span className="stat-label">Total Won</span>
            </div>
          </div>

          <div className="games-grid">
            {data.map((game) => (
              <div key={game.booking_id} className="game-card">
                <div className="game-header">
                  <div className="game-info">
                    <h3>{game.game_title}</h3>
                    <p className="game-id">Booking #{game.booking_id}</p>
                  </div>
                  <div className="game-badges">
                    {getGameStatusBadge(game.game_status)}
                    {getResultBadge(game.result)}
                  </div>
                </div>

                <div className="game-details">
                  <div className="detail-row">
                    <span className="label">Game ID:</span>
                    <span className="value">{game.game_id || "-"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Booking Time:</span>
                    <span className="value">{game.booking_time ? formatDate(game.booking_time) : "-"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Total Amount:</span>
                    <span className="value amount">₹{game.total_amount || 0}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Tickets Purchased:</span>
                    <span className="value">{game.total_user_tickets || "-"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Total Winning:</span>
                    <span className="value winning">₹{game.total_winning || 0}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Agent Commission:</span>
                    <span className="value">₹{game.agent_commission || 0}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Payment Status:</span>
                    <span className={`value payment-${game.payment_status || 'unknown'}`}>
                      {game.payment_status || "-"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Payment Method:</span>
                    <span className="value">{game.payment_method || "-"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Payment ID:</span>
                    <span className="value">{game.payment_id || "-"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Paid At:</span>
                    <span className="value">{game.paid_at ? formatDate(game.paid_at) : "-"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Ticket Price:</span>
                    <span className="value">₹{game.ticket_price || 0}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Total Game Tickets:</span>
                    <span className="value">{game.total_tickets || "-"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Start DateTime:</span>
                    <span className="value">{game.start_datetime ? formatDate(game.start_datetime) : "-"}</span>
                  </div>
                </div>

                <div className="tickets-summary">
                  <h4>Tickets Summary ({game.tickets?.length || 0})</h4>
                  <div className="tickets-stats">
                    <div className="ticket-stat">
                      <span className="ticket-count">{game.tickets?.length || 0}</span>
                      <span className="ticket-label">Total Tickets</span>
                    </div>
                    <div className="ticket-stat">
                      <span className="ticket-count">{game.tickets?.filter(t => t.result === "win").length || 0}</span>
                      <span className="ticket-label">Winning Tickets</span>
                    </div>
                    <div className="ticket-stat">
                      <span className="ticket-count">{game.tickets?.filter(t => t.result === "loss").length || 0}</span>
                      <span className="ticket-label">Losing Tickets</span>
                    </div>
                  </div>
                  
                  {game.tickets && game.tickets.length > 0 && (
                    <div className="tickets-list">
                      <h5>Individual Tickets</h5>
                      <div className="tickets-grid-detail">
                        {game.tickets.map((ticket) => (
                          <div key={ticket.ticket_id} className="ticket-detail-card">
                            <div className="ticket-header-detail">
                              <span className="ticket-number">#{ticket.ticket_number || "-"}</span>
                              <span className={`ticket-result ${ticket.result || 'unknown'}`}>
                                {ticket.result === "win" ? "🏆" : ticket.result === "loss" ? "❌" : "-"}
                              </span>
                            </div>
                            <div className="ticket-info-grid">
                              <div className="ticket-info-item">
                                <span className="info-label">Price:</span>
                                <span className="info-value">₹{ticket.price || 0}</span>
                              </div>
                              <div className="ticket-info-item">
                                <span className="info-label">Type:</span>
                                <span className="info-value">{ticket.sheet_type || "-"}</span>
                              </div>
                              <div className="ticket-info-item">
                                <span className="info-label">Status:</span>
                                <span className="info-value">{ticket.ticket_status || "-"}</span>
                              </div>
                              <div className="ticket-info-item">
                                <span className="info-label">Claimed:</span>
                                <span className="info-value">{ticket.is_claimed ? "Yes" : "No"}</span>
                              </div>
                              <div className="ticket-info-item">
                                <span className="info-label">Winning:</span>
                                <span className="info-value winning">₹{ticket.total_winning || 0}</span>
                              </div>
                              <div className="ticket-info-item">
                                <span className="info-label">Created:</span>
                                <span className="info-value">{ticket.ticket_created_at ? formatDate(ticket.ticket_created_at) : "-"}</span>
                              </div>
                              <div className="ticket-info-item">
                                <span className="info-label">Round ID:</span>
                                <span className="info-value">{ticket.round_id || "-"}</span>
                              </div>
                              <div className="ticket-info-item">
                                <span className="info-label">Round Time:</span>
                                <span className="info-value">{ticket.round_time ? formatDate(ticket.round_time) : "-"}</span>
                              </div>
                            </div>
                            {ticket.winnings && ticket.winnings.length > 0 && (
                              <div className="ticket-winnings">
                                <strong>Winnings:</strong>
                                {ticket.winnings.map((win, idx) => (
                                  <div key={idx} className="winning-detail">
                                    <span className="win-type">{win.win_type || "-"}</span>
                                    <span className="win-amount">₹{win.amount || 0}</span>
                                    <span className="win-date">{win.created_at ? formatDate(win.created_at) : "-"}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {game.tickets && game.tickets.some(t => t.winnings && t.winnings.length > 0) && (
                  <div className="winnings-summary">
                    <h4>Prize Breakdown</h4>
                    <div className="prize-list">
                      {game.tickets.map(ticket => 
                        ticket.winnings && ticket.winnings.length > 0 ? (
                          ticket.winnings.map((win, idx) => (
                            <div key={`${ticket.ticket_id}-${idx}`} className="prize-item">
                              <span className="prize-type">{win.win_type || "-"}</span>
                              <span className="prize-amount">₹{win.amount || 0}</span>
                              <span className="ticket-ref">Ticket #{ticket.ticket_number || "-"}</span>
                              <span className="prize-date">{win.created_at ? formatDate(win.created_at) : "-"}</span>
                            </div>
                          ))
                        ) : null
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserGameHistory;