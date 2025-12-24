import React, { useContext } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/Dashboard";
import VoterDashboard from "./pages/VoterDashboard";
import Navbar from "./components/Navbar";
import { AuthContext } from "./context/AuthContext";

const Layout = () => {
  const location = useLocation();
  const hideNavbar = ["/login", "/register"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Outlet />
    </>
  );
};

const RoleRedirect = () => {
  const { user } = useContext(AuthContext);

  if (!user) return <Navigate to="/login" />;

  return user.role === "admin" ? (
    <Navigate to="/admin/dashboard" />
  ) : (
    <Navigate to="/voter/dashboard" />
  );
};

const App = () => {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<RoleRedirect />} />

          <Route
            path="/login"
            element={!user ? <Login /> : <RoleRedirect />}
          />

          <Route
            path="/register"
            element={!user ? <Register /> : <RoleRedirect />}
          />

          {/* 🔐 Admin route */}
          <Route
            path="/admin/dashboard"
            element={
              user?.role === "admin" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          {/* 🗳️ Voter route */}
          <Route
            path="/voter/dashboard"
            element={
              user?.role === "voter" ? (
                <VoterDashboard />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
