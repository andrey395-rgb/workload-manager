import React from 'react';
import { Snackbar, Alert } from '@mui/material';

/**
 * Reusable Notification Component
 * @param {boolean} open - Whether the snackbar is visible
 * @param {string} message - The text to display
 * @param {string} severity - MUI Alert severity ('success', 'error', 'info', 'warning')
 * @param {function} onClose - Function to call when closing
 */
const Notification = ({ open, message, severity = 'info', onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ mt: { xs: 7, sm: 8 } }} // Add some margin to avoid overlapping with top headers if necessary
    >
      <Alert 
        onClose={onClose} 
        severity={severity} 
        variant="filled"
        sx={{ 
          width: '100%', 
          borderRadius: 1.5, 
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontWeight: 600
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
