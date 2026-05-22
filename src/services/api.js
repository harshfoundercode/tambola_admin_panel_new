// import axios from "axios";

// // Testing URL
// const API_BASE_URL = "https://api.luckyfunda.com/api";

// const UPLOAD_BASE_URL = "https://api.luckyfunda.com";


// const api = axios.create({
//   baseURL: API_BASE_URL,

// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   console.log("TOKEN =>", token);

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }


//   if (!(config.data instanceof FormData)) {
//     config.headers["Content-Type"] = "application/json";
//   }

//   return config;
// });

// /*============== Admin Login ============*/
// export const loginAPI = async (data) => {
//   const res = await api.post("/auth/admin/login", data);
//   return res.data;
// };

// export const sendOtpAPI = async (data) => {
//   const res = await api.post("/auth/admin/forgot-password/send-otp", data);
//   return res.data;
// };

// export const resetPasswordAPI = async (data) => {
//   const res = await api.put("/auth/admin/forgot-password/reset-password", data);
//   return res.data;
// };

// /*============== Admin Profile ============*/
// export const getAdminProfileAPI = async () => {
//   const res = await api.get("/auth/admin/profile");
//   return res.data;
// };

// export const changePasswordAPI = async (data) => {
//   const res = await api.put("/auth/admin/change-password", data);
//   return res.data;
// };

// export const updateAdminProfileAPI = async (data) => {
//   const res = await api.put("/auth/admin/profile/update", data);
//   return res.data;
// };

// /*============== Game APIs ============*/
// export const createGameAPI = async (gameData) => {
//   const response = await api.post("/game/create", gameData);
//   return response.data;
// };

// export const startGameAPI = async (round_id) => {
//   const response = await api.post("/game/start", { round_id });
//   return response.data;
// };

// export const stopGameAPI = async (round_id) => {
//   const response = await api.post("/game/stop", { round_id });
//   return response.data;
// };

// // FIXED: Updated callNumberAPI to support manual numbers
// export const callNumberAPI = async (roundId, options = {}) => {
//   const payload = options.number ? { round_id: roundId, number: options.number } : { round_id: roundId };
//   const response = await api.post("/game/call-number", payload);
//   return response.data;
// };

// export const getGameStatusAPI = async (round_id) => {
//   const response = await api.get("/game/status", { params: { round_id } });
//   return response.data;
// };

// export const getWinnersListAPI = async (round_id) => {
//   const response = await api.get("/game/winners-list", {
//     params: { round_id },
//   });
//   return response.data;
// };

// export const getAllGamesAPI = async () => {
//   const res = await api.get("/game/all-games");
//   return res.data;
// };

// export const getGameByIdAPI = async (gameId) => {
//   const res = await api.get(`/game/${gameId}`);
//   return res.data;
// };

// // ============ agent =========================
// export const createAgentAPI = async (agentData) => {
//   console.log("📝 CREATE AGENT - Request Data:", agentData);
//   const res = await api.post("/agent/agent/save", agentData);
//   console.log("✅ CREATE AGENT - Response:", res.data);
//   return res.data;
// };

// export const updateAgentAPI = async (agentData) => {
//   console.log("✏️ UPDATE AGENT - Request Data:", agentData);
//   console.log("Agent ID being sent:", agentData.agent_id);
//   const res = await api.post("/agent/agent/save", agentData);
//   console.log("✅ UPDATE AGENT - Response:", res.data);
//   return res.data;
// };

// export const getAllAgentAPI = async () => {
//   const res = await api.get("/agent/agent/list");
//   return res.data;
// };

// export const updateAgentStatusAPI = async (agentId, status) => {
//   const res = await api.put("/agent/agent/status", { agent_id: agentId, status });
//   return res.data;
// };

// export const getAllTicketsAPI = async (game_id) => {
//   const res = await api.get("/ticket/all", { params: { game_id } });
//   return res.data;
// };

// export const getCurrentRoundAPI = async (game_id) => {
//   const res = await api.get("/round/current", { params: { game_id } });
//   return res.data;
// };

// export const createRoundAPI = async (data) => {
//   const response = await api.post("/round/create", data);
//   return response.data;
// };

// export const generateTicketsAPI = async (data) => {
//   const response = await api.post("/ticket/generate", data);
//   return response.data;
// };

// // Get Game Rounds API
// export const getGameRoundsAPI = async (game_id) => {
//   const response = await api.get("/round/game-rounds", { params: { game_id } });
//   return response.data;
// };

// /*============== Prize APIs ============*/

// export const getAllPrizesAPI = async () => {
//   const res = await api.get("/admin/prize");
//   return res.data;
// };

// export const addPrizeAPI = async (prizeData) => {
//   const res = await api.post("/admin/prize/add", prizeData);
//   return res.data;
// };

// export const updatePrizeAPI = async (prize_id, prizeData) => {
//   const res = await api.put(`/admin/prize/${prize_id}`, prizeData);
//   return res.data;
// };

// export const deletePrizeAPI = async (prize_id) => {
//   const res = await api.delete(`/admin/prize/${prize_id}`);
//   return res.data;
// };

// /*============== Banner APIs ============*/

// export const addBannerAPI = async (image_file) => {
//   const formData = new FormData();
//   formData.append('image', image_file);

//   console.log("📤 Sending banner image:", image_file);
//   console.log("FormData entries:");
//   for (let pair of formData.entries()) {
//     console.log(pair[0], pair[1]);
//   }

//   const res = await api.post("/admin/banner/add", formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });
//   return res.data;
// };

// export const updateBannerAPI = async (id, image_file) => {
//   const formData = new FormData();
//   formData.append('image', image_file);

//   console.log(`📤 Updating banner ${id} with image:`, image_file);

//   const res = await api.put(`/admin/banner/${id}`, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });
//   return res.data;
// };

// export const getBannerAPI = async () => {
//   const res = await api.get("/admin/banner");
//   return res.data;
// };

// export const deleteBannerAPI = async (id) => {
//   const res = await api.delete(`/admin/banner/${id}`);
//   return res.data;
// };

// /*============== Offer APIs ============*/

// // ✅ FIXED: Proper FormData handling with validation
// export const addOfferAPI = async (formDataOrFile) => {
//   try {
//     let formData;

//     // ✅ Check karo ki already FormData hai ya File object
//     if (formDataOrFile instanceof FormData) {
//       formData = formDataOrFile;
//       console.log("📤 Received FormData object");
//     } else {
//       // Agar File object directly aaya hai
//       formData = new FormData();
//       formData.append('image', formDataOrFile);
//       console.log("📤 Received File object, created FormData");
//     }

//     // ✅ Debug: Check karo FormData content
//     console.log("=== ADD OFFER - FormData Debug ===");
//     let hasImage = false;
//     for (let pair of formData.entries()) {
//       console.log(`Field: ${pair[0]}`);
//       console.log(`Value:`, pair[1]);
//       if (pair[1] instanceof File) {
//         hasImage = true;
//         console.log(`  File Name: ${pair[1].name}`);
//         console.log(`  File Size: ${pair[1].size} bytes`);
//         console.log(`  File Type: ${pair[1].type}`);
//       }
//     }

//     if (!hasImage) {
//       console.error("❌ FormData mein image field nahi hai!");
//     }

//     const res = await api.post("/admin/offers/add", formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });

//     console.log("✅ Offer Added Successfully:", res.data);
//     return res.data;

//   } catch (error) {
//     console.error("❌ Error adding offer:", error.response?.data || error.message);
//     throw error;
//   }
// };

// export const getAllOffersAPI = async () => {
//   const res = await api.get("/admin/offers");
//   return res.data;
// };

// // ✅ FIXED: Update offer with proper FormData handling
// export const updateOfferAPI = async (id, formDataOrFile) => {
//   try {
//     let formData;

//     // ✅ Check karo ki already FormData hai ya File object
//     if (formDataOrFile instanceof FormData) {
//       formData = formDataOrFile;
//       console.log(`📤 Updating offer ${id} with FormData`);
//     } else if (formDataOrFile instanceof File) {
//       formData = new FormData();
//       formData.append('image', formDataOrFile);
//       console.log(`📤 Updating offer ${id} with File object`);
//     } else {
//       // Agar kuch bhi nahi aaya (edit without new image)
//       formData = new FormData();
//       console.log(`📤 Updating offer ${id} without new image`);
//     }

//     // ✅ Debug
//     console.log("=== UPDATE OFFER - FormData Debug ===");
//     for (let pair of formData.entries()) {
//       console.log(`Field: ${pair[0]}`, pair[1]);
//     }

//     const res = await api.put(`/admin/offers/${id}`, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });

//     console.log("✅ Offer Updated Successfully:", res.data);
//     return res.data;

//   } catch (error) {
//     console.error("❌ Error updating offer:", error.response?.data || error.message);
//     throw error;
//   }
// };

// export const deleteOfferAPI = async (id) => {
//   const res = await api.delete(`/admin/offers/${id}`);
//   return res.data;
// };

// export const updateGameAPI = async (gameId, gameData) => {
//   const response = await api.put(`/game/update/${gameId}`, gameData);
//   return response.data;
// };

// /*============== User APIs =============*/
// export const getUserDetailsAPI = async () => {
//   const response = await api.get(`/user/users`);
//   return response.data;
// };

// /*============== Admin Winner APIs =============*/

// // Force winner by number
// export const forceWinnerByNumberAPI = async (roundId, data) => {
//   const response = await api.post(`/admin/force-winner-by-number/${roundId}`, data);
//   return response.data;
// };

// // Force winner by ticket ID
// export const forceWinnerByTicketAPI = async (roundId, data) => {
//   const response = await api.post(`/admin/force-winner-by-ticket/${roundId}`, data);
//   return response.data;
// };

// // Admin announcement
// export const adminAnnounceAPI = async (roundId, data) => {
//   const response = await api.post(`/admin/announce/${roundId}`, data);
//   return response.data;
// };

// /*============== KYC APIs =============*/
// export const getUserKycAPI = async (userId) => {
//   const response = await api.get(`/user/kyc/${userId}`);
//   return response.data;
// };

// export const updateKycStatusAPI = async (userId, status) => {
//   console.log(`Updating KYC status for user ${userId} to ${status}`);
//   const response = await api.put(`/user/kyc/status/${userId}`, { status });
//   console.log(`KYC status update response for user ${userId}:`, response.data);
//   return response.data;
// };

// /*============== Transaction APIs =============*/
// export const getUserGameHistoryAPI = async (userId) => {
//   const response = await api.get(`/user/game-history/${userId}`);
//   return response.data;
// };

// /*============== Video APIs =============*/
// export const addFeedbackVideoAPI = async (videoData) => {
//   const response = await api.post("/user/feedback-video", videoData);
//   return response.data;
// };

// export const getAllFeedbackVideosAPI = async () => {
//   const response = await api.get("/user/feedback-video/all");
//   return response.data;
// };

// export const updateFeedbackVideoAPI = async (videoId, videoData) => {
//   const response = await api.put(`/user/feedback-video/${videoId}`, videoData);
//   return response.data;
// };

// /*============== Dashboard APIs =============*/
// export const getDashboardDataAPI = async () => {
//   const response = await api.get("/admin/dashboard");
//   return response;
// };



// /*============== How It Works APIs =============*/

// // Get current "How It Works" video
// export const getHowItWorksAPI = async () => {
//   try {
//     console.log("📡 Fetching How It Works video...");
//     const response = await api.get("/admin/how-it-works");
//     console.log("✅ How It Works Response:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching How It Works:", error.response?.data || error.message);
//     throw error;
//   }
// };

// // Add  "How It Works" video
// export const howItWorksAddAPI = async (videoData) => {
//   try {
//     console.log("📤 Adding/Updating How It Works video:", videoData);
//     const response = await api.post("/admin/how-it-works/add", videoData);
//     console.log("✅ How It Works Add Response:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error adding How It Works video:", error.response?.data || error.message);
//     throw error;
//   }
// };

// // Update existing "How It Works" video
// export const updateHowItWorksAPI = async (id, videoData) => {
//   try {
//     console.log("📤 Updating How It Works video - ID:", id, "Data:", videoData);
//     const response = await api.put(`admin/how-it-works/${id}`, videoData);
//     console.log("✅ How It Works Update Response:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error updating How It Works video:", error.response?.data || error.message);
//     throw error;
//   }
// };


// /*============== Winners Banners APIs =============*/

// // Get current "winner baner" 
// export const getWinnerBannersAPI = async () => {
//   try {
//     const response = await api.get("/admin/winner-banner");
//     console.log("✅ Winner Banner Response:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching Winner Banner:", error.response?.data || error.message);
//     throw error;
//   }
// };

// // Add new winner banner (FormData)
// export const addWinnerBannerAPI = async (imageFile) => {
//   try {
//     const formData = new FormData();
//     formData.append('image', imageFile);

//     console.log("📤 Adding Winner Banner - File:", imageFile.name, "Size:", imageFile.size);

//     const response = await api.put("/admin/winner-banner/add", formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });

//     console.log("✅ Winner Banner Add Response:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error adding Winner Banner:", error.response?.data || error.message);
//     throw error;
//   }
// };

// // Update existing winner banner (FormData)
// export const updateWinnerBannerAPI = async (id, imageFile) => {
//   try {
//     const formData = new FormData();
//     formData.append('image', imageFile);

//     console.log(`📤 Updating Winner Banner ID ${id} - File:`, imageFile.name);

//     const response = await api.put(`/admin/winner-banner/${id}`, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });

//     console.log("✅ Winner Banner Update Response:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error updating Winner Banner:", error.response?.data || error.message);
//     throw error;
//   }
// };


// /*============== Exporting API instance =============*/

// // Get "withdraw requests" 
// export const getWithdrawRequestsAPI = async (page = 1, limit = 10) => {
//   try {
//     const response = await api.get(`/wallet/admin/withdrawals?page=${page}&limit=${limit}`);
//     console.log("✅ Get Withdraw req Response:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching withdraw req:", error.response?.data || error.message);
//     throw error;
//   }
// };

// // Change withdraw request status (approve/reject)
// export const changeWithdrawReqStatusAPI = async (data) => {
//   try {
//     console.log("📤 Updating withdraw request status:", data);
//     const response = await api.post("/wallet/admin/withdrawals/update-status", data);
//     console.log("✅ Change status Response:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error changing status of withdraw req:", error.response?.data || error.message);
//     throw error;
//   }
// };

// export default api;
import axios from "axios";

// Testing URL
const API_BASE_URL = "https://api.luckyfunda.com/api";

const TESTING_API_BASE_URL = "https://api.luckyfunda.com/";

const UPLOAD_BASE_URL = "https://api.luckyfunda.com";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Helper function to log API calls
const logApiCall = (method, url, data = null, response = null, error = null) => {
  const fullUrl = `${API_BASE_URL}${url}`;
  console.log("========================================");
  console.log(`🔗 API ${method.toUpperCase()}: ${fullUrl}`);
  if (data) {
    console.log("📤 Request Data:", typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  }
  if (response) {
    console.log("✅ Response:", JSON.stringify(response, null, 2));
  }
  if (error) {
    console.log("❌ Error:", error.response?.data || error.message);
  }
  console.log("========================================");
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  
  console.log("🔐 Token Retrieved:", token);
  // Log request URL
  const fullUrl = `${API_BASE_URL}${config.url}`;
  console.log(`🚀 REQUEST: ${config.method?.toUpperCase()} ${fullUrl}`);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("🔑 Token Present: Yes");
  } else {
    console.log("🔑 Token Present: No");
  }

  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    // Log successful response
    const fullUrl = `${API_BASE_URL}${response.config.url}`;
    console.log(`✅ RESPONSE [${response.status}]: ${fullUrl}`);
    console.log("📥 Data:", JSON.stringify(response.data, null, 2));
    return response;
  },
  (error) => {
    // Log error response
    const fullUrl = `${API_BASE_URL}${error.config?.url}`;
    console.log(`❌ ERROR [${error.response?.status}]: ${fullUrl}`);
    console.log("📥 Error Data:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/*============== Admin Login ============*/
export const loginAPI = async (data) => {
  console.log("🔐 LOGIN API CALLED");
  const res = await api.post("/auth/admin/login", data);
  return res.data;
};

export const sendOtpAPI = async (data) => {
  console.log("📧 SEND OTP API CALLED");
  const res = await api.post("/auth/admin/forgot-password/send-otp", data);
  return res.data;
};

export const resetPasswordAPI = async (data) => {
  console.log("🔑 RESET PASSWORD API CALLED");
  const res = await api.put("/auth/admin/forgot-password/reset-password", data);
  return res.data;
};

/*============== Admin Profile ============*/
export const getAdminProfileAPI = async () => {
  console.log("👤 GET ADMIN PROFILE API CALLED");
  const res = await api.get("/auth/admin/profile");
  return res.data;
};

export const changePasswordAPI = async (data) => {
  console.log("🔒 CHANGE PASSWORD API CALLED");
  const res = await api.put("/auth/admin/change-password", data);
  return res.data;
};

export const updateAdminProfileAPI = async (data) => {
  console.log("✏️ UPDATE ADMIN PROFILE API CALLED");
  const res = await api.put("/auth/admin/profile/update", data);
  return res.data;
};

/*============== Game APIs ============*/
export const createGameAPI = async (gameData) => {
  console.log("🎮 CREATE GAME API CALLED");
  const response = await api.post("/game/create", gameData);
  return response.data;
};

export const startGameAPI = async (round_id) => {
  console.log("▶️ START GAME API CALLED");
  const response = await api.post("/game/start", { round_id });
  return response.data;
};

export const stopGameAPI = async (round_id) => {
  console.log("⏹️ STOP GAME API CALLED");
  const response = await api.post("/game/stop", { round_id });
  return response.data;
};

export const callNumberAPI = async (roundId, options = {}) => {
  console.log("🔢 CALL NUMBER API CALLED");
  const payload = options.number ? { round_id: roundId, number: options.number } : { round_id: roundId };
  const response = await api.post("/game/call-number", payload);
  return response.data;
};

export const getGameStatusAPI = async (round_id) => {
  console.log("📊 GET GAME STATUS API CALLED");
  const response = await api.get("/game/status", { params: { round_id } });
  return response.data;
};

export const getWinnersListAPI = async (round_id) => {
  console.log("🏆 GET WINNERS LIST API CALLED");
  const response = await api.get("/game/winners-list", { params: { round_id } });
  return response.data;
};

export const getAllGamesAPI = async () => {
  console.log("🎲 GET ALL GAMES API CALLED");
  const res = await api.get("/game/all-games");
  return res.data;
};

export const getGameByIdAPI = async (gameId) => {
  console.log("🎯 GET GAME BY ID API CALLED");
  const res = await api.get(`/game/${gameId}`);
  return res.data;
};

/*============== Agent APIs ============*/
export const createAgentAPI = async (agentData) => {
  console.log("👨‍💼 CREATE AGENT API CALLED");
  const res = await api.post("/agent/agent/save", agentData);
  return res.data;
};

export const updateAgentAPI = async (agentData) => {
  console.log("✏️ UPDATE AGENT API CALLED");
  const res = await api.post("/agent/agent/save", agentData);
  return res.data;
};

export const getAllAgentAPI = async () => {
  console.log("📋 GET ALL AGENTS API CALLED");
  const res = await api.get("/agent/agent/list");
  return res.data;
};

export const updateAgentStatusAPI = async (agentId, status) => {
  console.log("🔄 UPDATE AGENT STATUS API CALLED");
  const res = await api.put("/agent/agent/status", { agent_id: agentId, status });
  return res.data;
};

/*============== Ticket APIs ============*/
export const getAllTicketsAPI = async (game_id) => {
  console.log("🎫 GET ALL TICKETS API CALLED");
  const res = await api.get("/ticket/all", { params: { game_id } });
  return res.data;
};

export const generateTicketsAPI = async (data) => {
  console.log("🎟️ GENERATE TICKETS API CALLED");
  const response = await api.post("/ticket/generate", data);
  return response.data;
};

/*============== Round APIs ============*/
export const getCurrentRoundAPI = async (game_id) => {
  console.log("🔄 GET CURRENT ROUND API CALLED");
  const res = await api.get("/round/current", { params: { game_id } });
  return res.data;
};

export const createRoundAPI = async (data) => {
  console.log("➕ CREATE ROUND API CALLED");
  const response = await api.post("/round/create", data);
  return response.data;
};

export const getGameRoundsAPI = async (game_id) => {
  console.log("📋 GET GAME ROUNDS API CALLED");
  const response = await api.get("/round/game-rounds", { params: { game_id } });
  return response.data;
};

/*============== Prize APIs ============*/
export const getAllPrizesAPI = async () => {
  console.log("🏅 GET ALL PRIZES API CALLED");
  const res = await api.get("/admin/prize");
  return res.data;
};

export const addPrizeAPI = async (prizeData) => {
  console.log("➕ ADD PRIZE API CALLED");
  const res = await api.post("/admin/prize/add", prizeData);
  return res.data;
};

export const updatePrizeAPI = async (prize_id, prizeData) => {
  console.log("✏️ UPDATE PRIZE API CALLED");
  const res = await api.put(`/admin/prize/${prize_id}`, prizeData);
  return res.data;
};

export const deletePrizeAPI = async (prize_id) => {
  console.log("🗑️ DELETE PRIZE API CALLED");
  const res = await api.delete(`/admin/prize/${prize_id}`);
  return res.data;
};

/*============== Banner APIs ============*/
export const addBannerAPI = async (image_file) => {
  console.log("🖼️ ADD BANNER API CALLED");
  const formData = new FormData();
  formData.append('image', image_file);
  
  const res = await api.post("/admin/banner/add", formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const updateBannerAPI = async (id, image_file) => {
  console.log("✏️ UPDATE BANNER API CALLED");
  const formData = new FormData();
  formData.append('image', image_file);
  
  const res = await api.put(`/admin/banner/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getBannerAPI = async () => {
  console.log("🖼️ GET BANNERS API CALLED");
  const res = await api.get("/admin/banner");
  return res.data;
};

export const deleteBannerAPI = async (id) => {
  console.log("🗑️ DELETE BANNER API CALLED");
  const res = await api.delete(`/admin/banner/${id}`);
  return res.data;
};

/*============== Offer APIs ============*/
export const addOfferAPI = async (formDataOrFile) => {
  console.log("🎁 ADD OFFER API CALLED");
  try {
    let formData;
    
    if (formDataOrFile instanceof FormData) {
      formData = formDataOrFile;
    } else {
      formData = new FormData();
      formData.append('image', formDataOrFile);
    }
    
    const res = await api.post("/admin/offers/add", formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const getAllOffersAPI = async () => {
  console.log("🎁 GET ALL OFFERS API CALLED");
  const res = await api.get("/admin/offers");
  return res.data;
};

export const updateOfferAPI = async (id, formDataOrFile) => {
  console.log("✏️ UPDATE OFFER API CALLED");
  try {
    let formData;
    
    if (formDataOrFile instanceof FormData) {
      formData = formDataOrFile;
    } else if (formDataOrFile instanceof File) {
      formData = new FormData();
      formData.append('image', formDataOrFile);
    } else {
      formData = new FormData();
    }
    
    const res = await api.put(`/admin/offers/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

export const deleteOfferAPI = async (id) => {
  console.log("🗑️ DELETE OFFER API CALLED");
  const res = await api.delete(`/admin/offers/${id}`);
  return res.data;
};

export const updateGameAPI = async (gameId, gameData) => {
  console.log("✏️ UPDATE GAME API CALLED");
  const response = await api.put(`/game/update/${gameId}`, gameData);
  return response.data;
};

/*============== User APIs ============*/
export const getUserDetailsAPI = async () => {
  console.log("👥 GET USER DETAILS API CALLED");
  const response = await api.get(`/user/users`);
  return response.data;
};

/*============== Admin Winner APIs ============*/
export const forceWinnerByNumberAPI = async (roundId, data) => {
  console.log("🏆 FORCE WINNER BY NUMBER API CALLED");
  const response = await api.post(`/admin/force-winner-by-number/${roundId}`, data);
  return response.data;
};

export const forceWinnerByTicketAPI = async (roundId, data) => {
  console.log("🎫 FORCE WINNER BY TICKET API CALLED");
  const response = await api.post(`/admin/force-winner-by-ticket/${roundId}`, data);
  return response.data;
};

export const adminAnnounceAPI = async (roundId, data) => {
  console.log("📢 ADMIN ANNOUNCE API CALLED");
  const response = await api.post(`/admin/announce/${roundId}`, data);
  return response.data;
};

/*============== KYC APIs ============*/
export const getUserKycAPI = async (userId) => {
  console.log("🔍 GET USER KYC API CALLED");
  const response = await api.get(`/user/kyc/${userId}`);
  return response.data;
};

// export const updateKycStatusAPI = async (userId, status) => {
//   console.log("✏️ UPDATE KYC STATUS API CALLED");
//   const response = await api.put(`/user/kyc/status/${userId}`, { status });
//   console.log(`KYC status update response for user ${userId}:`, response.data);
//   return response.data;
// };

export const updateKycStatusAPI = async (kycId, status, rejectReason = "") => {
  try {
    const body = {
      status: status
    };
    
    // Only add reject_reason if status is rejected and reason is provided
    if (status === "rejected" && rejectReason) {
      body.reject_reason = rejectReason;
    }
    
    console.log("📤 Updating KYC status:", { kycId, body });
    const response = await api.put(`/user/kyc/status/${kycId}`, body);
    console.log("✅ KYC status update Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating KYC status:", error.response?.data || error.message);
    throw error;
  }
};

/*============== Transaction APIs ============*/
export const getUserGameHistoryAPI = async (userId) => {
  console.log("📜 GET USER GAME HISTORY API CALLED");
  const response = await api.get(`/user/game-history/${userId}`);
  return response.data;
};


export const getUserTransactionHistoryAPI = async (userId) => {
  console.log("📜 GET USER GAME HISTORY API CALLED");
  const response = await api.get(`/user/transaction-history/${userId}`);
  return response.data;
};

/*============== Video APIs ============*/
export const addFeedbackVideoAPI = async (videoData) => {
  console.log("🎥 ADD FEEDBACK VIDEO API CALLED");
  const response = await api.post("/user/feedback-video", videoData);
  return response.data;
};

export const getAllFeedbackVideosAPI = async () => {
  console.log("🎥 GET ALL FEEDBACK VIDEOS API CALLED");
  const response = await api.get("/user/feedback-video/all");
  return response.data;
};

export const updateFeedbackVideoAPI = async (videoId, videoData) => {
  console.log("✏️ UPDATE FEEDBACK VIDEO API CALLED");
  const response = await api.put(`/user/feedback-video/${videoId}`, videoData);
  return response.data;
};

/*============== Dashboard APIs ============*/
export const getDashboardDataAPI = async () => {
  console.log("📊 GET DASHBOARD DATA API CALLED");
  const response = await api.get("/admin/dashboard");
  return response;
};

/*============== How It Works APIs ============*/
export const getHowItWorksAPI = async () => {
  console.log("📖 GET HOW IT WORKS API CALLED");
  try {
    const response = await api.get("/admin/how-it-works");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const howItWorksAddAPI = async (videoData) => {
  console.log("➕ ADD HOW IT WORKS API CALLED");
  try {
    const response = await api.post("/admin/how-it-works/add", videoData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateHowItWorksAPI = async (id, videoData) => {
  console.log("✏️ UPDATE HOW IT WORKS API CALLED");
  try {
    const response = await api.put(`admin/how-it-works/${id}`, videoData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/*============== Winners Banners APIs ============*/
export const getWinnerBannersAPI = async () => {
  console.log("🏆 GET WINNER BANNERS API CALLED");
  try {
    const response = await api.get("/admin/winner-banner");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addWinnerBannerAPI = async (imageFile) => {
  console.log("➕ ADD WINNER BANNER API CALLED");
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.put("/admin/winner-banner/add", formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateWinnerBannerAPI = async (id, imageFile) => {
  console.log("✏️ UPDATE WINNER BANNER API CALLED");
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.put(`/admin/winner-banner/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/*============== Withdrawal APIs ============*/
export const getWithdrawRequestsAPI = async (page = 1, limit = 10) => {
  console.log("💰 GET WITHDRAW REQUESTS API CALLED");
  try {
    const response = await api.get(`/wallet/admin/withdrawals?page=${page}&limit=${limit}`);
    console.log("✅ Withdraw Requests Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching withdraw requests:", error.response?.data || error.message);
    throw error;
  }
};

export const changeWithdrawReqStatusAPI = async (data) => {
  console.log("🔄 CHANGE WITHDRAW STATUS API CALLED");
  try {
    console.log("📤 Status Update Data:", JSON.stringify(data, null, 2));
    const response = await api.post("/wallet/admin/withdrawals/update-status", data);
    console.log("✅ Status Update Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error changing withdraw status:", error.response?.data || error.message);
    throw error;
  }
};


/*============== Footer/Contact APIs ============*/
export const getFooterDataAPI = async () => {
  console.log("📋 GET FOOTER DATA API CALLED");
  try {
    const response = await api.get("/admin/footer-data"); // Adjust endpoint as needed
    console.log("✅ Footer Data Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching footer data:", error.response?.data || error.message);
    throw error;
  }
};

/*============== Bulk Transfer Number APIs ============*/
export const bulkTransferNumberAnnounceAPI = async (data) => {
  try {
    console.log("📤 Status Update Data:", JSON.stringify(data));
    const response = await api.post("/game/set-bulk-announcement", data);
    console.log("✅ bulkTransferNumberAnnounceAPI  Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error in bulk transfer number status:", error.response?.data || error.message);
    throw error;
  }
};
export default api;