import "./App.css";
import { Route, Routes, Navigate } from "react-router";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import { useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";
import { Vote } from "lucide-react";
import { Link } from "react-router";


function App() {
  const context = useContext(AuthContext);
  const logout = context?.logout;
  const isAuthenticated = context?.isAuthenticated ?? false;

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        {!isAuthenticated && (
          <>
            <Route
              path="/"
              element={<Navigate to="/login" />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </>
        )}

        {/* Protected route */}
        {isAuthenticated && (
          <Route
            path="/dashboard"
            element={
              <>
                <header className="bg-white shadow-sm border-b">
                  <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Vote className="text-blue-600" size={32} />
                      <Link to='/'>
                      <h1 className="text-xl font-bold text-gray-900">
                       Vote App
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
            }
          />   
                 
        )}
        
        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;
