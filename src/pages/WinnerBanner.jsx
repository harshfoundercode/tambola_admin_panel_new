import React, { useState, useEffect, useRef } from "react";
import { 
  getWinnerBannersAPI, 
  addWinnerBannerAPI, 
  updateWinnerBannerAPI 
} from "../services/api";

const WinnerBannerManager = () => {
  const [bannerImage, setBannerImage] = useState(null);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch current winner banner
  const fetchCurrentBanner = async () => {
    setFetching(true);
    setErrorMessage("");
    
    try {
      const response = await getWinnerBannersAPI();
      console.log("🔍 Winner Banner Full Response:", response);
      
      // Check different response structures
      let bannerData = null;
      
      if (response.success && response.data) {
        bannerData = response.data;
      } else if (response.data) {
        bannerData = response.data;
      } else if (response.image_url || response.image) {
        bannerData = response;
      }
      
      console.log("📦 Extracted Banner Data:", bannerData);
      
      if (bannerData && (bannerData.image_url || bannerData.image)) {
        setCurrentBanner(bannerData);
        const imageUrl = bannerData.image_url || bannerData.image;
        setPreviewUrl(imageUrl);
        setIsEditMode(true);
        console.log("🖼️ Banner loaded successfully:", imageUrl);
      } else {
        setCurrentBanner(null);
        setPreviewUrl("");
        setIsEditMode(false);
        console.log("ℹ️ No banner found or empty response");
      }
    } catch (error) {
      console.error("❌ Error fetching banner:", error);
      // Agar 404 ya empty hai to new mode
      setCurrentBanner(null);
      setPreviewUrl("");
      setIsEditMode(false);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCurrentBanner();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setBannerImage(file);
    setSuccessMessage("");
    setErrorMessage("");
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    
    console.log("📁 File selected:", file.name, "Size:", (file.size / 1024).toFixed(2) + "KB");
  };

  // Validate image file
  const validateImage = (file) => {
    if (!file) return "Please select an image file";
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return "Invalid file type. Please upload JPG, PNG, GIF, or WebP image";
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return "File size too large. Maximum size is 5MB";
    }
    
    return "";
  };

  // Handle form submission (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!bannerImage) {
      setErrorMessage("Please select an image file");
      return;
    }
    
    const validationError = validateImage(bannerImage);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    
    try {
      let response;
      
      console.log("📝 Submission Details:", {
        isEditMode,
        currentBannerId: currentBanner?.id,
        fileName: bannerImage.name,
        fileSize: bannerImage.size
      });
      
      if (isEditMode && currentBanner?.id) {
        // Update existing banner - FormData bhejo
        console.log("🔄 Updating banner ID:", currentBanner.id);
        response = await updateWinnerBannerAPI(currentBanner.id, bannerImage);
        console.log("✅ Update response:", response);
      } else {
        // Add new banner - FormData bhejo
        console.log("➕ Adding new banner");
        response = await addWinnerBannerAPI(bannerImage);
        console.log("✅ Add response:", response);
      }
      
      if (response.success || response.status === 200 || response.status === 201) {
        setSuccessMessage(
          isEditMode 
            ? "✅ Winner banner updated successfully!" 
            : "✅ Winner banner added successfully!"
        );
        
        // Clear file input
        setBannerImage(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        
        // Refresh banner data
        await fetchCurrentBanner();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        throw new Error(response.message || "Failed to save banner");
      }
    } catch (error) {
      console.error("❌ Error saving banner:", error);
      setErrorMessage(
        error.response?.data?.message || 
        error.message || 
        "Failed to save banner. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setBannerImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    if (isEditMode && currentBanner) {
      setPreviewUrl(currentBanner.image_url || currentBanner.image || "");
    } else {
      setPreviewUrl("");
    }
    setSuccessMessage("");
    setErrorMessage("");
  };

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '2rem',
    },
    wrapper: {
      maxWidth: '800px',
      margin: '0 auto',
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
    },
    headerTitle: {
      fontSize: '2.5rem',
      fontWeight: '800',
      color: '#1a237e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      marginBottom: '0.5rem',
    },
    headerIcon: {
      fontSize: '3rem',
    },
    headerSubtitle: {
      color: '#546e7a',
      fontSize: '1.1rem',
      fontWeight: '500',
    },
    messageBox: {
      padding: '1rem 1.5rem',
      borderRadius: '15px',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    },
    successBox: {
      background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
      border: '2px solid #4caf50',
      color: '#2e7d32',
    },
    errorBox: {
      background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
      border: '2px solid #f44336',
      color: '#c62828',
    },
    card: {
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0',
      padding: '2rem',
      marginBottom: '2rem',
      transition: 'all 0.3s ease',
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '4rem',
    },
    spinner: {
      width: '60px',
      height: '60px',
      border: '5px solid #e0e0e0',
      borderTop: '5px solid #1a237e',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    },
    currentBannerContainer: {
      borderRadius: '15px',
      overflow: 'hidden',
      boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
      marginTop: '1rem',
    },
    bannerImage: {
      width: '100%',
      height: 'auto',
      display: 'block',
    },
    emptyState: {
      textAlign: 'center',
      padding: '4rem 2rem',
    },
    emptyIcon: {
      fontSize: '5rem',
      display: 'block',
      marginBottom: '1.5rem',
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      fontWeight: '600',
      color: '#37474f',
      marginBottom: '0.75rem',
      fontSize: '1rem',
    },
    required: {
      color: '#f44336',
      marginLeft: '4px',
    },
    uploadArea: {
      border: '3px dashed #bdbdbd',
      borderRadius: '15px',
      padding: '3rem 2rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      background: '#fafafa',
    },
    uploadAreaDragging: {
      borderColor: '#1a237e',
      background: '#e8eaf6',
      transform: 'scale(1.02)',
    },
    uploadAreaWithFile: {
      borderColor: '#4caf50',
      background: '#f1f8e9',
    },
    uploadIcon: {
      fontSize: '3rem',
      display: 'block',
      marginBottom: '1rem',
    },
    uploadText: {
      color: '#424242',
      fontSize: '1rem',
      marginBottom: '0.5rem',
      fontWeight: '500',
    },
    uploadHint: {
      color: '#9e9e9e',
      fontSize: '0.85rem',
    },
    previewContainer: {
      background: 'linear-gradient(135deg, #f5f5f5 0%, #e8eaf6 100%)',
      borderRadius: '15px',
      padding: '1.5rem',
      border: '1px solid #c5cae9',
      marginTop: '1.5rem',
    },
    previewTitle: {
      fontWeight: '600',
      color: '#37474f',
      marginBottom: '1rem',
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    previewImage: {
      width: '100%',
      maxHeight: '400px',
      objectFit: 'contain',
      borderRadius: '12px',
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
      background: 'white',
    },
    fileName: {
      color: '#1565c0',
      fontSize: '0.9rem',
      marginTop: '0.75rem',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      marginTop: '2rem',
    },
    primaryButton: {
      flex: 1,
      padding: '1rem 2rem',
      background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontWeight: '700',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      boxShadow: '0 5px 15px rgba(26,35,126,0.3)',
    },
    primaryButtonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
      boxShadow: 'none',
    },
    secondaryButton: {
      padding: '1rem 2rem',
      background: 'white',
      color: '#37474f',
      border: '2px solid #e0e0e0',
      borderRadius: '12px',
      fontWeight: '600',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    },
    badge: {
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: '600',
      display: 'inline-block',
    },
    editBadge: {
      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
      color: '#1565c0',
      border: '1px solid #90caf9',
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#1a237e',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      margin: 0,
    },
    bannerInfo: {
      fontSize: '0.85rem',
      color: '#90a4ae',
      marginTop: '0.75rem',
      textAlign: 'center',
    },
  };

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrorMessage("Please drop an image file");
        return;
      }
      
      // Simulate file input change
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        handleFileChange({ target: { files: dataTransfer.files } });
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* Global Animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes slideIn {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          .hover-lift:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 50px rgba(0,0,0,0.15) !important;
          }
          .btn-primary:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(26,35,126,0.4) !important;
          }
          .btn-secondary:hover:not(:disabled) {
            background: #f5f5f5 !important;
            border-color: #bdbdbd !important;
            transform: translateY(-2px);
          }
        `}
      </style>

      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>
            <span style={styles.headerIcon}>🏆</span>
            Winner Banner Manager
          </h1>
          <p style={styles.headerSubtitle}>
            {isEditMode 
              ? "Update your winner announcement banner" 
              : "Upload a winner announcement banner"
            }
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={{...styles.messageBox, ...styles.successBox}}>
            <span style={{fontSize: '1.5rem'}}>✅</span>
            <p style={{fontWeight: '600', margin: 0, flex: 1}}>{successMessage}</p>
            <button 
              onClick={() => setSuccessMessage("")}
              style={{
                background: 'none',
                border: 'none',
                color: '#2e7d32',
                cursor: 'pointer',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                padding: '5px',
                borderRadius: '5px',
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div style={{...styles.messageBox, ...styles.errorBox}}>
            <span style={{fontSize: '1.5rem'}}>❌</span>
            <p style={{fontWeight: '600', margin: 0, flex: 1}}>{errorMessage}</p>
            <button 
              onClick={() => setErrorMessage("")}
              style={{
                background: 'none',
                border: 'none',
                color: '#c62828',
                cursor: 'pointer',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                padding: '5px',
                borderRadius: '5px',
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading State */}
        {fetching ? (
          <div style={styles.card}>
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={{color: '#78909c', marginTop: '1rem', fontWeight: '500'}}>
                Loading banner...
              </p>
            </div>
          </div>
        ) : currentBanner && (currentBanner.image_url || currentBanner.image) ? (
          /* Current Banner Display */
          <div style={styles.card} className="hover-lift">
            <div style={styles.infoRow}>
              <h2 style={styles.sectionTitle}>
                <span>🏆</span>
                Current Winner Banner
              </h2>
              {currentBanner.id && (
                <span style={{...styles.badge, ...styles.editBadge}}>
                  🆔 ID: {currentBanner.id}
                </span>
              )}
            </div>

            <div style={styles.currentBannerContainer}>
              <img 
                src={currentBanner.image_url || currentBanner.image} 
                alt="Winner Banner"
                style={styles.bannerImage}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x400?text=Banner+Not+Available';
                }}
              />
            </div>

            {currentBanner.id && (
              <p style={styles.bannerInfo}>
                Banner ID: {currentBanner.id} | Last Updated: {currentBanner.updatedAt ? new Date(currentBanner.updatedAt).toLocaleDateString() : 'N/A'}
              </p>
            )}
          </div>
        ) : (
          /* Empty State */
          <div style={styles.card}>
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>🏆</span>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#37474f',
                marginBottom: '0.5rem',
              }}>
                No Winner Banner Added
              </h3>
              <p style={{
                color: '#90a4ae',
                fontSize: '1rem',
                maxWidth: '400px',
                margin: '0 auto',
              }}>
                Upload a winner announcement banner to display on your platform
              </p>
            </div>
          </div>
        )}

        {/* Upload Form */}
        <div style={styles.card} className="hover-lift">
          <div style={styles.infoRow}>
            <h2 style={styles.sectionTitle}>
              <span>{isEditMode ? "✏️" : "➕"}</span>
              {isEditMode ? "Update Banner" : "Upload New Banner"}
            </h2>
            {isEditMode && (
              <span style={{...styles.badge, ...styles.editBadge}}>
                ✨ Edit Mode
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {/* File Upload Area */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                🖼️ Winner Banner Image <span style={styles.required}>*</span>
              </label>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  ...styles.uploadArea,
                  ...(isDragging ? styles.uploadAreaDragging : {}),
                  ...(bannerImage ? styles.uploadAreaWithFile : {}),
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                  disabled={loading}
                />
                
                <span style={styles.uploadIcon}>
                  {bannerImage ? '✅' : '📁'}
                </span>
                <p style={styles.uploadText}>
                  {bannerImage 
                    ? `Selected: ${bannerImage.name}`
                    : 'Drag & drop your image here, or click to browse'
                  }
                </p>
                <p style={styles.uploadHint}>
                  Supported: JPG, PNG, GIF, WebP • Max size: 5MB
                </p>
              </div>
            </div>

            {/* Image Preview */}
            {previewUrl && (
              <div style={styles.previewContainer}>
                <h3 style={styles.previewTitle}>
                  <span>🖼️</span>
                  {bannerImage ? 'New Image Preview' : 'Current Image'}
                </h3>
                <img 
                  src={previewUrl} 
                  alt="Banner preview"
                  style={styles.previewImage}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/800x400?text=Preview+Not+Available';
                  }}
                />
                {bannerImage && (
                  <p style={styles.fileName}>
                    <span>📄</span>
                    {bannerImage.name} 
                    <span style={{color: '#78909c', marginLeft: '10px'}}>
                      ({(bannerImage.size / 1024).toFixed(2)} KB)
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div style={styles.buttonGroup}>
              <button
                type="submit"
                disabled={loading || !bannerImage}
                style={{
                  ...styles.primaryButton,
                  ...(loading || !bannerImage ? styles.primaryButtonDisabled : {}),
                }}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '3px solid rgba(255,255,255,0.3)',
                      borderTop: '3px solid white',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                    }}></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <span>{isEditMode ? "🔄" : "📤"}</span>
                    {isEditMode ? "Update Banner" : "Upload Banner"}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                style={{
                  ...styles.secondaryButton,
                  ...(loading ? styles.primaryButtonDisabled : {}),
                }}
                className="btn-secondary"
              >
                🔄 Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WinnerBannerManager;