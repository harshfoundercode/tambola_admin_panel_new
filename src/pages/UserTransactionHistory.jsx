import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getUserGameHistoryAPI } from "../services/api";
import { toast } from "react-toastify";
import "../styles/UserTransactionHistory.css";

function UserTransactionHistory() {
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
    fetchTransactionHistory();
  }, [userId]);

  const fetchTransactionHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserGameHistoryAPI(userId);
      if (response.data) {
        setData(response.data);
      } else {
        setError("No transaction history found");
      }
    } catch (err) {
      console.error("Error fetching transaction history:", err);
      setError(err.message || "Failed to load transaction history");
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

  const getResultBadge = (result) => {
    return (
      <span className={`result-badge ${result}`}>
        {result === "win" ? "🏆 Win" : "❌ Loss"}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      success: { text: "✅ Success", class: "success" },
      pending: { text: "⏳ Pending", class: "pending" },
      failed: { text: "❌ Failed", class: "failed" }
    };
    const statusInfo = statusMap[status] || { text: status, class: "default" };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading transaction history...</p>
      </div>
    );
  }

  return (
    <div className="transaction-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate("/player-details")}>
          ← Back to Players
        </button>
        <h2>Transaction History - {userName || `User #${userId}`}</h2>
      </div>

      {error ? (
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={fetchTransactionHistory} className="retry-btn">
            Try Again
          </button>
        </div>
      ) : data.length === 0 ? (
        <div className="no-data-container">
          <div className="no-data-icon">📊</div>
          <h3>No Transaction History</h3>
          <p>This user has no game transactions yet.</p>
        </div>
      ) : (
        <div className="transactions-container">
          {data.map((transaction, index) => (
            <div key={transaction.booking_id} className="transaction-card">
              <div className="transaction-header">
                <div className="transaction-info">
                  <h3>#{transaction.booking_id} - {transaction.game_title}</h3>
                  <p className="booking-time">{formatDate(transaction.booking_time)}</p>
                </div>
                <div className="transaction-badges">
                  {getStatusBadge(transaction.payment_status)}
                  {getResultBadge(transaction.result)}
                </div>
              </div>

              <div className="transaction-summary">
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="label">Total Amount</span>
                    <span className="value amount">₹{transaction.total_amount}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Total Tickets</span>
                    <span className="value">{transaction.total_user_tickets}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Total Winning</span>
                    <span className="value winning">₹{transaction.total_winning}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Game Status</span>
                    <span className={`value status-${transaction.game_status}`}>
                      {transaction.game_status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="tickets-section">
                <h4>Tickets ({transaction.tickets.length})</h4>
                <div className="tickets-grid">
                  {transaction.tickets.map((ticket) => (
                    <div key={ticket.ticket_id} className="ticket-card">
                      <div className="ticket-header">
                        <span className="ticket-number">Ticket #{ticket.ticket_number}</span>
                        <span className={`ticket-result ${ticket.result}`}>
                          {ticket.result === "win" ? "🏆" : "❌"}
                        </span>
                      </div>
                      <div className="ticket-details">
                        <div className="ticket-info">
                          <span>Price: ₹{ticket.price}</span>
                          <span>Type: {ticket.sheet_type}</span>
                          <span>Winning: ₹{ticket.total_winning}</span>
                        </div>
                        {ticket.winnings && ticket.winnings.length > 0 && (
                          <div className="winnings-list">
                            <strong>Winnings:</strong>
                            {ticket.winnings.map((win, idx) => (
                              <div key={idx} className="winning-item">
                                <span className="win-type">{win.win_type}</span>
                                <span className="win-amount">₹{win.amount}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserTransactionHistory;