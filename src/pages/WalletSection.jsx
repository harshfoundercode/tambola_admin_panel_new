import React, { useState, useEffect } from 'react';
import { 
  getWalletDashboardDataAPI, 
  getWalletTransactionAPI, 
  getWalletAgentsAPI, 
  getWalletAgentsDetailsAPI 
} from '../services/api';

const AdminCommissionWallet = () => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  
  // State for API data
  const [loading, setLoading] = useState({
    dashboard: false,
    transactions: false,
    agents: false,
    agentDetails: false
  });
  const [error, setError] = useState({
    dashboard: null,
    transactions: null,
    agents: null,
    agentDetails: null
  });
  
  // API Data states
  const [walletData, setWalletData] = useState({
    total_balance: '0.00',
    total_revenue: '0',
    total_agent_earning: '0.00',
    pending_withdrawals: '0.00'
  });
  
  const [transactions, setTransactions] = useState([]);
  const [agents, setAgents] = useState([]);
  const [agentDetails, setAgentDetails] = useState(null);

  // Fetch Wallet Dashboard Data
  const fetchWalletDashboard = async () => {
    setLoading(prev => ({ ...prev, dashboard: true }));
    setError(prev => ({ ...prev, dashboard: null }));
    try {
      const response = await getWalletDashboardDataAPI();
      console.log("📊 Dashboard Response:", response);
      if (response.data.success) {
        setWalletData(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching wallet dashboard:', err);
      setError(prev => ({ ...prev, dashboard: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  };

  // Fetch Wallet Transactions
  const fetchWalletTransactions = async () => {
    setLoading(prev => ({ ...prev, transactions: true }));
    setError(prev => ({ ...prev, transactions: null }));
    try {
      const response = await getWalletTransactionAPI();
      console.log("📊 Transactions Response:", response);
      if (response.data.success) {
        const transactionData = response.data.rows || response.data.data || [];
        setTransactions(transactionData);
      } else {
        throw new Error(response.data.message || 'Failed to fetch transactions');
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(prev => ({ ...prev, transactions: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  };

  // Fetch Agents
  const fetchAgents = async () => {
    setLoading(prev => ({ ...prev, agents: true }));
    setError(prev => ({ ...prev, agents: null }));
    try {
      const response = await getWalletAgentsAPI();
      console.log("📊 Agents Response:", response);
      
      if (response.data.success) {
        let agentData = [];
        if (response.data.data && Array.isArray(response.data.data)) {
          agentData = response.data.data;
        } else if (response.data.rows && Array.isArray(response.data.rows)) {
          agentData = response.data.rows;
        }
        console.log("📊 Agent Data Array:", agentData);
        setAgents(agentData);
      } else {
        throw new Error(response.data.message || 'Failed to fetch agents');
      }
    } catch (err) {
      console.error('Error fetching agents:', err);
      setError(prev => ({ ...prev, agents: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, agents: false }));
    }
  };

  // Fetch Agent Details
  const fetchAgentDetails = async (agentId) => {
    if (!agentId) return;
    setLoading(prev => ({ ...prev, agentDetails: true }));
    setError(prev => ({ ...prev, agentDetails: null }));
    try {
      const response = await getWalletAgentsDetailsAPI(agentId);
      console.log("📊 Agent Details Response:", response);
      if (response.data.success) {
        setAgentDetails(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch agent details');
      }
    } catch (err) {
      console.error('Error fetching agent details:', err);
      setError(prev => ({ ...prev, agentDetails: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, agentDetails: false }));
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchWalletDashboard();
    fetchWalletTransactions();
    fetchAgents();
  }, []);

  // Jab tab change ho toh API call karein
  useEffect(() => {
    if (activeTab === 'transactions') {
      console.log("🔄 Transactions tab active - fetching transactions...");
      fetchWalletTransactions();
    } else if (activeTab === 'agents') {
      console.log("🔄 Agents tab active - fetching agents...");
      fetchAgents();
      if (selectedAgent) {
        fetchAgentDetails(selectedAgent.agent_id);
      }
    }
  }, [activeTab]);

  // Fetch agent details when selected
  useEffect(() => {
    if (selectedAgent && activeTab === 'agents') {
      fetchAgentDetails(selectedAgent.agent_id);
    } else if (!selectedAgent) {
      setAgentDetails(null);
    }
  }, [selectedAgent, activeTab]);

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount || amount === '0' || amount === '0.00') return '₹0';
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  // Get status badge style
  const getStatusStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return { backgroundColor: '#dcfce7', color: '#16a34a' };
      case 'pending':
        return { backgroundColor: '#fef9c3', color: '#ca8a04' };
      case 'failed':
      case 'rejected':
        return { backgroundColor: '#fee2e2', color: '#dc2626' };
      default:
        return { backgroundColor: '#f1f5f9', color: '#64748b' };
    }
  };

  // Get agent status style
  const getAgentStatusStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'active':
        return { backgroundColor: '#dcfce7', color: '#16a34a' };
      case 'inactive':
        return { backgroundColor: '#f1f5f9', color: '#64748b' };
      default:
        return { backgroundColor: '#f1f5f9', color: '#64748b' };
    }
  };

  // ===== STYLES =====
  const styles = {
    container: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      color: '#1e293b'
    },
    header: {
      marginBottom: '32px'
    },
    headerTitle: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#0f172a',
      letterSpacing: '-0.5px',
      margin: '0'
    },
    headerSub: {
      color: '#64748b',
      marginTop: '6px',
      fontSize: '15px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '20px',
      marginBottom: '32px'
    },
    statCard: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '20px 24px',
      border: '1px solid #f1f5f9',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    statLeft: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    statLabel: {
      fontSize: '13px',
      fontWeight: '500',
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.4px'
    },
    statValue: {
      fontSize: '26px',
      fontWeight: '700',
      color: '#0f172a'
    },
    statIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      color: '#ffffff',
      flexShrink: '0'
    },
    statIconBlue: {
      backgroundColor: '#2563eb'
    },
    statIconGreen: {
      backgroundColor: '#22c55e'
    },
    statIconPurple: {
      backgroundColor: '#8b5cf6'
    },
    statIconOrange: {
      backgroundColor: '#f97316'
    },
    tabsWrapper: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #f1f5f9',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      overflow: 'hidden'
    },
    tabsNav: {
      display: 'flex',
      gap: '0',
      borderBottom: '1px solid #e2e8f0',
      padding: '0 24px',
      backgroundColor: '#fafbfc'
    },
    tabBtn: {
      padding: '16px 4px',
      marginRight: '28px',
      border: 'none',
      background: 'transparent',
      fontSize: '14px',
      fontWeight: '500',
      color: '#94a3b8',
      cursor: 'pointer',
      borderBottom: '2px solid transparent',
      transition: 'all 0.2s ease',
      textTransform: 'capitalize',
      letterSpacing: '0.2px'
    },
    tabBtnActive: {
      color: '#2563eb',
      borderBottom: '2px solid #2563eb'
    },
    tabContent: {
      padding: '24px',
      minHeight: '420px'
    },
    filters: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      marginBottom: '20px'
    },
    filterInput: {
      flex: '1',
      minWidth: '200px',
      position: 'relative'
    },
    filterInputField: {
      width: '100%',
      padding: '10px 12px 10px 38px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '14px',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      boxSizing: 'border-box'
    },
    filterSelect: {
      padding: '10px 16px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      fontSize: '14px',
      color: '#1e293b',
      outline: 'none',
      cursor: 'pointer',
      transition: 'border-color 0.2s ease'
    },
    transactionItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 16px',
      borderRadius: '8px',
      borderBottom: '1px solid #f1f5f9',
      transition: 'background 0.15s ease'
    },
    transactionLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px'
    },
    transactionIcon: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px'
    },
    transactionIconCredit: {
      backgroundColor: '#dcfce7',
      color: '#16a34a'
    },
    transactionIconDebit: {
      backgroundColor: '#fee2e2',
      color: '#dc2626'
    },
    txTitle: {
      fontWeight: '500',
      color: '#0f172a',
      fontSize: '14px'
    },
    txDate: {
      fontSize: '13px',
      color: '#94a3b8'
    },
    transactionRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '18px'
    },
    txAmount: {
      fontWeight: '600',
      fontSize: '15px'
    },
    txAmountCredit: {
      color: '#16a34a'
    },
    txAmountDebit: {
      color: '#dc2626'
    },
    statusBadge: {
      padding: '4px 14px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize'
    },
    agentTable: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      textAlign: 'left',
      padding: '12px 16px',
      fontSize: '13px',
      fontWeight: '600',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.3px',
      borderBottom: '1px solid #e2e8f0'
    },
    td: {
      padding: '12px 16px',
      fontSize: '14px',
      borderBottom: '1px solid #f1f5f9',
      color: '#0f172a'
    },
    agentStatus: {
      padding: '4px 14px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600'
    },
    loadingSpinner: {
      textAlign: 'center',
      padding: '40px',
      color: '#94a3b8'
    },
    errorMessage: {
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '16px',
      fontSize: '14px'
    },
    noData: {
      textAlign: 'center',
      padding: '40px',
      color: '#94a3b8',
      fontSize: '14px'
    },
    agentRowSelected: {
      backgroundColor: '#eff6ff'
    },
    agentDetailPanel: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      marginTop: '20px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
    },
    agentDetailHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      paddingBottom: '16px',
      borderBottom: '1px solid #e2e8f0'
    },
    agentDetailTitle: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#0f172a'
    },
    agentDetailSubtitle: {
      fontSize: '14px',
      color: '#64748b',
      marginTop: '4px'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      color: '#94a3b8',
      padding: '4px 8px',
      borderRadius: '4px',
      transition: 'background 0.2s ease'
    },
    agentDetailGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px',
      marginBottom: '24px'
    },
    agentDetailCard: {
      backgroundColor: '#f8fafc',
      borderRadius: '10px',
      padding: '18px',
      border: '1px solid #f1f5f9',
      textAlign: 'center',
      transition: 'all 0.2s ease'
    },
    agentDetailLabel: {
      fontSize: '12px',
      fontWeight: '500',
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.3px'
    },
    agentDetailValue: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#0f172a',
      marginTop: '6px'
    },
    actionLink: {
      color: '#2563eb',
      textDecoration: 'none',
      cursor: 'pointer',
      transition: 'color 0.2s ease',
      fontWeight: '500'
    },
    walletSummary: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '12px',
      marginTop: '16px',
      padding: '16px',
      backgroundColor: '#f8fafc',
      borderRadius: '10px',
      border: '1px solid #e2e8f0'
    },
    walletItem: {
      textAlign: 'center'
    },
    walletLabel: {
      fontSize: '11px',
      fontWeight: '500',
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.3px'
    },
    walletValue: {
      fontSize: '18px',
      fontWeight: '600',
      marginTop: '4px'
    }
  };

  // ===== COMPONENTS =====
  const StatCard = ({ label, value, icon, iconColor }) => (
    <div style={styles.statCard}>
      <div style={styles.statLeft}>
        <span style={styles.statLabel}>{label}</span>
        <span style={styles.statValue}>{value}</span>
      </div>
     
    </div>
  );

  const TransactionRow = ({ transaction }) => {
    const isCredit = transaction.type === 'credit';
    
    return (
      <div style={styles.transactionItem}>
        <div style={styles.transactionLeft}>
          <div style={{
            ...styles.transactionIcon,
            ...(isCredit ? styles.transactionIconCredit : styles.transactionIconDebit)
          }}>
            <i className={`fas fa-arrow-${isCredit ? 'up' : 'down'}`}></i>
          </div>
          <div>
            <div style={styles.txTitle}>{transaction.title || 'Transaction'}</div>
            <div style={styles.txDate}>
              {transaction.created_at || transaction.date || 'N/A'}
            </div>
          </div>
        </div>
        <div style={styles.transactionRight}>
          <span style={{
            ...styles.txAmount,
            ...(isCredit ? styles.txAmountCredit : styles.txAmountDebit)
          }}>
            {isCredit ? '+' : '-'}{formatCurrency(transaction.amount)}
          </span>
          <span style={{
            ...styles.statusBadge,
            ...getStatusStyle(transaction.status)
          }}>
            {transaction.status || 'success'}
          </span>
        </div>
      </div>
    );
  };

  const AgentDetailView = ({ agent, details }) => {
    if (loading.agentDetails) {
      return (
        <div style={styles.agentDetailPanel}>
          <div style={styles.loadingSpinner}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '24px' }}></i>
            <p>Loading agent details...</p>
          </div>
        </div>
      );
    }

    if (error.agentDetails) {
      return (
        <div style={styles.agentDetailPanel}>
          <div style={styles.errorMessage}>
            <i className="fas fa-exclamation-circle"></i> {error.agentDetails}
          </div>
        </div>
      );
    }

    if (!details) {
      return (
        <div style={styles.agentDetailPanel}>
          <div style={styles.noData}>No details available for this agent</div>
        </div>
      );
    }

    return (
      <div style={styles.agentDetailPanel}>
        {/* Header */}
        <div style={styles.agentDetailHeader}>
          <div>
            <h3 style={styles.agentDetailTitle}>{details.name || agent?.name || 'Agent'}</h3>
            <div style={styles.agentDetailSubtitle}>
              Agent ID: {details.agent_id} • {details.email || 'No email'} • {details.phone || 'No phone'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              ...styles.agentStatus,
              ...getAgentStatusStyle(details.status)
            }}>
              {details.status || 'N/A'}
            </span>
            <button 
              style={styles.closeBtn}
              onClick={() => setSelectedAgent(null)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div style={styles.agentDetailGrid}>
          <div style={styles.agentDetailCard}>
            <div style={styles.agentDetailLabel}>Wallet Balance</div>
            <div style={{ ...styles.agentDetailValue, color: '#2563eb' }}>
              {formatCurrency(details.wallet_balance)}
            </div>
          </div>
          <div style={styles.agentDetailCard}>
            <div style={styles.agentDetailLabel}>Total Commission</div>
            <div style={{ ...styles.agentDetailValue, color: '#16a34a' }}>
              {formatCurrency(details.total_commission)}
            </div>
          </div>
          <div style={styles.agentDetailCard}>
            <div style={styles.agentDetailLabel}>Total Winning</div>
            <div style={{ ...styles.agentDetailValue, color: '#8b5cf6' }}>
              {formatCurrency(details.total_winning)}
            </div>
          </div>
          <div style={styles.agentDetailCard}>
            <div style={styles.agentDetailLabel}>Total Sold</div>
            <div style={styles.agentDetailValue}>{details.total_sold || 0}</div>
          </div>
        </div>

        {/* Booking & Transaction Stats */}
        <div style={styles.agentDetailGrid}>
          <div style={styles.agentDetailCard}>
            <div style={styles.agentDetailLabel}>Total Bookings</div>
            <div style={{ ...styles.agentDetailValue, color: '#f97316' }}>
              {details.total_bookings || 0}
            </div>
          </div>
          <div style={styles.agentDetailCard}>
            <div style={styles.agentDetailLabel}>Booking Amount</div>
            <div style={{ ...styles.agentDetailValue, color: '#dc2626' }}>
              {formatCurrency(details.booking_amount)}
            </div>
          </div>
          <div style={styles.agentDetailCard}>
            <div style={styles.agentDetailLabel}>Total Tickets</div>
            <div style={{ ...styles.agentDetailValue, color: '#0891b2' }}>
              {details.total_tickets || 0}
            </div>
          </div>
          <div style={styles.agentDetailCard}>
            <div style={styles.agentDetailLabel}>Total Transactions</div>
            <div style={{ ...styles.agentDetailValue, color: '#7c3aed' }}>
              {details.total_transactions || 0}
            </div>
          </div>
        </div>

        {/* Wallet Summary */}
        <div style={{ marginTop: '8px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '12px' }}>
            <i className="fas fa-wallet" style={{ marginRight: '8px' }}></i>
            Wallet Summary
          </h4>
          <div style={styles.walletSummary}>
            <div style={styles.walletItem}>
              <div style={styles.walletLabel}>Wallet Balance</div>
              <div style={{ ...styles.walletValue, color: '#2563eb' }}>
                {formatCurrency(details.wallet_balance)}
              </div>
            </div>
            <div style={styles.walletItem}>
              <div style={styles.walletLabel}>Total Credit</div>
              <div style={{ ...styles.walletValue, color: '#16a34a' }}>
                {formatCurrency(details.wallet_credit)}
              </div>
            </div>
            <div style={styles.walletItem}>
              <div style={styles.walletLabel}>Total Debit</div>
              <div style={{ ...styles.walletValue, color: '#dc2626' }}>
                {formatCurrency(details.wallet_debit)}
              </div>
            </div>
            <div style={styles.walletItem}>
              <div style={styles.walletLabel}>Total Commission</div>
              <div style={{ ...styles.walletValue, color: '#8b5cf6' }}>
                {formatCurrency(details.total_commission)}
              </div>
            </div>
          </div>
        </div>

        {/* Agent Info */}
        <div style={{ 
          marginTop: '16px', 
          padding: '12px 16px', 
          backgroundColor: '#f1f5f9', 
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            <i className="fas fa-calendar-alt" style={{ marginRight: '6px' }}></i>
            Joined: {details.created_at ? new Date(details.created_at).toLocaleDateString() : 'N/A'}
          </span>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            <i className="fas fa-clock" style={{ marginRight: '6px' }}></i>
            {details.created_at ? new Date(details.created_at).toLocaleTimeString() : 'N/A'}
          </span>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            <i className="fas fa-id-badge" style={{ marginRight: '6px' }}></i>
            Agent ID: #{details.agent_id}
          </span>
        </div>
      </div>
    );
  };

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter(tx => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (tx.title || '').toLowerCase().includes(searchLower) ||
           (tx.name || '').toLowerCase().includes(searchLower) ||
           (tx.account_type || '').toLowerCase().includes(searchLower);
  });

  // ===== RENDER =====
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Commission &amp; Wallet Management</h1>
        <p style={styles.headerSub}>Manage commissions, wallet balance, and financial operations</p>
      </div>

      {/* Error Messages */}
      {error.dashboard && (
        <div style={styles.errorMessage}>
          <i className="fas fa-exclamation-circle"></i> {error.dashboard}
        </div>
      )}

      {/* Stats - Dashboard data sirf ek baar fetch hoti hai */}
      {loading.dashboard ? (
        <div style={styles.loadingSpinner}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '24px' }}></i>
          <p>Loading dashboard data...</p>
        </div>
      ) : (
        <div style={styles.statsGrid}>
          <StatCard
            label="Total Balance"
            value={formatCurrency(walletData.total_balance)}
            icon="fas fa-wallet"
            iconColor={styles.statIconBlue}
          />
          <StatCard
            label="Total Revenue"
            value={formatCurrency(walletData.total_revenue)}
            icon="fas fa-coins"
            iconColor={styles.statIconGreen}
          />
          <StatCard
            label="Total Agent Earning"
            value={formatCurrency(walletData.total_agent_earning)}
            icon="fas fa-percentage"
            iconColor={styles.statIconPurple}
          />
          <StatCard
            label="Pending Withdrawals"
            value={formatCurrency(walletData.pending_withdrawals)}
            icon="fas fa-clock"
            iconColor={styles.statIconOrange}
          />
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabsWrapper}>
        <div style={styles.tabsNav}>
          {['transactions', 'agents'].map((tab) => (
            <button
              key={tab}
              style={{
                ...styles.tabBtn,
                ...(activeTab === tab ? styles.tabBtnActive : {})
              }}
              onClick={() => {
                setActiveTab(tab);
                setSelectedAgent(null);
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div style={styles.tabContent}>
          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div>
              <div style={styles.filters}>
                <div style={styles.filterInput}>
                  <i className="fas fa-search" style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#94a3b8' 
                  }}></i>
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    style={styles.filterInputField}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select style={styles.filterSelect}>
                  <option>All Types</option>
                  <option>Credit</option>
                  <option>Debit</option>
                </select>
                <select style={styles.filterSelect}>
                  <option>All Status</option>
                  <option>Success</option>
                  <option>Pending</option>
                  <option>Failed</option>
                </select>
              </div>

              {loading.transactions ? (
                <div style={styles.loadingSpinner}>
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '24px' }}></i>
                  <p>Loading transactions...</p>
                </div>
              ) : error.transactions ? (
                <div style={styles.errorMessage}>
                  <i className="fas fa-exclamation-circle"></i> {error.transactions}
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div style={styles.noData}>
                  <i className="fas fa-inbox" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}></i>
                  {searchQuery ? 'No transactions match your search' : 'No transactions found'}
                </div>
              ) : (
                filteredTransactions.map((tx, index) => (
                  <TransactionRow key={tx.id || index} transaction={tx} />
                ))
              )}
            </div>
          )}

          {/* Agents Tab */}
          {activeTab === 'agents' && (
            <div>
              {loading.agents ? (
                <div style={styles.loadingSpinner}>
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '24px' }}></i>
                  <p>Loading agents...</p>
                </div>
              ) : error.agents ? (
                <div style={styles.errorMessage}>
                  <i className="fas fa-exclamation-circle"></i> {error.agents}
                </div>
              ) : agents.length === 0 ? (
                <div style={styles.noData}>
                  <i className="fas fa-users" style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}></i>
                  No agents found
                </div>
              ) : (
                <>
                  <table style={styles.agentTable}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Agent Name</th>
                        <th style={styles.th}>Phone</th>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Total Earning</th>
                        <th style={styles.th}>Total Sold</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Joined</th>
                        <th style={styles.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agents.map((agent) => (
                        <tr 
                          key={agent.agent_id}
                          style={{
                            ...(selectedAgent?.agent_id === agent.agent_id ? styles.agentRowSelected : {})
                          }}
                        >
                          <td style={styles.td}>
                            <strong>{agent.name || 'N/A'}</strong>
                          </td>
                          <td style={styles.td}>{agent.phone || 'N/A'}</td>
                          <td style={styles.td}>{agent.email || 'N/A'}</td>
                          <td style={{ ...styles.td, color: '#16a34a', fontWeight: '600' }}>
                            {formatCurrency(agent.total_earning)}
                          </td>
                          <td style={styles.td}>{agent.total_sold || 0}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.agentStatus,
                              ...getAgentStatusStyle(agent.status)
                            }}>
                              {agent.status || 'N/A'}
                            </span>
                          </td>
                          <td style={styles.td}>
                            {agent.created_at ? new Date(agent.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td style={styles.td}>
                            <span 
                              style={styles.actionLink}
                              onClick={() => setSelectedAgent(agent)}
                            >
                              <i className="fas fa-eye"></i> View Details
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Agent Detail View */}
                  {selectedAgent && (
                    <AgentDetailView agent={selectedAgent} details={agentDetails} />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Global styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .tab-pane-active {
          animation: fadeIn 0.3s ease;
        }
        .fas, .far, .fal, .fab {
          font-family: 'Font Awesome 6 Free';
          font-weight: 900;
        }
        button:hover {
          opacity: 0.85;
        }
        .action-link:hover {
          color: #1d4ed8;
        }
      `}</style>
    </div>
  );
};

export default AdminCommissionWallet;