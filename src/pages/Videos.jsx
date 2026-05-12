// Videos.jsx
import { useState, useEffect } from "react";
import "../styles/VideoManagement.css";
import { toast } from "react-toastify";
import { addFeedbackVideoAPI, getAllFeedbackVideosAPI, updateFeedbackVideoAPI } from "../services/api";

function Videos() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [fetchingVideos, setFetchingVideos] = useState(true);
  const [updatingVideo, setUpdatingVideo] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    video_url: "",
    status: "active"
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setFetchingVideos(true);
      const response = await getAllFeedbackVideosAPI();
      setVideos(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch videos");
    } finally {
      setFetchingVideos(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Please enter name!");
      return;
    }
    
    if (!formData.video_url.trim()) {
      toast.error("Please enter video URL!");
      return;
    }

    setLoading(true);
    try {
      const response = await addFeedbackVideoAPI(formData);
      toast.success(response.message || "Video added successfully!");
      setFormData({ name: "", video_url: "", status: "active" });
      setShowForm(false);
      fetchVideos(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add video");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (video) => {
    const newStatus = video.status === "active" ? "inactive" : "active";
    const updateData = {
      name: video.name,
      video_url: video.video_url,
      status: newStatus
    };

    setUpdatingVideo(video.id);
    try {
      const response = await updateFeedbackVideoAPI(video.id, updateData);
      toast.success(response.message || "Status updated successfully!");
      
      // Update the local state
      setVideos(prevVideos => 
        prevVideos.map(v => 
          v.id === video.id ? { ...v, status: newStatus } : v
        )
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingVideo(null);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", video_url: "", status: "active" });
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVideoId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?#]+)/,
      /youtube\.com\/shorts\/([^&\?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  return (
    <div className="video-management">
      <div className="video-header">
        <h2>Video Management</h2>
        <button className="video-add-btn" onClick={() => setShowForm(true)}>
          + Add Feedback Video
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="video-modal" onClick={resetForm}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Feedback Video</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter person name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Video URL *</label>
                <input
                  type="url"
                  name="video_url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.video_url}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div className="video-modal-buttons">
                <button 
                  type="submit" 
                  className="video-btn-submit"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Video"}
                </button>
                <button 
                  type="button" 
                  className="video-btn-cancel" 
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Videos List */}
      <div className="videos-container">
        {fetchingVideos ? (
          <div className="loading-state">
            <p>Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="empty-state">
            <p>No feedback videos found</p>
          </div>
        ) : (
          <div className="videos-table-container">
            <table className="videos-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Video</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => {
                  const videoId = getVideoId(video.video_url);
                  const isUpdating = updatingVideo === video.id;
                  
                  return (
                    <tr key={video.id}>
                      <td>{video.id}</td>
                      <td className="name-cell">{video.name}</td>
                      <td className="video-cell">
                        {videoId ? (
                          <div className="video-preview">
                            <img 
                              src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                              alt="Video thumbnail"
                              className="video-thumbnail"
                            />
                            <a 
                              href={video.video_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="video-link"
                            >
                              Watch
                            </a>
                          </div>
                        ) : (
                          <a 
                            href={video.video_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="video-link"
                          >
                            View Video
                          </a>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${video.status}`}>
                          {video.status}
                        </span>
                      </td>
                      <td className="date-cell">{formatDate(video.createdAt)}</td>
                      <td className="actions-cell">
                        <button 
                          className={`action-btn toggle-btn ${video.status === 'active' ? 'deactivate' : 'activate'}`}
                          onClick={() => handleStatusToggle(video)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            "Updating..."
                          ) : video.status === "active" ? (
                            "Deactivate"
                          ) : (
                            "Activate"
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Videos;