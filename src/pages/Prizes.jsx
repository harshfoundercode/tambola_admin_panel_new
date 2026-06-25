import { useState, useEffect } from "react";
import "../styles/prizes.css";
import api from "../services/api";

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  return (
    <div className={`toast-notification toast-${type}`}>
      <div className="toast-content">
        <div className="toast-message">
          <span className="toast-icon">{icons[type] || "✅"}</span>
          <span className="toast-text">{message}</span>
          <button className="toast-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="toast-progress">
          <div className="toast-progress-bar"></div>
        </div>
      </div>
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

function Prizes() {
  const [prizes, setPrizes] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPrize, setEditingPrize] = useState(null);
  const [selectedGameFilter, setSelectedGameFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    game_id: "",
    prize_name: "",
    prize_amount: "",
    max_winners: 1,
  });

  // Show Toast
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2200);
  };

  // Fetch all games
  const fetchGames = async () => {
    try {
      const res = await api.get("/game/all-games");
      if (res.data.success && res.data.data?.games) {
        setGames(res.data.data.games);
      } else if (res.data.games) {
        setGames(res.data.games);
      } else if (Array.isArray(res.data.data)) {
        setGames(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching games:", err);
    }
  };

  // Fetch all prizes - FIXED URL
  const fetchPrizes = async () => {
    setLoading(true);
    try {
      // FIXED: Use correct endpoint "/admin/prize" instead of "/admin/prizes"
      const res = await api.get("/admin/prize");

      if (res.data.success && res.data.data) {
        // Filter by game if filter is selected
        let filteredPrizes = res.data.data;
        if (selectedGameFilter) {
          filteredPrizes = res.data.data.filter(
            (prize) => prize.game_id === parseInt(selectedGameFilter),
          );
        }
        setPrizes(filteredPrizes);
      } else if (res.data.prizes) {
        setPrizes(res.data.prizes);
      } else if (Array.isArray(res.data)) {
        setPrizes(res.data);
      } else {
        setPrizes([]);
      }
    } catch (err) {
      console.error("Error fetching prizes:", err);
      showToast("Failed to fetch prizes", "error");
    } finally {
      setLoading(false);
    }
  };

  // Add/Update Prize - FIXED URLs
// Add/Update Prize - COMPLETELY FIXED
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.game_id) {
    showToast("Please select a game!", "warning");
    return;
  }

  if (!form.prize_name) {
    showToast("Please enter prize name!", "warning");
    return;
  }

  if (!form.prize_amount || form.prize_amount <= 0) {
    showToast("Please enter valid prize amount!", "warning");
    return;
  }

  setLoading(true);

  try {
    if (editingPrize) {
      
      const res = await api.put(`/admin/prize/${editingPrize.prize_id}`, {
        game_id: parseInt(form.game_id),
        prize_name: form.prize_name,
        prize_amount: parseInt(form.prize_amount),
        max_winners: parseInt(form.max_winners)
      });
      
      if (res.data.success) {
        showToast("Prize updated successfully!", "success");
        setEditingPrize(null);
      } else {
        throw new Error(res.data.message || "Update failed");
      }
    } else {
      
      const res = await api.post("/admin/prize/add", {
        game_id: parseInt(form.game_id),
        prize_name: form.prize_name,
        prize_amount: parseInt(form.prize_amount),
        max_winners: parseInt(form.max_winners)
      });
      
      if (res.data.success) {
        showToast("Prize added successfully!", "success");
      } else {
        throw new Error(res.data.message || "Add failed");
      }
    }

    // Reset form
    setForm({
      game_id: "",
      prize_name: "",
      prize_amount: "",
      max_winners: 1,
    });
    setIsModalOpen(false);
    fetchPrizes();
    
  } catch (err) {
    console.error(err);
    showToast(
      err.response?.data?.message || err.message || "Error saving prize",
      "error"
    );
  } finally {
    setLoading(false);
  }
};

  // Edit Prize
  const handleEdit = (prize) => {
    setEditingPrize(prize);
    setForm({
      game_id: prize.game_id,
      prize_name: prize.prize_name,
      prize_amount: prize.prize_amount,
      max_winners: prize.max_winners,
    });
    setIsModalOpen(true);
  };


const handleDelete = async (prize_id, prize_name) => {
  setLoading(true);
  try {
    console.log(`Deleting prize ${prize_id}: ${prize_name}`);
    
    // FIXED: Use correct endpoint "/admin/prize/${prize_id}"
    const res = await api.delete(`/admin/prize/${prize_id}`);
    
    console.log("Delete response:", res.data);
    
    if (res.data.success) {
      showToast(` Prize "${prize_name}" deleted successfully!`, "success");
      setDeleteConfirm(null);
      await fetchPrizes(); // Refresh list
      
      // Reset editing state if needed
      if (editingPrize?.prize_id === prize_id) {
        setEditingPrize(null);
        setForm({
          game_id: "",
          prize_name: "",
          prize_amount: "",
          max_winners: 1,
        });
      }
    } else {
      throw new Error(res.data.message || "Delete failed");
    }
  } catch (err) {
    console.error("Delete error:", err);
    showToast(
      err.response?.data?.message || err.message || "Error deleting prize",
      "error"
    );
  } finally {
    setLoading(false);
  }
};

  const openAddModal = () => {
    setEditingPrize(null);
    setForm({
      game_id: "",
      prize_name: "",
      prize_amount: "",
      max_winners: 1,
    });
    setIsModalOpen(true);
  };

  const getGameName = (game_id) => {
    const game = games.find((g) => g.game_id === parseInt(game_id));
    return game ? game.title || game.game_name : `Game ${game_id}`;
  };

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    fetchPrizes();
  }, [selectedGameFilter]);

  return (
    <div className="prize-manager">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div
            className="modal-content-small"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Confirm Delete</h2>
              <button
                className="modal-close"
                onClick={() => setDeleteConfirm(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to delete{" "}
                <strong>"{deleteConfirm.name}"</strong>?
              </p>
              <p className="warning-text">This action cannot be undone!</p>
              <div className="modal-buttons">
                <button
                  className="btn-cancel"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn-confirm-delete"
                  onClick={() =>
                    handleDelete(deleteConfirm.id, deleteConfirm.name)
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPrize ? "✏️ Edit Prize" : "➕ Add New Prize"}
      >
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Select Game *</label>
            <select
              value={form.game_id}
              onChange={(e) => setForm({ ...form, game_id: e.target.value })}
              required
            >
              <option value="">-- Select Game --</option>
              {games.map((game) => (
                <option key={game.game_id} value={game.game_id}>
                  {game.title || game.game_name || `Game ${game.game_id}`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Prize Name *</label>
            <input
              type="text"
              placeholder="e.g., EARLY5, FULL, TOP, MIDDLE, BOTTOM"
              value={form.prize_name}
              onChange={(e) =>
                setForm({ ...form, prize_name: e.target.value.toUpperCase() })
              }
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Prize Amount (₹) *</label>
              <input
                type="number"
                placeholder="Amount"
                value={form.prize_amount}
                onChange={(e) =>
                  setForm({ ...form, prize_amount: e.target.value })
                }
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Max Winners *</label>
              <input
                type="number"
                placeholder="Max winners"
                value={form.max_winners}
                onChange={(e) =>
                  setForm({ ...form, max_winners: e.target.value })
                }
                min="1"
                required
              />
            </div>
          </div>

          <div className="modal-buttons">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading
                ? "Processing..."
                : editingPrize
                  ? "Update Prize"
                  : "Add Prize"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Header */}
      <div className="prize-header">
        <div>
          <h1>🏆 Prize Management</h1>
          <p>Manage prizes for your lottery games</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span class="text-blue-500">Total Prizes</span>
            <strong class="text-blue-500">{prizes.length}</strong>
          </div>
          <div className="stat-card">
            <span class="text-blue-500">Active Games</span>
            <strong class="text-blue-500">{games.length}</strong>
          </div>
          <button className="add-prize-btn" onClick={openAddModal}>
            ➕ Add New Prize
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>Filter by Game:</label>
          <select
            value={selectedGameFilter}
            onChange={(e) => setSelectedGameFilter(e.target.value)}
          >
            <option value="">All Games</option>
            {games.map((game) => (
              <option key={game.game_id} value={game.game_id}>
                {game.title || game.game_name || `Game ${game.game_id}`}
              </option>
            ))}
          </select>
        </div>
        <button className="refresh-btn" onClick={fetchPrizes}>
          🔄 Refresh
        </button>
      </div>

      {/* Prizes Table */}
      <div className="prizes-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading prizes...</p>
          </div>
        ) : prizes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏆</div>
            <p>No prizes found</p>
            <button className="empty-btn" onClick={openAddModal}>
              Add Your First Prize
            </button>
          </div>
        ) : (
          <table className="prizes-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Prize Name</th>
                <th>Game</th>
                <th>Amount (₹)</th>
                <th>Max Winners</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {prizes.map((prize) => (
                <tr key={prize.prize_id}>
                  <td>#{prize.prize_id}</td>
                  <td>
                    <span className="prize-name-badge">{prize.prize_name}</span>
                  </td>
                  <td>{getGameName(prize.game_id)}</td>
                  <td>₹{parseInt(prize.prize_amount).toLocaleString()}</td>
                  <td>{prize.max_winners}</td>
                  <td>
                    <span
                      className={`status-badge ${prize.is_active === 1 ? "active" : "inactive"}`}
                    >
                      {prize.is_active === 1 ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEdit(prize)}
                      title="Edit Prize"
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() =>
                        setDeleteConfirm({
                          id: prize.prize_id,
                          name: prize.prize_name,
                        })
                      }
                      title="Delete Prize"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Prizes;
