// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   Gift,
//   Users,
//   IndianRupee,
//   Save,
//   Loader2,
// } from "lucide-react";

// export default function ReferralSettings() {
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);

//   const [formData, setFormData] = useState({
//     max_referral_earning_limit: "",
//     referrer_reward_amount: "",
//     referred_user_reward_amount: "",
//   });



//   // ================= UPDATE API =================
//   const updateReferralSettings = async () => {
//     try {
//       setSaving(true);

//       await axios.post(
//         "https://api.luckyfunda.com/api/auth/admin/referral-settings",
//         formData
//       );

//       alert("Settings Updated Successfully");
//     } catch (error) {
//       console.log(error);
//       alert("Failed to update settings");
//     } finally {
//       setSaving(false);
//     }
//   };



//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const cardStyle = {
//     background: "#fff",
//     borderRadius: "24px",
//     padding: "25px",
//     boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
//     flex: 1,
//     minWidth: "280px",
//   };

//   const inputStyle = {
//     width: "100%",
//     padding: "14px",
//     marginTop: "10px",
//     borderRadius: "14px",
//     border: "1px solid #ddd",
//     outline: "none",
//     fontSize: "16px",
//     fontWeight: "600",
//     boxSizing: "border-box",
//   };

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: "#f4f7fb",
//         padding: "30px",
//       }}
//     >
//       {/* HEADER */}
//       <div
//         style={{
//           maxWidth: "1200px",
//           margin: "auto",
//         }}
//       >
//         <div
//           style={{
//             background:
//               "linear-gradient(135deg, #7c3aed, #4f46e5)",
//             borderRadius: "30px",
//             padding: "30px",
//             color: "#fff",
//             marginBottom: "30px",
//             boxShadow: "0 10px 30px rgba(79,70,229,0.3)",
//           }}
//         >
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "20px",
//             }}
//           >
//             <div
//               style={{
//                 background: "rgba(255,255,255,0.2)",
//                 padding: "18px",
//                 borderRadius: "20px",
//               }}
//             >
//               <Gift size={35} />
//             </div>

//             <div>
//               <h1
//                 style={{
//                   margin: 0,
//                   fontSize: "34px",
//                   fontWeight: "700",
//                 }}
//               >
//                 Referral Settings
//               </h1>

//               <p
//                 style={{
//                   marginTop: "8px",
//                   color: "rgba(255,255,255,0.85)",
//                 }}
//               >
//                 Manage referral rewards and earning limits
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* LOADER */}
//         {loading ? (
//           <div
//             style={{
//               background: "#fff",
//               borderRadius: "25px",
//               padding: "60px",
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
//             }}
//           >
//             <Loader2
//               size={45}
//               style={{
//                 animation: "spin 1s linear infinite",
//               }}
//             />
//           </div>
//         ) : (
//           <>
//             {/* CARDS */}
//             <div
//               style={{
//                 display: "flex",
//                 gap: "25px",
//                 flexWrap: "wrap",
//               }}
//             >
//               {/* MAX LIMIT */}
//               <div style={cardStyle}>
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     marginBottom: "20px",
//                   }}
//                 >
//                   <div
//                     style={{
//                       background: "#ede9fe",
//                       padding: "14px",
//                       borderRadius: "18px",
//                     }}
//                   >
//                     <IndianRupee
//                       size={28}
//                       color="#7c3aed"
//                     />
//                   </div>

//                   <span
//                     style={{
//                       color: "#666",
//                       fontWeight: "600",
//                     }}
//                   >
//                     Max Limit
//                   </span>
//                 </div>

//                 <div
//                   style={{
//                     fontSize: "15px",
//                     fontWeight: "600",
//                     color: "#444",
//                   }}
//                 >
//                   Max Referral Earning Limit
//                 </div>

//                 <input
//                   type="number"
//                   name="max_referral_earning_limit"
//                   value={
//                     formData.max_referral_earning_limit
//                   }
//                   onChange={handleChange}
//                   placeholder="Enter amount"
//                   style={inputStyle}
//                 />
//               </div>

//               {/* REFERRER */}
//               <div style={cardStyle}>
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     marginBottom: "20px",
//                   }}
//                 >
//                   <div
//                     style={{
//                       background: "#dcfce7",
//                       padding: "14px",
//                       borderRadius: "18px",
//                     }}
//                   >
//                     <Users
//                       size={28}
//                       color="#16a34a"
//                     />
//                   </div>

//                   <span
//                     style={{
//                       color: "#666",
//                       fontWeight: "600",
//                     }}
//                   >
//                     Referrer
//                   </span>
//                 </div>

//                 <div
//                   style={{
//                     fontSize: "15px",
//                     fontWeight: "600",
//                     color: "#444",
//                   }}
//                 >
//                   Referrer Reward Amount
//                 </div>

//                 <input
//                   type="number"
//                   name="referrer_reward_amount"
//                   value={formData.referrer_reward_amount}
//                   onChange={handleChange}
//                   placeholder="Enter amount"
//                   style={inputStyle}
//                 />
//               </div>

//               {/* NEW USER */}
//               <div style={cardStyle}>
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     marginBottom: "20px",
//                   }}
//                 >
//                   <div
//                     style={{
//                       background: "#dbeafe",
//                       padding: "14px",
//                       borderRadius: "18px",
//                     }}
//                   >
//                     <Gift
//                       size={28}
//                       color="#2563eb"
//                     />
//                   </div>

//                   <span
//                     style={{
//                       color: "#666",
//                       fontWeight: "600",
//                     }}
//                   >
//                     New User
//                   </span>
//                 </div>

//                 <div
//                   style={{
//                     fontSize: "15px",
//                     fontWeight: "600",
//                     color: "#444",
//                   }}
//                 >
//                   Referred User Reward
//                 </div>

//                 <input
//                   type="number"
//                   name="referred_user_reward_amount"
//                   value={
//                     formData.referred_user_reward_amount
//                   }
//                   onChange={handleChange}
//                   placeholder="Enter amount"
//                   style={inputStyle}
//                 />
//               </div>
//             </div>

//             {/* SAVE BUTTON */}
//             <div
//               style={{
//                 marginTop: "35px",
//                 display: "flex",
//                 justifyContent: "flex-end",
//               }}
//             >
//               <button
//                 onClick={updateReferralSettings}
//                 disabled={saving}
//                 style={{
//                   background:
//                     "linear-gradient(135deg,#7c3aed,#4f46e5)",
//                   color: "#fff",
//                   border: "none",
//                   borderRadius: "18px",
//                   padding: "16px 30px",
//                   fontSize: "16px",
//                   fontWeight: "700",
//                   cursor: "pointer",
//                   display: "flex",
//                   alignItems: "center",
//                   gap: "12px",
//                   boxShadow:
//                     "0 10px 25px rgba(79,70,229,0.3)",
//                 }}
//               >
//                 {saving ? (
//                   <>
//                     <Loader2
//                       size={20}
//                       style={{
//                         animation:
//                           "spin 1s linear infinite",
//                       }}
//                     />
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <Save size={20} />
//                     Save Settings
//                   </>
//                 )}
//               </button>
//             </div>
//           </>
//         )}
//       </div>

//       {/* SPIN ANIMATION */}
//       <style>
//         {`
//           @keyframes spin {
//             from {
//               transform: rotate(0deg);
//             }
//             to {
//               transform: rotate(360deg);
//             }
//           }
//         `}
//       </style>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Gift,
  Users,
  IndianRupee,
  Save,
  Loader2,
} from "lucide-react";

export default function ReferralSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    max_referral_earning_limit: "",
    referrer_reward_amount: "",
    referred_user_reward_amount: "",
  });

  // ================= FETCH SETTINGS =================
  const fetchReferralSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token"); // or however you store token

      const response = await axios.get(
        "https://api.luckyfunda.com/api/auth/admin/referral-settings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setFormData({
          max_referral_earning_limit: response.data.data.max_referral_earning_limit || "",
          referrer_reward_amount: response.data.data.referrer_reward_amount || "",
          referred_user_reward_amount: response.data.data.referred_user_reward_amount || "",
        });
      }
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        // Redirect to login page
        // window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralSettings();
  }, []);

  // ================= UPDATE API =================
  const updateReferralSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token"); // or however you store token

      await axios.post(
        "https://api.luckyfunda.com/api/auth/admin/referral-settings",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Settings Updated Successfully");
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        alert("Session expired. Please login again.");
        // Redirect to login page
        // window.location.href = "/login";
      } else {
        alert(error.response?.data?.message || "Failed to update settings");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const cardStyle = {
    background: "#fff",
    borderRadius: "24px",
    padding: "25px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    flex: 1,
    minWidth: "280px",
  };

  const inputStyle = {
    width: "100%",
    padding: "14px",
    marginTop: "10px",
    borderRadius: "14px",
    border: "1px solid #ddd",
    outline: "none",
    fontSize: "16px",
    fontWeight: "600",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "30px",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "auto",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, #7c3aed, #4f46e5)",
            borderRadius: "30px",
            padding: "30px",
            color: "#fff",
            marginBottom: "30px",
            boxShadow: "0 10px 30px rgba(79,70,229,0.3)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.2)",
                padding: "18px",
                borderRadius: "20px",
              }}
            >
              <Gift size={35} />
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "34px",
                  fontWeight: "700",
                }}
              >
                Referral Settings
              </h1>

              <p
                style={{
                  marginTop: "8px",
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                Manage referral rewards and earning limits
              </p>
            </div>
          </div>
        </div>

        {/* LOADER */}
        {loading ? (
          <div
            style={{
              background: "#fff",
              borderRadius: "25px",
              padding: "60px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <Loader2
              size={45}
              style={{
                animation: "spin 1s linear infinite",
              }}
            />
          </div>
        ) : (
          <>
            {/* CARDS */}
            <div
              style={{
                display: "flex",
                gap: "25px",
                flexWrap: "wrap",
              }}
            >
              {/* MAX LIMIT */}
              <div style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      background: "#ede9fe",
                      padding: "14px",
                      borderRadius: "18px",
                    }}
                  >
                    <IndianRupee
                      size={28}
                      color="#7c3aed"
                    />
                  </div>

                  <span
                    style={{
                      color: "#666",
                      fontWeight: "600",
                    }}
                  >
                    Max Limit
                  </span>
                </div>

                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#444",
                  }}
                >
                  Max Referral Earning Limit
                </div>

                <input
                  type="number"
                  name="max_referral_earning_limit"
                  value={
                    formData.max_referral_earning_limit
                  }
                  onChange={handleChange}
                  placeholder="Enter amount"
                  style={inputStyle}
                />
              </div>

              {/* REFERRER */}
              <div style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      background: "#dcfce7",
                      padding: "14px",
                      borderRadius: "18px",
                    }}
                  >
                    <Users
                      size={28}
                      color="#16a34a"
                    />
                  </div>

                  <span
                    style={{
                      color: "#666",
                      fontWeight: "600",
                    }}
                  >
                    Referrer
                  </span>
                </div>

                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#444",
                  }}
                >
                  Referrer Reward Amount
                </div>

                <input
                  type="number"
                  name="referrer_reward_amount"
                  value={formData.referrer_reward_amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  style={inputStyle}
                />
              </div>

              {/* NEW USER */}
              <div style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      background: "#dbeafe",
                      padding: "14px",
                      borderRadius: "18px",
                    }}
                  >
                    <Gift
                      size={28}
                      color="#2563eb"
                    />
                  </div>

                  <span
                    style={{
                      color: "#666",
                      fontWeight: "600",
                    }}
                  >
                    New User
                  </span>
                </div>

                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: "600",
                    color: "#444",
                  }}
                >
                  Referred User Reward
                </div>

                <input
                  type="number"
                  name="referred_user_reward_amount"
                  value={
                    formData.referred_user_reward_amount
                  }
                  onChange={handleChange}
                  placeholder="Enter amount"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* SAVE BUTTON */}
            <div
              style={{
                marginTop: "35px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={updateReferralSettings}
                disabled={saving}
                style={{
                  background:
                    "linear-gradient(135deg,#7c3aed,#4f46e5)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "18px",
                  padding: "16px 30px",
                  fontSize: "16px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  boxShadow:
                    "0 10px 25px rgba(79,70,229,0.3)",
                }}
              >
                {saving ? (
                  <>
                    <Loader2
                      size={20}
                      style={{
                        animation:
                          "spin 1s linear infinite",
                      }}
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Settings
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* SPIN ANIMATION */}
      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}