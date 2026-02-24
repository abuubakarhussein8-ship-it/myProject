import { Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { useAuth } from "./context/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import Books from "./pages/Books";
import BorrowBook from "./pages/BorrowBook";
import BorrowHistory from "./pages/BorrowHistory";
import Dashboard from "./pages/Dashboard";
import Fines from "./pages/Fines";
import Login from "./pages/Login";
import Members from "./pages/Members";
import Register from "./pages/Register";
import "./App.css";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function RoleRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return allowedRoles.includes(user.role) ? children : <Navigate to="/" replace />;
}

function roleHome(user) {
  if (!user) return "/login";
  if (user.role === "member") return "/dashboard/member";
  return "/dashboard/staff";
}

function App() {
  const { user } = useAuth();
  const hasSidebar = user && user.role !== "member";

  return (
    <div className="app">
      {user && <Navbar />}
      <div className="app-container">
        {hasSidebar && <Sidebar />}
        <div className={`main-content ${hasSidebar ? "with-sidebar" : ""}`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/dashboard/member"
              element={
                <RoleRoute allowedRoles={["member"]}>
                  <Dashboard />
                </RoleRoute>
              }
            />

            <Route
              path="/dashboard/staff"
              element={
                <RoleRoute allowedRoles={["admin", "librarian"]}>
                  <AdminDashboard />
                </RoleRoute>
              }
            />

            <Route
              path="/books"
              element={
                <ProtectedRoute>
                  <Books />
                </ProtectedRoute>
              }
            />

            <Route
              path="/members"
              element={
                <RoleRoute allowedRoles={["admin", "librarian"]}>
                  <Members />
                </RoleRoute>
              }
            />

            <Route
              path="/borrow-book"
              element={
                <ProtectedRoute>
                  <BorrowBook />
                </ProtectedRoute>
              }
            />

            <Route
              path="/borrow-history"
              element={
                <ProtectedRoute>
                  <BorrowHistory />
                </ProtectedRoute>
              }
            />

            <Route
              path="/fines"
              element={
                <ProtectedRoute>
                  <Fines />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to={roleHome(user)} replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
