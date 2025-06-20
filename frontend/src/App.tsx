import "./App.css";
import { Route, Routes, Navigate } from "react-router";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import { useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";
import { Vote } from "lucide-react";
import Dashboard from "./pages/Dashboard/Dashboard";

function App() {
  const context = useContext(AuthContext);
  const logout = context?.logout;
  const isAuthenticated = context?.isAuthenticated ?? false;
  return (
    <div>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated ? (
          <>
            <header className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Vote className="text-blue-600" size={32} />
                  <h1 className="text-xl font-bold text-gray-900">
                    DecisionVote
                  </h1>
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
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md">
              <div className="text-center mb-2">
                <Vote className="mx-auto text-blue-600 mb-4" size={48} />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  DecisionVote
                </h1>
                <p className="text-gray-600">
                  Collaborative decision making made simple
                </p>
              </div>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Routes>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
