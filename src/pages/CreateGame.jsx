// import { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   createGameAPI,
//   generateTicketsAPI,
//   createRoundAPI,
//   getAllGamesAPI,
//   getGameRoundsAPI,
//   updateGameAPI,
//   getGameByIdAPI,
// } from "../services/api";
// import "../styles/createGame.css";
// import "../styles/checkbox-fix.css";

// export default function GameManager({ onGameSelect }) {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const editGame = location.state?.editGame;
//   const isEditMode = !!editGame;
//   const [loading, setLoading] = useState(false);
//   const [toast, setToast] = useState(null);
//   const [games, setGames] = useState([]);
//   const [selectedGame, setSelectedGame] = useState(null);
//   const [rounds, setRounds] = useState([]);

//   // Single Form State
//   const [form, setForm] = useState({
//     title: "",
//     game_date: new Date().toISOString().split("T")[0],
//     game_time: new Date().toLocaleTimeString("en-US", {
//       hour12: false,
//       hour: "2-digit",
//       minute: "2-digit",
//     }),
//     winning_house: [],
//     winning_prizes: {},
//     box_bonus: "First Sheet bonus",
//     tickets: 200,
//     ticket_price: 10,
//     commission: 0,
//     bonus_amount: 0,
//   });

//   const winningHouseOptions = [
//     "First Full House",
//     "Secend Full House",
//     "Third Full House",
//     "Top Line",
//     "Middle Line",
//     "Bottom Line",
//     "Box Bonus",
//     "Corner",
//     "Star",
//     "Early 5",
//     "Quick6",
//     "Quick7"
//   ];

//   const handleWinningHouseChange = (option) => {
//     const updatedWinningHouse = form.winning_house.includes(option)
//       ? form.winning_house.filter(item => item !== option)
//       : [...form.winning_house, option];

//     const updatedPrizes = { ...form.winning_prizes };
//     if (!updatedWinningHouse.includes(option)) {
//       delete updatedPrizes[option];
//       delete updatedMaxWinners[option];
//     }

//     setForm({
//       ...form,
//       winning_house: updatedWinningHouse,
//       winning_prizes: updatedPrizes,
//     });
//   };

//   const handlePrizeAmountChange = (option, amount) => {
//     // Only allow numbers
//     if (amount === '' || /^\d+$/.test(amount)) {
//       setForm({
//         ...form,
//         winning_prizes: {
//           ...form.winning_prizes,
//           [option]: amount === '' ? '' : parseInt(amount)
//         }
//       });
//     }
//   };



//   const showToast = (message, type) => {
//     setToast({ message, type });
//     setTimeout(() => setToast(null), 3000);
//   };

//   // Fetch all games
//   const fetchGames = async () => {
//     try {
//       const response = await getAllGamesAPI();
//       if (response.success && response.data?.games) {
//         setGames(response.data.games);
//       }
//     } catch (err) {
//       console.error("Error fetching games:", err);
//     }
//   };

//   // Fetch rounds for selected game
//   const fetchRounds = async (gameId) => {
//     try {
//       const response = await getGameRoundsAPI(gameId);
//       if (response.success && response.data) {
//         setRounds(response.data);
//       }
//     } catch (err) {
//       console.error("Error fetching rounds:", err);
//     }
//   };

//   // Create or Update Game
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!form.title.trim()) {
//       showToast("Please enter game title", "error");
//       return;
//     }

//     setLoading(true);

//     try {
//       // Prepare prizes array from winning_house and winning_prizes
//       const prizes = form.winning_house.map(prizeType => {
//         let prizeName;
//         switch (prizeType) {
//           case "First Full House":
//             prizeName = "FIRST_FULL_HOUSE";
//             break;
//           case "Secend Full House":
//             prizeName = "SECOND_FULL_HOUSE";
//             break;
//           case "Third Full House":
//             prizeName = "THIRD_FULL_HOUSE";
//             break;
//           case "Top Line":
//             prizeName = "TOP_LINE";
//             break;
//           case "Middle Line":
//             prizeName = "MIDDLE_LINE";
//             break;
//           case "Bottom Line":
//             prizeName = "BOTTOM_LINE";
//             break;
//           case "Early 5":
//             prizeName = "EARLY5";
//             break;
//           default:
//             prizeName = prizeType.toUpperCase().replace(/ /g, '_');
//         }

//         return {
//           prize_name: prizeName,
//           prize_amount: form.winning_prizes[prizeType] || 0,
//         };
//       });

//       const gamePayload = {
//         title: form.title,
//         start_datetime: `${form.game_date} ${form.game_time}:00`,
//         ticket_price: form.ticket_price,
//         total_tickets: form.tickets,
//         agent_commission: form.commission,
//         bonus_name: form.box_bonus,
//         bonus_amount: form.bonus_amount,
//         prizes: prizes,
        
//       };

//       if (isEditMode) {
//         // Update existing game
//         const gameRes = await updateGameAPI(editGame.game_id, gamePayload);
        
//         if (!gameRes.success) throw new Error(gameRes.message);
        
//         showToast("Game updated successfully!", "success");
//         setTimeout(() => navigate("/games"), 300);
//       } else {
//         // Create new game
//         const gameRes = await createGameAPI(gamePayload);

//         if (!gameRes.success) throw new Error(gameRes.message);

//         const gameId = gameRes.data?.game_id || gameRes.game_id || gameRes.data.data.game_id;
//         console.log("Created Game ID:", gameId); // Debug log
//         showToast("Game created successfully!", "success");

//         // Generate Tickets for new games only
//         const ticketRes = await generateTicketsAPI({
//           game_id: gameId,
//           total_tickets: form.tickets,
//         });

//         if (!ticketRes.success) throw new Error(ticketRes.message);

//         showToast(`Game created! ${form.tickets} tickets generated`, "success");
//         setTimeout(() => navigate("/games"), 300);
//       }

//       // Reset Form
//       setForm({
//         title: "",
//         game_date: new Date().toISOString().split("T")[0],
//         game_time: new Date().toLocaleTimeString("en-US", {
//           hour12: false,
//           hour: "2-digit",
//           minute: "2-digit",
//         }),
//         winning_house: [],
//         winning_prizes: {},
//         box_bonus: "First Sheet bonus",
//         tickets: 200,
//         ticket_price: 10,
//         commission: 0,
//         bonus_amount: 0,
//       });

//       // Refresh games list
//       fetchGames();
//     } catch (err) {
//       showToast(err.message || "Something went wrong", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Play Game
//   const handlePlayGame = (game, round) => {
//     if (onGameSelect) {
//       onGameSelect(game.game_id, round?.round_id);
//     }
//   };

//   // Load edit data on mount
//   useEffect(() => {
//     const loadEditData = async () => {
//       if (isEditMode && editGame) {
//         console.log("Edit Game Data:", editGame); // Debug log
        
//         let gameData = editGame;
        
//         // If prizes are missing or empty, fetch complete game details
//         if (!gameData.prizes || gameData.prizes.length === 0) {
//           try {
//             console.log("Fetching complete game details for ID:", gameData.game_id);
//             const response = await getGameByIdAPI(gameData.game_id);
//             if (response.success && response.data) {
//               gameData = response.data;
//               console.log("Fetched complete game data:", gameData);
//             }
//           } catch (error) {
//             console.error("Error fetching game details:", error);
//           }
//         }
        
//         const gameDate = new Date(gameData.start_datetime);
//         const dateStr = gameDate.toISOString().split("T")[0];
//         const timeStr = gameDate.toTimeString().slice(0, 5);
        
//         // Convert prizes to form format
//         const winning_house = [];
//         const winning_prizes = {};
        
//         if (gameData.prizes && gameData.prizes.length > 0) {
//           console.log("Processing prizes:", gameData.prizes); // Debug log
          
//           gameData.prizes.forEach(prize => {
//             let displayName;
            
//             // Handle different prize name formats
//             const prizeName = prize.prize_name || prize.name || "";
            
//             switch (prizeName.toUpperCase()) {
//               case "FIRST_FULL_HOUSE":
//               case "FIRST FULL HOUSE":
//                 displayName = "First Full House";
//                 break;
//               case "SECOND_FULL_HOUSE":
//               case "SECEND_FULL_HOUSE":
//               case "SECOND FULL HOUSE":
//               case "SECEND FULL HOUSE":
//                 displayName = "Secend Full House";
//                 break;
//               case "THIRD_FULL_HOUSE":
//               case "THIRD FULL HOUSE":
//                 displayName = "Third Full House";
//                 break;
//               case "TOP_LINE":
//               case "TOP LINE":
//                 displayName = "Top Line";
//                 break;
//               case "MIDDLE_LINE":
//               case "MIDDLE LINE":
//                 displayName = "Middle Line";
//                 break;
//               case "BOTTOM_LINE":
//               case "BOTTOM LINE":
//                 displayName = "Bottom Line";
//                 break;
//               case "BOX_BONUS":
//               case "BOX BONUS":
//                 displayName = "Box Bonus";
//                 break;
//               case "CORNER":
//                 displayName = "Corner";
//                 break;
//               case "STAR":
//                 displayName = "Star";
//                 break;
//               case "EARLY5":
//               case "EARLY_5":
//               case "EARLY 5":
//                 displayName = "Early 5";
//                 break;
//               case "QUICK6":
//               case "QUICK_6":
//               case "QUICK 6":
//                 displayName = "Quick6";
//                 break;
//               case "QUICK7":
//               case "QUICK_7":
//               case "QUICK 7":
//                 displayName = "Quick7";
//                 break;
//               default:
//                 // Fallback: convert snake_case or UPPER_CASE to Title Case
//                 displayName = prizeName
//                   .replace(/_/g, ' ')
//                   .toLowerCase()
//                   .replace(/\b\w/g, l => l.toUpperCase());
//             }
            
//             console.log(`Prize: ${prizeName} -> ${displayName}`);
            
//             if (displayName && winningHouseOptions.includes(displayName)) {
//               winning_house.push(displayName);
//               winning_prizes[displayName] = prize.prize_amount || prize.amount || 0;
//             } else {
//               console.warn(`Prize "${displayName}" not found in winningHouseOptions`);
//             }
//           });
          
//           console.log("Final winning_house:", winning_house); // Debug log
//           console.log("Final winning_prizes:", winning_prizes); // Debug log
//         } else {
//           console.log("No prizes found in game data");
//         }
        
//         setForm({
//           title: gameData.title || "",
//           game_date: dateStr,
//           game_time: timeStr,
//           winning_house,
//           winning_prizes,
//           box_bonus: gameData.bonus_name || "First Sheet bonus",
//           tickets: gameData.total_tickets || 200,
//           ticket_price: gameData.ticket_price || 10,
//           commission: gameData.agent_commission || 0,
//           bonus_amount: gameData.bonus_amount || 0,
//         });
//       }
//     };
    
//     loadEditData();
//   }, [isEditMode, editGame]);

//   useEffect(() => {
//     fetchGames();
//   }, []);

//   return (
//     <div className="game-manager">
//       {/* Toast Notification */}
//       {toast && (
//         <div className={`toast toast-${toast.type}`}>
//           <span className="toast-icon">
//             {toast.type === "success"
//               ? "✅"
//               : toast.type === "error"
//                 ? "❌"
//                 : "⚠️"}
//           </span>
//           <span className="toast-message">{toast.message}</span>
//           <button className="toast-close" onClick={() => setToast(null)}>
//             ×
//           </button>
//         </div>
//       )}

//       {/* Create Game Form */}
//       <div className="form-card">
//         <div className="form-header">
//           <h2>🎲 {isEditMode ? 'Edit' : 'Create New'} Tambola Game</h2>
//           <p>{isEditMode ? 'Update your existing game settings' : 'Set up your exciting Tambola lottery game with custom prizes and rules'}</p>
//         </div>

//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label>Game Title</label>
//             <input
//               type="text"
//               value={form.title}
//               onChange={(e) => setForm({ ...form, title: e.target.value })}
//               placeholder="Enter an exciting game title"
//               required
//             />
//           </div>

//           <div className="form-row">
//             <div className="form-group">
//               <label>Game Date</label>
//               <input
//                 type="date"
//                 value={form.game_date}
//                 onChange={(e) =>
//                   setForm({ ...form, game_date: e.target.value })
//                 }
//               />
//             </div>
//             <div className="form-group">
//               <label>Game Time</label>
//               <input
//                 type="time"
//                 value={form.game_time}
//                 onChange={(e) =>
//                   setForm({ ...form, game_time: e.target.value })
//                 }
//               />
//             </div>
//           </div>

//           {/* Winning House Checkboxes */}
//           <div className="form-group">
//             <label>Winning House Options</label>
//             <div className="checkbox-grid">
//               {winningHouseOptions.map((option) => (
//                 <div key={option} className={`checkbox-item ${form.winning_house.includes(option) ? 'selected' : ''}`}>
//                   <label className="checkbox-label">
//                     <input
//                       type="checkbox"
//                       checked={form.winning_house.includes(option)}
//                       onChange={() => handleWinningHouseChange(option)}
//                     />
//                     <span>{option}</span>
//                   </label>
//                   {form.winning_house.includes(option) && (
//                     <div className="prize-inputs">
//                       <input
//                         type="text"
//                         placeholder="Prize amount ($)"
//                         value={form.winning_prizes[option] || ''}
//                         onChange={(e) => handlePrizeAmountChange(option, e.target.value)}
//                         className="prize-input"
//                       />
                     
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Box Bonus Dropdown - Only show for Full House options */}
//           {(form.winning_house.includes("First Full House") ||
//             form.winning_house.includes("Secend Full House") ||
//             form.winning_house.includes("Third Full House")) && (
//               <div className="form-row">
//                 <div className="form-group">
//                   <label>Box Bonus*</label>
//                   <select
//                     value={form.box_bonus}
//                     onChange={(e) =>
//                       setForm({ ...form, box_bonus: e.target.value })
//                     }
//                     required
//                   >
//                     <option value="First Sheet Bonus">First Sheet Bonus</option>
//                     <option value="Half Sheet Bonus">Half Sheet Bonus</option>
//                   </select>
//                 </div>

//                 <div className="form-group">
//                   <label>Bonus Amount</label>
//                   <input
//                     type="number"
//                     value={form.bonus_amount}
//                     onChange={(e) =>
//                       setForm({ ...form, bonus_amount: parseInt(e.target.value)})
//                     }
//                     min="1"
//                     max="10000"
//                   />
//                 </div>
//               </div>
//             )}

//           <div className="form-row">
//             <div className="form-group">
//               <label>Total Tickets</label>
//               <input
//                 type="number"
//                 value={form.tickets}
//                 onChange={(e) =>
//                   setForm({ ...form, tickets: parseInt(e.target.value)})
//                 }
//                 min="1"
//                 max="10000"
//                 placeholder="Number of tickets to generate"
//               />
//             </div>

//             <div className="form-group">
//               <label>Ticket Price</label>
//               <input
//                 type="number"
//                 value={form.ticket_price}
//                 onChange={(e) =>
//                   setForm({ ...form, ticket_price: parseFloat(e.target.value)})
//                 }
//                 min="1"
//                 step="1"
//                 placeholder="Price per ticket ($)"
//               />
//             </div>
//           </div>

//           <div className="form-row">
//             <div className="form-group">
//               <label>Agent Commission</label>
//               <input
//                 type="number"
//                 value={form.commission}
//                 onChange={(e) =>
//                   setForm({ ...form, commission: parseInt(e.target.value)})
//                 }
//                 min="0"
//                 max="10000"
//                 placeholder="Commission %"
//               />
//             </div>
//           </div>

//           <button type="submit" disabled={loading} className="submit-btn">
//             {loading ? (
//               <>
//                 <span>🎮</span> {isEditMode ? 'Updating' : 'Creating'} Game...
//               </>
//             ) : (
//               <>
//                 <span>🚀</span> {isEditMode ? 'Update' : 'Create'} Tambola Game
//               </>
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  createGameAPI,
  generateTicketsAPI,
  createRoundAPI,
  getAllGamesAPI,
  getGameRoundsAPI,
  updateGameAPI,
  getGameByIdAPI,
} from "../services/api";
import "../styles/createGame.css";
import "../styles/checkbox-fix.css";

export default function GameManager({ onGameSelect }) {
  const navigate = useNavigate();
  const location = useLocation();
  const editGame = location.state?.editGame;
  const isEditMode = !!editGame;
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [rounds, setRounds] = useState([]);

  // Single Form State
  const [form, setForm] = useState({
    title: "",
    game_date: new Date().toISOString().split("T")[0],
    game_time: new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }),
    winning_house: [],
    winning_prizes: {},
    box_bonus: "First Sheet bonus",
    tickets: 200,
    ticket_price: 10,
    half_sheet_price: 5, // ✅ Added
    full_sheet_price: 10, // ✅ Added
    commission: 0,
    bonus_amount: 0,
  });

  const winningHouseOptions = [
    "First Full House",
    "Secend Full House",
    "Third Full House",
    "Top Line",
    "Middle Line",
    "Bottom Line",
    "Box Bonus",
    "Corner",
    "Star",
    "Early 5",
    "Quick6",
    "Quick7"
  ];

  const handleWinningHouseChange = (option) => {
    const updatedWinningHouse = form.winning_house.includes(option)
      ? form.winning_house.filter(item => item !== option)
      : [...form.winning_house, option];

    const updatedPrizes = { ...form.winning_prizes };
    if (!updatedWinningHouse.includes(option)) {
      delete updatedPrizes[option];
      delete updatedMaxWinners[option];
    }

    setForm({
      ...form,
      winning_house: updatedWinningHouse,
      winning_prizes: updatedPrizes,
    });
  };

  const handlePrizeAmountChange = (option, amount) => {
    // Only allow numbers
    if (amount === '' || /^\d+$/.test(amount)) {
      setForm({
        ...form,
        winning_prizes: {
          ...form.winning_prizes,
          [option]: amount === '' ? '' : parseInt(amount)
        }
      });
    }
  };



  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch all games
  const fetchGames = async () => {
    try {
      const response = await getAllGamesAPI();
      if (response.success && response.data?.games) {
        setGames(response.data.games);
      }
    } catch (err) {
      console.error("Error fetching games:", err);
    }
  };

  // Fetch rounds for selected game
  const fetchRounds = async (gameId) => {
    try {
      const response = await getGameRoundsAPI(gameId);
      if (response.success && response.data) {
        setRounds(response.data);
      }
    } catch (err) {
      console.error("Error fetching rounds:", err);
    }
  };

  // Create or Update Game
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      showToast("Please enter game title", "error");
      return;
    }

    setLoading(true);

    try {
      // Prepare prizes array from winning_house and winning_prizes
      const prizes = form.winning_house.map(prizeType => {
        let prizeName;
        switch (prizeType) {
          case "First Full House":
            prizeName = "FIRST_FULL_HOUSE";
            break;
          case "Secend Full House":
            prizeName = "SECOND_FULL_HOUSE";
            break;
          case "Third Full House":
            prizeName = "THIRD_FULL_HOUSE";
            break;
          case "Top Line":
            prizeName = "TOP_LINE";
            break;
          case "Middle Line":
            prizeName = "MIDDLE_LINE";
            break;
          case "Bottom Line":
            prizeName = "BOTTOM_LINE";
            break;
          case "Early 5":
            prizeName = "EARLY5";
            break;
          default:
            prizeName = prizeType.toUpperCase().replace(/ /g, '_');
        }

        return {
          prize_name: prizeName,
          prize_amount: form.winning_prizes[prizeType] || 0,
        };
      });

      const gamePayload = {
        title: form.title,
        start_datetime: `${form.game_date} ${form.game_time}:00`,
        ticket_price: form.ticket_price,
        half_sheet_price: form.half_sheet_price, // ✅ Added
        full_sheet_price: form.full_sheet_price, // ✅ Added
        total_tickets: form.tickets,
        agent_commission: form.commission,
        bonus_name: form.box_bonus,
        bonus_amount: form.bonus_amount,
        prizes: prizes
      };

      console.log("📤 Game Payload:", gamePayload); // Debug log

      if (isEditMode) {
        // Update existing game
        const gameRes = await updateGameAPI(editGame.game_id, gamePayload);
        
        if (!gameRes.success) throw new Error(gameRes.message);
        
        showToast("Game updated successfully!", "success");
        setTimeout(() => navigate("/games"), 300);
      } else {
        // Create new game
        const gameRes = await createGameAPI(gamePayload);

        if (!gameRes.success) throw new Error(gameRes.message);

        const gameId = gameRes.data?.game_id || gameRes.game_id || gameRes.data.data.game_id;
        console.log("Created Game ID:", gameId);
        showToast("Game created successfully!", "success");

        // Generate Tickets for new games only
        const ticketRes = await generateTicketsAPI({
          game_id: gameId,
          total_tickets: form.tickets,
        });

        if (!ticketRes.success) throw new Error(ticketRes.message);

        showToast(`Game created! ${form.tickets} tickets generated`, "success");
        setTimeout(() => navigate("/games"), 300);
      }

      // Reset Form
      setForm({
        title: "",
        game_date: new Date().toISOString().split("T")[0],
        game_time: new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        }),
        winning_house: [],
        winning_prizes: {},
        box_bonus: "First Sheet bonus",
        tickets: 200,
        ticket_price: 10,
        half_sheet_price: 5, // ✅ Reset
        full_sheet_price: 10, // ✅ Reset
        commission: 0,
        bonus_amount: 0,
      });

      // Refresh games list
      fetchGames();
    } catch (err) {
      showToast(err.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  // Play Game
  const handlePlayGame = (game, round) => {
    if (onGameSelect) {
      onGameSelect(game.game_id, round?.round_id);
    }
  };

  // Load edit data on mount
  useEffect(() => {
    const loadEditData = async () => {
      if (isEditMode && editGame) {
        console.log("Edit Game Data:", editGame);
        
        let gameData = editGame;
        
        // If prizes are missing or empty, fetch complete game details
        if (!gameData.prizes || gameData.prizes.length === 0) {
          try {
            console.log("Fetching complete game details for ID:", gameData.game_id);
            const response = await getGameByIdAPI(gameData.game_id);
            if (response.success && response.data) {
              gameData = response.data;
              console.log("Fetched complete game data:", gameData);
            }
          } catch (error) {
            console.error("Error fetching game details:", error);
          }
        }
        
        const gameDate = new Date(gameData.start_datetime);
        const dateStr = gameDate.toISOString().split("T")[0];
        const timeStr = gameDate.toTimeString().slice(0, 5);
        
        // Convert prizes to form format
        const winning_house = [];
        const winning_prizes = {};
        
        if (gameData.prizes && gameData.prizes.length > 0) {
          console.log("Processing prizes:", gameData.prizes);
          
          gameData.prizes.forEach(prize => {
            let displayName;
            
            const prizeName = prize.prize_name || prize.name || "";
            
            switch (prizeName.toUpperCase()) {
              case "FIRST_FULL_HOUSE":
              case "FIRST FULL HOUSE":
                displayName = "First Full House";
                break;
              case "SECOND_FULL_HOUSE":
              case "SECEND_FULL_HOUSE":
              case "SECOND FULL HOUSE":
              case "SECEND FULL HOUSE":
                displayName = "Secend Full House";
                break;
              case "THIRD_FULL_HOUSE":
              case "THIRD FULL HOUSE":
                displayName = "Third Full House";
                break;
              case "TOP_LINE":
              case "TOP LINE":
                displayName = "Top Line";
                break;
              case "MIDDLE_LINE":
              case "MIDDLE LINE":
                displayName = "Middle Line";
                break;
              case "BOTTOM_LINE":
              case "BOTTOM LINE":
                displayName = "Bottom Line";
                break;
              case "BOX_BONUS":
              case "BOX BONUS":
                displayName = "Box Bonus";
                break;
              case "CORNER":
                displayName = "Corner";
                break;
              case "STAR":
                displayName = "Star";
                break;
              case "EARLY5":
              case "EARLY_5":
              case "EARLY 5":
                displayName = "Early 5";
                break;
              case "QUICK6":
              case "QUICK_6":
              case "QUICK 6":
                displayName = "Quick6";
                break;
              case "QUICK7":
              case "QUICK_7":
              case "QUICK 7":
                displayName = "Quick7";
                break;
              default:
                displayName = prizeName
                  .replace(/_/g, ' ')
                  .toLowerCase()
                  .replace(/\b\w/g, l => l.toUpperCase());
            }
            
            if (displayName && winningHouseOptions.includes(displayName)) {
              winning_house.push(displayName);
              winning_prizes[displayName] = prize.prize_amount || prize.amount || 0;
            }
          });
        }
        
        setForm({
          title: gameData.title || "",
          game_date: dateStr,
          game_time: timeStr,
          winning_house,
          winning_prizes,
          box_bonus: gameData.bonus_name || "First Sheet bonus",
          tickets: gameData.total_tickets || 200,
          ticket_price: gameData.ticket_price || 10,
          half_sheet_price: gameData.half_sheet_price || 5, // ✅ Added
          full_sheet_price: gameData.full_sheet_price || 10, // ✅ Added
          commission: gameData.agent_commission || 0,
          bonus_amount: gameData.bonus_amount || 0,
        });
      }
    };
    
    loadEditData();
  }, [isEditMode, editGame]);

  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <div className="game-manager">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === "success"
              ? "✅"
              : toast.type === "error"
                ? "❌"
                : "⚠️"}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}>
            ×
          </button>
        </div>
      )}

      {/* Create Game Form */}
      <div className="form-card">
        <div className="form-header">
          <h2>🎲 {isEditMode ? 'Edit' : 'Create New'} Tambola Game</h2>
          <p>{isEditMode ? 'Update your existing game settings' : 'Set up your exciting Tambola lottery game with custom prizes and rules'}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Game Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter an exciting game title"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Game Date</label>
              <input
                type="date"
                value={form.game_date}
                onChange={(e) =>
                  setForm({ ...form, game_date: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Game Time</label>
              <input
                type="time"
                value={form.game_time}
                onChange={(e) =>
                  setForm({ ...form, game_time: e.target.value })
                }
              />
            </div>
          </div>

          {/* ✅ Sheet Prices Section */}
          <div className="form-section">
            <h3 className="section-title">💰 Sheet Pricing</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Half Sheet Price ($)</label>
                <input
                  type="number"
                  value={form.half_sheet_price}
                  onChange={(e) =>
                    setForm({ ...form, half_sheet_price: parseFloat(e.target.value) || 0 })
                  }
                  min="0"
                  step="1"
                  placeholder="Price for half sheet"
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Price for 3 tickets (half sheet)
                </small>
              </div>
              <div className="form-group">
                <label>Full Sheet Price ($)</label>
                <input
                  type="number"
                  value={form.full_sheet_price}
                  onChange={(e) =>
                    setForm({ ...form, full_sheet_price: parseFloat(e.target.value) || 0 })
                  }
                  min="0"
                  step="1"
                  placeholder="Price for full sheet"
                />
                <small style={{ color: '#666', fontSize: '12px' }}>
                  Price for 6 tickets (full sheet)
                </small>
              </div>
            </div>
          </div>

          {/* Winning House Checkboxes */}
          <div className="form-group">
            <label>Winning House Options</label>
            <div className="checkbox-grid">
              {winningHouseOptions.map((option) => (
                <div key={option} className={`checkbox-item ${form.winning_house.includes(option) ? 'selected' : ''}`}>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.winning_house.includes(option)}
                      onChange={() => handleWinningHouseChange(option)}
                    />
                    <span>{option}</span>
                  </label>
                  {form.winning_house.includes(option) && (
                    <div className="prize-inputs">
                      <input
                        type="text"
                        placeholder="Prize amount ($)"
                        value={form.winning_prizes[option] || ''}
                        onChange={(e) => handlePrizeAmountChange(option, e.target.value)}
                        className="prize-input"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Box Bonus Dropdown */}
          {(form.winning_house.includes("First Full House") ||
            form.winning_house.includes("Secend Full House") ||
            form.winning_house.includes("Third Full House")) && (
              <div className="form-row">
                <div className="form-group">
                  <label>Box Bonus*</label>
                  <select
                    value={form.box_bonus}
                    onChange={(e) =>
                      setForm({ ...form, box_bonus: e.target.value })
                    }
                    required
                  >
                    <option value="First Sheet Bonus">First Sheet Bonus</option>
                    <option value="Half Sheet Bonus">Half Sheet Bonus</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Bonus Amount</label>
                  <input
                    type="number"
                    value={form.bonus_amount}
                    onChange={(e) =>
                      setForm({ ...form, bonus_amount: parseInt(e.target.value) || 0 })
                    }
                    min="1"
                    max="10000"
                  />
                </div>
              </div>
            )}

          {/* ✅ Ticket & Pricing Section */}
          <div className="form-section">
            <h3 className="section-title">🎫 Ticket Settings</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Total Tickets</label>
                <input
                  type="number"
                  value={form.tickets}
                  onChange={(e) =>
                    setForm({ ...form, tickets: parseInt(e.target.value) || 0 })
                  }
                  min="1"
                  max="10000"
                  placeholder="Number of tickets to generate"
                />
              </div>

              <div className="form-group">
                <label>Ticket Price ($)</label>
                <input
                  type="number"
                  value={form.ticket_price}
                  onChange={(e) =>
                    setForm({ ...form, ticket_price: parseFloat(e.target.value) || 0 })
                  }
                  min="1"
                  step="1"
                  placeholder="Price per ticket"
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Agent Commission (%)</label>
              <input
                type="number"
                value={form.commission}
                onChange={(e) =>
                  setForm({ ...form, commission: parseInt(e.target.value) || 0 })
                }
                min="0"
                max="100"
                placeholder="Commission percentage"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <>
                <span>🎮</span> {isEditMode ? 'Updating' : 'Creating'} Game...
              </>
            ) : (
              <>
                <span>🚀</span> {isEditMode ? 'Update' : 'Create'} Tambola Game
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}