import React, { useState, useEffect } from "react";
import "../styles/AddOffer.css";
import { getAllOffersAPI, addOfferAPI,updateOfferAPI, deleteOfferAPI } from "../services/api";
import { toast } from "react-toastify";

const AddOffer = () => {
  const [offers, setOffers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("edit");
  const [currentOffer, setCurrentOffer] = useState(null);
  const [formData, setFormData] = useState({
    image: null
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllOffersAPI();
      if (response && response.success && response.data) {
        const validOffers = response.data.filter(offer => offer.image_url && offer.image_url.trim());
        setOffers(validOffers);
      } else {
        setError(response?.message || "Failed to load offers");
      }
    } catch (err) {
      console.error("Error fetching offers:", err);
      setError(err.message || "Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const maxWidth = 800;
          const maxHeight = 600;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          console.log("Original file size:", file.size);
          console.log("Compressed size:", compressedDataUrl.length);
          
          if (compressedDataUrl.length > 500000) {
            console.log("Still too large, compressing more...");
            const moreCompressed = canvas.toDataURL('image/jpeg', 0.5);
            resolve(moreCompressed);
          } else {
            resolve(compressedDataUrl);
          }
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleEdit = (offer) => {
    setModalMode("edit");
    setCurrentOffer(offer);
    setFormData({ image: null });
    setPreviewUrl(offer.image_url);
    setShowModal(true);
    setUploadProgress(0);
  };

  const handleDeleteClick = (offer) => {
    setOfferToDelete(offer);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!offerToDelete) return;
    
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
      
      await deleteOfferAPI(offerToDelete.id);
      
      if (interval) clearInterval(interval);
      setUploadProgress(100);
      
      setTimeout(() => {
        fetchOffers();
        setShowDeleteConfirm(false);
        setOfferToDelete(null);
        setUploadProgress(0);
        toast.success("Offer deleted successfully!");
      }, 500);
    } catch (error) {
      if (interval) clearInterval(interval);
      console.error("Error deleting offer:", error);
      toast.error(error.response?.data?.message || "Failed to delete offer");
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
      
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size should be less than 2MB");
        return;
      }
      
      setFormData({ image: file });
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const handleSubmit = async () => {
    if (!formData.image) {
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
      
      let imageDataUrl = await compressImage(formData.image);
      
      const offerData = {
        image_url: imageDataUrl
      };
      
      const response = await updateOfferAPI(currentOffer.id, offerData);
      console.log("Update response:", response);
      
      if (interval) clearInterval(interval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setShowModal(false);
        setFormData({ image: null });
        if (previewUrl && !currentOffer) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setUploadProgress(0);
        toast.success("Offer image updated successfully!");
        fetchOffers();
      }, 500);
      
    } catch (error) {
      if (interval) clearInterval(interval);
      console.error("Error saving offer:", error);
      
      if (error.response?.status === 413) {
        toast.error("Image is too large. Please try an even smaller image (less than 1MB).");
      } else {
        toast.error(error.response?.data?.message || "Failed to update offer");
      }
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (previewUrl && !currentOffer) {
      URL.revokeObjectURL(previewUrl);
    }
    setShowModal(false);
    setFormData({ image: null });
    setPreviewUrl(null);
    setUploadProgress(0);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setOfferToDelete(null);
    setUploadProgress(0);
  };

  return (
    <div className="add-offer-container">
      {(loading || uploadProgress > 0) && (
        <div className="progress-bar-container">
          <div className="progress-bar-wrapper">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <div className="progress-bar-text">
            {uploadProgress}% Complete
          </div>
        </div>
      )}

      <div className="offers-header">
        <h2>Manage Offers</h2>
      </div>

      <div className="offers-grid">
        {error ? (
          <div className="ao-error-wrap">
            <div className="ao-error-icon">⚠️</div>
            <h3 className="ao-error-title">Failed to Load Offers</h3>
            <p className="ao-error-msg">{error}</p>
            <button onClick={fetchOffers} className="ao-error-btn">
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Try Again
            </button>
          </div>
        ) : offers.length > 0 ? (
          offers.map((offer) => (
            <div key={offer.id} className="offer-card">
              <img
                src={offer.image_url}
                alt="Offer"
                className="offer-image"
                onError={(e) => {
                  console.error("Image failed to load:", offer.image_url);
                  e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Found";
                }}
              />
              <div className="offer-actions">
                <button onClick={() => handleEdit(offer)} className="edit-offer-btn">
                  Edit Image
                </button>
                <button onClick={() => handleDeleteClick(offer)} className="delete-offer-btn">
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-offers">
            <p>No offers available</p>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this offer?</p>
            <div className="modal-buttons">
              <button onClick={cancelDelete} className="cancel-btn">
                Cancel
              </button>
              <button onClick={confirmDelete} className="confirm-delete-btn">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Update Offer Image</h3>

            <div className="form-group">
              <label>Upload New Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <small>Max size: 2MB (Recommended: 800x600px)</small>
            </div>

            {previewUrl && (
              <div className="preview-container">
                <img src={previewUrl} alt="Preview" />
              </div>
            )}

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="upload-progress">
                <div className="upload-progress-bar">
                  <div style={{ width: `${uploadProgress}%` }} />
                </div>
                <span>{uploadProgress}%</span>
              </div>
            )}

            <div className="modal-buttons">
              <button onClick={handleCloseModal} disabled={loading}>
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={loading || !formData.image}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddOffer;