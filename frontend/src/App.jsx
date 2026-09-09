import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";
import LoginPage from "./components/auth/LoginPage.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";

function Root() {
  const { isAuthenticated, checking } = useAuth();

  if (checking) {
    return <div className="boot">Cargando iPhonizate OS…</div>;
  }
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </ThemeProvider>
  );
}
