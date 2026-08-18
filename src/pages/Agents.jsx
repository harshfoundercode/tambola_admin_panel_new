// Agents.jsx - Fixed: no double popup, no duplicate API calls
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllAgentAPI, updateAgentStatusAPI } from "../services/api";
import { FaEdit, FaEye, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { toast } from "react-toastify";
import "../styles/PlayersDetail.css";

// ✅ Moved OUTSIDE the Agents component.
// Defining it inside Agents meant a brand-new function/component identity was
// created on every re-render (e.g. when booking state updated), which made
// React unmount + remount the modal -> looked like the popup "regenerated"
// itself right after the bookings API call finished.
function ViewAgentModal({
  agent,
  onClose,
  agentBookings,
  bookingsLoading,
  bookingsError,
  bookingsSummary,
  bookingsPagination,
  bookingPage,
  bookingStatusFilter,
  bookingSearchTerm,
  onSearchTermChange,
  onFilterChange,
  onSearch,
  onPageChange,
  onRetry,
}) {
  if (!agent) return null;

  const initials = agent.name
    ? agent.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "AG";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content booking-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "1000px", maxHeight: "90vh", overflow: "hidden" }}
      >
        {/* Header */}
        <div className="modal-hero" style={{ position: "sticky", top: 0, zIndex: 10 }}>
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

        <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto", padding: "20px" }}>
          {/* Full Agent Details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div style={{ backgroundColor: "#f8fafc", borderRadius: "12px", padding: "16px" }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "#004296" }}>
                👤 Personal Information
              </h4>
              <div style={{ display: "grid", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", borderBottom: "1px solid #e5e7eb", padding: "4px 0" }}>
                  <span style={{ color: "#6b7280" }}>Agent ID</span>
                  <span style={{ fontWeight: "500", color: "#111827" }}>#{agent.agent_id}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", borderBottom: "1px solid #e5e7eb", padding: "4px 0" }}>
                  <span style={{ color: "#6b7280" }}>Name</span>
                  <span style={{ fontWeight: "500", color: "#111827" }}>{agent.name || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", borderBottom: "1px solid #e5e7eb", padding: "4px 0" }}>
                  <span style={{ color: "#6b7280" }}>Email</span>
                  <span style={{ fontWeight: "500", color: "#111827" }}>{agent.email || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", borderBottom: "1px solid #e5e7eb", padding: "4px 0" }}>
                  <span style={{ color: "#6b7280" }}>Password</span>
                  <span style={{ fontWeight: "500", color: "#111827" }}>{agent.password || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", borderBottom: "1px solid #e5e7eb", padding: "4px 0" }}>
                  <span style={{ color: "#6b7280" }}>Status</span>
                  <span style={{ fontWeight: "500", color: agent.status === "active" ? "#059669" : "#dc2626" }}>
                    {agent.status === "active" ? "✅ Active" : "❌ Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: "#f8fafc", borderRadius: "12px", padding: "16px" }}>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "#004296" }}>
                📱 Contact Information
              </h4>
              <div style={{ display: "grid", gap: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", borderBottom: "1px solid #e5e7eb", padding: "4px 0" }}>
                  <span style={{ color: "#6b7280" }}>WhatsApp</span>
                  <span style={{ fontWeight: "500", color: "#111827" }}>{agent.whatsapp_number || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", borderBottom: "1px solid #e5e7eb", padding: "4px 0" }}>
                  <span style={{ color: "#6b7280" }}>Telegram</span>
                  <span style={{ fontWeight: "500", color: "#111827" }}>{agent.telegram_username || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", borderBottom: "1px solid #e5e7eb", padding: "4px 0" }}>
                  <span style={{ color: "#6b7280" }}>SMS Number</span>
                  <span style={{ fontWeight: "500", color: "#111827" }}>{agent.sms_number || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", borderBottom: "1px solid #e5e7eb", padding: "4px 0" }}>
                  <span style={{ color: "#6b7280" }}>Commission/Ticket</span>
                  <span style={{ fontWeight: "500", color: "#111827" }}>{agent.commission_per_ticket || "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", borderBottom: "1px solid #e5e7eb", padding: "4px 0" }}>
                  <span style={{ color: "#6b7280" }}>Joined</span>
                  <span style={{ fontWeight: "500", color: "#111827" }}>
                    {agent.created_at
                      ? new Date(agent.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div style={{ backgroundColor: "#f8fafc", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
            <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600", color: "#004296" }}>
              💰 Financial Summary
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
              <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "12px", textAlign: "center", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#004296" }}>{agent.total_sold ?? 0}</div>
                <div style={{ fontSize: "11px", color: "#6b7280" }}>Total Sold</div>
              </div>
              <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "12px", textAlign: "center", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#059669" }}>₹{agent.total_earning ?? "0.00"}</div>
                <div style={{ fontSize: "11px", color: "#6b7280" }}>Total Earning</div>
              </div>
              <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "12px", textAlign: "center", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#8b5cf6" }}>{agent.commission_per_ticket || "—"}</div>
                <div style={{ fontSize: "11px", color: "#6b7280" }}>Commission/Ticket</div>
              </div>
            </div>
          </div>

          {/* Bookings Section */}
          <div style={{ backgroundColor: "#f8fafc", borderRadius: "12px", padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#004296" }}>📋 Bookings</h4>
              {bookingsSummary && (
                <span style={{ fontSize: "12px", color: "#6b7280" }}>
                  Total: <strong>{bookingsSummary.total_bookings || 0}</strong>
                </span>
              )}
            </div>

            {/* Booking Filters */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
              {["all", "confirmed", "pending", "cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => onFilterChange(status)}
                  style={{
                    padding: "3px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
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
              <div style={{ display: "flex", gap: "4px", flex: "1", minWidth: "120px" }}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={bookingSearchTerm}
                  onChange={(e) => onSearchTermChange(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && onSearch()}
                  style={{
                    flex: 1,
                    padding: "3px 8px",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    fontSize: "11px",
                    outline: "none",
                  }}
                />
                <button
                  onClick={onSearch}
                  style={{
                    padding: "3px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
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
              <div style={{ textAlign: "center", padding: "15px" }}>
                <div className="spinner-small" style={{ margin: "0 auto" }}></div>
                <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>Loading bookings...</p>
              </div>
            )}

            {/* Bookings Error */}
            {bookingsError && !bookingsLoading && (
              <div style={{ textAlign: "center", padding: "12px", backgroundColor: "#fee2e2", borderRadius: "8px", color: "#991b1b", fontSize: "12px" }}>
                {bookingsError}
                <button
                  onClick={onRetry}
                  style={{
                    display: "block",
                    margin: "6px auto 0",
                    padding: "3px 14px",
                    backgroundColor: "#dc2626",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "11px",
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
                  <div style={{ textAlign: "center", padding: "16px", backgroundColor: "#f9fafb", borderRadius: "8px", color: "#6b7280", fontSize: "13px" }}>
                    📭 No bookings found
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                          <th style={{ padding: "6px 10px", textAlign: "left", fontWeight: "600", color: "#6b7280" }}>ID</th>
                          <th style={{ padding: "6px 10px", textAlign: "left", fontWeight: "600", color: "#6b7280" }}>Customer</th>
                          <th style={{ padding: "6px 10px", textAlign: "left", fontWeight: "600", color: "#6b7280" }}>Game</th>
                          <th style={{ padding: "6px 10px", textAlign: "center", fontWeight: "600", color: "#6b7280" }}>Tickets</th>
                          <th style={{ padding: "6px 10px", textAlign: "center", fontWeight: "600", color: "#6b7280" }}>Amount</th>
                          <th style={{ padding: "6px 10px", textAlign: "center", fontWeight: "600", color: "#6b7280" }}>Status</th>
                          <th style={{ padding: "6px 10px", textAlign: "center", fontWeight: "600", color: "#6b7280" }}>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {agentBookings.slice(0, 5).map((booking, index) => (
                          <tr key={booking.booking_id || index} style={{ borderBottom: "1px solid #f3f4f6" }}>
                            <td style={{ padding: "6px 10px", fontFamily: "monospace", color: "#6b7280", fontSize: "11px" }}>
                              #{booking.booking_id}
                            </td>
                            <td style={{ padding: "6px 10px", fontWeight: "500", color: "#374151" }}>
                              {booking.customer?.name || "—"}
                              <div style={{ fontSize: "10px", color: "#6b7280" }}>{booking.customer?.phone || ""}</div>
                            </td>
                            <td style={{ padding: "6px 10px", fontSize: "11px", color: "#374151" }}>{booking.game?.game_name || "—"}</td>
                            <td style={{ padding: "6px 10px", textAlign: "center" }}>{booking.booking_details?.total_tickets || 0}</td>
                            <td style={{ padding: "6px 10px", textAlign: "center", fontWeight: "600", color: "#004296" }}>
                              ₹{booking.booking_details?.total_amount || 0}
                            </td>
                            <td style={{ padding: "6px 10px", textAlign: "center" }}>
                              <span
                                style={{
                                  padding: "2px 8px",
                                  borderRadius: "10px",
                                  fontSize: "10px",
                                  fontWeight: "600",
                                  backgroundColor:
                                    booking.status_color === "green"
                                      ? "#d1fae5"
                                      : booking.status_color === "yellow"
                                      ? "#fef3c7"
                                      : "#fee2e2",
                                  color:
                                    booking.status_color === "green"
                                      ? "#065f46"
                                      : booking.status_color === "yellow"
                                      ? "#92400e"
                                      : "#991b1b",
                                }}
                              >
                                {booking.status_label || "—"}
                              </span>
                            </td>
                            <td style={{ padding: "6px 10px", textAlign: "center", color: "#6b7280", fontSize: "11px" }}>
                              {booking.booking_details?.created_at
                                ? new Date(booking.booking_details.created_at).toLocaleDateString("en-IN")
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {agentBookings.length > 5 && (
                      <div style={{ textAlign: "center", padding: "8px", fontSize: "11px", color: "#6b7280" }}>
                        + {agentBookings.length - 5} more bookings
                      </div>
                    )}
                  </div>
                )}

                {/* Pagination */}
                {bookingsPagination && bookingsPagination.total_pages > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", marginTop: "10px" }}>
                    <button
                      onClick={() => onPageChange(bookingPage - 1)}
                      disabled={bookingPage <= 1}
                      style={{
                        padding: "3px 10px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        border: "1px solid #e5e7eb",
                        backgroundColor: bookingPage <= 1 ? "#f3f4f6" : "white",
                        color: bookingPage <= 1 ? "#9ca3af" : "#374151",
                        cursor: bookingPage <= 1 ? "not-allowed" : "pointer",
                      }}
                    >
                      ←
                    </button>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      Page {bookingPage} of {bookingsPagination.total_pages}
                    </span>
                    <button
                      onClick={() => onPageChange(bookingPage + 1)}
                      disabled={bookingPage >= bookingsPagination.total_pages}
                      style={{
                        padding: "3px 10px",
                        borderRadius: "6px",
                        fontSize: "11px",
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

        <div className="modal-footer" style={{ position: "sticky", bottom: 0, backgroundColor: "white", borderTop: "1px solid #e5e7eb" }}>
          <button className="close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function Agents() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Booking States
  const [agentBookings, setAgentBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState(null);
  const [bookingsSummary, setBookingsSummary] = useState(null);
  const [bookingsPagination, setBookingsPagination] = useState(null);
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [bookingSearchTerm, setBookingSearchTerm] = useState("");

  // ✅ Blocks a second click while the first "open modal" click is still being processed
  const [opening, setOpening] = useState(false);

  // ✅ Bump this to force-retry the SAME filters/page (Retry button)
  const [retryTick, setRetryTick] = useState(0);

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

  // ✅ SINGLE source of truth for fetching bookings.
  // This effect fires whenever selectedAgent / page / filter / retryTick changes.
  // Because it's declarative (driven by state, not by imperative function calls
  // scattered across handlers), there is no way for two overlapping requests to
  // both "win" and update state twice — and AbortController cancels any request
  // that becomes stale before it resolves.
  useEffect(() => {
    if (!selectedAgent) return;

    const controller = new AbortController();

    const fetchAgentBookings = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first");
        return;
      }

      try {
        setBookingsLoading(true);
        setBookingsError(null);

        let url = `https://api.luckyfunda.com/api/agent/admin/panel/bookings?agent_id=${selectedAgent.agent_id}&page=${bookingPage}&limit=10`;

        if (bookingStatusFilter && bookingStatusFilter !== "all") {
          url += `&status=${bookingStatusFilter}`;
        }
        if (bookingSearchTerm) {
          url += `&search=${encodeURIComponent(bookingSearchTerm)}`;
        }

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const result = await response.json();

        if (response.status === 401) {
          toast.error("Session expired. Please login again");
          localStorage.removeItem("token");
          return;
        }

        if (result.success && result.data) {
          setAgentBookings(result.data.bookings || []);
          setBookingsSummary(result.data.summary || null);
          setBookingsPagination(result.data.pagination || null);
        } else {
          setBookingsError(result.message || "Failed to fetch bookings");
          setAgentBookings([]);
        }
      } catch (err) {
        if (err.name === "AbortError") return; // stale request, ignore silently
        setBookingsError(err.message || "Failed to load bookings");
        setAgentBookings([]);
      } finally {
        setBookingsLoading(false);
      }
    };

    fetchAgentBookings();

    return () => controller.abort();
  }, [selectedAgent, bookingPage, bookingStatusFilter, bookingSearchTerm, retryTick]);

  // Toggle agent status
  const toggleAgentStatus = async (agent) => {
    if (updatingStatus === agent.agent_id) return;

    setUpdatingStatus(agent.agent_id);
    const newStatus = agent.status === "active" ? "inactive" : "active";

    try {
      const response = await updateAgentStatusAPI(agent.agent_id, newStatus);

      if (response.success) {
        setData((prevData) =>
          prevData.map((item) =>
            item.agent_id === agent.agent_id ? { ...item, status: newStatus } : item
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

  // ✅ Handle view agent — just sets state; the useEffect above does the fetching.
  const handleViewAgent = (e, agent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (opening) return; // blocks a fast double-click from opening twice

    setOpening(true);
    setBookingPage(1);
    setBookingStatusFilter("all");
    setBookingSearchTerm("");
    setAgentBookings([]);
    setBookingsSummary(null);
    setBookingsPagination(null);
    setSelectedAgent(agent);

    // small cooldown so a second rapid click on the same/other row is ignored
    setTimeout(() => setOpening(false), 400);
  };

  const handleCloseModal = () => {
    setSelectedAgent(null);
    setAgentBookings([]);
    setBookingsSummary(null);
    setBookingsPagination(null);
  };

  const handleBookingFilterChange = (status) => {
    setBookingStatusFilter(status);
    setBookingPage(1);
  };

  const handleBookingSearch = () => {
    setBookingPage(1);
    setRetryTick((t) => t + 1); // in case page/filter didn't change but user hit search again
  };

  const handleBookingPageChange = (newPage) => {
    setBookingPage(newPage);
  };

  const handleBookingRetry = () => {
    setRetryTick((t) => t + 1);
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
            <div className="stat-value">{data.filter((d) => d.status === "active").length}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{data.filter((d) => d.status !== "active").length}</div>
            <div className="stat-label">Inactive</div>
          </div>
          <div className="stat-card">
            <div
              className="stat-value"
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
            <button onClick={() => setSearchTerm("")} className="clear-btn">
              ✕
            </button>
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
                            {agent.status === "active" ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
                            <span>{agent.status === "active" ? "Active" : "Inactive"}</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="action-cell">
                      <button
                        className="action-btn view-action"
                        disabled={opening}
                        onClick={(e) => handleViewAgent(e, agent)}
                      >
                        <FaEye size={12} />
                        <span>View</span>
                      </button>
                      <button
                        className="action-btn edit-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          navigate("/create-agent", { state: agent });
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
          agentBookings={agentBookings}
          bookingsLoading={bookingsLoading}
          bookingsError={bookingsError}
          bookingsSummary={bookingsSummary}
          bookingsPagination={bookingsPagination}
          bookingPage={bookingPage}
          bookingStatusFilter={bookingStatusFilter}
          bookingSearchTerm={bookingSearchTerm}
          onSearchTermChange={setBookingSearchTerm}
          onFilterChange={handleBookingFilterChange}
          onSearch={handleBookingSearch}
          onPageChange={handleBookingPageChange}
          onRetry={handleBookingRetry}
        />
      )}
    </div>
  );
}

export default Agents;