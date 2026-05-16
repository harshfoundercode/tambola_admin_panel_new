import { useState } from "react";
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
import  styles from  "../styles/WithdrawalRequests.module.css";


// ==================== STATIC DATA ====================
const STATIC_WITHDRAWAL_REQUESTS = [
  // ... SAME DATA AS BEFORE (unchanged) ...
  {
    id: 101,
    request_id: "WD-2026001",
    user_id: 5,
    user_name: "Abhee Singh",
    phone: "9555602293",
    email: "abhee@example.com",
    amount: "5000.00",
    method: "bank",
    status: "pending",
    account_holder_name: "Abhee Singh",
    bank_name: "Bank of Baroda",
    account_number: "XXXX890",
    ifsc_code: "BARB0HAZARA",
    upi_id: null,
    transaction_id: null,
    rejection_reason: null,
    created_at: "2026-05-16T06:03:48.000Z",
    updated_at: null
  },
  {
    id: 102,
    request_id: "WD-2026002",
    user_id: 8,
    user_name: "Rahul Sharma",
    phone: "9876543210",
    email: "rahul@example.com",
    amount: "1500.00",
    method: "upi",
    status: "pending",
    account_holder_name: null,
    bank_name: null,
    account_number: null,
    ifsc_code: null,
    upi_id: "rahul@upi",
    transaction_id: null,
    rejection_reason: null,
    created_at: "2026-05-16T04:30:22.000Z",
    updated_at: null
  },
  {
    id: 103,
    request_id: "WD-2026003",
    user_id: 12,
    user_name: "Priya Patel",
    phone: "8765432109",
    email: "priya@example.com",
    amount: "10000.00",
    method: "bank",
    status: "approved",
    account_holder_name: "Priya Patel",
    bank_name: "HDFC Bank",
    account_number: "XXXX567",
    ifsc_code: "HDFC0001234",
    upi_id: null,
    transaction_id: "TXN20260516123456",
    rejection_reason: null,
    created_at: "2026-05-15T14:20:10.000Z",
    updated_at: "2026-05-15T16:45:30.000Z",
    approved_at: "2026-05-15T16:45:30.000Z"
  },
  {
    id: 104,
    request_id: "WD-2026004",
    user_id: 15,
    user_name: "Amit Kumar",
    phone: "7654321098",
    email: "amit@example.com",
    amount: "2500.00",
    method: "upi",
    status: "rejected",
    account_holder_name: null,
    bank_name: null,
    account_number: null,
    ifsc_code: null,
    upi_id: "amit@upi",
    transaction_id: null,
    rejection_reason: "Insufficient balance in wallet",
    created_at: "2026-05-15T11:10:05.000Z",
    updated_at: "2026-05-15T12:30:45.000Z",
    rejected_at: "2026-05-15T12:30:45.000Z"
  },
  {
    id: 105,
    request_id: "WD-2026005",
    user_id: 20,
    user_name: "Sneha Gupta",
    phone: "6543210987",
    email: "sneha@example.com",
    amount: "7500.00",
    method: "bank",
    status: "pending",
    account_holder_name: "Sneha Gupta",
    bank_name: "ICICI Bank",
    account_number: "XXXX234",
    ifsc_code: "ICIC0000456",
    upi_id: null,
    transaction_id: null,
    rejection_reason: null,
    created_at: "2026-05-16T08:00:15.000Z",
    updated_at: null
  },
  {
    id: 106,
    request_id: "WD-2026006",
    user_id: 25,
    user_name: "Vikram Yadav",
    phone: "5432109876",
    email: "vikram@example.com",
    amount: "35000.00",
    method: "upi",
    status: "approved",
    account_holder_name: null,
    bank_name: null,
    account_number: null,
    ifsc_code: null,
    upi_id: "vikram@upi",
    transaction_id: "TXN20260515987654",
    rejection_reason: null,
    created_at: "2026-05-14T09:30:00.000Z",
    updated_at: "2026-05-14T15:20:00.000Z",
    approved_at: "2026-05-14T15:20:00.000Z"
  },
  {
    id: 107,
    request_id: "WD-2026007",
    user_id: 30,
    user_name: "Deepak Mishra",
    phone: "4321098765",
    email: "deepak@example.com",
    amount: "1200.00",
    method: "bank",
    status: "rejected",
    account_holder_name: "Deepak Mishra",
    bank_name: "SBI Bank",
    account_number: "XXXX901",
    ifsc_code: "SBIN0000789",
    upi_id: null,
    transaction_id: null,
    rejection_reason: "KYC not verified",
    created_at: "2026-05-14T07:15:30.000Z",
    updated_at: "2026-05-14T10:45:00.000Z",
    rejected_at: "2026-05-14T10:45:00.000Z"
  },
  {
    id: 108,
    request_id: "WD-2026008",
    user_id: 35,
    user_name: "Meera Reddy",
    phone: "3210987654",
    email: "meera@example.com",
    amount: "20000.00",
    method: "upi",
    status: "pending",
    account_holder_name: null,
    bank_name: null,
    account_number: null,
    ifsc_code: null,
    upi_id: "meera@upi",
    transaction_id: null,
    rejection_reason: null,
    created_at: "2026-05-16T09:45:00.000Z",
    updated_at: null
  }
];

function WithdrawalRequests() {
  const [requests, setRequests] = useState(STATIC_WITHDRAWAL_REQUESTS);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState({ min: "", max: "" });
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const summary = {
    total_requests: requests.length,
    pending_requests: requests.filter(r => r.status === 'pending').length,
    approved_requests: requests.filter(r => r.status === 'approved').length,
    rejected_requests: requests.filter(r => r.status === 'rejected').length,
    total_amount: requests.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0),
    pending_amount: requests.filter(r => r.status === 'pending').reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0),
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); showNotification("Data refreshed!", "success"); }, 1000);
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const handleApprove = (requestId) => {
    setActionLoading(true);
    setTimeout(() => {
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'approved', approved_at: new Date().toISOString(), transaction_id: `TXN${Date.now()}` } : req
      ));
      setActionLoading(false); setModalType(null); setSelectedRequest(null);
      showNotification("Withdrawal approved!", "success");
    }, 1000);
  };

  const handleReject = (requestId, reason) => {
    setActionLoading(true);
    setTimeout(() => {
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'rejected', rejected_at: new Date().toISOString(), rejection_reason: reason || "No reason" } : req
      ));
      setActionLoading(false); setModalType(null); setSelectedRequest(null); setRejectReason("");
      showNotification("Withdrawal rejected!", "error");
    }, 1000);
  };

  const openRejectModal = (req) => { setSelectedRequest(req); setRejectReason(""); setModalType("reject"); };
  const openApproveModal = (req) => { setSelectedRequest(req); setModalType("approve"); };
  const openDetailsModal = (req) => { setSelectedRequest(req); setModalType("details"); };
  const closeModal = () => { setModalType(null); setSelectedRequest(null); setRejectReason(""); };

  const getFilteredRequests = () => {
    let filtered = [...requests];
    if (filter !== "all") filtered = filtered.filter(req => filter === "approved" ? req.status === "approved" : filter === "rejected" ? req.status === "rejected" : req.status === filter);
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(req => req.user_name?.toLowerCase().includes(term) || req.phone?.includes(term) || req.email?.toLowerCase().includes(term) || req.request_id?.toLowerCase().includes(term));
    }
    if (amountFilter.min) filtered = filtered.filter(req => parseFloat(req.amount) >= parseFloat(amountFilter.min));
    if (amountFilter.max) filtered = filtered.filter(req => parseFloat(req.amount) <= parseFloat(amountFilter.max));
    if (dateFilter !== "all") {
      const now = new Date(); const filterDate = new Date();
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
    let relative = diffHours < 1 ? `${Math.floor(Math.abs(new Date() - date) / 60000)} min ago` : diffHours < 24 ? `${diffHours} hours ago` : `${Math.floor(diffHours/24)} days ago`;
    return { full: date.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }), relative };
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
            {label:'Total',icon:<HiOutlineDocumentText/>,iconClass:styles.iconIndigo,value:summary.total_requests,sub:'All requests',color:styles.textGray},
            {label:'Pending',icon:<HiOutlineClock/>,iconClass:styles.iconAmber,value:summary.pending_requests,sub:`${formatCurrency(summary.pending_amount)} pending`,color:styles.textAmber},
            {label:'Approved',icon:<HiOutlineCheck/>,iconClass:styles.iconEmerald,value:summary.approved_requests,sub:'Processed',color:styles.textEmerald},
            {label:'Rejected',icon:<HiOutlineX/>,iconClass:styles.iconRed,value:summary.rejected_requests,sub:'Declined',color:styles.textRed},
            {label:'Total Value',icon:<HiOutlineCurrencyRupee/>,iconClass:styles.iconViolet,value:formatCurrency(summary.total_amount),sub:'All requests',color:styles.textViolet},
            {label:'Today',icon:<HiOutlineShieldCheck/>,iconClass:styles.iconBlue,value:requests.filter(r=>{const t=new Date();t.setHours(0,0,0,0);return new Date(r.created_at)>=t}).length,sub:'New today',color:styles.textBlue},
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
              {key:'all',label:'All',count:summary.total_requests,activeClass:styles.filterTabAll},
              {key:'pending',label:'Pending',count:summary.pending_requests,activeClass:styles.filterTabPending,icon:<HiOutlineClock size={16}/>},
              {key:'approved',label:'Approved',count:summary.approved_requests,activeClass:styles.filterTabApproved,icon:<HiOutlineCheck size={16}/>},
              {key:'rejected',label:'Rejected',count:summary.rejected_requests,activeClass:styles.filterTabRejected,icon:<HiOutlineX size={16}/>},
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
                  </div>
                </div>
                <div className={styles.modalSection}><h3 className={styles.sectionTitle}>Payment Details</h3>
                  {selectedRequest.method==='bank' ? (
                    <div className={styles.bankDetails} style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'0.75rem'}}>
                      <div><p style={{fontSize:'0.75rem',color:'#2563eb'}}>Account Holder</p><p className={styles.infoValue}>{selectedRequest.account_holder_name}</p></div>
                      <div><p style={{fontSize:'0.75rem',color:'#2563eb'}}>Bank Name</p><p className={styles.infoValue}>{selectedRequest.bank_name}</p></div>
                      <div><p style={{fontSize:'0.75rem',color:'#2563eb'}}>Account No.</p><p className={styles.infoValue} style={{fontFamily:'monospace'}}>{selectedRequest.account_number}</p></div>
                      <div><p style={{fontSize:'0.75rem',color:'#2563eb'}}>IFSC</p><p className={styles.infoValue} style={{fontFamily:'monospace'}}>{selectedRequest.ifsc_code}</p></div>
                    </div>
                  ) : (
                    <div className={styles.upiDetails}><p style={{fontSize:'0.75rem',color:'#7c3aed'}}>UPI ID</p><p className={styles.infoValue} style={{fontFamily:'monospace'}}>{selectedRequest.upi_id}</p></div>
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
                  <p style={{fontSize:'0.875rem',color:'#4b5563'}}>{selectedRequest.bank_name} • {selectedRequest.account_number}</p>
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