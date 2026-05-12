import "../styles/dashboard.css";
import { useState, useEffect } from "react";
import { getDashboardDataAPI } from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { FaGamepad, FaUsers, FaRupeeSign, FaPlay, FaTrophy, FaTicketAlt, FaCalendarAlt, FaArrowUp, FaArrowDown } from "react-icons/fa";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await getDashboardDataAPI();
      console.log("Dashboard data:", response);
      if (response.status === 200 && response.data.success) {
      setDashboardData(response.data.data);
    }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading player details...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="dashboard">Error loading dashboard data</div>;
  }

  const { cards, charts, tables } = dashboardData;

  const stats = [
    {
      title: "Total Games",
      value: cards.total_games,
      icon: <FaGamepad />,
      color: "purple",
      change: `${cards.live_games} live now`,
      increase: true,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      title: "Total Players",
      value: cards.total_players,
      icon: <FaUsers />,
      color: "green",
      change: `${cards.total_agents} agents`,
      increase: true,
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      title: "Total Revenue",
      value: `₹${cards.total_revenue}`,
      icon: <FaRupeeSign />,
      color: "gold",
      change: `₹${cards.total_winning_distributed} distributed`,
      increase: true,
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
    {
      title: "Pending Claims",
      value: cards.pending_claims,
      icon: <FaTicketAlt />,
      color: "orange",
      change: `${cards.total_claims} total claims`,
      increase: true,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
  ];

  const revenueData = charts.revenue_overview.map(item => ({
    day: item.day_name.slice(0, 3),
    revenue: item.revenue
  }));

  const getStatusClass = (status) => {
    switch(status.toLowerCase()) {
      case 'live': return 'status-live';
      case 'upcoming': return 'status-upcoming';
      case 'completed': return 'status-completed';
      default: return '';
    }
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h2 className="dashboard-title">Dashboard</h2>
          <p className="dashboard-subtitle">Welcome back! Here's what's happening with your games today.</p>
        </div>
        <div className="header-right">
          <div className="date-badge">
            <FaCalendarAlt />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid with Unique Colors */}
      <div className="stats-grid">
        <div className="stat-card stat-card-1">
          <div className="stat-circle"></div>
          <div className="stat-icon-wrapper icon-purple">
            {stats[0].icon}
          </div>
          <div className="stat-content">
            <h4 className="stat-title">{stats[0].title}</h4>
            <p className="stat-value">{stats[0].value}</p>
            <span className="stat-change positive">
              <FaArrowUp className="change-icon" />
              {stats[0].change}
            </span>
          </div>
        </div>

        <div className="stat-card stat-card-2">
          <div className="stat-circle"></div>
          <div className="stat-icon-wrapper icon-orange">
            {stats[1].icon}
          </div>
          <div className="stat-content">
            <h4 className="stat-title">{stats[1].title}</h4>
            <p className="stat-value">{stats[1].value}</p>
            <span className="stat-change positive">
              <FaArrowUp className="change-icon" />
              {stats[1].change}
            </span>
          </div>
        </div>

        <div className="stat-card stat-card-3">
          <div className="stat-circle"></div>
          <div className="stat-icon-wrapper icon-green">
            {stats[2].icon}
          </div>
          <div className="stat-content">
            <h4 className="stat-title">{stats[2].title}</h4>
            <p className="stat-value">{stats[2].value}</p>
            <span className="stat-change positive">
              <FaArrowUp className="change-icon" />
              {stats[2].change}
            </span>
          </div>
        </div>

        <div className="stat-card stat-card-4">
          <div className="stat-circle"></div>
          <div className="stat-icon-wrapper icon-gold">
            {stats[3].icon}
          </div>
          <div className="stat-content">
            <h4 className="stat-title">{stats[3].title}</h4>
            <p className="stat-value">{stats[3].value}</p>
            <span className="stat-change positive">
              <FaArrowUp className="change-icon" />
              {stats[3].change}
            </span>
          </div>
        </div>
      </div>

      {/* Chart and Winners Row */}
      <div className="two-columns">
        {/* Chart Section */}
        <div className="chart-section">
          <div className="section-header">
            <h3>Revenue Overview</h3>
            <span className="section-badge">This Week</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '8px 12px'
                }}
                formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#FBBF24"
                strokeWidth={3}
                dot={{ fill: '#FBBF24', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#1E3A8A' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Winners */}
        <div className="winners-section">
          <div className="section-header">
            <h3>🏆 Top Winners</h3>
            <span className="section-badge yellow">This Week</span>
          </div>
          <div className="winners-list">
            {tables.top_winners.length > 0 ? tables.top_winners.map((winner, i) => (
              <div key={i} className="winner-item">
                <div className="winner-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⭐'}</div>
                <div className="winner-info">
                  <span className="winner-name">{winner.name}</span>
                  <span className="winner-game">{winner.game}</span>
                </div>
                <div className="winner-prize">₹{winner.prize}</div>
              </div>
            )) : (
              <div className="no-data">No winners yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Games Table */}
      <div className="table-section">
        <div className="section-header">
          <h3>📋 Recent Games</h3>
          <button className="view-all-btn">View All →</button>
        </div>
        <div className="table-wrapper">
          <table className="games-table">
            <thead>
              <tr>
                <th>Game Name</th>
                <th>Status</th>
                <th>Players</th>
                <th>Prize Pool</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {tables.recent_games.map((game, i) => (
                <tr key={i}>
                  <td className="game-name">{game.title}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(game.status)}`}>
                      {game.status}
                    </span>
                  </td>
                  <td>{game.total_players}</td>
                  <td className="prize">₹{game.total_prize_pool}</td>
                  <td>{game.game_time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}