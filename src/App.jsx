import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Games from "./pages/Games";
import CreateGame from "./pages/CreateGame";
import LiveGame from "./pages/LiveGame";
import Tickets from "./pages/Tickets";
import Winners from "./pages/Winners";
import Players from "./pages/Claims";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Prizes from "./pages/Prizes";
import AddOffer from "./pages/AddOffer";
import AddBanner from "./pages/AddBanner";
import PolicyPage from "./pages/PolicyPage";
import PlayerDetails from "./pages/PlayerDetails";
import Agents from "./pages/Agents";
import CreateAgent from "./pages/CreateAgent";
import Videos from "./pages/Videos";
import UserDetailsPage from "./pages/UserDetailsPage";
import UserTransactionHistory from "./pages/UserTransactionHistory";
import UserGameHistory from "./pages/UserGameHistory";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";

import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import "./App.css";
import HowItWorksManager from "./pages/HowItsWorks";
import WinnerBannerManager from "./pages/WinnerBanner";
import WithdrawalRequests from "./pages/withdrawRequest";
import PaymentQRManager from "./pages/qr_code";
import ReferralSystem from "./pages/ReferalCode";
import ReferralSettings from "./pages/ReferalCode";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔐 Login Page */}
        <Route path="/" element={<Login />} />




        {/* 🔒 Protected Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/games"
          element={
            <ProtectedRoute>
              <Layout>
                <Games />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-game"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateGame />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/live-game"
          element={
            <ProtectedRoute>
              <Layout>
                <LiveGame />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <Layout>
                <Tickets />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/players"
          element={
            <ProtectedRoute>
              <Layout>
                <Players />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/winners"
          element={
            <ProtectedRoute>
              <Layout>
                <Winners />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/prizes"
          element={
            <ProtectedRoute>
              <Layout>
                <Prizes />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-offer"
          element={
            <ProtectedRoute>
              <Layout>
                <AddOffer />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-banner"
          element={
            <ProtectedRoute>
              <Layout>
                <AddBanner />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/policies"
          element={
            <ProtectedRoute>
              <Layout>
                <PolicyPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/player-details"
          element={
            <ProtectedRoute>
              <Layout>
                <PlayerDetails />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/qr-code"
          element={
            <ProtectedRoute>
              <Layout>
                <PaymentQRManager />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/agents"
          element={
            <ProtectedRoute>
              <Layout>
                <Agents />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-agent"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateAgent />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/videos"
          element={
            <ProtectedRoute>
              <Layout>
                <Videos />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/how-it-works"
          element={
            <ProtectedRoute>
              <Layout>
                <HowItWorksManager />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/winner-banner"
          element={
            <ProtectedRoute>
              <Layout>
                <WinnerBannerManager />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-details"
          element={
            <ProtectedRoute>
              <Layout>
                <UserDetailsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-transaction-history"
          element={
            <ProtectedRoute>
              <Layout>
                <UserTransactionHistory />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/user-game-history"
          element={
            <ProtectedRoute>
              <Layout>
                <UserGameHistory />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
         <Route
          path="/withdraw-request"
          element={
            <ProtectedRoute>
              <Layout>
                <WithdrawalRequests />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <Layout>
                <ChangePassword />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <Layout>
                <ChangePassword />
              </Layout>
            </ProtectedRoute>
          }
        />

         <Route
          path="/referal"
          element={
            <ProtectedRoute>
              <Layout>
                <ReferralSettings />
              </Layout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;