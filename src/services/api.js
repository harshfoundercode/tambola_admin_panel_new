import axios from "axios";

// Testing URL
const API_BASE_URL = "https://testingtambola.honeywithmoon.com/api";

// Live URL
// const API_BASE_URL = "https://tambola.honeywithmoon.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
    console.log("TOKEN =>", token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
  // If options has a number property, it's a manual call
  // Otherwise it's an auto-call
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

// export const addBannerAPI = async (image_url) => {
//   const res = await api.post("/admin/banner/add", { image_url });
//   return res.data;
// };

// export const updateBannerAPI = async (id, image_url) => {
//   const res = await api.put(`/admin/banner/${id}`, { image_url });
//   return res.data;
// };

export const addBannerAPI = async (image_file) => {
  const formData = new FormData();
  formData.append('image', image_file);
  
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

export const addOfferAPI = async (image_url) => {
  const formData = new FormData();
  formData.append('image', image_url);
  
  const res = await api.post("/admin/offers/add", formData,{
     headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const getAllOffersAPI = async () => {
  const res = await api.get("/admin/offers");
  return res.data;
};

export const updateOfferAPI = async (id, image_url) => {
   const formData = new FormData();
  formData.append('image', image_url);

  const res = await api.put(`/admin/offers/${id}`, formData,{
     headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
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

/*============== Admin Winner APIs Not make api for  only test =============*/

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

export default api;