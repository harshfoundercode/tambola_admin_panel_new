import "../styles/dashboard.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

import { FaGamepad, FaUsers, FaRupeeSign, FaPlay, FaTrophy, FaTicketAlt, FaCalendarAlt, FaArrowUp, FaArrowDown, FaMoneyBillWave, FaClock, FaCheckCircle } from "react-icons/fa";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  // Navigate to Player Details page
  const handleNavigateToPlayerDetails = () => {
    navigate('/player-details');
  };

  // Navigate to user details with specific user
  const handleUserClick = (userId) => {
    if (userId) {
      navigate(`/player-details?userId=${userId}`);
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
      onClick: null,
    },
    {
      title: "Total Players",
      value: cards.total_players,
      icon: <FaUsers />,
      color: "green",
      change: `${cards.total_agents} agents`,
      increase: true,
      onClick: handleNavigateToPlayerDetails,
    },
    {
      title: "Total Revenue",
      value: `₹${cards.total_revenue}`,
      icon: <FaRupeeSign />,
      color: "gold",
      change: `₹${cards.total_winning_distributed} distributed`,
      increase: true,
      onClick: null,
    },
    {
      title: "Pending Claims",
      value: cards.pending_claims,
      icon: <FaTicketAlt />,
      color: "orange",
      change: `${cards.total_claims} total claims`,
      increase: true,
      onClick: null,
    },
  ];

  // Payment stats with navigation to Player Details page
  const paymentStats = [
    {
      title: "Manual Payment Requests",
      value: cards.manual_payment_requests || 0,
      icon: <FaMoneyBillWave />,
      color: "blue",
      change: "Total requests",
      increase: true,
      onClick: handleNavigateToPlayerDetails,
    },
    {
      title: "Pending Payments",
      value: cards.pending_manual_payments || 0,
      icon: <FaClock />,
      color: "orange",
      change: "Awaiting approval",
      increase: true,
      onClick: handleNavigateToPlayerDetails,
    },
    {
      title: "Successful Payments",
      value: cards.successful_manual_payments || 0,
      icon: <FaCheckCircle />,
      color: "green",
      change: "Completed",
      increase: true,
      onClick: handleNavigateToPlayerDetails,
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
        <div 
          className="stat-card stat-card-1"
          onClick={stats[0].onClick}
          style={{ cursor: stats[0].onClick ? 'pointer' : 'default' }}
        >
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

        <div 
          className="stat-card stat-card-2"
          onClick={stats[1].onClick}
          style={{ cursor: stats[1].onClick ? 'pointer' : 'default' }}
        >
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

        <div 
          className="stat-card stat-card-3"
          onClick={stats[2].onClick}
          style={{ cursor: stats[2].onClick ? 'pointer' : 'default' }}
        >
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

        <div 
          className="stat-card stat-card-4"
          onClick={stats[3].onClick}
          style={{ cursor: stats[3].onClick ? 'pointer' : 'default' }}
        >
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

      {/* Manual Payment Stats Row - Clickable */}
      <div className="payment-stats-grid">
        <h3 className="payment-stats-title">💰 Manual Payment Overview</h3>
        <div className="payment-stats-container">
          {paymentStats.map((stat, index) => (
            <div 
              key={index} 
              className={`payment-stat-card payment-stat-${index + 1} clickable`}
              onClick={stat.onClick}
              style={{ cursor: 'pointer' }}
            >
              <div className="payment-stat-circle"></div>
              <div className={`payment-stat-icon-wrapper icon-${stat.color}`}>
                {stat.icon}
              </div>
              <div className="payment-stat-content">
                <h4 className="payment-stat-title">{stat.title}</h4>
                <p className="payment-stat-value">{stat.value}</p>
                <span className="payment-stat-change positive">
                  <FaArrowUp className="change-icon" />
                  {stat.change}
                </span>
              </div>
              <div className="payment-hover-effect">
                View Details →
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Section - Full Width */}
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

      {/* Top Winners - Full Width */}
      <div className="winners-section">
        <div className="section-header">
          <h3>🏆 Top Winners</h3>
          <span className="section-badge yellow">This Week</span>
        </div>
        <div className="winners-list">
          {tables.top_winners && tables.top_winners.length > 0 ? (
            tables.top_winners.map((winner, i) => (
              <div 
                key={i} 
                className="winner-item clickable"
                onClick={() => handleUserClick(winner.user_id)}
                style={{ cursor: winner.user_id ? 'pointer' : 'default' }}
              >
                <div className="winner-rank">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '⭐'}
                </div>
                <div className="winner-info">
                  <span className="winner-name">
                    {winner.user_name || `User ${winner.user_id || 'Unknown'}`}
                  </span>
                  <span className="winner-game">
                    {winner.total_wins || 0} wins
                  </span>
                </div>
                <div className="winner-prize">
                  ₹{parseInt(winner.total_winning || 0).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">No winners yet</div>
          )}
        </div>
      </div>

      {/* Recent Games Table */}
      <div className="table-section">
        <div className="section-header">
          <h3>📋 Recent Games</h3>
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
              {tables.recent_games && tables.recent_games.length > 0 ? (
                tables.recent_games.map((game, i) => (
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
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">No recent games</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}