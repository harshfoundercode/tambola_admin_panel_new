import React, { useState, useEffect } from "react";
import { 
  getHowItWorksAPI, 
  howItWorksAddAPI, 
  updateHowItWorksAPI 
} from "../services/api";

const HowItWorksManager = () => {
  const [videoLink, setVideoLink] = useState("");
  const [currentVideo, setCurrentVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [videoPreview, setVideoPreview] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  // Extract YouTube video ID
  const extractYouTubeID = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Get YouTube thumbnail
  const getYouTubeThumbnail = (url) => {
    const videoId = extractYouTubeID(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  // Get YouTube embed URL
  const getYouTubeEmbedUrl = (url) => {
    const videoId = extractYouTubeID(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  // Fetch current video
  const fetchCurrentVideo = async () => {
    setFetching(true);
    setErrorMessage("");
    
    try {
      const response = await getHowItWorksAPI();
      console.log("🔍 Full API Response:", response);
      console.log("📦 Response Data:", response.data);
      
      // ✅ FIXED: Response structure ke hisaab se data extract karo
      if (response.success && response.data) {
        // Response format: { success: true, data: { id, video_link, ... } }
        const videoData = response.data;
        console.log("✅ Video data found:", videoData);
        
        if (videoData.video_link) {
          setCurrentVideo(videoData);
          setVideoLink(videoData.video_link);
          setVideoPreview(videoData.video_link);
          setIsEditMode(true);
          console.log("🎬 Video loaded successfully:", videoData.video_link);
        } else {
          // Data object hai lekin video_link empty hai
          setCurrentVideo(null);
          setVideoLink("");
          setVideoPreview("");
          setIsEditMode(false);
          console.log("⚠️ Video data exists but video_link is empty");
        }
      } else if (response.data && response.data.video_link) {
        // Alternative response structure
        setCurrentVideo(response.data);
        setVideoLink(response.data.video_link);
        setVideoPreview(response.data.video_link);
        setIsEditMode(true);
        console.log("🎬 Video loaded (alt format):", response.data.video_link);
      } else {
        // No video found
        setCurrentVideo(null);
        setVideoLink("");
        setVideoPreview("");
        setIsEditMode(false);
        console.log("ℹ️ No video found in response");
      }
    } catch (error) {
      console.error("❌ Error fetching video:", error);
      setCurrentVideo(null);
      setVideoLink("");
      setVideoPreview("");
      setIsEditMode(false);
      setErrorMessage("Failed to load video. Please try again.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCurrentVideo();
  }, []);

  // Handle video link change
  const handleVideoLinkChange = (e) => {
    const link = e.target.value;
    setVideoLink(link);
    setSuccessMessage("");
    setErrorMessage("");
    
    if (link && extractYouTubeID(link)) {
      setVideoPreview(link);
    } else {
      setVideoPreview("");
    }
  };

  // Validate YouTube URL
  const validateYouTubeUrl = (url) => {
    if (!url) return "Video link is required";
    const videoId = extractYouTubeID(url);
    if (!videoId) return "Invalid YouTube URL. Please enter a valid YouTube video link";
    return "";
  };

  // Handle form submission (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateYouTubeUrl(videoLink);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    
    try {
      let response;
      
      console.log("📝 Current state:", {
        isEditMode,
        currentVideoId: currentVideo?.id,
        videoLink
      });
      
      if (isEditMode && currentVideo?.id) {
        // Update existing video
        console.log("🔄 Updating video with ID:", currentVideo.id);
        response = await updateHowItWorksAPI(currentVideo.id, {
          video_link: videoLink
        });
        console.log("✅ Update response:", response);
      } else {
        // Add new video
        console.log("➕ Adding new video");
        response = await addHowItWorksAPI({
          video_link: videoLink
        });
        console.log("✅ Add response:", response);
      }
      
      if (response.success || response.status === 200 || response.status === 201) {
        setSuccessMessage(
          isEditMode 
            ? "✅ Video updated successfully!" 
            : "✅ Video added successfully!"
        );
        
        // Refresh current video data
        await fetchCurrentVideo();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        throw new Error(response.message || "Failed to save video");
      }
    } catch (error) {
      console.error("❌ Error saving video:", error);
      setErrorMessage(
        error.response?.data?.message || 
        error.message || 
        "Failed to save video. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    if (isEditMode && currentVideo) {
      setVideoLink(currentVideo.video_link || "");
      setVideoPreview(currentVideo.video_link || "");
    } else {
      setVideoLink("");
      setVideoPreview("");
    }
    setSuccessMessage("");
    setErrorMessage("");
  };

  // Debug info
  console.log("🎯 Render State:", {
    fetching,
    isEditMode,
    hasCurrentVideo: !!currentVideo,
    videoLink,
    currentVideoId: currentVideo?.id
  });

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '2rem',
    },
    wrapper: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    header: {
      marginBottom: '2rem',
      textAlign: 'center',
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
      textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
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
      animation: 'slideIn 0.3s ease-out',
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
    videoEmbedContainer: {
      position: 'relative',
      width: '100%',
      paddingBottom: '56.25%',
      borderRadius: '15px',
      overflow: 'hidden',
      boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
    },
    videoEmbed: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      border: 'none',
    },
    videoInfoBox: {
      marginTop: '1.5rem',
      padding: '1.5rem',
      background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
      borderRadius: '12px',
      border: '1px solid #e0e0e0',
    },
    videoLink: {
      color: '#1976d2',
      textDecoration: 'none',
      fontWeight: '600',
      wordBreak: 'break-all',
      transition: 'color 0.3s ease',
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
    inputWrapper: {
      position: 'relative',
    },
    input: {
      width: '100%',
      padding: '1rem 1.25rem',
      borderRadius: '12px',
      border: '2px solid #e0e0e0',
      fontSize: '1rem',
      transition: 'all 0.3s ease',
      outline: 'none',
      background: '#fafafa',
    },
    inputError: {
      borderColor: '#f44336',
      background: '#fff5f5',
    },
    inputValid: {
      borderColor: '#4caf50',
      background: '#f1f8e9',
    },
    checkmark: {
      position: 'absolute',
      right: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#4caf50',
      fontSize: '1.2rem',
      fontWeight: 'bold',
    },
    hint: {
      fontSize: '0.85rem',
      color: '#90a4ae',
      marginTop: '0.5rem',
    },
    previewContainer: {
      background: 'linear-gradient(135deg, #f5f5f5 0%, #e8eaf6 100%)',
      borderRadius: '15px',
      padding: '1.5rem',
      border: '1px solid #c5cae9',
    },
    previewTitle: {
      fontWeight: '600',
      color: '#37474f',
      marginBottom: '1rem',
      fontSize: '1rem',
    },
    previewGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
    },
    thumbnail: {
      width: '100%',
      borderRadius: '12px',
      boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
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
    editBadge: {
      padding: '0.5rem 1rem',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
      color: '#1565c0',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: '600',
      border: '1px solid #90caf9',
    },
    tipsContainer: {
      background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
      border: '2px solid #90caf9',
      borderRadius: '20px',
      padding: '2rem',
      marginTop: '2rem',
    },
    tipsTitle: {
      fontSize: '1.3rem',
      fontWeight: '700',
      color: '#0d47a1',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    tipsList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    tipsItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      marginBottom: '0.75rem',
      color: '#1565c0',
      fontSize: '0.95rem',
      lineHeight: '1.6',
    },
    tipsBullet: {
      color: '#1976d2',
      fontSize: '1.2rem',
      lineHeight: '1.4',
    },
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
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          @keyframes slideIn {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .hover-lift:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 50px rgba(0,0,0,0.15);
          }
          .input-focus:focus {
            border-color: #1a237e !important;
            box-shadow: 0 0 0 3px rgba(26,35,126,0.1) !important;
            background: white !important;
          }
          .btn-primary:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(26,35,126,0.4);
          }
          .btn-secondary:hover:not(:disabled) {
            background: #f5f5f5;
            border-color: #bdbdbd;
            transform: translateY(-2px);
          }
          .video-thumbnail:hover {
            transform: scale(1.02);
          }
        `}
      </style>

      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>
            <span style={styles.headerIcon}>📹</span>
            How It Works Video Manager
          </h1>
          <p style={styles.headerSubtitle}>
            {isEditMode 
              ? "Update the instructional video for your platform" 
              : "Add an instructional video for your platform"
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
              className="ml-auto text-red-700 hover:text-red-900"
              style={{
                background: 'none',
                border: 'none',
                color: '#c62828',
                cursor: 'pointer',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                padding: '5px',
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
            </div>
            <p style={{textAlign: 'center', color: '#78909c', marginTop: '1rem'}}>
              Loading video...
            </p>
          </div>
        ) : currentVideo?.video_link ? (
          /* Current Video Display */
          <div style={styles.card} className="hover-lift">
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1a237e',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '1.5rem',
            }}>
              <span>📺</span>
              Current Video
            </h2>

            {/* YouTube Video Embed */}
            <div style={styles.videoEmbedContainer}>
              <iframe
                src={getYouTubeEmbedUrl(currentVideo.video_link)}
                title="How It Works Video"
                style={styles.videoEmbed}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

           
          </div>
        ) : (
          /* Empty State */
          <div style={styles.card}>
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>🎥</span>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#37474f',
                marginBottom: '0.5rem',
              }}>
                No Video Added Yet
              </h3>
              <p style={{
                color: '#90a4ae',
                fontSize: '1rem',
              }}>
                Add your first "How It Works" video to help users understand your platform
              </p>
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        <div style={styles.card} className="hover-lift">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1a237e',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              margin: 0,
            }}>
              <span>{isEditMode ? "✏️" : "➕"}</span>
              {isEditMode ? "Update Video" : "Add New Video"}
            </h2>
           
          </div>

          <form onSubmit={handleSubmit}>
            {/* Video Link Input */}
            <div style={styles.formGroup}>
              
              <div style={styles.inputWrapper}>
                <input
                  type="url"
                  value={videoLink}
                  onChange={handleVideoLinkChange}
                  placeholder="https://www.youtube.com/watch?v=abcd1234"
                  style={{
                    ...styles.input,
                    ...(errorMessage && !videoLink ? styles.inputError : {}),
                    ...(videoLink && extractYouTubeID(videoLink) ? styles.inputValid : {}),
                  }}
                  className="input-focus"
                  disabled={loading}
                />
                {videoLink && extractYouTubeID(videoLink) && (
                  <span style={styles.checkmark}>✓</span>
                )}
              </div>
           
            </div>

            {/* Preview */}
            {videoPreview && extractYouTubeID(videoPreview) && (
              <div style={styles.previewContainer}>
                <h3 style={styles.previewTitle}>📺 Live Preview</h3>
                <div style={styles.previewGrid}>
                  {/* Thumbnail Preview */}
                  <div>
                    <img
                      src={getYouTubeThumbnail(videoPreview)}
                      alt="Video thumbnail"
                      style={styles.thumbnail}
                      className="video-thumbnail"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/480x360?text=Video+Thumbnail';
                      }}
                    />
                    <p style={{
                      textAlign: 'center',
                      fontSize: '0.85rem',
                      color: '#78909c',
                      marginTop: '0.5rem',
                    }}>
                      📸 Video Thumbnail
                    </p>
                  </div>
                  
                  {/* Embed Preview */}
                  <div>
                    <div style={styles.videoEmbedContainer}>
                      <iframe
                        src={getYouTubeEmbedUrl(videoPreview)}
                        title="Preview"
                        style={styles.videoEmbed}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <p style={{
                      textAlign: 'center',
                      fontSize: '0.85rem',
                      color: '#78909c',
                      marginTop: '0.5rem',
                    }}>
                      🎬 Live Preview
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={styles.buttonGroup}>
              <button
                type="submit"
                disabled={loading || !videoLink}
                style={{
                  ...styles.primaryButton,
                  ...(loading || !videoLink ? styles.primaryButtonDisabled : {}),
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
                    Saving...
                  </>
                ) : (
                  <>
                    <span>{isEditMode ? "🔄" : "➕"}</span>
                    {isEditMode ? "Update Video" : "Add Video"}
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

export default HowItWorksManager;