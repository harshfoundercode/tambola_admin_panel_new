import React, { useEffect, useState } from "react";
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
  const [updatingStatus, setUpdatingStatus] = useState(null); // Track which agent is being updated

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

  // Function to toggle agent status
  const toggleAgentStatus = async (agent) => {
    if (updatingStatus === agent.agent_id) return; // Prevent multiple clicks
    
    setUpdatingStatus(agent.agent_id);
    const newStatus = agent.status === "active" ? "inactive" : "active";
    
    try {
      const response = await updateAgentStatusAPI(agent.agent_id, newStatus);
      
      if (response.success) {
        // Update local state
        setData(prevData => 
          prevData.map(item => 
            item.agent_id === agent.agent_id 
              ? { ...item, status: newStatus }
              : item
          )
        );
        
        // Show success message
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

  const ViewAgentModal = ({ agent, onClose }) => {
    if (!agent) return null;
    const initials = agent.name
      ? agent.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
      : "AG";

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>

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

          <div className="modal-body">

            {/* Financial Grid */}
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

            {/* Info Rows */}
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
                <span className="info-key">Password</span>
                <span className="info-val">{agent.password || "—"}</span>
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
                        onClick={() => toggleAgentStatus(agent)}
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
                      <button
                        className="action-btn view-action"
                        onClick={() => setSelectedAgent(agent)}
                      >
                        <FaEye size={12} />
                        <span>View</span>
                      </button>

                      <button
                        className="action-btn edit-action"
                        onClick={() => navigate('/create-agent', { state: agent })}
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
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}

export default Agents;