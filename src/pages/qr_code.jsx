import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import '../styles/QrCode.css';

const PaymentQRManager = () => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchQRCode = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://api.luckyfunda.com/api/wallet/payment-qr', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        toast.error('Please login to continue');
        return;
      }

      if (response.status === 404) {
        setQrData(null);
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch QR code');

      const result = await response.json();
      if (result.data) {
        setQrData(result.data);
      }
    } catch (error) {
      console.error('Error fetching QR:', error);
      if (!error.message.includes('404')) {
        toast.error('Could not load QR code');
      }
    } finally {
      setLoading(false);
    }
  };

  const addOrUpdateQRCode = async () => {
    if (!selectedFile) {
      toast.warning('Please select a QR code image first');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('qr_image', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://api.luckyfunda.com/api/wallet/admin/payment-qr', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      setQrData(result.data);
      toast.success(qrData ? 'QR code updated successfully' : 'QR code added successfully');
      setIsEditing(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      await fetchQRCode();
    } catch (error) {
      console.error('Error uploading QR:', error);
      toast.error(error.message || 'Failed to save QR code');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file (PNG, JPG, JPEG)');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  useEffect(() => {
    fetchQRCode();
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  return (
    <div className="payment-qr-container">
      <div className="qr-content-wrapper">
        {/* Header Section */}
        <div className="qr-header">
          <div className="header-title">
            <h1>Payment QR Code</h1>
            <p className="header-subtitle">Manage UPI payment QR for withdrawals</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="action-button"
            >
              {qrData ? '✏️ Update QR' : '➕ Add QR'}
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="loader"></div>
            <p className="loading-text">Loading QR code...</p>
          </div>
        )}

        {/* Main Content */}
        {!loading && (
          <>
            {/* Display Mode - Show existing QR */}
            {!isEditing && qrData && (
              <div className="qr-card">
                {/* Status Banner */}
                <div className={`status-banner ${qrData.status === 'active' ? 'active' : 'inactive'}`}>
                  <div className="status-indicator">
                    <div className={`status-dot ${qrData.status === 'active' ? 'active' : 'inactive'}`}></div>
                    <span className="status-text">
                      Status: {qrData.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {qrData.id && (
                    <span className="qr-id-badge">
                      ID: #{qrData.id}
                    </span>
                  )}
                </div>

                {/* QR Display */}
                <div className="qr-display">
                  <div className="qr-image-wrapper">
                    <img
                      src={qrData.qr_image}
                      alt="Payment QR Code"
                      className="qr-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/320?text=QR+Code+Not+Found';
                        toast.error('QR image failed to load');
                      }}
                    />
                  </div>
                  
                  <div className="qr-actions">
                    <button
                      onClick={() => window.open(qrData.qr_image, '_blank')}
                      className="view-full-btn"
                    >
                      <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span>View Full Size</span>
                    </button>
                  </div>
                </div>

                {/* Info Note */}
                <div className="info-note">
                  <p className="info-text">
                    💡 This QR code will be shown to users for making payments
                  </p>
                </div>
              </div>
            )}

            {/* Add/Edit Mode */}
            {isEditing && (
              <div className="edit-mode-container">
                <div className="edit-header">
                  <h2 className="edit-title">
                    {qrData ? 'Update QR Code' : 'Add New QR Code'}
                  </h2>
                </div>
                
                <div className="edit-content">
                  {/* File Upload Area */}
                  <div className="upload-area">
                    <input
                      type="file"
                      id="qr-upload"
                      accept="image/png,image/jpeg,image/jpg"
                      onChange={handleFileSelect}
                      className="hidden-input"
                    />
                    <label htmlFor="qr-upload" className="upload-label">
                      {previewUrl ? (
                        <div className="upload-preview">
                          <img src={previewUrl} alt="Preview" className="preview-image" />
                          <div className="change-text">
                            <svg className="icon-small" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Click to change image</span>
                          </div>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <div className="upload-icon">
                            <svg className="icon-large" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="upload-title">Click to upload QR code</p>
                            <p className="upload-subtitle">PNG, JPG, JPEG up to 5MB</p>
                            {qrData && (
                              <p className="replace-note">Current QR will be replaced</p>
                            )}
                          </div>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Instructions Card */}
                  <div className="instructions-card">
                    <h3 className="instructions-title">
                      <span className="title-icon">📌</span>
                      Instructions for QR Code
                    </h3>
                    <ul className="instructions-list">
                      <li><span className="check-icon">✓</span> Upload clear, readable QR code image</li>
                      <li><span className="check-icon">✓</span> Supported formats: PNG, JPG, JPEG</li>
                      <li><span className="check-icon">✓</span> Maximum file size: 5MB</li>
                      <li><span className="check-icon">✓</span> Recommended size: 500x500 pixels or higher</li>
                      <li><span className="warning-icon">⚠</span> Make sure QR is properly linked to your payment account</li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="button-group">
                    <button
                      onClick={addOrUpdateQRCode}
                      disabled={uploading || !selectedFile}
                      className="btn-primary"
                    >
                      {uploading ? (
                        <>
                          <span className="spinner"></span>
                          <span>{qrData ? 'Updating...' : 'Uploading...'}</span>
                        </>
                      ) : (
                        <>{qrData ? '💾 Update QR Code' : '📤 Save QR Code'}</>
                      )}
                    </button>
                    <button
                      onClick={resetForm}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State - No QR Code */}
            {!isEditing && !qrData && !loading && (
              <div className="empty-state">
                <div className="empty-icon-wrapper">
                  <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <h3 className="empty-title">No QR Code Configured</h3>
                <p className="empty-description">
                  You haven't added a payment QR code yet. Click the "Add QR" button to upload one.
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-add-large"
                >
                  ➕ Add QR Code Now
                </button>
              </div>
            )}
          </>
        )}

    
      </div>
    </div>
  );
};

export default PaymentQRManager;