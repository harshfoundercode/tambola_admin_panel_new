import React, { useState, useEffect } from "react";
import { FaImage, FaEdit, FaTrash, FaUpload, FaCheck, FaTimes } from "react-icons/fa";
import "../styles/AddBanner.css";
import { getBannerAPI, addBannerAPI, updateBannerAPI, deleteBannerAPI } from "../services/api";
import { toast } from "react-toastify";

const AddBanner = () => {
  const [bannerImage, setBannerImage] = useState(null);
  const [bannerId, setBannerId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    setLoading(true);
    try {
      const response = await getBannerAPI();
      console.log("Fetched banner response:", response);
      
      if (response && response.success && response.data && response.data.image_url) {
        const imageUrl = response.data.image_url.trim();
        setBannerImage(imageUrl);
        setBannerId(response.data.id);
        console.log("Banner loaded successfully:", imageUrl);
      } else {
        console.log("No banner found");
        setBannerImage(null);
        setBannerId(null);
      }
    } catch (error) {
      console.error("Error fetching banner:", error);
      setBannerImage(null);
      setBannerId(null);
    } finally {
      setLoading(false);
    }
  };



  const handleAdd = () => {
    setShowModal(true);
    setNewImage(null);
    setPreviewUrl(null);
    setUploadProgress(0);
  };

  const handleEdit = () => {
    setShowModal(true);
    setNewImage(null);
    setPreviewUrl(null);
    setUploadProgress(0);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!bannerId) {
      toast.error("No banner selected to delete");
      setShowDeleteConfirm(false);
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    
    let interval = null;

    try {
      interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 100);

      await deleteBannerAPI(bannerId);
      
      if (interval) clearInterval(interval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setBannerImage(null);
        setBannerId(null);
        setShowDeleteConfirm(false);
        setUploadProgress(0);
        toast.success("Banner deleted successfully!");
      }, 500);
    } catch (error) {
      if (interval) clearInterval(interval);
      console.error("Error deleting banner:", error);
      toast.error(error.response?.data?.message || "Failed to delete banner");
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      
      setNewImage(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const handleSubmit = async () => {
    if (!newImage) {
      toast.error("Please select an image");
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    
    let interval = null;

    try {
      interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 100);

      let response;
      
      if (!bannerImage) {
        // Add new banner
        response = await addBannerAPI(newImage);
        console.log("Add response:", response);
        
        if (response && response.success && response.data) {
          setBannerImage(response.data.image_url);
          setBannerId(response.data.id);
        }
      } else {
        // Update existing banner
        if (!bannerId) {
          throw new Error("No banner ID found");
        }
        response = await updateBannerAPI(bannerId, newImage);
        console.log("Update response:", response);
        setBannerImage(newImage);
      }
      
      if (interval) clearInterval(interval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setShowModal(false);
        setNewImage(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setUploadProgress(0);
        toast.success(`Banner ${!bannerImage ? "added" : "updated"} successfully!`);
        fetchBanner();
      }, 500);
      
    } catch (error) {
      if (interval) clearInterval(interval);
      console.error("Error saving banner:", error);
      toast.error(error.response?.data?.message || `Failed to ${!bannerImage ? "add" : "update"} banner`);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setShowModal(false);
    setNewImage(null);
    setPreviewUrl(null);
    setUploadProgress(0);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setUploadProgress(0);
  };

  return (
    <div className="banner-management">
      {/* Header */}
      <div className="banner-header">
        <div className="header-content">
          <div className="header-icon">
            <FaImage size={24} />
          </div>
          <div className="header-text">
            <h1>Banner Management</h1>
            <p>Manage your application banner image</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {(loading || uploadProgress > 0) && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="progress-text">{uploadProgress}% Complete</span>
        </div>
      )}

      {/* Banner Card */}
      <div className="banner-card">
        <div className="banner-display">
          {bannerImage ? (
            <>
              <img
                src={bannerImage}
                alt="Current Banner"
                className="banner-img"
                onError={(e) => {
                  console.error("Image failed to load:", bannerImage);
                  e.target.style.display = 'none';
                  setBannerImage(null);
                }}
              />
              <div className="banner-overlay">
                <div className="banner-actions">
                  <button onClick={handleEdit} className="action-btn edit-btn">
                    <FaEdit size={16} />
                    <span>Edit Banner</span>
                  </button>
                  <button onClick={handleDelete} className="action-btn delete-btn">
                    <FaTrash size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="banner-empty">
              <div className="empty-icon">
                <FaImage size={48} />
              </div>
              <h3>No Banner Set</h3>
              <p>Upload a banner image to display across your application</p>
              <button onClick={handleAdd} className="add-btn">
                <FaUpload size={16} />
                <span>Upload Banner</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <div className="delete-icon">
              <FaTrash size={32} />
            </div>
            <h3>Delete Banner</h3>
            <p>Are you sure you want to delete this banner? This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={cancelDelete} className="btn-cancel">
                <FaTimes size={14} />
                <span>Cancel</span>
              </button>
              <button onClick={confirmDelete} className="btn-delete" disabled={loading}>
                <FaCheck size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content upload-modal">
            <div className="modal-header">
              <h3>{bannerImage ? 'Update Banner' : 'Upload Banner'}</h3>
              <button onClick={handleCloseModal} className="close-btn">
                <FaTimes size={16} />
              </button>
            </div>

            <div className="modal-body">
              {bannerImage && (
                <div className="current-banner">
                  <label>Current Banner:</label>
                  <div className="current-preview">
                    <img src={bannerImage} alt="Current" />
                  </div>
                </div>
              )}

              <div className="upload-section">
                <label>Select New Image:</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="banner-upload"
                    className="file-input"
                  />
                  <label htmlFor="banner-upload" className="upload-label">
                    <FaUpload size={20} />
                    <span>Choose Image</span>
                  </label>
                  {newImage && <span className="file-info">{newImage.name}</span>}
                </div>
                <small className="upload-hint">
                  Supported formats: JPG, PNG, GIF, WEBP
                </small>
              </div>

              {previewUrl && (
                <div className="preview-section">
                  <label>Preview:</label>
                  <div className="preview-container">
                    <img src={previewUrl} alt="Preview" />
                  </div>
                </div>
              )}

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="progress-text">Processing... {uploadProgress}%</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={handleCloseModal} disabled={loading} className="btn-cancel">
                <FaTimes size={14} />
                <span>Cancel</span>
              </button>
              <button onClick={handleSubmit} disabled={loading || !newImage} className="btn-submit">
                <FaCheck size={14} />
                <span>{bannerImage ? 'Update' : 'Upload'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBanner;