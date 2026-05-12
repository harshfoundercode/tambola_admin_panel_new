import { useState, useEffect } from "react";
import { FaFileAlt, FaPlus, FaEdit, FaTrash, FaTimes, FaCheck, FaSave } from "react-icons/fa";
import { toast } from "react-toastify";
import "../styles/ManagePolicies.css";
import api from "../services/api";

function ManagePolicies() {
  const [policies, setPolicies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "terms"
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sabhi policies fetch karo
  const fetchAllPolicies = async () => {
    setLoading(true);
    try {
      const res = await api.get("/policy/all");
      
      if (res.data.success) {
        const dataObj = res.data.data;
        
        // Convert object to array format
        const policiesArray = Object.keys(dataObj).map(type => {
          let content = dataObj[type];
          let title = "";
          
          // Set title based on type
          switch(type) {
            case 'terms': title = "Terms & Conditions"; break;
            case 'privacy': title = "Privacy Policy"; break;
            case 'faq': title = "FAQ"; break;
            case 'rules': title = "Rules & Regulations"; break;
            case 'contact': title = "Contact Information"; break;
            default: title = type.charAt(0).toUpperCase() + type.slice(1);
          }
          
          // If content is object (like contact), stringify it
          if (typeof content === 'object') {
            content = JSON.stringify(content, null, 2);
          }
          
          return {
            id: type,
            type: type,
            title: title,
            content: content
          };
        });
        
        setPolicies(policiesArray);
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch policies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPolicies();
  }, []);

  // UPDATE Policy
  const handleUpdate = async (type) => {
    setLoading(true);
    try {
      const res = await api.put(`/policy/update/${type}`, {
        title: formData.title,
        content: formData.content
      });
      
      if (res.data.success) {
        toast.success("Policy updated successfully!");
        fetchAllPolicies();
        closeModal();
      } else {
        toast.error(res.data.message || "Failed to update policy");
      }
    } catch (err) {
      toast.error("Error updating policy");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // DELETE Policy
  const handleDelete = async (type) => {
    if (!window.confirm(`Are you sure you want to reset ${type} policy?`)) return;
    
    setLoading(true);
    try {
      const defaultContent = `Add ${type} here`;
      const res = await api.put(`/policy/update/${type}`, {
        title: type.charAt(0).toUpperCase() + type.slice(1),
        content: defaultContent
      });
      
      if (res.data.success) {
        toast.success(`${type} policy reset successfully!`);
        fetchAllPolicies();
      } else {
        toast.error(res.data.message || "Failed to reset policy");
      }
    } catch (err) {
      toast.error("Error resetting policy");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ADD Policy
  const handleAdd = async () => {
    // Check if policy type already exists
    const existingPolicy = policies.find(p => p.type === formData.type);
    if (existingPolicy) {
      toast.error(`Policy type "${formData.type}" already exists! Please edit existing policy instead.`);
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post("/policy/add", formData);
      
      if (res.data.success) {
        toast.success("Policy added successfully!");
        fetchAllPolicies();
        closeModal();
      } else {
        toast.error(res.data.message || "Failed to add policy");
      }
    } catch (err) {
      toast.error("Error adding policy");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Modal functions
  const openAddModal = () => {
    setModalMode('add');
    setFormData({ title: "", content: "", type: "terms" });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (policy) => {
    setModalMode('edit');
    setFormData({
      title: policy.title,
      content: policy.content,
      type: policy.type
    });
    setEditingId(policy.type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ title: "", content: "", type: "terms" });
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'edit') {
      handleUpdate(editingId);
    } else {
      handleAdd();
    }
  };

  return (
    <div className="policies-management">
      {/* Header */}
      <div className="policies-header">
        <div className="header-content">
          <div className="header-icon">
            <FaFileAlt size={24} />
          </div>
          <div className="header-text">
            <h1>Manage Policies</h1>
            <p>Create and manage your application policies and terms</p>
          </div>
        </div>
        <button onClick={openAddModal} className="add-policy-btn">
          <FaPlus size={16} />
          <span>Add New Policy</span>
        </button>
      </div>

      {/* Policies Grid */}
      <div className="policies-grid">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading policies...</p>
          </div>
        ) : policies.length === 0 ? (
          <div className="empty-state">
            <FaFileAlt size={48} />
            <h3>No Policies Found</h3>
            <p>Start by adding your first policy</p>
            <button onClick={openAddModal} className="empty-add-btn">
              <FaPlus size={16} />
              <span>Add Policy</span>
            </button>
          </div>
        ) : (
          policies.map((policy) => (
            <div key={policy.id} className="policy-card">
              <div className="policy-header">
                <div className="policy-type">{policy.type}</div>
                <div className="policy-actions">
                  <button 
                    onClick={() => openEditModal(policy)} 
                    className="action-btn edit-btn"
                    title="Edit Policy"
                  >
                    <FaEdit size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(policy.type)} 
                    className="action-btn delete-btn"
                    title="Reset Policy"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
              <div className="policy-content">
                <h3>{policy.title}</h3>
                <p>{policy.content.substring(0, 150)}...</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{modalMode === 'add' ? 'Add New Policy' : 'Edit Policy'}</h3>
              <button onClick={closeModal} className="close-btn">
                <FaTimes size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Policy Type</label>
                <select 
                  value={formData.type} 
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  disabled={modalMode === 'edit'}
                  className="form-select"
                  required
                >
                  <option value="terms">Terms & Conditions</option>
                  <option value="privacy">Privacy Policy</option>
                  <option value="faq">FAQ</option>
                  <option value="rules">Rules & Regulations</option>
                  <option value="contact">Contact Information</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="form-input"
                  placeholder="Enter policy title"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="form-textarea"
                  rows="12"
                  placeholder="Enter policy content here... (HTML supported)"
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn-cancel" disabled={loading}>
                  <FaTimes size={14} />
                  <span>Cancel</span>
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? (
                    <div className="spinner-small"></div>
                  ) : (
                    <FaSave size={14} />
                  )}
                  <span>{modalMode === 'add' ? 'Add Policy' : 'Update Policy'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagePolicies;