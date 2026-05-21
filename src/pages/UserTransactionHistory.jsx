
// import React, { useEffect, useState } from "react";
// import { useSearchParams, useNavigate } from "react-router-dom";
// import { getUserTransactionHistoryAPI } from "../services/api";
// import { toast } from "react-toastify";
// import "../styles/UserTransactionHistory.css";

// function UserTransactionHistory() {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const userId = searchParams.get("userId");
//   const userName = searchParams.get("userName");
  
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!userId) {
//       toast.error("User ID is required");
//       navigate("/player-details");
//       return;
//     }
//     fetchTransactionHistory();
//   }, [userId]);

//   const fetchTransactionHistory = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await getUserTransactionHistoryAPI(userId);
//       console.log("API Response:", response);
      
//       // Check response structure properly
//       if (response && response.data && Array.isArray(response.data)) {
//         setData(response.data);
//       } else if (response && Array.isArray(response)) {
//         setData(response);
//       } else {
//         setData([]);
//         setError("No transaction history found");
//       }
//     } catch (err) {
//       console.error("Error fetching transaction history:", err);
//       setError(err.message || "Failed to load transaction history");
//       setData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     // Handle "2026-05-21 18:34:20" format
//     const date = new Date(dateString.replace(" ", "T"));
//     if (isNaN(date.getTime())) return dateString;
    
//     return date.toLocaleDateString("en-IN", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit"
//     });
//   };

//   const getTransactionIcon = (type, method) => {
//     if (type === "credit") {
//       if (method === "referral") return "🤝";
//       if (method === "bonus") return "🎁";
//       return "💰";
//     }
//     return "💸";
//   };

//   const getMethodDisplay = (method) => {
//     const methods = {
//       referral: "Referral Bonus",
//       bonus: "Bonus",
//       gateway: "Online Payment",
//       manual: "Manual Payment",
//       UPI: "UPI Payment",
//       wallet: "Wallet",
//     };
//     return methods[method] || method?.toUpperCase() || "Wallet";
//   };

//   const getStatusBadge = (status) => {
//     const statusStyles = {
//       success: { bg: "#dcfce7", color: "#166534", text: "✅ Success" },
//       completed: { bg: "#dcfce7", color: "#166534", text: "✅ Completed" },
//       pending: { bg: "#fef3c7", color: "#92400e", text: "⏳ Pending" },
//       approved: { bg: "#dbeafe", color: "#1e40af", text: "👍 Approved" },
//       failed: { bg: "#fee2e2", color: "#991b1b", text: "❌ Failed" },
//       rejected: { bg: "#fee2e2", color: "#991b1b", text: "❌ Rejected" },
//     };
    
//     const style = statusStyles[status?.toLowerCase()] || statusStyles.pending;
    
//     return (
//       <span style={{
//         padding: "4px 12px",
//         borderRadius: "20px",
//         fontSize: "12px",
//         fontWeight: "600",
//         backgroundColor: style.bg,
//         color: style.color,
//         border: `1px solid ${style.color}20`,
//       }}>
//         {style.text}
//       </span>
//     );
//   };

//   // Calculate summary
//   const totalCredit = data
//     .filter(txn => txn.type === "credit")
//     .reduce((sum, txn) => sum + parseFloat(txn.amount), 0);
    
//   const totalDebit = data
//     .filter(txn => txn.type === "debit")
//     .reduce((sum, txn) => sum + parseFloat(txn.amount), 0);

//   if (loading) {
//     return (
//       <div style={{
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         minHeight: "60vh",
//         gap: "16px",
//       }}>
//         <div style={{
//           width: "48px",
//           height: "48px",
//           border: "4px solid #e5e7eb",
//           borderTop: "4px solid #004296",
//           borderRadius: "50%",
//           animation: "spin 1s linear infinite",
//         }} />
//         <p style={{ color: "#6b7280", fontSize: "16px" }}>Loading transaction history...</p>
//         <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
//       </div>
//     );
//   }

//   return (
//     <div style={{
//       minHeight: "100vh",
//       backgroundColor: "#f9fafb",
//       padding: "24px",
//     }}>
//       <div style={{
//         maxWidth: "1200px",
//         margin: "0 auto",
//       }}>
//         {/* Header */}
//         <div style={{
//           backgroundColor: "white",
//           borderRadius: "16px",
//           padding: "24px",
//           marginBottom: "24px",
//           boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//         }}>
//           <button
//             onClick={() => navigate("/player-details")}
//             style={{
//               padding: "8px 16px",
//               backgroundColor: "#f3f4f6",
//               border: "none",
//               borderRadius: "8px",
//               cursor: "pointer",
//               fontSize: "14px",
//               fontWeight: "500",
//               color: "#374151",
//               marginBottom: "16px",
//               display: "inline-flex",
//               alignItems: "center",
//               gap: "8px",
//             }}
//           >
//             ← Back to Players
//           </button>
//           <h2 style={{
//             fontSize: "24px",
//             fontWeight: "700",
//             color: "#111827",
//             margin: 0,
//           }}>
//             Transaction History - {userName || `User #${userId}`}
//           </h2>
//         </div>

//         {error ? (
//           <div style={{
//             backgroundColor: "white",
//             borderRadius: "16px",
//             padding: "48px",
//             textAlign: "center",
//             boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//           }}>
//             <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
//             <h3 style={{ fontSize: "18px", color: "#374151", marginBottom: "8px" }}>Error Loading Data</h3>
//             <p style={{ color: "#6b7280", marginBottom: "16px" }}>{error}</p>
//             <button
//               onClick={fetchTransactionHistory}
//               style={{
//                 padding: "10px 24px",
//                 backgroundColor: "#004296",
//                 color: "white",
//                 border: "none",
//                 borderRadius: "8px",
//                 cursor: "pointer",
//                 fontWeight: "600",
//               }}
//             >
//               Try Again
//             </button>
//           </div>
//         ) : data.length === 0 ? (
//           <div style={{
//             backgroundColor: "white",
//             borderRadius: "16px",
//             padding: "48px",
//             textAlign: "center",
//             boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//           }}>
//             <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
//             <h3 style={{ fontSize: "18px", color: "#374151", marginBottom: "8px" }}>No Transaction History</h3>
//             <p style={{ color: "#6b7280" }}>This user has no transactions yet.</p>
//           </div>
//         ) : (
//           <>
//             {/* Summary Cards */}
//             <div style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
//               gap: "16px",
//               marginBottom: "24px",
//             }}>
//               <div style={{
//                 backgroundColor: "white",
//                 borderRadius: "16px",
//                 padding: "20px",
//                 boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//               }}>
//                 <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 4px 0" }}>Total Credits</p>
//                 <p style={{ color: "#059669", fontSize: "24px", fontWeight: "700", margin: 0 }}>
//                   ₹{totalCredit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
//                 </p>
//               </div>
//               <div style={{
//                 backgroundColor: "white",
//                 borderRadius: "16px",
//                 padding: "20px",
//                 boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//               }}>
//                 <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 4px 0" }}>Total Debits</p>
//                 <p style={{ color: "#dc2626", fontSize: "24px", fontWeight: "700", margin: 0 }}>
//                   ₹{totalDebit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
//                 </p>
//               </div>
//               <div style={{
//                 backgroundColor: "white",
//                 borderRadius: "16px",
//                 padding: "20px",
//                 boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//               }}>
//                 <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 4px 0" }}>Total Transactions</p>
//                 <p style={{ color: "#004296", fontSize: "24px", fontWeight: "700", margin: 0 }}>
//                   {data.length}
//                 </p>
//               </div>
//             </div>

//             {/* Transactions List */}
//             <div style={{
//               backgroundColor: "white",
//               borderRadius: "16px",
//               boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//               overflow: "hidden",
//             }}>
//               <div style={{
//                 padding: "20px 24px",
//                 borderBottom: "1px solid #f3f4f6",
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//               }}>
//                 <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#111827" }}>
//                   All Transactions
//                 </h3>
//                 <span style={{ fontSize: "14px", color: "#9ca3af" }}>
//                   {data.length} records
//                 </span>
//               </div>

//               <div style={{ overflowX: "auto" }}>
//                 <table style={{
//                   width: "100%",
//                   borderCollapse: "collapse",
//                 }}>
//                   <thead>
//                     <tr style={{
//                       backgroundColor: "#f9fafb",
//                       borderBottom: "1px solid #e5e7eb",
//                     }}>
//                       <th style={tableHeaderStyle}>ID</th>
//                       <th style={tableHeaderStyle}>Type</th>
//                       <th style={tableHeaderStyle}>Title</th>
//                       <th style={tableHeaderStyle}>Amount</th>
//                       <th style={tableHeaderStyle}>Method</th>
//                       <th style={tableHeaderStyle}>Status</th>
//                       <th style={tableHeaderStyle}>Date & Time</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {data.map((transaction) => (
//                       <tr
//                         key={transaction.id}
//                         style={{
//                           borderBottom: "1px solid #f3f4f6",
//                           transition: "background-color 0.2s",
//                         }}
//                         onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
//                         onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
//                       >
//                         <td style={tableCellStyle}>
//                           <span style={{
//                             fontFamily: "monospace",
//                             fontSize: "13px",
//                             color: "#6b7280",
//                           }}>
//                             #{transaction.id}
//                           </span>
//                         </td>
//                         <td style={tableCellStyle}>
//                           <span style={{
//                             display: "inline-flex",
//                             alignItems: "center",
//                             gap: "6px",
//                             fontSize: "14px",
//                             fontWeight: "500",
//                             color: transaction.type === "credit" ? "#059669" : "#dc2626",
//                           }}>
//                             {getTransactionIcon(transaction.type, transaction.method)}
//                             {transaction.type === "credit" ? "Credit" : "Debit"}
//                           </span>
//                         </td>
//                         <td style={tableCellStyle}>
//                           <span style={{ fontSize: "14px", color: "#374151", fontWeight: "500" }}>
//                             {transaction.title || "Transaction"}
//                           </span>
//                         </td>
//                         <td style={tableCellStyle}>
//                           <span style={{
//                             fontSize: "15px",
//                             fontWeight: "700",
//                             color: transaction.type === "credit" ? "#059669" : "#dc2626",
//                           }}>
//                             {transaction.type === "credit" ? "+" : "−"} ₹{parseFloat(transaction.amount).toFixed(2)}
//                           </span>
//                         </td>
//                         <td style={tableCellStyle}>
//                           <span style={{
//                             padding: "4px 10px",
//                             backgroundColor: "#f3f4f6",
//                             borderRadius: "6px",
//                             fontSize: "12px",
//                             fontWeight: "500",
//                             color: "#374151",
//                           }}>
//                             {getMethodDisplay(transaction.method)}
//                           </span>
//                         </td>
//                         <td style={tableCellStyle}>
//                           {getStatusBadge(transaction.status)}
//                         </td>
//                         <td style={tableCellStyle}>
//                           <span style={{ fontSize: "13px", color: "#6b7280" }}>
//                             {formatDate(transaction.created_at)}
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// // Styles
// const tableHeaderStyle = {
//   padding: "12px 16px",
//   textAlign: "left",
//   fontSize: "12px",
//   fontWeight: "600",
//   color: "#6b7280",
//   textTransform: "uppercase",
//   letterSpacing: "0.05em",
//   whiteSpace: "nowrap",
// };

// const tableCellStyle = {
//   padding: "16px",
//   whiteSpace: "nowrap",
// };

// export default UserTransactionHistory;
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { getUserTransactionHistoryAPI } from "../services/api";
import { toast } from "react-toastify";
import "../styles/UserTransactionHistory.css";

function UserTransactionHistory() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get("userId");
  const userName = searchParams.get("userName");
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTransactionId, setRejectTransactionId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (!userId) {
      toast.error("User ID is required");
      navigate("/player-details");
      return;
    }
    fetchTransactionHistory();
  }, [userId]);

  const fetchTransactionHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserTransactionHistoryAPI(userId);
      console.log("API Response:", response);
      
      if (response && response.data && Array.isArray(response.data)) {
        setData(response.data);
      } else if (response && Array.isArray(response)) {
        setData(response);
      } else {
        setData([]);
        setError("No transaction history found");
      }
    } catch (err) {
      console.error("Error fetching transaction history:", err);
      setError(err.message || "Failed to load transaction history");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // APPROVE MANUAL PAYMENT
  // =========================
  const handleApprove = async (transactionId) => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      toast.error("Please login first");
      return;
    }

    setProcessingId(transactionId);

    try {
      const response = await fetch(
        `https://api.luckyfunda.com/api/wallet/admin/manual-payments/${transactionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "approved",
          }),
        }
      );

      const result = await response.json();
      console.log("Approve Response:", result);

      if (response.ok) {
        toast.success("Payment approved successfully!");
        fetchTransactionHistory(); // Refresh data
      } else {
        throw new Error(result.message || "Failed to approve payment");
      }
    } catch (err) {
      console.error("Error approving payment:", err);
      toast.error(err.message || "Failed to approve payment");
    } finally {
      setProcessingId(null);
    }
  };

  // =========================
  // OPEN REJECT MODAL
  // =========================
  const openRejectModal = (transactionId) => {
    setRejectTransactionId(transactionId);
    setRejectReason("");
    setShowRejectModal(true);
  };

  // =========================
  // REJECT MANUAL PAYMENT
  // =========================
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    const token = localStorage.getItem("token");
    
    if (!token) {
      toast.error("Please login first");
      return;
    }

    setProcessingId(rejectTransactionId);

    try {
      const response = await fetch(
        `https://api.luckyfunda.com/api/wallet/admin/manual-payments/${rejectTransactionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "rejected",
            reject_reason: rejectReason,
          }),
        }
      );

      const result = await response.json();
      console.log("Reject Response:", result);

      if (response.ok) {
        toast.success("Payment rejected successfully!");
        setShowRejectModal(false);
        setRejectTransactionId(null);
        setRejectReason("");
        fetchTransactionHistory(); // Refresh data
      } else {
        throw new Error(result.message || "Failed to reject payment");
      }
    } catch (err) {
      console.error("Error rejecting payment:", err);
      toast.error(err.message || "Failed to reject payment");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString.replace(" ", "T"));
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getTransactionIcon = (type, method) => {
    if (type === "credit") {
      if (method === "referral") return "🤝";
      if (method === "bonus") return "🎁";
      return "💰";
    }
    return "💸";
  };

  const getMethodDisplay = (method) => {
    const methods = {
      referral: "Referral Bonus",
      bonus: "Bonus",
      gateway: "Online Payment",
      manual: "Manual Payment",
      UPI: "UPI Payment",
      wallet: "Wallet",
    };
    return methods[method] || method?.toUpperCase() || "Wallet";
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      success: { bg: "#dcfce7", color: "#166534", text: "✅ Success" },
      completed: { bg: "#dcfce7", color: "#166534", text: "✅ Completed" },
      pending: { bg: "#fef3c7", color: "#92400e", text: "⏳ Pending" },
      approved: { bg: "#dbeafe", color: "#1e40af", text: "👍 Approved" },
      failed: { bg: "#fee2e2", color: "#991b1b", text: "❌ Failed" },
      rejected: { bg: "#fee2e2", color: "#991b1b", text: "❌ Rejected" },
    };
    
    const style = statusStyles[status?.toLowerCase()] || statusStyles.pending;
    
    return (
      <span style={{
        padding: "4px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600",
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.color}20`,
        whiteSpace: "nowrap",
      }}>
        {style.text}
      </span>
    );
  };

  // Calculate summary
  const totalCredit = data
    .filter(txn => txn.type === "credit" && (txn.status === "success" || txn.status === "approved"))
    .reduce((sum, txn) => sum + parseFloat(txn.amount), 0);
    
  const totalDebit = data
    .filter(txn => txn.type === "debit")
    .reduce((sum, txn) => sum + parseFloat(txn.amount), 0);

  const pendingCount = data.filter(txn => txn.status === "pending").length;

  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: "16px",
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          border: "4px solid #e5e7eb",
          borderTop: "4px solid #004296",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }} />
        <p style={{ color: "#6b7280", fontSize: "16px" }}>Loading transaction history...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f9fafb",
      padding: "24px",
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}>
          <div>
            <button
              onClick={() => navigate("/player-details")}
              style={{
                padding: "8px 16px",
                backgroundColor: "#f3f4f6",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "12px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              ← Back to Players
            </button>
            <h2 style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#111827",
              margin: 0,
            }}>
              Transaction History - {userName || `User #${userId}`}
            </h2>
          </div>
          
          {pendingCount > 0 && (
            <div style={{
              backgroundColor: "#fef3c7",
              color: "#92400e",
              padding: "10px 20px",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              ⏳ {pendingCount} Pending Approval
            </div>
          )}
        </div>

        {error ? (
          <div style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "48px",
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
            <h3 style={{ fontSize: "18px", color: "#374151", marginBottom: "8px" }}>Error Loading Data</h3>
            <p style={{ color: "#6b7280", marginBottom: "16px" }}>{error}</p>
            <button
              onClick={fetchTransactionHistory}
              style={{
                padding: "10px 24px",
                backgroundColor: "#004296",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Try Again
            </button>
          </div>
        ) : data.length === 0 ? (
          <div style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "48px",
            textAlign: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
            <h3 style={{ fontSize: "18px", color: "#374151", marginBottom: "8px" }}>No Transaction History</h3>
            <p style={{ color: "#6b7280" }}>This user has no transactions yet.</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}>
              <div style={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}>
                <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 4px 0" }}>Total Credits</p>
                <p style={{ color: "#059669", fontSize: "24px", fontWeight: "700", margin: 0 }}>
                  ₹{totalCredit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div style={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}>
                <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 4px 0" }}>Total Debits</p>
                <p style={{ color: "#dc2626", fontSize: "24px", fontWeight: "700", margin: 0 }}>
                  ₹{totalDebit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div style={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}>
                <p style={{ color: "#6b7280", fontSize: "14px", margin: "0 0 4px 0" }}>Total Transactions</p>
                <p style={{ color: "#004296", fontSize: "24px", fontWeight: "700", margin: 0 }}>
                  {data.length}
                </p>
              </div>
            </div>

            {/* Transactions Table */}
            <div style={{
              backgroundColor: "white",
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}>
              <div style={{
                padding: "20px 24px",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}>
                <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#111827" }}>
                  All Transactions
                </h3>
                <span style={{ fontSize: "14px", color: "#9ca3af" }}>
                  {data.length} records
                </span>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                }}>
                  <thead>
                    <tr style={{
                      backgroundColor: "#f9fafb",
                      borderBottom: "1px solid #e5e7eb",
                    }}>
                      <th style={tableHeaderStyle}>ID</th>
                      <th style={tableHeaderStyle}>Type</th>
                      <th style={tableHeaderStyle}>Title</th>
                      <th style={tableHeaderStyle}>Amount</th>
                      <th style={tableHeaderStyle}>Method</th>
                      <th style={tableHeaderStyle}>Status</th>
                      <th style={tableHeaderStyle}>Date & Time</th>
                      <th style={tableHeaderStyle}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((transaction) => (
                      <tr
                        key={transaction.id}
                        style={{
                          borderBottom: "1px solid #f3f4f6",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <td style={tableCellStyle}>
                          <span style={{
                            fontFamily: "monospace",
                            fontSize: "13px",
                            color: "#6b7280",
                          }}>
                            #{transaction.id}
                          </span>
                        </td>
                        <td style={tableCellStyle}>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: transaction.type === "credit" ? "#059669" : "#dc2626",
                          }}>
                            {getTransactionIcon(transaction.type, transaction.method)}
                            {transaction.type === "credit" ? "Credit" : "Debit"}
                          </span>
                        </td>
                        <td style={tableCellStyle}>
                          <div>
                            <span style={{ fontSize: "14px", color: "#374151", fontWeight: "500" }}>
                              {transaction.title || "Transaction"}
                            </span>
                            {transaction.reject_reason && (
                              <p style={{
                                fontSize: "12px",
                                color: "#dc2626",
                                margin: "4px 0 0 0",
                                maxWidth: "200px",
                              }}>
                                Reason: {transaction.reject_reason}
                              </p>
                            )}
                          </div>
                        </td>
                        <td style={tableCellStyle}>
                          <span style={{
                            fontSize: "15px",
                            fontWeight: "700",
                            color: transaction.type === "credit" ? "#059669" : "#dc2626",
                          }}>
                            {transaction.type === "credit" ? "+" : "−"} ₹{parseFloat(transaction.amount).toFixed(2)}
                          </span>
                        </td>
                        <td style={tableCellStyle}>
                          <span style={{
                            padding: "4px 10px",
                            backgroundColor: "#f3f4f6",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "500",
                            color: "#374151",
                          }}>
                            {getMethodDisplay(transaction.method)}
                          </span>
                        </td>
                        <td style={tableCellStyle}>
                          {getStatusBadge(transaction.status)}
                        </td>
                        <td style={tableCellStyle}>
                          <span style={{ fontSize: "13px", color: "#6b7280" }}>
                            {formatDate(transaction.created_at)}
                          </span>
                        </td>
                        <td style={tableCellStyle}>
                          {/* Show approve/reject only for manual payments with pending status */}
                          {transaction.method === "manual" && transaction.status === "pending" && (
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                onClick={() => handleApprove(transaction.id)}
                                disabled={processingId === transaction.id}
                                style={{
                                  padding: "6px 14px",
                                  backgroundColor: processingId === transaction.id ? "#86efac" : "#059669",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "8px",
                                  cursor: processingId === transaction.id ? "not-allowed" : "pointer",
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  opacity: processingId === transaction.id ? 0.7 : 1,
                                  transition: "all 0.2s",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                {processingId === transaction.id ? "..." : "✓"} Approve
                              </button>
                              <button
                                onClick={() => openRejectModal(transaction.id)}
                                disabled={processingId === transaction.id}
                                style={{
                                  padding: "6px 14px",
                                  backgroundColor: processingId === transaction.id ? "#fca5a5" : "#dc2626",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "8px",
                                  cursor: processingId === transaction.id ? "not-allowed" : "pointer",
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  opacity: processingId === transaction.id ? 0.7 : 1,
                                  transition: "all 0.2s",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                {processingId === transaction.id ? "..." : "✗"} Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          backdropFilter: "blur(4px)",
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "20px",
            padding: "32px",
            width: "100%",
            maxWidth: "480px",
            boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}>
              <h3 style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: "700",
                color: "#111827",
              }}>
                Reject Payment #{rejectTransactionId}
              </h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectTransactionId(null);
                  setRejectReason("");
                }}
                style={{
                  backgroundColor: "#f3f4f6",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  color: "#6b7280",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px",
              }}>
                Rejection Reason <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "12px",
                  fontSize: "14px",
                  color: "#374151",
                  resize: "vertical",
                  outline: "none",
                  transition: "border-color 0.2s",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => e.target.style.borderColor = "#004296"}
                onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
              />
            </div>

            <div style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
            }}>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectTransactionId(null);
                  setRejectReason("");
                }}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={processingId === rejectTransactionId}
                style={{
                  padding: "10px 24px",
                  backgroundColor: processingId === rejectTransactionId ? "#fca5a5" : "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: processingId === rejectTransactionId ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  opacity: processingId === rejectTransactionId ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {processingId === rejectTransactionId ? (
                  <>
                    <span style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid white",
                      borderTop: "2px solid transparent",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }} />
                    Rejecting...
                  </>
                ) : (
                  "Confirm Reject"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Styles
const tableHeaderStyle = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: "12px",
  fontWeight: "600",
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  whiteSpace: "nowrap",
};

const tableCellStyle = {
  padding: "16px",
  whiteSpace: "nowrap",
};

export default UserTransactionHistory;