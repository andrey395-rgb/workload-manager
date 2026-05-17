import React, { useState, useMemo, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getAppTheme } from './theme';

import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Profile from './pages/Profile';
import AdminTeam from './pages/AdminTeam';
import Navbar from './components/Navbar';
import Projects from './pages/ProjectsPage';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';

// Create a context for the color mode
export const ColorModeContext = createContext({ toggleColorMode: () => {} });

function App() {
  // Initialize mode from localStorage or default to 'light'
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('app_mode');
    return savedMode === 'dark' ? 'dark' : 'light';
  });

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const nextMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('app_mode', nextMode);
          return nextMode;
        });
      },
      mode,
    }),
    [mode]
  );

  const theme = useMemo(() => getAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/team"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminTeam />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Projects />
                </ProtectedRoute>
              }
            />

            {/* Protected Employee Routes */}
            <Route 
              path="/employee" 
              element={
                <ProtectedRoute requiredRole="employee">
                  <EmployeeDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Shared Protected Routes */}
            <Route 
              path="/profile" 
              element={
                <Navigate to="/settings" replace />
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />

            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;