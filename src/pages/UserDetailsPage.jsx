import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";

function UserDetailsPage() {
  const { userId: paramUserId } = useParams();
  const [searchParams] = useSearchParams();
  const queryUserId = searchParams.get('id');
  
  // Try multiple ways to get userId
  const userId = paramUserId || queryUserId || localStorage.getItem("viewingUserId") || "1";
  
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("=== DEBUG INFO ===");
    console.log("paramUserId:", paramUserId);
    console.log("queryUserId:", queryUserId);
    console.log("Final userId:", userId);
    console.log("Current URL:", window.location.href);
    
    if (userId) {
      fetchUserDetails();
    } else {
      // If no userId, default to user 1
      console.log("No userId found, defaulting to user 1");
      fetchUserDetails(1);
    }
  }, [userId, paramUserId, queryUserId]);

  const fetchUserDetails = async (id = userId) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      const apiUrl = `https://tambola.fctesting.shop/api/user/details/${id}`;
      
      console.log("Fetching:", apiUrl);
      
      const response = await axios.get(apiUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      
      console.log("Response:", response.data);
      
      if (response.data.success) {
        setUserData(response.data.data);
        // Save to localStorage for persistence
        localStorage.setItem("viewingUserId", id);
      } else {
        setError(response.data.message || "Failed to fetch");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Demo users list
  const demoUsers = [1, 2, 3, 4, 5];

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>Loading User Details...</h2>
          <div style={styles.spinner}></div>
          <p>User ID: {userId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <h2 style={{ color: "#dc2626" }}>⚠️ Error</h2>
          <p>{error}</p>
          <p style={{ color: "#666" }}>User ID attempted: {userId}</p>
          
          {/* User selector for testing */}
          <div style={{ marginTop: "20px" }}>
            <h4>Try another user:</h4>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
              {demoUsers.map(uid => (
                <button
                  key={uid}
                  onClick={() => fetchUserDetails(uid)}
                  style={{
                    padding: "10px 20px",
                    background: "#4f46e5",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  User {uid}
                </button>
              ))}
            </div>
          </div>
          
          <button onClick={() => fetchUserDetails()} style={styles.button}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2>No Data Found</h2>
          <button onClick={() => fetchUserDetails()} style={styles.button}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { user, summary, win_history } = userData;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header with user selector */}
        <div style={styles.header}>
          <h1 style={styles.title}>User Profile</h1>
          <div style={{ display: "flex", gap: "10px" }}>
            <select 
              onChange={(e) => fetchUserDetails(e.target.value)}
              value={userId}
              style={styles.select}
            >
              {demoUsers.map(uid => (
                <option key={uid} value={uid}>User {uid}</option>
              ))}
            </select>
            <span style={styles.userIdBadge}>ID: #{user.user_id}</span>
          </div>
        </div>

        {/* User Info Card */}
        <div style={styles.userCard}>
          <div style={styles.avatar}>
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div style={styles.userInfo}>
            <h2 style={styles.userName}>{user.name}</h2>
            <p style={styles.userPhone}>📞 {user.phone}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, ...styles.walletCard}}>
            <div style={styles.statIcon}>💰</div>
            <div>
              <div style={styles.statLabel}>Wallet Balance</div>
              <div style={styles.statValue}>₹{summary?.wallet_balance?.toLocaleString() || 0}</div>
            </div>
          </div>
          
          <div style={{...styles.statCard, ...styles.winningCard}}>
            <div style={styles.statIcon}>🏆</div>
            <div>
              <div style={styles.statLabel}>Total Winning</div>
              <div style={styles.statValue}>₹{summary?.total_winning?.toLocaleString() || 0}</div>
            </div>
          </div>
          
          <div style={{...styles.statCard, ...styles.depositCard}}>
            <div style={styles.statIcon}>📥</div>
            <div>
              <div style={styles.statLabel}>Total Deposit</div>
              <div style={styles.statValue}>₹{summary?.total_deposit?.toLocaleString() || 0}</div>
            </div>
          </div>
          
          <div style={{...styles.statCard, ...styles.withdrawCard}}>
            <div style={styles.statIcon}>📤</div>
            <div>
              <div style={styles.statLabel}>Total Withdraw</div>
              <div style={styles.statValue}>₹{summary?.total_withdraw?.toLocaleString() || 0}</div>
            </div>
          </div>
        </div>

        {/* Win History */}
        {win_history && win_history.length > 0 && (
          <div style={styles.historySection}>
            <h3>🏅 Win History ({win_history.length} wins)</h3>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Prize</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Game</th>
                    <th style={styles.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {win_history.slice(0, 10).map((win, idx) => (
                    <tr key={idx}>
                      <td style={styles.td}>{win.prize_name || win.win_type}</td>
                      <td style={styles.td}>₹{win.amount?.toLocaleString()}</td>
                      <td style={styles.td}>{win.game_name || "—"}</td>
                      <td style={styles.td}>{new Date(win.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f5f7fa",
    padding: "20px",
  },
  content: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontSize: "28px",
    color: "#1a1a2e",
    margin: 0,
  },
  userIdBadge: {
    background: "#e0e7ff",
    color: "#4f46e5",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "500",
  },
  select: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    background: "white",
    cursor: "pointer",
  },
  userCard: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "20px",
    padding: "32px",
    marginBottom: "32px",
    display: "flex",
    alignItems: "center",
    gap: "24px",
    color: "white",
  },
  avatar: {
    width: "80px",
    height: "80px",
    background: "rgba(255,255,255,0.2)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    margin: "0 0 8px 0",
    fontSize: "28px",
  },
  userPhone: {
    margin: 0,
    fontSize: "16px",
    opacity: 0.95,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "40px",
  },
  statCard: {
    background: "white",
    padding: "20px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  walletCard: { borderLeft: "4px solid #3b82f6" },
  winningCard: { borderLeft: "4px solid #10b981" },
  depositCard: { borderLeft: "4px solid #8b5cf6" },
  withdrawCard: { borderLeft: "4px solid #f59e0b" },
  statIcon: { fontSize: "40px" },
  statLabel: { fontSize: "14px", color: "#64748b", marginBottom: "8px" },
  statValue: { fontSize: "28px", fontWeight: "bold", color: "#1e293b" },
  historySection: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
  },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHeader: { background: "#f8fafc", borderBottom: "2px solid #e2e8f0" },
  th: { textAlign: "left", padding: "12px 16px", fontWeight: "600", color: "#475569" },
  td: { padding: "16px", borderBottom: "1px solid #e2e8f0", color: "#334155" },
  card: {
    background: "white",
    borderRadius: "12px",
    padding: "40px",
    textAlign: "center",
    maxWidth: "500px",
    margin: "100px auto",
  },
  errorCard: {
    background: "white",
    borderRadius: "12px",
    padding: "40px",
    textAlign: "center",
    maxWidth: "600px",
    margin: "100px auto",
  },
  button: {
    background: "#4f46e5",
    color: "white",
    border: "none",
    padding: "10px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "20px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e2e8f0",
    borderTopColor: "#4f46e5",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "20px auto",
  },
};

// Add animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(styleSheet);

export default UserDetailsPage;