import { useState, useEffect } from "react";
import {
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineClock,
  HiOutlinePhone,
  HiOutlineCash,
  HiOutlineSearch,
  HiOutlineOfficeBuilding,
  HiOutlineDeviceMobile,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlineRefresh,
  HiOutlineExclamation,
  HiOutlineShieldCheck,
  HiOutlineCurrencyRupee
} from "react-icons/hi";
import styles from "../styles/WithdrawalRequests.module.css";
import { getWithdrawRequestsAPI, changeWithdrawReqStatusAPI } from "../services/api"; // Adjust import path

function WithdrawalRequests() {
  // State for API data
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    total_requests: 0,
    pending_requests: "0",
    approved_requests: "0",
    rejected_requests: "0",
    total_amount: "0",
    today_requests: "0"
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1
  });

  // UI States
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState({ min: "", max: "" });
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // Map API data to component structure
  const mapApiDataToRequest = (item) => ({
    id: item.withdrawal_id,
    request_id: `WD-${String(item.withdrawal_id).padStart(4, '0')}`,
    user_id: item.user_id,
    user_name: item.name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Unknown User',
    phone: item.phone || 'N/A',
    email: item.email || '',
    amount: item.amount,
    method: item.method,
    status: item.status,
    account_holder_name: item.account_holder_name,
    bank_name: item.bank_name,
    account_number: item.account_number ? `XXXX${item.account_number.slice(-4)}` : null,
    ifsc_code: item.ifsc_code,
    upi_id: item.upi_id,
    transaction_id: item.transaction_id,
    rejection_reason: item.reject_reason,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    approved_at: item.status === 'approved' ? item.updatedAt : null,
    rejected_at: item.status === 'rejected' ? item.updatedAt : null,
    kyc_status: item.kyc_status,
    wallet_balance: item.wallet_balance,
    raw_account_number: item.account_number,
    raw_upi_id: item.upi_id
  });

  // Fetch withdrawal requests from API
  const fetchWithdrawals = async (page = 1) => {
    setLoading(true);
    try {
      const result = await getWithdrawRequestsAPI(page, pagination.limit);
      console.log("API Response:", result);

      if (result) {
        // Map API data to component structure
        const mappedData = (result.data || []).map(mapApiDataToRequest);
        
        setRequests(mappedData);
        setStats(result.stats || {
          total_requests: mappedData.length,
          pending_requests: String(mappedData.filter(r => r.status === 'pending').length),
          approved_requests: String(mappedData.filter(r => r.status === 'approved').length),
          rejected_requests: String(mappedData.filter(r => r.status === 'rejected').length),
          total_amount: String(mappedData.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)),
          today_requests: String(mappedData.length)
        });
        setPagination(result.pagination || pagination);
      } else {
        showNotification("No data received from API", "error");
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      showNotification(error.response?.data?.message || error.message || "Failed to fetch withdrawal requests", "error");
    } finally {
      setLoading(false);
    }
  };

  // Approve withdrawal via API
  const handleApprove = async (requestId) => {
    setActionLoading(true);
    try {
      const statusData = {
        withdrawal_id: requestId,
        status: "approved"
      };

      console.log("Approving withdrawal:", statusData);
      const result = await changeWithdrawReqStatusAPI(statusData);
      console.log("Approve Response:", result);

      if (result) {
        // Update local state
        setRequests(prev => prev.map(req => 
          req.id === requestId ? { 
            ...req, 
            status: 'approved', 
            approved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            transaction_id: result.transaction_id || req.transaction_id
          } : req
        ));
        
        // Refresh stats
        await fetchWithdrawals(pagination.page);
        showNotification("Withdrawal approved successfully!", "success");
      }
    } catch (error) {
      console.error("Error approving withdrawal:", error);
      showNotification(error.response?.data?.message || error.message || "Failed to approve withdrawal", "error");
    } finally {
      setActionLoading(false);
      setModalType(null);
      setSelectedRequest(null);
    }
  };

  // Reject withdrawal via API
  const handleReject = async (requestId, reason) => {
    if (!reason || !reason.trim()) {
      showNotification("Please provide a rejection reason", "error");
      return;
    }
    
    setActionLoading(true);
    try {
      const statusData = {
        withdrawal_id: requestId,
        status: "rejected",
        reject_reason: reason
      };

      console.log("Rejecting withdrawal:", statusData);
      const result = await changeWithdrawReqStatusAPI(statusData);
      console.log("Reject Response:", result);

      if (result) {
        // Update local state
        setRequests(prev => prev.map(req => 
          req.id === requestId ? { 
            ...req, 
            status: 'rejected', 
            rejected_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            rejection_reason: reason 
          } : req
        ));
        
        // Refresh stats
        await fetchWithdrawals(pagination.page);
        showNotification("Withdrawal rejected successfully!", "error");
      }
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      showNotification(error.response?.data?.message || error.message || "Failed to reject withdrawal", "error");
    } finally {
      setActionLoading(false);
      setModalType(null);
      setSelectedRequest(null);
      setRejectReason("");
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchWithdrawals(1);
  }, []);

  const handleRefresh = () => {
    fetchWithdrawals(pagination.page);
  };

  const handlePageChange = (newPage) => {
    fetchWithdrawals(newPage);
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const openRejectModal = (req) => { setSelectedRequest(req); setRejectReason(""); setModalType("reject"); };
  const openApproveModal = (req) => { setSelectedRequest(req); setModalType("approve"); };
  const openDetailsModal = (req) => { setSelectedRequest(req); setModalType("details"); };
  const closeModal = () => { setModalType(null); setSelectedRequest(null); setRejectReason(""); };

  const getFilteredRequests = () => {
    let filtered = [...requests];
    if (filter !== "all") {
      filtered = filtered.filter(req => 
        filter === "approved" ? req.status === "approved" : 
        filter === "rejected" ? req.status === "rejected" : 
        req.status === filter
      );
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(req => 
        req.user_name?.toLowerCase().includes(term) || 
        req.phone?.includes(term) || 
        req.email?.toLowerCase().includes(term) || 
        req.request_id?.toLowerCase().includes(term)
      );
    }
    if (amountFilter.min) filtered = filtered.filter(req => parseFloat(req.amount) >= parseFloat(amountFilter.min));
    if (amountFilter.max) filtered = filtered.filter(req => parseFloat(req.amount) <= parseFloat(amountFilter.max));
    if (dateFilter !== "all") {
      const now = new Date(); 
      const filterDate = new Date();
      if (dateFilter === "today") filterDate.setHours(0,0,0,0);
      else if (dateFilter === "week") filterDate.setDate(now.getDate()-7);
      else if (dateFilter === "month") filterDate.setMonth(now.getMonth()-1);
      filtered = filtered.filter(req => new Date(req.created_at) >= filterDate);
    }
    return filtered;
  };

  const formatDate = (dateString) => {
    if (!dateString) return { full: "N/A", relative: "N/A" };
    const date = new Date(dateString);
    const diffHours = Math.floor(Math.abs(new Date() - date) / 3600000);
    let relative = diffHours < 1 ? `${Math.floor(Math.abs(new Date() - date) / 60000)} min ago` : 
                   diffHours < 24 ? `${diffHours} hours ago` : 
                   `${Math.floor(diffHours/24)} days ago`;
    return { 
      full: date.toLocaleDateString('en-IN', { 
        day:'numeric', 
        month:'short', 
        year:'numeric', 
        hour:'2-digit', 
        minute:'2-digit' 
      }), 
      relative 
    };
  };

  const formatCurrency = (amount) => `₹${parseFloat(amount||0).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}`;

  const getStatusDisplay = (status) => {
    const map = {
      'pending': { text:'Pending', icon:<HiOutlineClock/>, dot: styles.dotPending, badge: styles.badgePending, border: styles.borderPending, avatar: styles.avatarPending, footer: styles.footerPending },
      'approved': { text:'Approved', icon:<HiOutlineCheck/>, dot: styles.dotApproved, badge: styles.badgeApproved, border: styles.borderApproved, avatar: styles.avatarApproved, footer: styles.footerApproved },
      'rejected': { text:'Rejected', icon:<HiOutlineX/>, dot: styles.dotRejected, badge: styles.badgeRejected, border: styles.borderRejected, avatar: styles.avatarRejected, footer: styles.footerRejected },
    };
    return map[status] || { text:status, icon:null, dot:'', badge:'', border:'', avatar:'', footer:'' };
  };

  const getMethodIcon = (m) => m==='bank' ? <HiOutlineOfficeBuilding/> : m==='upi' ? <HiOutlineDeviceMobile/> : <HiOutlineCurrencyRupee/>;
  const getMethodName = (m) => m==='bank' ? 'Bank Transfer' : m==='upi' ? 'UPI Transfer' : m;
  const clearAllFilters = () => { setFilter("all"); setSearchTerm(""); setDateFilter("all"); setAmountFilter({min:"",max:""}); };

  const filteredRequests = getFilteredRequests();
  const hasActiveFilters = filter!=="all" || searchTerm || dateFilter!=="all" || amountFilter.min || amountFilter.max;

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        
        {notification.show && (
          <div className={`${styles.notificationToast} ${notification.type==='success'?styles.notificationSuccess:styles.notificationError} ${styles.animateSlideIn}`}>
            <div className={styles.flexCenter} style={{gap:'0.5rem'}}>
              {notification.type==='success' ? <HiOutlineCheck/> : <HiOutlineExclamation/>}
              <span style={{fontSize:'0.875rem',fontWeight:500}}>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}><HiOutlineCash size={24}/></div>
            <div>
              <h1 className={styles.headerTitle}>Withdrawal Requests</h1>
              <p className={styles.headerSubtitle}>Manage and process user withdrawal requests</p>
            </div>
          </div>
          <button onClick={handleRefresh} disabled={loading} className={styles.refreshBtn}>
            <HiOutlineRefresh className={loading?styles.animateSpin:''} size={16}/>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          {[
            {label:'Total',icon:<HiOutlineDocumentText/>,iconClass:styles.iconIndigo,value:stats.total_requests,sub:'All requests',color:styles.textGray},
            {label:'Pending',icon:<HiOutlineClock/>,iconClass:styles.iconAmber,value:stats.pending_requests,sub:`${formatCurrency(stats.pending_requests)} pending`,color:styles.textAmber},
            {label:'Approved',icon:<HiOutlineCheck/>,iconClass:styles.iconEmerald,value:stats.approved_requests,sub:'Processed',color:styles.textEmerald},
            {label:'Rejected',icon:<HiOutlineX/>,iconClass:styles.iconRed,value:stats.rejected_requests,sub:'Declined',color:styles.textRed},
            {label:'Total Value',icon:<HiOutlineCurrencyRupee/>,iconClass:styles.iconViolet,value:formatCurrency(stats.total_amount),sub:'All requests',color:styles.textViolet},
            {label:'Today',icon:<HiOutlineShieldCheck/>,iconClass:styles.iconBlue,value:stats.today_requests,sub:'New today',color:styles.textBlue},
          ].map((s,i)=>(
            <div key={i} className={styles.statCard}>
              <div className={styles.statCardHeader}>
                <div className={`${styles.statIcon} ${s.iconClass}`}>{s.icon}</div>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
              <p className={`${styles.statValue} ${s.color}`}>{s.value}</p>
              <p className={styles.statSub}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className={styles.filtersContainer}>
          <div className={styles.filterTabs}>
            {[
              {key:'all',label:'All',count:parseInt(stats.total_requests),activeClass:styles.filterTabAll},
              {key:'pending',label:'Pending',count:parseInt(stats.pending_requests),activeClass:styles.filterTabPending,icon:<HiOutlineClock size={16}/>},
              {key:'approved',label:'Approved',count:parseInt(stats.approved_requests),activeClass:styles.filterTabApproved,icon:<HiOutlineCheck size={16}/>},
              {key:'rejected',label:'Rejected',count:parseInt(stats.rejected_requests),activeClass:styles.filterTabRejected,icon:<HiOutlineX size={16}/>},
            ].map(tab=>(
              <button key={tab.key} onClick={()=>setFilter(tab.key)}
                className={`${styles.filterTab} ${filter===tab.key ? `${styles.filterTabActive} ${tab.activeClass}` : ''}`}>
                {tab.icon}{tab.label}
                <span className={`${styles.filterBadge} ${filter!==tab.key?styles.filterBadgeInactive:''}`}>{tab.count}</span>
              </button>
            ))}
          </div>
          <div className={styles.filtersRow}>
            <div className={styles.searchWrapper}>
              <HiOutlineSearch className={styles.searchIcon} size={20}/>
              <input type="text" placeholder="Search by name, phone, email..." value={searchTerm}
                onChange={e=>setSearchTerm(e.target.value)} className={styles.searchInput}/>
              {searchTerm && <button onClick={()=>setSearchTerm('')} className={styles.clearSearch}>✕</button>}
            </div>
            <select value={dateFilter} onChange={e=>setDateFilter(e.target.value)} className={styles.dateSelect}>
              <option value="all">📅 All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <div className={styles.amountFilters}>
              <input type="number" placeholder="Min" value={amountFilter.min}
                onChange={e=>setAmountFilter({...amountFilter,min:e.target.value})} className={styles.amountInput}/>
              <span className={styles.amountSeparator}>-</span>
              <input type="number" placeholder="Max" value={amountFilter.max}
                onChange={e=>setAmountFilter({...amountFilter,max:e.target.value})} className={styles.amountInput}/>
            </div>
            {hasActiveFilters && (
              <button onClick={clearAllFilters} className={styles.clearBtn}>
                <HiOutlineX size={16}/> Clear
              </button>
            )}
          </div>
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className={styles.paginationContainer}>
            <button 
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className={styles.pageButton}
            >
              ← Previous
            </button>
            <span className={styles.pageInfo}>
              Page {pagination.page} of {pagination.total_pages}
            </span>
            <button 
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.total_pages}
              className={styles.pageButton}
            >
              Next →
            </button>
          </div>
        )}

        {/* Result count */}
        <div className={styles.resultCount}>
          <p className={styles.resultText}>
            Showing <span className={styles.resultBold}>{filteredRequests.length}</span> request{filteredRequests.length!==1?'s':''}
            {hasActiveFilters && <span> (filtered)</span>}
          </p>
        </div>

        {/* List */}
        <div className={styles.requestsList}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p className={styles.loadingText}>Loading withdrawal requests...</p>
            </div>
          ) : filteredRequests.length===0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}><HiOutlineCash size={40}/></div>
              <h3 className={styles.emptyTitle}>No withdrawal requests found</h3>
              <p className={styles.emptyText}>{hasActiveFilters?'Try adjusting filters':'No requests yet'}</p>
              {hasActiveFilters && <button onClick={clearAllFilters} className={styles.emptyBtn}>Clear All Filters</button>}
            </div>
          ) : (
            filteredRequests.map(req=>{
              const s = getStatusDisplay(req.status);
              const d = formatDate(req.created_at);
              return (
                <div key={req.id} className={`${styles.requestCard} ${s.border}`}>
                  <div className={styles.cardBody}>
                    <div className={styles.cardRow}>
                      <div className={styles.userInfo}>
                        <div className={`${styles.userAvatar} ${s.avatar}`}>{req.user_name?.charAt(0)?.toUpperCase()||'U'}</div>
                        <div style={{minWidth:0}}>
                          <h3 className={styles.userName}>{req.user_name}</h3>
                          <div className={styles.userContact}>
                            <span className={styles.contactItem}><HiOutlinePhone size={12}/> {req.phone}</span>
                            {req.email && <span className={styles.contactItem}>✉ {req.email}</span>}
                          </div>
                        </div>
                      </div>
                      <div className={styles.amountSection}>
                        <div className={styles.amountText}>
                          <p className={styles.amountValue}>{formatCurrency(req.amount)}</p>
                          <div className={styles.methodInfo}>{getMethodIcon(req.method)}<span>{getMethodName(req.method)}</span></div>
                        </div>
                        <div className={`${styles.statusBadge} ${s.badge}`}>
                          <div className={`${styles.statusDot} ${s.dot}`}></div>{s.icon}<span>{s.text}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.cardMeta}>
                      <span className={styles.metaId}>#{req.request_id}</span><span className={styles.metaDivider}>•</span>
                      <span>🕐 {d.relative}</span>
                      {req.transaction_id && <><span className={styles.metaDivider}>•</span><span className={styles.metaTxn}>TXN: {req.transaction_id}</span></>}
                      {req.rejection_reason && <><span className={styles.metaDivider}>•</span><span className={styles.metaReason}>Reason: {req.rejection_reason}</span></>}
                    </div>
                  </div>
                  <div className={`${styles.cardFooter} ${s.footer}`}>
                    <button onClick={()=>openDetailsModal(req)} className={styles.viewBtn}><HiOutlineEye size={16}/> View Details</button>
                    {req.status==="pending" ? (
                      <div className={styles.actionButtons}>
                        <button onClick={()=>openApproveModal(req)} disabled={actionLoading} className={styles.approveBtn}><HiOutlineCheck size={16}/> Approve</button>
                        <button onClick={()=>openRejectModal(req)} disabled={actionLoading} className={styles.rejectBtn}><HiOutlineX size={16}/> Reject</button>
                      </div>
                    ) : (
                      <span className={styles.statusText}>
                        {req.status==="approved" ? `✅ Approved on ${formatDate(req.approved_at||req.updated_at).full}` : `❌ Rejected on ${formatDate(req.rejected_at||req.updated_at).full}`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ============== DETAILS MODAL ============== */}
      {modalType==="details" && selectedRequest && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={`${styles.modalContent} ${styles.modalMaxLg}`} onClick={e=>e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <div className={`${styles.modalHeaderIcon} ${styles.iconInfo}`}><HiOutlineDocumentText size={24}/></div>
                <div><h2 className={`${styles.modalTitle} ${styles.titleDefault}`}>Request Details</h2><p className={`${styles.modalSubtitle} ${styles.subtitleDefault}`}>#{selectedRequest.request_id}</p></div>
              </div>
              <button onClick={closeModal} className={styles.modalClose}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalGrid}>
                <div className={styles.modalSection}><h3 className={styles.sectionTitle}>Customer Information</h3>
                  <div className={styles.infoGrid}>
                    <div><p className={styles.infoLabel}>Name</p><p className={styles.infoValue}>{selectedRequest.user_name}</p></div>
                    <div><p className={styles.infoLabel}>Phone</p><p className={styles.infoValue}>{selectedRequest.phone}</p></div>
                    <div><p className={styles.infoLabel}>Email</p><p className={styles.infoValue}>{selectedRequest.email||'N/A'}</p></div>
                    <div><p className={styles.infoLabel}>User ID</p><p className={styles.infoValue}>#{selectedRequest.user_id}</p></div>
                    {selectedRequest.kyc_status && (
                      <div><p className={styles.infoLabel}>KYC Status</p>
                        <span className={selectedRequest.kyc_status === 'verified' ? styles.textEmerald : styles.textAmber}>
                          {selectedRequest.kyc_status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.modalSection}><h3 className={styles.sectionTitle}>Withdrawal Information</h3>
                  <div className={styles.infoGrid}>
                    <div><p className={styles.infoLabel}>Amount</p><p className={styles.infoValueLg}>{formatCurrency(selectedRequest.amount)}</p></div>
                    <div><p className={styles.infoLabel}>Method</p><p className={styles.infoValue} style={{display:'flex',alignItems:'center',gap:'0.25rem'}}>{getMethodIcon(selectedRequest.method)}{getMethodName(selectedRequest.method)}</p></div>
                    <div><p className={styles.infoLabel}>Status</p>
                      <span className={`${styles.statusBadge} ${getStatusDisplay(selectedRequest.status).badge}`} style={{marginTop:'0.25rem'}}>
                        <div className={`${styles.statusDot} ${getStatusDisplay(selectedRequest.status).dot}`}></div>
                        {getStatusDisplay(selectedRequest.status).icon}{getStatusDisplay(selectedRequest.status).text}
                      </span>
                    </div>
                    <div><p className={styles.infoLabel}>Requested On</p><p className={styles.infoValue}>{formatDate(selectedRequest.created_at).full}</p></div>
                    {selectedRequest.wallet_balance && (
                      <div><p className={styles.infoLabel}>Wallet Balance</p><p className={styles.infoValue}>{formatCurrency(selectedRequest.wallet_balance)}</p></div>
                    )}
                  </div>
                </div>
                <div className={styles.modalSection}><h3 className={styles.sectionTitle}>Payment Details</h3>
                  {selectedRequest.method==='bank' ? (
                    <div className={styles.bankDetails} style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'0.75rem'}}>
                      <div><p style={{fontSize:'0.75rem',color:'#2563eb'}}>Account Holder</p><p className={styles.infoValue}>{selectedRequest.account_holder_name}</p></div>
                      <div><p style={{fontSize:'0.75rem',color:'#2563eb'}}>Bank Name</p><p className={styles.infoValue}>{selectedRequest.bank_name}</p></div>
                      <div><p style={{fontSize:'0.75rem',color:'#2563eb'}}>Account No.</p><p className={styles.infoValue} style={{fontFamily:'monospace'}}>{selectedRequest.raw_account_number || selectedRequest.account_number}</p></div>
                      <div><p style={{fontSize:'0.75rem',color:'#2563eb'}}>IFSC</p><p className={styles.infoValue} style={{fontFamily:'monospace'}}>{selectedRequest.ifsc_code}</p></div>
                    </div>
                  ) : (
                    <div className={styles.upiDetails}><p style={{fontSize:'0.75rem',color:'#7c3aed'}}>UPI ID</p><p className={styles.infoValue} style={{fontFamily:'monospace'}}>{selectedRequest.raw_upi_id || selectedRequest.upi_id}</p></div>
                  )}
                </div>
                {(selectedRequest.transaction_id||selectedRequest.rejection_reason) && (
                  <div className={styles.modalSection}>
                    <h3 className={styles.sectionTitle}>{selectedRequest.status==='approved'?'Transaction Details':'Rejection Details'}</h3>
                    {selectedRequest.transaction_id && <div className={styles.txnDetails}><p style={{fontSize:'0.75rem',color:'#059669'}}>Transaction ID</p><p style={{fontFamily:'monospace',fontWeight:600,color:'#065f46'}}>{selectedRequest.transaction_id}</p></div>}
                    {selectedRequest.rejection_reason && <div className={styles.rejectDetails}><p style={{fontSize:'0.75rem',color:'#dc2626'}}>Rejection Reason</p><p style={{fontWeight:600,color:'#991b1b'}}>{selectedRequest.rejection_reason}</p></div>}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              {selectedRequest.status==="pending" ? (
                <>
                  <button onClick={()=>{closeModal();openApproveModal(selectedRequest);}} className={styles.confirmApproveBtn}><HiOutlineCheck size={20}/> Approve</button>
                  <button onClick={()=>{closeModal();openRejectModal(selectedRequest);}} className={styles.confirmRejectBtn}><HiOutlineX size={20}/> Reject</button>
                </>
              ) : (
                <button onClick={closeModal} className={styles.cancelBtn}>Close</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============== APPROVE MODAL ============== */}
      {modalType==="approve" && selectedRequest && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={`${styles.modalContent} ${styles.modalMaxMd}`} onClick={e=>e.stopPropagation()}>
            <div className={`${styles.modalHeader} ${styles.modalHeaderSuccess}`}>
              <div className={styles.modalHeaderLeft}>
                <div className={`${styles.modalHeaderIcon} ${styles.iconSuccess}`}><HiOutlineCheck size={24}/></div>
                <div><h2 className={`${styles.modalTitle} ${styles.titleSuccess}`}>Approve Withdrawal</h2><p className={`${styles.modalSubtitle} ${styles.subtitleSuccess}`}>Confirm to process payment</p></div>
              </div>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.confirmText}>Are you sure you want to approve?</p>
              <div className={styles.summaryBox}>
                <div className={styles.summaryRow}><span className={styles.summaryLabel}>Customer</span><span className={styles.summaryValue}>{selectedRequest.user_name}</span></div>
                <div className={styles.summaryRow}><span className={styles.summaryLabel}>Amount</span><span className={styles.summaryValue} style={{color:'#059669',fontSize:'1.125rem'}}>{formatCurrency(selectedRequest.amount)}</span></div>
                <div className={styles.summaryRow}><span className={styles.summaryLabel}>Method</span><span className={styles.summaryValue}>{getMethodName(selectedRequest.method)}</span></div>
                <div className={styles.summaryRow}><span className={styles.summaryLabel}>Request ID</span><span className={styles.summaryValue} style={{fontFamily:'monospace'}}>#{selectedRequest.request_id}</span></div>
                {selectedRequest.method==='bank' && <div className={styles.summaryDivider}>
                  <p style={{fontSize:'0.75rem',color:'#6b7280',marginBottom:'0.25rem'}}>Bank Details</p>
                  <p className={styles.summaryValue}>{selectedRequest.account_holder_name}</p>
                  <p style={{fontSize:'0.875rem',color:'#4b5563'}}>{selectedRequest.bank_name} • {selectedRequest.raw_account_number || selectedRequest.account_number}</p>
                  <p style={{fontSize:'0.75rem',color:'#6b7280'}}>IFSC: {selectedRequest.ifsc_code}</p>
                </div>}
              </div>
              <div className={styles.warningBox}>
                <HiOutlineExclamation className={styles.warningIcon} size={20}/>
                <p className={styles.warningText}>This will initiate payment. Verify all details before confirming.</p>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={closeModal} className={`${styles.cancelBtn} ${styles.flex1}`}>Cancel</button>
              <button onClick={()=>handleApprove(selectedRequest.id)} disabled={actionLoading} className={`${styles.confirmApproveBtn} ${styles.flex1}`}>
                {actionLoading ? <><div className={styles.spinnerSmall}></div>Processing...</> : <><HiOutlineCheck size={20}/> Confirm Approval</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============== REJECT MODAL ============== */}
      {modalType==="reject" && selectedRequest && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={`${styles.modalContent} ${styles.modalMaxMd}`} onClick={e=>e.stopPropagation()}>
            <div className={`${styles.modalHeader} ${styles.modalHeaderDanger}`}>
              <div className={styles.modalHeaderLeft}>
                <div className={`${styles.modalHeaderIcon} ${styles.iconDanger}`}><HiOutlineX size={24}/></div>
                <div><h2 className={`${styles.modalTitle} ${styles.titleDanger}`}>Reject Withdrawal</h2><p className={`${styles.modalSubtitle} ${styles.subtitleDanger}`}>Provide reason for rejection</p></div>
              </div>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.summaryBox}>
                <div className={styles.summaryRow}><span className={styles.summaryLabel}>Request ID</span><span className={styles.summaryValue} style={{fontFamily:'monospace'}}>#{selectedRequest.request_id}</span></div>
                <div className={styles.summaryRow}><span className={styles.summaryLabel}>Customer</span><span className={styles.summaryValue}>{selectedRequest.user_name}</span></div>
                <div className={styles.summaryRow}><span className={styles.summaryLabel}>Amount</span><span className={styles.summaryValue}>{formatCurrency(selectedRequest.amount)}</span></div>
              </div>
              <label className={styles.rejectLabel}>Reason for Rejection <span className={styles.rejectRequired}>*</span></label>
              <textarea value={rejectReason} onChange={e=>setRejectReason(e.target.value)} placeholder="Enter detailed reason..." rows="4" className={styles.rejectTextarea}/>
              <p className={styles.rejectHint}>This reason will be visible to the user.</p>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={closeModal} className={`${styles.cancelBtn} ${styles.flex1}`}>Cancel</button>
              <button onClick={()=>handleReject(selectedRequest.id, rejectReason)} disabled={actionLoading||!rejectReason.trim()} className={`${styles.confirmRejectBtn} ${styles.flex1}`}>
                {actionLoading ? <><div className={styles.spinnerSmall}></div>Processing...</> : <><HiOutlineX size={20}/> Confirm Rejection</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WithdrawalRequests;