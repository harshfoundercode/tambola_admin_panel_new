// Agents.jsx - Fixed Double Popup with stopPropagation
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAllAgentAPI, updateAgentStatusAPI } from "../services/api";
import { FaEdit, FaEye, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { toast } from 'react-toastify';
import "../styles/PlayersDetail.css";

function Agents() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState(null);
  
  // ✅ New states for bookings
  const [agentBookings, setAgentBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);
  const [bookingsSummary, setBookingsSummary] = useState(null);
  const [bookingsPagination, setBookingsPagination] = useState(null);
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [bookingSearchTerm, setBookingSearchTerm] = useState("");
  
  // ✅ Prevent double popup
  const isProcessingRef = useRef(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllAgentAPI();
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.message || "Failed to load agents");
      }
    } catch (err) {
      setError(err.message || "Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch agent bookings
  const fetchAgentBookings = async (agentId, page = 1, status = "all", search = "") => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      toast.error("Please login first");
      return;
    }

    try {
      setBookingsLoading(true);
      setBookingsError(null);
      
      let url = `https://api.luckyfunda.com/api/agent/admin/panel/bookings?agent_id=${agentId}&page=${page}&limit=10`;
      
      if (status && status !== "all") {
        url += `&status=${status}`;
      }
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      console.log("Fetching bookings URL:", url);
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const result = await response.json();
      console.log("Bookings Response:", result);

      if (response.status === 401) {
        toast.error("Session expired. Please login again");
        localStorage.removeItem("token");
        return;
      }

      if (result.success && result.data) {
        setAgentBookings(result.data.bookings || []);
        setBookingsSummary(result.data.summary || null);
        setBookingsPagination(result.data.pagination || null);
        console.log("✅ Bookings set:", result.data.bookings?.length || 0);
      } else {
        setBookingsError(result.message || "Failed to fetch bookings");
        setAgentBookings([]);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setBookingsError(err.message || "Failed to load bookings");
      setAgentBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  // Toggle agent status
  const toggleAgentStatus = async (agent) => {
    if (updatingStatus === agent.agent_id) return;
    
    setUpdatingStatus(agent.agent_id);
    const newStatus = agent.status === "active" ? "inactive" : "active";
    
    try {
      const response = await updateAgentStatusAPI(agent.agent_id, newStatus);
      
      if (response.success) {
        setData(prevData => 
          prevData.map(item => 
            item.agent_id === agent.agent_id 
              ? { ...item, status: newStatus }
              : item
          )
        );
        toast.success(`Agent ${newStatus === "active" ? "activated" : "deactivated"} successfully!`);
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // ✅ Handle view agent with bookings - FIXED
  const handleViewAgent = (e, agent) => {
    // ✅ Stop event propagation
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    // ✅ Prevent double call
    if (isProcessingRef.current) {
      console.log("⚠️ Already processing, skipping");
      return;
    }
    
    isProcessingRef.current = true;
    
    console.log("👁️ Opening view for agent:", agent.agent_id);
    
    setSelectedAgent(agent);
    setBookingPage(1);
    setBookingStatusFilter("all");
    setBookingSearchTerm("");
    fetchAgentBookings(agent.agent_id, 1, "all", "");
    
    // Reset processing flag after a delay
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 500);
  };

  // ✅ Close modal handler
  const handleCloseModal = () => {
    isProcessingRef.current = false;
    setSelectedAgent(null);
    setAgentBookings([]);
    setBookingsSummary(null);
    setBookingsPagination(null);
  };

  // ✅ Handle booking filter change
  const handleBookingFilterChange = (status) => {
    setBookingStatusFilter(status);
    setBookingPage(1);
    if (selectedAgent) {
      fetchAgentBookings(selectedAgent.agent_id, 1, status, bookingSearchTerm);
    }
  };

  // ✅ Handle booking search
  const handleBookingSearch = () => {
    if (selectedAgent) {
      setBookingPage(1);
      fetchAgentBookings(selectedAgent.agent_id, 1, bookingStatusFilter, bookingSearchTerm);
    }
  };

  // ✅ Handle booking page change
  const handleBookingPageChange = (newPage) => {
    setBookingPage(newPage);
    if (selectedAgent) {
      fetchAgentBookings(selectedAgent.agent_id, newPage, bookingStatusFilter, bookingSearchTerm);
    }
  };

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.whatsapp_number?.includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && item.status === "active") ||
      (statusFilter === "inactive" && item.status !== "active");
    return matchesSearch && matchesStatus;
  });

  // ✅ ViewAgentModal component
  const ViewAgentModal = ({ agent, onClose }) => {
    if (!agent) return null;
    const initials = agent.name
      ? agent.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
      : "AG";

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content booking-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "900px" }}>

          {/* Header */}
          <div className="modal-hero">
            <button className="modal-close" onClick={onClose}>×</button>
            <div className="modal-avatar">{initials}</div>
            <h3>{agent.name}</h3>
            <div className="modal-meta">
              <span>📱 {agent.whatsapp_number || "—"}</span>
              <span className={`kyc-pill ${agent.status === "active" ? "verified" : "unverified"}`}>
                {agent.status === "active" ? "✓ Active" : "✗ Inactive"}
              </span>
            </div>
          </div>

          <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>

            {/* Financial Summary */}
            <p className="section-label">Financial Summary</p>
            <div className="fin-grid">
              <div className="fin-card blue">
                <span className="fin-icon">🎟️</span>
                <span className="fin-val">{agent.total_sold ?? 0}</span>
                <span className="fin-lbl">Total Sold</span>
              </div>
              <div className="fin-card green">
                <span className="fin-icon">💰</span>
                <span className="fin-val">₹{agent.total_earning ?? "0.00"}</span>
                <span className="fin-lbl">Total Earning</span>
              </div>
              <div className="fin-card purple">
                <span className="fin-icon">🏷️</span>
                <span className="fin-val">{agent.commission_per_ticket ?? "—"}</span>
                <span className="fin-lbl">Commission/Ticket</span>
              </div>
            </div>

            {/* Agent Info */}
            <p className="section-label">Contact Info</p>
            <div className="info-rows">
              <div className="info-row">
                <span className="info-key">Agent ID</span>
                <span className="info-val">#{agent.agent_id}</span>
              </div>
              <div className="info-row">
                <span className="info-key">Email</span>
                <span className="info-val">{agent.email || "—"}</span>
              </div>
              <div className="info-row">
                <span className="info-key">Telegram</span>
                <span className="info-val">{agent.telegram_username || "—"}</span>
              </div>
              <div className="info-row">
                <span className="info-key">SMS Number</span>
                <span className="info-val">{agent.sms_number || "—"}</span>
              </div>
              <div className="info-row">
                <span className="info-key">Joined</span>
                <span className="info-val">
                  {agent.created_at ? new Date(agent.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                </span>
              </div>
            </div>

            {/* Bookings Section */}
            <div style={{ marginTop: "20px", borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                  📋 Bookings
                </h4>
                {bookingsSummary && (
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>
                    Total: <strong>{bookingsSummary.total_bookings || 0}</strong>
                  </span>
                )}
              </div>

              {/* Booking Filters */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  {["all", "confirmed", "pending", "cancelled"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleBookingFilterChange(status)}
                      style={{
                        padding: "4px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "500",
                        border: "1px solid #e5e7eb",
                        backgroundColor: bookingStatusFilter === status ? "#004296" : "white",
                        color: bookingStatusFilter === status ? "white" : "#374151",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "4px", flex: "1", minWidth: "150px" }}>
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={bookingSearchTerm}
                    onChange={(e) => setBookingSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleBookingSearch()}
                    style={{
                      flex: 1,
                      padding: "4px 10px",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      fontSize: "12px",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={handleBookingSearch}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "500",
                      backgroundColor: "#004296",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Bookings Loading */}
              {bookingsLoading && (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <div className="spinner-small" style={{ margin: "0 auto" }}></div>
                  <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "8px" }}>Loading bookings...</p>
                </div>
              )}

              {/* Bookings Error */}
              {bookingsError && !bookingsLoading && (
                <div style={{ 
                  textAlign: "center", 
                  padding: "16px", 
                  backgroundColor: "#fee2e2", 
                  borderRadius: "8px",
                  color: "#991b1b",
                  fontSize: "13px"
                }}>
                  {bookingsError}
                  <button
                    onClick={() => fetchAgentBookings(agent.agent_id, bookingPage, bookingStatusFilter, bookingSearchTerm)}
                    style={{
                      display: "block",
                      margin: "8px auto 0",
                      padding: "4px 16px",
                      backgroundColor: "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Bookings List */}
              {!bookingsLoading && !bookingsError && (
                <>
                  {!agentBookings || agentBookings.length === 0 ? (
                    <div style={{ 
                      textAlign: "center", 
                      padding: "24px", 
                      backgroundColor: "#f9fafb", 
                      borderRadius: "8px",
                      color: "#6b7280",
                      fontSize: "14px"
                    }}>
                      📭 No bookings found
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ 
                        width: "100%", 
                        borderCollapse: "collapse",
                        fontSize: "13px",
                      }}>
                        <thead>
                          <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                            <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "600", color: "#6b7280" }}>Booking ID</th>
                            <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "600", color: "#6b7280" }}>Customer</th>
                            <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "600", color: "#6b7280" }}>Game</th>
                            <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "600", color: "#6b7280" }}>Tickets</th>
                            <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "600", color: "#6b7280" }}>Amount</th>
                            <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "600", color: "#6b7280" }}>Status</th>
                            <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: "600", color: "#6b7280" }}>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {agentBookings.map((booking, index) => (
                            <tr key={booking.booking_id || index} style={{ borderBottom: "1px solid #f3f4f6" }}>
                              <td style={{ padding: "8px 12px", fontFamily: "monospace", color: "#6b7280", fontSize: "12px" }}>
                                #{booking.booking_id || booking.booking_number}
                              </td>
                              <td style={{ padding: "8px 12px", fontWeight: "500", color: "#374151" }}>
                                {booking.customer?.name || "—"}
                                <div style={{ fontSize: "11px", color: "#6b7280" }}>
                                  {booking.customer?.phone || ""}
                                </div>
                              </td>
                              <td style={{ padding: "8px 12px", fontWeight: "500", color: "#374151", fontSize: "12px" }}>
                                {booking.game?.game_name || "—"}
                              </td>
                              <td style={{ padding: "8px 12px", textAlign: "center" }}>
                                {booking.booking_details?.total_tickets || booking.tickets?.length || 0}
                              </td>
                              <td style={{ padding: "8px 12px", fontWeight: "600", color: "#004296" }}>
                                ₹{booking.booking_details?.total_amount || 0}
                              </td>
                              <td style={{ padding: "8px 12px" }}>
                                <span style={{
                                  padding: "2px 10px",
                                  borderRadius: "12px",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  backgroundColor: booking.status_color === "green" ? "#d1fae5" : 
                                    booking.status_color === "yellow" ? "#fef3c7" : "#fee2e2",
                                  color: booking.status_color === "green" ? "#065f46" :
                                    booking.status_color === "yellow" ? "#92400e" : "#991b1b",
                                }}>
                                  {booking.status_label || booking.booking_details?.booking_status || "—"}
                                </span>
                              </td>
                              <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: "12px" }}>
                                {booking.booking_details?.created_at ? 
                                  new Date(booking.booking_details.created_at).toLocaleDateString("en-IN") : 
                                  "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination */}
                  {bookingsPagination && bookingsPagination.total_pages > 1 && (
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "center", 
                      alignItems: "center", 
                      gap: "8px", 
                      marginTop: "12px",
                      padding: "8px"
                    }}>
                      <button
                        onClick={() => handleBookingPageChange(bookingPage - 1)}
                        disabled={bookingPage <= 1}
                        style={{
                          padding: "4px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          border: "1px solid #e5e7eb",
                          backgroundColor: bookingPage <= 1 ? "#f3f4f6" : "white",
                          color: bookingPage <= 1 ? "#9ca3af" : "#374151",
                          cursor: bookingPage <= 1 ? "not-allowed" : "pointer",
                        }}
                      >
                        ←
                      </button>
                      <span style={{ fontSize: "13px", color: "#6b7280" }}>
                        Page {bookingPage} of {bookingsPagination.total_pages}
                      </span>
                      <button
                        onClick={() => handleBookingPageChange(bookingPage + 1)}
                        disabled={bookingPage >= bookingsPagination.total_pages}
                        style={{
                          padding: "4px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          border: "1px solid #e5e7eb",
                          backgroundColor: bookingPage >= bookingsPagination.total_pages ? "#f3f4f6" : "white",
                          color: bookingPage >= bookingsPagination.total_pages ? "#9ca3af" : "#374151",
                          cursor: bookingPage >= bookingsPagination.total_pages ? "not-allowed" : "pointer",
                        }}
                      >
                        →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button className="close-btn" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading agents...</p>
      </div>
    );
  }

  return (
    <div className="page-container">

      <h2 className="page-heading">Agent Management</h2>

      <div className="page-header">
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-value">{data.length}</div>
            <div className="stat-label">Total Agents</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{data.filter(d => d.status === "active").length}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{data.filter(d => d.status !== "active").length}</div>
            <div className="stat-label">Inactive</div>
          </div>
          <div className="stat-card">
            <div className="stat-value"
              style={{ cursor: "pointer", color: "#1E3A8A" }}
              onClick={() => navigate("/create-agent")}
            >
              + Add
            </div>
            <div className="stat-label">New Agent</div>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-bar">
          <svg className="search-icon" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="#94a3b8" strokeWidth="1.8" />
            <path d="M13.5 13.5L17 17" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email or WhatsApp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="clear-btn">✕</button>
          )}
        </div>
        <div className="filter-tabs">
          <span className="filter-label">Status:</span>
          {["all", "active", "inactive"].map((f) => (
            <button
              key={f}
              className={`filter-tab ${statusFilter === f ? "active" : ""}`}
              onClick={() => setStatusFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="table-container">
        {error ? (
          <div className="pd-error-wrap">
            <div className="pd-error-icon">⚠️</div>
            <h3 className="pd-error-title">Failed to Load Agents</h3>
            <p className="pd-error-msg">{error}</p>
            <button onClick={fetchAgents} className="pd-error-btn">
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Try Again
            </button>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>WhatsApp</th>
                <th>Telegram</th>
                <th>Total Sold</th>
                <th>Total Earning</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((agent, index) => (
                  <tr key={agent.agent_id}>
                    <td>{index + 1}</td>
                    <td className="player-name">{agent.name || "—"}</td>
                    <td>{agent.email || "—"}</td>
                    <td>{agent.whatsapp_number || "—"}</td>
                    <td>{agent.telegram_username || "—"}</td>
                    <td className="text-center">{agent.total_sold ?? 0}</td>
                    <td className="amount">₹{agent.total_earning ?? "0.00"}</td>
                    <td className="status-cell">
                      <button
                        className={`status-toggle-btn ${agent.status === "active" ? "active" : "inactive"}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          toggleAgentStatus(agent);
                        }}
                        disabled={updatingStatus === agent.agent_id}
                      >
                        {updatingStatus === agent.agent_id ? (
                          <span className="spinner-small"></span>
                        ) : (
                          <>
                            {agent.status === "active" ? (
                              <FaToggleOn size={18} />
                            ) : (
                              <FaToggleOff size={18} />
                            )}
                            <span>{agent.status === "active" ? "Active" : "Inactive"}</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="action-cell">
                      {/* ✅ FIXED: Complete stopPropagation + preventDefault */}
                      <button
                        className="action-btn view-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleViewAgent(e, agent);
                        }}
                        onMouseDown={(e) => {
                          // ✅ Prevent focus stealing
                          e.preventDefault();
                        }}
                      >
                        <FaEye size={12} />
                        <span>View</span>
                      </button>

                      <button
                        className="action-btn edit-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          navigate('/create-agent', { state: agent });
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                        }}
                      >
                        <FaEdit size={12} />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    <div>No agents found</div>
                    <small>Try adjusting your search</small>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedAgent && (
        <ViewAgentModal
          agent={selectedAgent}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default Agents;