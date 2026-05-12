import React, { useEffect, useState } from "react";
import { getUserDetailsAPI, getUserKycAPI, updateKycStatusAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/PlayersDetail.css";

function PlayerDetails() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [verifyFilter, setVerifyFilter] = useState("all");
  const [showKycModal, setShowKycModal] = useState(false);
  const [kycData, setKycData] = useState(null);
  const [kycLoading, setKycLoading] = useState(false);

  useEffect(() => {
    fetchPlayerDetails();
  }, []);

  const fetchPlayerDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserDetailsAPI();
      console.log("Get User Details response", response);
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.message || "Failed to load player details");
      }
    } catch (err) {
      console.error("Error fetching player details:", err);
      setError(err.message || "Failed to load player details");
    } finally {
      setLoading(false);
    }
  };

  const handleViewKyc = async (userId) => {
    setKycLoading(true);
    try {
      console.log("Fetching KYC for user ID:", userId);
      const response = await getUserKycAPI(userId);
      console.log("KYC API Response:", response);
      if (response.data && response.data.length > 0) {
        // API returns array, so take the first item
        setKycData(response.data[0]);
        setShowKycModal(true);
      } else {
        console.log("No KYC data found");
        toast.info("No KYC data found for this user");
      }
    } catch (err) {
      console.error("Error fetching KYC:", err);
      toast.error("Failed to load KYC details: " + (err.message || "Unknown error"));
    } finally {
      setKycLoading(false);
    }
  };

  const handleKycStatusUpdate = async (userId, status) => {
    try {
      await updateKycStatusAPI(userId, status);
      toast.success(`KYC ${status} successfully`);
      fetchPlayerDetails();
    } catch (err) {
      console.error("Error updating KYC:", err);
      toast.error("Failed to update KYC status");
    }
  };

  const handleViewGameHistory = (userId, userName) => {
    navigate(`/user-game-history?userId=${userId}&userName=${encodeURIComponent(userName)}`);
  };

  const handleViewTransaction = (userId, userName) => {
    navigate(`/user-transaction-history?userId=${userId}&userName=${encodeURIComponent(userName)}`);
  };


  const filteredData = data.filter((item) => {
    const fullName = `${item.first_name} ${item.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      item.phone?.includes(searchTerm) ||
      item.referral_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVerify = verifyFilter === "all" ||
      (verifyFilter === "verified" && item.is_verified) ||
      (verifyFilter === "unverified" && !item.is_verified);
    return matchesSearch && matchesVerify;
  });

  const KycModal = ({ kyc, onClose }) => {
    if (!kyc) return null;

    console.log("KYC Modal Data:", kyc);

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content kyc-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-hero">
            <button className="modal-close" onClick={onClose}>×</button>
            <h3>KYC Details - {kyc.user_name || 'Unknown User'}</h3>
            <div className={`kyc-status-badge ${kyc.status || 'pending'}`}>
              Status: {kyc.status || 'Pending'}
            </div>
          </div>

          <div className="modal-body">
            <div className="kyc-section">
              <h4>Personal Information</h4>
              <div className="kyc-grid">
                <div className="kyc-item">
                  <span className="kyc-label">Name:</span>
                  <span className="kyc-value">{(kyc.first_name || '') + ' ' + (kyc.last_name || '')}</span>
                </div>
                <div className="kyc-item">
                  <span className="kyc-label">DOB:</span>
                  <span className="kyc-value">{kyc.dob ? new Date(kyc.dob).toLocaleDateString() : 'Not provided'}</span>
                </div>
                <div className="kyc-item">
                  <span className="kyc-label">Phone:</span>
                  <span className="kyc-value">{kyc.phone || 'Not provided'}</span>
                </div>
              </div>
            </div>

            <div className="kyc-section">
              <h4>ID Information</h4>
              <div className="kyc-grid">
                <div className="kyc-item">
                  <span className="kyc-label">ID Type:</span>
                  <span className="kyc-value">{kyc.id_type || 'Not provided'}</span>
                </div>
                <div className="kyc-item">
                  <span className="kyc-label">ID Number:</span>
                  <span className="kyc-value">{kyc.id_number || 'Not provided'}</span>
                </div>
                <div className="kyc-item">
                  <span className="kyc-label">ID Name:</span>
                  <span className="kyc-value">{kyc.id_name || 'Not provided'}</span>
                </div>
              </div>
              
              {(kyc.id_front_image || kyc.id_back_image) && (
                <div className="kyc-images">
                  {kyc.id_front_image && (
                    <div className="kyc-image-item">
                      <span className="kyc-label">ID Front:</span>
                      <img src={kyc.id_front_image} alt="ID Front" className="kyc-image" />
                    </div>
                  )}
                  {kyc.id_back_image && (
                    <div className="kyc-image-item">
                      <span className="kyc-label">ID Back:</span>
                      <img src={kyc.id_back_image} alt="ID Back" className="kyc-image" />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="kyc-section">
              <h4>Bank Information</h4>
              <div className="kyc-grid">
                <div className="kyc-item">
                  <span className="kyc-label">Account Number:</span>
                  <span className="kyc-value">{kyc.account_number || 'Not provided'}</span>
                </div>
                <div className="kyc-item">
                  <span className="kyc-label">IFSC Code:</span>
                  <span className="kyc-value">{kyc.ifsc_code || 'Not provided'}</span>
                </div>
                <div className="kyc-item">
                  <span className="kyc-label">Bank Name:</span>
                  <span className="kyc-value">{kyc.bank_name || 'Not provided'}</span>
                </div>
                <div className="kyc-item">
                  <span className="kyc-label">Account Holder:</span>
                  <span className="kyc-value">{kyc.account_holder_name || 'Not provided'}</span>
                </div>
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

  const ViewPlayerModal = ({ player, onClose }) => {
    if (!player) return null;
    const fullName = `${player.first_name} ${player.last_name}`;
    const initials = `${player.first_name?.[0] || ""}${player.last_name?.[0] || ""}`.toUpperCase();

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="modal-hero">
            <button className="modal-close" onClick={onClose}>×</button>
            <div className="modal-avatar">{initials}</div>
            <h3>{fullName}</h3>
            <div className="modal-meta">
              <span>📱 {player.phone}</span>
              <span className={`kyc-pill ${player.is_verified ? "verified" : "unverified"}`}>
                {player.is_verified ? "✓ Verified" : "✗ Unverified"}
              </span>
            </div>
          </div>

          <div className="modal-body">

            {/* Financial Grid */}
            <p className="section-label">Financial Summary</p>
            <div className="fin-grid">
              <div className="fin-card green">
                <span className="fin-icon">💳</span>
                <span className="fin-val">₹{(player.wallet || 0).toLocaleString()}</span>
                <span className="fin-lbl">Wallet</span>
              </div>
              <div className="fin-card green">
                <span className="fin-icon">🏆</span>
                <span className="fin-val">₹{(player.winning_balance || 0).toLocaleString()}</span>
                <span className="fin-lbl">Winnings</span>
              </div>
              <div className="fin-card blue">
                <span className="fin-icon">📥</span>
                <span className="fin-val">₹{(player.total_deposit || 0).toLocaleString()}</span>
                <span className="fin-lbl">Total Deposit</span>
              </div>
              <div className="fin-card red">
                <span className="fin-icon">💸</span>
                <span className="fin-val">₹{(player.total_withdraw || 0).toLocaleString()}</span>
                <span className="fin-lbl">Withdrawn</span>
              </div>
              <div className="fin-card purple">
                <span className="fin-icon">🎁</span>
                <span className="fin-val">₹{(player.referral_bonus || 0).toLocaleString()}</span>
                <span className="fin-lbl">Referral Bonus</span>
              </div>
              <div className="fin-card purple">
                <span className="fin-icon">🎀</span>
                <span className="fin-val">₹{(player.bonus_balance || 0).toLocaleString()}</span>
                <span className="fin-lbl">Bonus Balance</span>
              </div>
            </div>

            {/* Info Rows */}
            <p className="section-label">Account Info</p>
            <div className="info-rows">
              <div className="info-row">
                <span className="info-key">User ID</span>
                <span className="info-val">#{player.user_id}</span>
              </div>
              <div className="info-row">
                <span className="info-key">Referral Code</span>
                <span className="info-val referral-code">{player.referral_code}</span>
              </div>
              <div className="info-row">
                <span className="info-key">Referred By</span>
                <span className="info-val">{player.referred_by_name ? `${player.referred_by_name}` : "—"}</span>
              </div>
              <div className="info-row">
                <span className="info-key">KYC Status</span>
                <span className={`info-val kyc-status ${player.kyc_status ? "kyc-done" : "kyc-pending"}`}>
                  {player.kyc_status || "Pending"}
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
        <p>Loading player details...</p>
      </div>
    );
  }

  return (
    <div className="page-container">

     <h2 className="page-heading">Users Details</h2>

      <div className="page-header">
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-value">{data.length}</div>
            <div className="stat-label">Total Players</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{data.filter(d => d.is_verified).length}</div>
            <div className="stat-label">Verified</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{data.filter(d => !d.is_verified).length}</div>
            <div className="stat-label">Unverified</div>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-bar">
          <svg className="search-icon" viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="6" stroke="#94a3b8" strokeWidth="1.8"/>
            <path d="M13.5 13.5L17 17" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name, phone or referral code..."
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
          {["all", "verified", "unverified"].map((f) => (
            <button
              key={f}
              className={`filter-tab ${verifyFilter === f ? "active" : ""}`}
              onClick={() => setVerifyFilter(f)}
            >
              {f === "all" ? "All" : f === "verified" ? "Verified" : "Unverified"}
            </button>
          ))}
        </div>
      </div>

      <div className="table-container">
        {error ? (
          <div className="pd-error-wrap">
            <div className="pd-error-icon">⚠️</div>
            <h3 className="pd-error-title">Failed to Load Players</h3>
            <p className="pd-error-msg">{error}</p>
            <button onClick={fetchPlayerDetails} className="pd-error-btn">
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
                <th>Player Name</th>
                <th>Phone</th>
                <th>Referral Code</th>
                <th>Wallet</th>
                <th>Total Deposit</th>
                <th>User verifaction status</th>
                <th>Kcy status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={item.user_id}>
                    <td>{index + 1}</td>
                    <td className="player-name">{item.first_name} {item.last_name}</td>
                    <td>{item.phone}</td>
                    <td className="text-center">{item.referral_code}</td>
                    <td className="amount">₹{(item.wallet || 0).toLocaleString()}</td>
                    <td className="amount">₹{(item.total_deposit || 0).toLocaleString()}</td>
                    <td>
                      <span className={`verify-badge ${item.is_verified ? "v-yes" : "v-no"}`}>
                        {item.is_verified ? "Verified" : "Unverified"}
                      </span>
                    </td>

                    <td>
                      <select 
                        className={`kyc-status-dropdown kyc-${item.kyc_status || 'pending'}`}
                        value={item.kyc_status || "pending"}
                        onChange={(e) => handleKycStatusUpdate(item.user_id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="view-btn" onClick={() => setSelectedPlayer(item)}>View</button>
                        <button className="kyc-btn" onClick={() => handleViewKyc(item.user_id)} disabled={kycLoading}>
                          {kycLoading ? "Loading..." : "View KYC"}
                        </button>
                        <button className="transaction-btn" onClick={() => handleViewTransaction(item.user_id, `${item.first_name} ${item.last_name}`)}>View Transaction</button>
                        <button className="game-history-btn" onClick={() => handleViewGameHistory(item.user_id, `${item.first_name} ${item.last_name}`)}>View Game History</button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    <div>No data found</div>
                    <small>Try adjusting your search</small>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedPlayer && (
        <ViewPlayerModal 
          player={selectedPlayer} 
          onClose={() => setSelectedPlayer(null)} 
        />
      )}

      {showKycModal && kycData && (
        <KycModal 
          kyc={kycData} 
          onClose={() => setShowKycModal(false)}
        />
      )}
    </div>
  );
}

export default PlayerDetails;