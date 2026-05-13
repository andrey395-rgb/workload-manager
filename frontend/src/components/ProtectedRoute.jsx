import React from 'react';
import { Navigate } from 'react-router-dom';

// We accept two "props" (inputs passed into our component):
// 1. 'children': The actual page we want to show (e.g., <AdminDashboard />)
// 2. 'requiredRole': The role needed to see this page ('admin' or 'employee')
function ProtectedRoute({ children, requiredRole }) {
  
  // 1. Grab the token and role from the browser's storage
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // 2. Check 1: Is the user logged in at all?
  if (!token) {
    // If no token exists, immediately redirect them to the login page
    return <Navigate to="/login" replace />;
  }

  // 3. Check 2: Does the page require a specific role, and does the user match it?
  if (requiredRole && userRole !== requiredRole) {
    // If an employee tries to access an admin page, redirect them to their own dashboard
    const fallbackRoute = userRole === 'admin' ? '/admin' : '/employee';
    return <Navigate to={fallbackRoute} replace />;
  }

  // 4. If both checks pass, render the actual page they asked for!
  return children;
}

export default ProtectedRoute;