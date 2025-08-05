import "./App.css";
import { Route, Routes, Navigate } from "react-router";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import Dashboard from "./pages/Dashboard/Dashboard";
import { useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";

import { Link } from "react-router";
import RoomView from "./components/RoomView";


function App() {
  const context = useContext(AuthContext);
  const logout = context?.logout;
  const isAuthenticated = context?.isAuthenticated ?? false;
  const firstLaunch = context?.firstLaunch ?? false;
  const loading = context?.loading ?? true;

  // Show loading while checking authentication state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

 return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* ✅ Public Room Route */}
        <Route
          path="/room/:roomId"
          element={
            <RoomView
              roomId={window.location.pathname.split("/room/")[1] || ""}
              onBack={() => window.history.back()}
            />
          }
        />

        {/* Auth Routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
        <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" />} />

        {/* Dashboard - Protected */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <>
                <header className="bg-white shadow-sm border-b">
                  <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Link to="/">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                          VoteApp
                        </h1>
                      </Link>
                    </div>
                    <button
                      onClick={logout}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Logout
                    </button>
                  </div>
                </header>
                <main className="py-8 px-4">
                  <Dashboard />
                </main>
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Default fallback - redirect to login on first launch or if not authenticated */}
        <Route path="*" element={<Navigate to={firstLaunch || !isAuthenticated ? "/login" : "/dashboard"} />} />
      </Routes>
    </div>
  );
}

export default App;
