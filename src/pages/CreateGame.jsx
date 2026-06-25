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
    tickets: 200,
    ticket_price: 10,
    half_sheet_price: 5,
    full_sheet_price: 10,
    half_sheet_bonus: 50,
    full_sheet_bonus: 100,
    commission: 0,
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

  // ✅ FIXED: Checkbox toggle
  const handleWinningHouseChange = (option) => {
    setForm((prevForm) => {
      const isSelected = prevForm.winning_house.includes(option);

      let updatedWinningHouse;
      if (isSelected) {
        updatedWinningHouse = prevForm.winning_house.filter(item => item !== option);
      } else {
        updatedWinningHouse = [...prevForm.winning_house, option];
      }

      const updatedPrizes = { ...prevForm.winning_prizes };
      if (isSelected) {
        delete updatedPrizes[option];
      }

      return {
        ...prevForm,
        winning_house: updatedWinningHouse,
        winning_prizes: updatedPrizes,
      };
    });
  };

  const handlePrizeAmountChange = (option, amount) => {
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

    if (!form.half_sheet_bonus || form.half_sheet_bonus <= 0) {
      showToast("Please enter Half Sheet Bonus amount", "error");
      return;
    }
    if (!form.full_sheet_bonus || form.full_sheet_bonus <= 0) {
      showToast("Please enter Full Sheet Bonus amount", "error");
      return;
    }

    setLoading(true);

    try {
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
        half_sheet_price: form.half_sheet_price,
        full_sheet_price: form.full_sheet_price,
        total_tickets: form.tickets,
        agent_commission: form.commission,
        half_sheet_bonus: parseInt(form.half_sheet_bonus),
        full_sheet_bonus: parseInt(form.full_sheet_bonus),
        prizes: prizes
      };

      console.log("📤 Game Payload:", gamePayload);

      if (isEditMode) {
        const gameRes = await updateGameAPI(editGame.game_id, gamePayload);

        if (!gameRes.success) throw new Error(gameRes.message);

        showToast("Game updated successfully!", "success");
        setTimeout(() => navigate("/games"), 300);
      } else {
        const gameRes = await createGameAPI(gamePayload);

        if (!gameRes.success) throw new Error(gameRes.message);

        const gameId = gameRes.data?.game_id || gameRes.game_id || gameRes.data.data.game_id;
        console.log("Created Game ID:", gameId);
        showToast("Game created successfully!", "success");

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
        tickets: 200,
        ticket_price: 10,
        half_sheet_price: 5,
        full_sheet_price: 10,
        half_sheet_bonus: 50,
        full_sheet_bonus: 100,
        commission: 0,
      });

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

        if (!gameData.prizes || gameData.prizes.length === 0) {
          try {
            const response = await getGameByIdAPI(gameData.game_id);
            if (response.success && response.data) {
              gameData = response.data;
            }
          } catch (error) {
            console.error("Error fetching game details:", error);
          }
        }

        const gameDate = new Date(gameData.start_datetime);
        const dateStr = gameDate.toISOString().split("T")[0];
        const timeStr = gameDate.toTimeString().slice(0, 5);

        const winning_house = [];
        const winning_prizes = {};

        if (gameData.prizes && gameData.prizes.length > 0) {
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
          tickets: gameData.total_tickets || 200,
          ticket_price: gameData.ticket_price || 10,
          half_sheet_price: gameData.half_sheet_price || 5,
          full_sheet_price: gameData.full_sheet_price || 10,
          half_sheet_bonus: gameData.half_sheet_bonus || 50,
          full_sheet_bonus: gameData.full_sheet_bonus || 100,
          commission: gameData.agent_commission || 0,
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
            {toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "⚠️"}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}>×</button>
        </div>
      )}

      {/* Create Game Form */}
      <div className="form-card">
        <div className="form-header">
          <h2>🎲 {isEditMode ? 'Edit' : 'Create New'} Tambola Game</h2>
          <p>{isEditMode ? 'Update your existing game settings' : 'Set up your exciting Tambola lottery game with custom prizes and rules'}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Game Title */}
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

          {/* Date & Time */}
          <div className="form-row">
            <div className="form-group">
              <label>Game Date</label>
              <input
                type="date"
                value={form.game_date}
                onChange={(e) => setForm({ ...form, game_date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Game Time</label>
              <input
                type="time"
                value={form.game_time}
                onChange={(e) => setForm({ ...form, game_time: e.target.value })}
              />
            </div>
          </div>

          {/* ✅ Sheet Pricing Section */}
          <div className="form-section">
            <h3 className="section-title">💰 Sheet Pricing</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Half Sheet Price ($)</label>
                <input
                  type="number"
                  value={form.half_sheet_price}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm({
                      ...form,
                      half_sheet_price: value === '' ? '' : parseFloat(value)
                    });
                  }}
                  min="0"
                  step="1"
                  placeholder="Price for half sheet"
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Price for 3 tickets (half sheet)</small>
              </div>
              <div className="form-group">
                <label>Full Sheet Price ($)</label>
                <input
                  type="number"
                  value={form.full_sheet_price}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm({
                      ...form,
                      full_sheet_price: value === '' ? '' : parseFloat(value)
                    });
                  }}
                  min="0"
                  step="1"
                  placeholder="Price for full sheet"
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Price for 6 tickets (full sheet)</small>
              </div>
            </div>
          </div>

          {/* ✅ Half Sheet Bonus & Full Sheet Bonus - Always Visible */}
          <div className="form-section">
            <h3 className="section-title">🎁 Sheet Bonus</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Half Sheet Bonus ($) *</label>
                <input
                  type="number"
                  value={form.half_sheet_bonus}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm({
                      ...form,
                      half_sheet_bonus: value === '' ? '' : parseInt(value)
                    });
                  }}
                  min="1"
                  max="10000"
                  placeholder="Bonus for half sheet"
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Bonus amount for half sheet winners</small>
              </div>
              <div className="form-group">
                <label>Full Sheet Bonus ($) *</label>
                <input
                  type="number"
                  value={form.full_sheet_bonus}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm({
                      ...form,
                      full_sheet_bonus: value === '' ? '' : parseInt(value)
                    });
                  }}
                  min="1"
                  max="10000"
                  placeholder="Bonus for full sheet"
                  required
                />
                <small style={{ color: '#666', fontSize: '12px' }}>Bonus amount for full sheet winners</small>
              </div>
            </div>
          </div>

          {/* Winning House Checkboxes */}
          <div className="form-group">
            <label>Winning House Options</label>
            <div className="checkbox-grid">
              {winningHouseOptions.map((option) => (
                <div
                  key={option}
                  className={`checkbox-item ${form.winning_house.includes(option) ? 'selected' : ''}`}
                >
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

          {/* Ticket Settings */}
          <div className="form-section">
            <h3 className="section-title">🎫 Ticket Settings</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Total Tickets</label>
                <input
                  type="number"
                  value={form.tickets}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm({
                      ...form,
                      tickets: value === '' ? '' : parseInt(value)
                    });
                  }}
                  min="1"
                  max="10000"
                  placeholder="Number of tickets"
                />
              </div>

              <div className="form-group">
                <label>Ticket Price ($)</label>
                <input
                  type="number"
                  value={form.ticket_price}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm({
                      ...form,
                      ticket_price: value === '' ? '' : parseFloat(value)
                    });
                  }}
                  min="1"
                  step="1"
                  placeholder="Price per ticket"
                />
              </div>
            </div>
          </div>

          {/* Agent Commission */}
          <div className="form-row">
            <div className="form-group">
              <label>Agent Commission (%)</label>
              <input
                type="number"
                value={form.commission}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm({
                    ...form,
                    commission: value === '' ? '' : parseInt(value)
                  });
                }}
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