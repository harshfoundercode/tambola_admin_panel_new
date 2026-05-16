import axios from "axios";

// Testing URL
const API_BASE_URL = "https://api.luckyfunda.com/api";

const UPLOAD_BASE_URL = "https://api.luckyfunda.com";


const api = axios.create({
  baseURL: API_BASE_URL,

});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("TOKEN =>", token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }


  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

/*============== Admin Login ============*/
export const loginAPI = async (data) => {
  const res = await api.post("/auth/admin/login", data);
  return res.data;
};

export const sendOtpAPI = async (data) => {
  const res = await api.post("/auth/admin/forgot-password/send-otp", data);
  return res.data;
};

export const resetPasswordAPI = async (data) => {
  const res = await api.put("/auth/admin/forgot-password/reset-password", data);
  return res.data;
};

/*============== Admin Profile ============*/
export const getAdminProfileAPI = async () => {
  const res = await api.get("/auth/admin/profile");
  return res.data;
};

export const changePasswordAPI = async (data) => {
  const res = await api.put("/auth/admin/change-password", data);
  return res.data;
};

export const updateAdminProfileAPI = async (data) => {
  const res = await api.put("/auth/admin/profile/update", data);
  return res.data;
};

/*============== Game APIs ============*/
export const createGameAPI = async (gameData) => {
  const response = await api.post("/game/create", gameData);
  return response.data;
};

export const startGameAPI = async (round_id) => {
  const response = await api.post("/game/start", { round_id });
  return response.data;
};

export const stopGameAPI = async (round_id) => {
  const response = await api.post("/game/stop", { round_id });
  return response.data;
};

// FIXED: Updated callNumberAPI to support manual numbers
export const callNumberAPI = async (roundId, options = {}) => {
  const payload = options.number ? { round_id: roundId, number: options.number } : { round_id: roundId };
  const response = await api.post("/game/call-number", payload);
  return response.data;
};

export const getGameStatusAPI = async (round_id) => {
  const response = await api.get("/game/status", { params: { round_id } });
  return response.data;
};

export const getWinnersListAPI = async (round_id) => {
  const response = await api.get("/game/winners-list", {
    params: { round_id },
  });
  return response.data;
};

export const getAllGamesAPI = async () => {
  const res = await api.get("/game/all-games");
  return res.data;
};

export const getGameByIdAPI = async (gameId) => {
  const res = await api.get(`/game/${gameId}`);
  return res.data;
};

// ============ agent =========================
export const createAgentAPI = async (agentData) => {
  console.log("📝 CREATE AGENT - Request Data:", agentData);
  const res = await api.post("/agent/agent/save", agentData);
  console.log("✅ CREATE AGENT - Response:", res.data);
  return res.data;
};

export const updateAgentAPI = async (agentData) => {
  console.log("✏️ UPDATE AGENT - Request Data:", agentData);
  console.log("Agent ID being sent:", agentData.agent_id);
  const res = await api.post("/agent/agent/save", agentData);
  console.log("✅ UPDATE AGENT - Response:", res.data);
  return res.data;
};

export const getAllAgentAPI = async () => {
  const res = await api.get("/agent/agent/list");
  return res.data;
};

export const updateAgentStatusAPI = async (agentId, status) => {
  const res = await api.put("/agent/agent/status", { agent_id: agentId, status });
  return res.data;
};

export const getAllTicketsAPI = async (game_id) => {
  const res = await api.get("/ticket/all", { params: { game_id } });
  return res.data;
};

export const getCurrentRoundAPI = async (game_id) => {
  const res = await api.get("/round/current", { params: { game_id } });
  return res.data;
};

export const createRoundAPI = async (data) => {
  const response = await api.post("/round/create", data);
  return response.data;
};

export const generateTicketsAPI = async (data) => {
  const response = await api.post("/ticket/generate", data);
  return response.data;
};

// Get Game Rounds API
export const getGameRoundsAPI = async (game_id) => {
  const response = await api.get("/round/game-rounds", { params: { game_id } });
  return response.data;
};

/*============== Prize APIs ============*/

export const getAllPrizesAPI = async () => {
  const res = await api.get("/admin/prize");
  return res.data;
};

export const addPrizeAPI = async (prizeData) => {
  const res = await api.post("/admin/prize/add", prizeData);
  return res.data;
};

export const updatePrizeAPI = async (prize_id, prizeData) => {
  const res = await api.put(`/admin/prize/${prize_id}`, prizeData);
  return res.data;
};

export const deletePrizeAPI = async (prize_id) => {
  const res = await api.delete(`/admin/prize/${prize_id}`);
  return res.data;
};

/*============== Banner APIs ============*/

export const addBannerAPI = async (image_file) => {
  const formData = new FormData();
  formData.append('image', image_file);

  console.log("📤 Sending banner image:", image_file);
  console.log("FormData entries:");
  for (let pair of formData.entries()) {
    console.log(pair[0], pair[1]);
  }

  const res = await api.post("/admin/banner/add", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const updateBannerAPI = async (id, image_file) => {
  const formData = new FormData();
  formData.append('image', image_file);

  console.log(`📤 Updating banner ${id} with image:`, image_file);

  const res = await api.put(`/admin/banner/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const getBannerAPI = async () => {
  const res = await api.get("/admin/banner");
  return res.data;
};

export const deleteBannerAPI = async (id) => {
  const res = await api.delete(`/admin/banner/${id}`);
  return res.data;
};

/*============== Offer APIs ============*/

// ✅ FIXED: Proper FormData handling with validation
export const addOfferAPI = async (formDataOrFile) => {
  try {
    let formData;

    // ✅ Check karo ki already FormData hai ya File object
    if (formDataOrFile instanceof FormData) {
      formData = formDataOrFile;
      console.log("📤 Received FormData object");
    } else {
      // Agar File object directly aaya hai
      formData = new FormData();
      formData.append('image', formDataOrFile);
      console.log("📤 Received File object, created FormData");
    }

    // ✅ Debug: Check karo FormData content
    console.log("=== ADD OFFER - FormData Debug ===");
    let hasImage = false;
    for (let pair of formData.entries()) {
      console.log(`Field: ${pair[0]}`);
      console.log(`Value:`, pair[1]);
      if (pair[1] instanceof File) {
        hasImage = true;
        console.log(`  File Name: ${pair[1].name}`);
        console.log(`  File Size: ${pair[1].size} bytes`);
        console.log(`  File Type: ${pair[1].type}`);
      }
    }

    if (!hasImage) {
      console.error("❌ FormData mein image field nahi hai!");
    }

    const res = await api.post("/admin/offers/add", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log("✅ Offer Added Successfully:", res.data);
    return res.data;

  } catch (error) {
    console.error("❌ Error adding offer:", error.response?.data || error.message);
    throw error;
  }
};

export const getAllOffersAPI = async () => {
  const res = await api.get("/admin/offers");
  return res.data;
};

// ✅ FIXED: Update offer with proper FormData handling
export const updateOfferAPI = async (id, formDataOrFile) => {
  try {
    let formData;

    // ✅ Check karo ki already FormData hai ya File object
    if (formDataOrFile instanceof FormData) {
      formData = formDataOrFile;
      console.log(`📤 Updating offer ${id} with FormData`);
    } else if (formDataOrFile instanceof File) {
      formData = new FormData();
      formData.append('image', formDataOrFile);
      console.log(`📤 Updating offer ${id} with File object`);
    } else {
      // Agar kuch bhi nahi aaya (edit without new image)
      formData = new FormData();
      console.log(`📤 Updating offer ${id} without new image`);
    }

    // ✅ Debug
    console.log("=== UPDATE OFFER - FormData Debug ===");
    for (let pair of formData.entries()) {
      console.log(`Field: ${pair[0]}`, pair[1]);
    }

    const res = await api.put(`/admin/offers/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log("✅ Offer Updated Successfully:", res.data);
    return res.data;

  } catch (error) {
    console.error("❌ Error updating offer:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteOfferAPI = async (id) => {
  const res = await api.delete(`/admin/offers/${id}`);
  return res.data;
};

export const updateGameAPI = async (gameId, gameData) => {
  const response = await api.put(`/game/update/${gameId}`, gameData);
  return response.data;
};

/*============== User APIs =============*/
export const getUserDetailsAPI = async () => {
  const response = await api.get(`/user/users`);
  return response.data;
};

/*============== Admin Winner APIs =============*/

// Force winner by number
export const forceWinnerByNumberAPI = async (roundId, data) => {
  const response = await api.post(`/admin/force-winner-by-number/${roundId}`, data);
  return response.data;
};

// Force winner by ticket ID
export const forceWinnerByTicketAPI = async (roundId, data) => {
  const response = await api.post(`/admin/force-winner-by-ticket/${roundId}`, data);
  return response.data;
};

// Admin announcement
export const adminAnnounceAPI = async (roundId, data) => {
  const response = await api.post(`/admin/announce/${roundId}`, data);
  return response.data;
};

/*============== KYC APIs =============*/
export const getUserKycAPI = async (userId) => {
  const response = await api.get(`/user/kyc/${userId}`);
  return response.data;
};

export const updateKycStatusAPI = async (userId, status) => {
  const response = await api.put(`/user/kyc/status/${userId}`, { status });
  return response.data;
};

/*============== Transaction APIs =============*/
export const getUserGameHistoryAPI = async (userId) => {
  const response = await api.get(`/user/game-history/${userId}`);
  return response.data;
};

/*============== Video APIs =============*/
export const addFeedbackVideoAPI = async (videoData) => {
  const response = await api.post("/user/feedback-video", videoData);
  return response.data;
};

export const getAllFeedbackVideosAPI = async () => {
  const response = await api.get("/user/feedback-video/all");
  return response.data;
};

export const updateFeedbackVideoAPI = async (videoId, videoData) => {
  const response = await api.put(`/user/feedback-video/${videoId}`, videoData);
  return response.data;
};

/*============== Dashboard APIs =============*/
export const getDashboardDataAPI = async () => {
  const response = await api.get("/admin/dashboard");
  return response;
};



/*============== How It Works APIs =============*/

// Get current "How It Works" video
export const getHowItWorksAPI = async () => {
  try {
    console.log("📡 Fetching How It Works video...");
    const response = await api.get("/admin/how-it-works");
    console.log("✅ How It Works Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching How It Works:", error.response?.data || error.message);
    throw error;
  }
};

// Add  "How It Works" video
export const howItWorksAddAPI = async (videoData) => {
  try {
    console.log("📤 Adding/Updating How It Works video:", videoData);
    const response = await api.post("/admin/how-it-works/add", videoData);
    console.log("✅ How It Works Add Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error adding How It Works video:", error.response?.data || error.message);
    throw error;
  }
};

// Update existing "How It Works" video
export const updateHowItWorksAPI = async (id, videoData) => {
  try {
    console.log("📤 Updating How It Works video - ID:", id, "Data:", videoData);
    const response = await api.put(`admin/how-it-works/${id}`, videoData);
    console.log("✅ How It Works Update Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating How It Works video:", error.response?.data || error.message);
    throw error;
  }
};


/*============== Winners Banners APIs =============*/

// Get current "winner baner" 
export const getWinnerBannersAPI = async () => {
  try {
    const response = await api.get("/admin/winner-banner");
    console.log("✅ Winner Banner Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching Winner Banner:", error.response?.data || error.message);
    throw error;
  }
};

// Add new winner banner (FormData)
export const addWinnerBannerAPI = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    console.log("📤 Adding Winner Banner - File:", imageFile.name, "Size:", imageFile.size);

    const response = await api.put("/admin/winner-banner/add", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log("✅ Winner Banner Add Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error adding Winner Banner:", error.response?.data || error.message);
    throw error;
  }
};

// Update existing winner banner (FormData)
export const updateWinnerBannerAPI = async (id, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    console.log(`📤 Updating Winner Banner ID ${id} - File:`, imageFile.name);

    const response = await api.put(`/admin/winner-banner/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log("✅ Winner Banner Update Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating Winner Banner:", error.response?.data || error.message);
    throw error;
  }
};


/*============== Exporting API instance =============*/

// Get "withdraw requests" 
export const getWithdrawRequestsAPI = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/wallet/admin/withdrawals?page=${page}&limit=${limit}`);
    console.log("✅ Get Withdraw req Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching withdraw req:", error.response?.data || error.message);
    throw error;
  }
};

// Change withdraw request status (approve/reject)
export const changeWithdrawReqStatusAPI = async (data) => {
  try {
    console.log("📤 Updating withdraw request status:", data);
    const response = await api.post("/wallet/admin/withdrawals/update-status", data);
    console.log("✅ Change status Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error changing status of withdraw req:", error.response?.data || error.message);
    throw error;
  }
};

export default api;