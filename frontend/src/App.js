import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Profile from './pages/Profile';
import AdminTeam from './pages/AdminTeam';
import Navbar from './components/Navbar';
import Projects from './pages/ProjectsPage';
// 1. Import our new gatekeeper
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <BrowserRouter>
    <Navbar/>
      <Routes>
        
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Admin Routes */}
        <Route 
          path="/admin" 
          element={
            // We wrap the dashboard inside the gatekeeper and pass the required role
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

        {/* Protected Profile Route (Accessible to BOTH roles, so we don't pass a requiredRole) */}
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;