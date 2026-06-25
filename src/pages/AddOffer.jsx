// import React, { useState, useEffect } from "react";
// import "../styles/AddOffer.css";
// import { getAllOffersAPI, addOfferAPI, updateOfferAPI, deleteOfferAPI } from "../services/api";
// import { toast } from "react-toastify";
// import tambolaLogo from "../assets/tambolaLogo.jpeg";

// const BASE_URL = "https://api.luckyfunda.com";

// const AddOffer = () => {
//   const [offers, setOffers] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [modalMode, setModalMode] = useState("add");
//   const [currentOffer, setCurrentOffer] = useState(null);
//   const [formData, setFormData] = useState({
//     image: null
//   });
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [offerToDelete, setOfferToDelete] = useState(null);

//   useEffect(() => {
//     fetchOffers();
//   }, []);

//   // ✅ Helper function to get proper image URL
//   const getImageUrl = (imageUrl) => {
//     if (!imageUrl) return "https://via.placeholder.com/300x200?text=No+Image";
    
//     // Agar already full URL hai
//     if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
//       return imageUrl;
//     }
    
//     // Agar URL mein 'undefined' hai toh usse remove karo
//     let cleanUrl = imageUrl.replace('undefined/', '').replace('undefined', '');
    
//     // Agar relative path hai toh base URL add karo
//     if (cleanUrl.startsWith('/')) {
//       return `${BASE_URL}${cleanUrl}`;
//     }
    
//     return `${BASE_URL}/${cleanUrl}`;
//   };

//   const fetchOffers = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await getAllOffersAPI();
//       console.log("📥 Fetched Offers Response:", response);
      
//       if (response && response.success && response.data) {
//         // ✅ Debug: Check image URLs
//         response.data.forEach(offer => {
//           console.log(`Offer ${offer.id} image_url:`, offer.image_url);
//           console.log(`Full URL:`, getImageUrl(offer.image_url));
//         });
        
//         const validOffers = response.data.filter(offer => offer.image_url && offer.image_url.trim());
//         setOffers(validOffers);
//       } else {
//         setError(response?.message || "Failed to load offers");
//         setOffers([]);
//       }
//     } catch (err) {
//       console.error("Error fetching offers:", err);
//       setError(err.message || "Failed to load offers");
//       setOffers([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddNew = () => {
//     setModalMode("add");
//     setCurrentOffer(null);
//     setFormData({ image: null });
//     setPreviewUrl(null);
//     setShowModal(true);
//     setUploadProgress(0);
//   };

//   const handleEdit = (offer) => {
//     setModalMode("edit");
//     setCurrentOffer(offer);
//     setFormData({ image: null });
//     // ✅ Existing image ka proper URL set karo
//     setPreviewUrl(getImageUrl(offer.image_url));
//     setShowModal(true);
//     setUploadProgress(0);
//   };

//   const handleDeleteClick = (offer) => {
//     setOfferToDelete(offer);
//     setShowDeleteConfirm(true);
//   };

//   const confirmDelete = async () => {
//     if (!offerToDelete) return;
    
//     setLoading(true);
//     setUploadProgress(0);
    
//     let interval = null;
    
//     try {
//       interval = setInterval(() => {
//         setUploadProgress(prev => {
//           if (prev >= 90) return prev;
//           return prev + 10;
//         });
//       }, 100);
      
//       await deleteOfferAPI(offerToDelete.id);
      
//       if (interval) clearInterval(interval);
//       setUploadProgress(100);
      
//       setTimeout(() => {
//         fetchOffers();
//         setShowDeleteConfirm(false);
//         setOfferToDelete(null);
//         setUploadProgress(0);
//         toast.success("Offer deleted successfully!");
//       }, 500);
//     } catch (error) {
//       if (interval) clearInterval(interval);
//       console.error("Error deleting offer:", error);
//       toast.error(error.response?.data?.message || "Failed to delete offer");
//       setUploadProgress(0);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       console.log("=== IMAGE SELECTED ===");
//       console.log("File name:", file.name);
//       console.log("File type:", file.type);
//       console.log("File size:", file.size, "bytes");
      
//       if (!file.type.startsWith('image/')) {
//         toast.error("Please select an image file");
//         return;
//       }
      
//       if (file.size > 5 * 1024 * 1024) {
//         toast.error("File size should be less than 5MB");
//         return;
//       }
      
//       setFormData({ image: file });
//       const preview = URL.createObjectURL(file);
//       setPreviewUrl(preview);
//     }
//   };

//   const handleSubmit = async () => {
//     if (modalMode === "add" && !formData.image) {
//       toast.error("Please select an image");
//       return;
//     }
    
//     console.log("\n=== SUBMITTING REQUEST ===");
//     console.log("Modal Mode:", modalMode);
//     if (formData.image) {
//       console.log("Image file:", formData.image.name);
//       console.log("Image type:", formData.image.type);
//       console.log("Image size:", formData.image.size, "bytes");
//     }
    
//     setLoading(true);
//     setUploadProgress(0);
    
//     let interval = null;
    
//     try {
//       interval = setInterval(() => {
//         setUploadProgress(prev => {
//           if (prev >= 90) return prev;
//           return prev + 10;
//         });
//       }, 100);
      
//       let response;
      
//       if (modalMode === "add") {
//         // ✅ Add mode: FormData create karo
//         const formDataToSend = new FormData();
//         formDataToSend.append('image', formData.image);
        
//         console.log("--- Sending ADD request with FormData ---");
//         for (let pair of formDataToSend.entries()) {
//           console.log(pair[0], pair[1]);
//           if (pair[1] instanceof File) {
//             console.log(`  File: ${pair[1].name}, Size: ${pair[1].size} bytes`);
//           }
//         }
        
//         response = await addOfferAPI(formDataToSend);
//         console.log("✅ Add API Response:", response);
        
//       } else {
//         // ✅ Edit mode: Sirf nayi image hai toh bhejo
//         if (formData.image) {
//           const formDataToSend = new FormData();
//           formDataToSend.append('image', formData.image);
          
//           console.log("--- Sending UPDATE request with new image ---");
//           response = await updateOfferAPI(currentOffer.id, formDataToSend);
//           console.log("✅ Update API Response:", response);
//         } else {
//           // Edit without new image
//           console.log("--- Sending UPDATE request without image ---");
//           const formDataToSend = new FormData();
//           response = await updateOfferAPI(currentOffer.id, formDataToSend);
//           console.log("✅ Update API Response:", response);
//         }
//       }
      
//       if (interval) clearInterval(interval);
//       setUploadProgress(100);
      
//       // ✅ Check response data
//       if (response && response.success) {
//         console.log("📦 Response data:", response.data);
//         console.log("📸 Image URL from response:", response.data?.image_url);
        
//         // ✅ Agar response mein image_url hai toh debug karo
//         if (response.data?.image_url) {
//           console.log("Full image URL:", getImageUrl(response.data.image_url));
//         }
//       }
      
//       setTimeout(() => {
//         setShowModal(false);
//         setFormData({ image: null });
//         if (previewUrl && modalMode === "add") {
//           URL.revokeObjectURL(previewUrl);
//         }
//         setPreviewUrl(null);
//         setUploadProgress(0);
//         toast.success(modalMode === "edit" ? "Offer updated successfully!" : "Offer added successfully!");
//         fetchOffers(); // ✅ Refresh offers list
//       }, 500);
      
//     } catch (error) {
//       if (interval) clearInterval(interval);
//       console.error("\n--- ERROR IN REQUEST ---");
//       console.error("Error:", error);
      
//       if (error.response?.status === 413) {
//         toast.error("Image is too large. Please try a smaller image (less than 2MB).");
//       } else if (error.response?.status === 400) {
//         toast.error(error.response?.data?.message || "Validation error");
//       } else {
//         toast.error(error.response?.data?.message || `Failed to ${modalMode === "edit" ? "update" : "add"} offer`);
//       }
//       setUploadProgress(0);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCloseModal = () => {
//     if (previewUrl && modalMode === "add") {
//       URL.revokeObjectURL(previewUrl);
//     }
//     setShowModal(false);
//     setFormData({ image: null });
//     setPreviewUrl(null);
//     setUploadProgress(0);
//   };

//   const cancelDelete = () => {
//     setShowDeleteConfirm(false);
//     setOfferToDelete(null);
//     setUploadProgress(0);
//   };

//   return (
//     <div className="add-offer-container">
//       {(loading || uploadProgress > 0) && (
//         <div className="progress-bar-container">
//           <div className="progress-bar-wrapper">
//             <div 
//               className="progress-bar-fill" 
//               style={{ width: `${uploadProgress}%` }}
//             />
//           </div>
//           <div className="progress-bar-text">
//             {uploadProgress}% Complete
//           </div>
//         </div>
//       )}

//       <div className="offers-header">
//         <h2>Manage Offers</h2>
//         <button onClick={handleAddNew} className="add-offer-btn">
//           + Add New Offer
//         </button>
//       </div>

//       <div className="offers-grid">
//         {error ? (
//           <div className="ao-error-wrap">
//             <div className="ao-error-icon">⚠️</div>
//             <h3 className="ao-error-title">Failed to Load Offers</h3>
//             <p className="ao-error-msg">{error}</p>
//             <button onClick={fetchOffers} className="ao-error-btn">
//               <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
//                 <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
//               </svg>
//               Try Again
//             </button>
//           </div>
//         ) : offers.length > 0 ? (
//           offers.map((offer) => (
//             <div key={offer.id} className="offer-card">
//               {/* ✅ FIX: Proper image URL with fallback */}
//               <img
//                 src={getImageUrl(offer.image_url)}
//                 alt="Offer"
//                 className="offer-image"
//                 onError={(e) => {
//                   console.error("❌ Image failed to load:", offer.image_url);
//                   console.error("Attempted URL:", getImageUrl(offer.image_url));
//                   e.target.src = "https://via.placeholder.com/300x200?text=Image+Not+Found";
//                 }}
//                 onLoad={() => {
//                   console.log("✅ Image loaded successfully:", offer.image_url);
//                 }}
//               />
//               <div className="offer-actions">
//                 <button onClick={() => handleEdit(offer)} className="edit-offer-btn">
//                   Edit Image
//                 </button>
//                 <button onClick={() => handleDeleteClick(offer)} className="delete-offer-btn">
//                   Delete
//                 </button>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className="no-offers">
//             <div className="no-offers-content">
//               <div className="no-offers-icon">📷</div>
//               <p>No offers available</p>
//               <button onClick={handleAddNew} className="add-first-offer-btn">
//                 + Add Your First Offer
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {showDeleteConfirm && (
//         <div className="modal-overlay">
//           <div className="modal-content delete-modal">
//             <h3>Confirm Delete</h3>
//             <p>Are you sure you want to delete this offer?</p>
//             <div className="modal-buttons">
//               <button onClick={cancelDelete} className="cancel-btn">
//                 Cancel
//               </button>
//               <button onClick={confirmDelete} className="confirm-delete-btn">
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showModal && (
//         <div className="modal-overlay">
//           <div className="modal-content">
//             <h3>{modalMode === "edit" ? "Update Offer Image" : "Add New Offer"}</h3>

//             <div className="form-group">
//               <label>
//                 Upload Image
//                 {modalMode === "edit" && " (Optional)"}
//               </label>
//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleImageChange}
//               />
//               <small>Max size: 5MB (Recommended: 800x600px)</small>
//             </div>

//             {previewUrl && (
//               <div className="preview-container">
//                 <img 
//                   src={previewUrl} 
//                   alt="Preview" 
//                   onError={(e) => {
//                     console.error("Preview image failed:", previewUrl);
//                     e.target.src = {tambolaLogo};
//                   }}
//                 />
//               </div>
//             )}

//             {uploadProgress > 0 && uploadProgress < 100 && (
//               <div className="upload-progress">
//                 <div className="upload-progress-bar">
//                   <div style={{ width: `${uploadProgress}%` }} />
//                 </div>
//                 <span>{uploadProgress}%</span>
//               </div>
//             )}

//             <div className="modal-buttons">
//               <button onClick={handleCloseModal} disabled={loading}>
//                 Cancel
//               </button>
//               <button 
//                 onClick={handleSubmit} 
//                 disabled={loading || (modalMode === "add" && !formData.image)}
//               >
//                 {loading ? "Processing..." : modalMode === "edit" ? "Update" : "Add"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
import React, { useState, useEffect } from "react";
import "../styles/AddOffer.css";
import {
  getAllOffersAPI,
  addOfferAPI,
  updateOfferAPI,
  deleteOfferAPI,
} from "../services/api";
import { toast } from "react-toastify";

const NO_IMAGE_ICON =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">
      <rect width="100%" height="100%" fill="#f3f4f6"/>

      <g fill="#9ca3af">
        <path d="M150 70c-16.5 0-30 13.5-30 30s13.5 30 30 30 30-13.5 30-30-13.5-30-30-30zm0 50c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z"/>

        <path d="M95 150h110c8 0 15-7 15-15V65c0-8-7-15-15-15H95c-8 0-15 7-15 15v70c0 8 7 15 15 15zm0-85h110v70H95V65z"/>
      </g>

      <text 
        x="50%" 
        y="88%" 
        text-anchor="middle" 
        fill="#9ca3af" 
        font-size="16" 
        font-family="Arial"
      >
        No Image
      </text>
    </svg>
  `);

const AddOffer = () => {
  const [offers, setOffers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentOffer, setCurrentOffer] = useState(null);

  const [formData, setFormData] = useState({
    image: null,
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

      console.log("📥 Offers Response:", response);

      if (response && response.success && response.data) {
        const validOffers = response.data.filter(
          (offer) => offer.image_url && offer.image_url.trim()
        );

        setOffers(validOffers);
      } else {
        setError(response?.message || "Failed to load offers");
        setOffers([]);
      }
    } catch (err) {
      console.error("Error fetching offers:", err);
      setError(err.message || "Failed to load offers");
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setModalMode("add");
    setCurrentOffer(null);
    setFormData({ image: null });
    setPreviewUrl(null);
    setShowModal(true);
    setUploadProgress(0);
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
        setUploadProgress((prev) => {
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

      console.error("Delete Error:", error);

      toast.error(
        error.response?.data?.message || "Failed to delete offer"
      );

      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      console.log("=== IMAGE SELECTED ===");
      console.log("File name:", file.name);
      console.log("File type:", file.type);
      console.log("File size:", file.size);

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      setFormData({ image: file });

      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const handleSubmit = async () => {
    if (modalMode === "add" && !formData.image) {
      toast.error("Please select an image");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    let interval = null;

    try {
      interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 100);

      let response;

      if (modalMode === "add") {
        const formDataToSend = new FormData();

        formDataToSend.append("image", formData.image);

        response = await addOfferAPI(formDataToSend);

        console.log("✅ Add Response:", response);
      } else {
        if (formData.image) {
          const formDataToSend = new FormData();

          formDataToSend.append("image", formData.image);

          response = await updateOfferAPI(
            currentOffer.id,
            formDataToSend
          );
        } else {
          const formDataToSend = new FormData();

          response = await updateOfferAPI(
            currentOffer.id,
            formDataToSend
          );
        }

        console.log("✅ Update Response:", response);
      }

      if (interval) clearInterval(interval);

      setUploadProgress(100);

      setTimeout(() => {
        setShowModal(false);

        setFormData({ image: null });

        if (previewUrl && modalMode === "add") {
          URL.revokeObjectURL(previewUrl);
        }

        setPreviewUrl(null);
        setUploadProgress(0);

        toast.success(
          modalMode === "edit"
            ? "Offer updated successfully!"
            : "Offer added successfully!"
        );

        fetchOffers();
      }, 500);
    } catch (error) {
      if (interval) clearInterval(interval);

      console.error("Submit Error:", error);

      if (error.response?.status === 413) {
        toast.error(
          "Image is too large. Please try a smaller image."
        );
      } else if (error.response?.status === 400) {
        toast.error(
          error.response?.data?.message || "Validation error"
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            `Failed to ${
              modalMode === "edit" ? "update" : "add"
            } offer`
        );
      }

      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (previewUrl && modalMode === "add") {
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

        <button
          onClick={handleAddNew}
          className="add-offer-btn"
        >
          + Add New Offer
        </button>
      </div>

      <div className="offers-grid">
        {error ? (
          <div className="ao-error-wrap">
            <div className="ao-error-icon">⚠️</div>

            <h3 className="ao-error-title">
              Failed to Load Offers
            </h3>

            <p className="ao-error-msg">{error}</p>

            <button
              onClick={fetchOffers}
              className="ao-error-btn"
            >
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
                  console.error(
                    "❌ Image failed:",
                    offer.image_url
                  );

                  e.target.src = NO_IMAGE_ICON;
                }}
              />

              <div className="offer-actions">
                <button
                  onClick={() => handleEdit(offer)}
                  className="edit-offer-btn"
                >
                  Edit Image
                </button>

                <button
                  onClick={() => handleDeleteClick(offer)}
                  className="delete-offer-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-offers">
            <div className="no-offers-content">
              <div className="no-offers-icon">📷</div>

              <p>No offers available</p>

              <button
                onClick={handleAddNew}
                className="add-first-offer-btn"
              >
                + Add Your First Offer
              </button>
            </div>
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content delete-modal">
            <h3>Confirm Delete</h3>

            <p>
              Are you sure you want to delete this offer?
            </p>

            <div className="modal-buttons">
              <button
                onClick={cancelDelete}
                className="cancel-btn"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="confirm-delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>
              {modalMode === "edit"
                ? "Update Offer Image"
                : "Add New Offer"}
            </h3>

            <div className="form-group">
              <label>
                Upload Image
                {modalMode === "edit" && " (Optional)"}
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />

              <small>
                Max size: 5MB (Recommended: 800x600px)
              </small>
            </div>

            {previewUrl && (
              <div className="preview-container">
                <img
                  src={previewUrl}
                  alt="Preview"
                  onError={(e) => {
                    e.target.src = NO_IMAGE_ICON;
                  }}
                />
              </div>
            )}

            {uploadProgress > 0 &&
              uploadProgress < 100 && (
                <div className="upload-progress">
                  <div className="upload-progress-bar">
                    <div
                      style={{
                        width: `${uploadProgress}%`,
                      }}
                    />
                  </div>

                  <span>{uploadProgress}%</span>
                </div>
              )}

            <div className="modal-buttons">
              <button
                onClick={handleCloseModal}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={
                  loading ||
                  (modalMode === "add" &&
                    !formData.image)
                }
              >
                {loading
                  ? "Processing..."
                  : modalMode === "edit"
                  ? "Update"
                  : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AddOffer;