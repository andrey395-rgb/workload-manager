import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  alpha,
  CircularProgress
} from '@mui/material';
import { NAVY, ACCENT } from '../themeTokens';

/**
 * Reusable Confirmation Dialog
 * @param {boolean} open - Whether the dialog is visible
 * @param {string} title - Dialog title
 * @param {string} description - Descriptive text for the action
 * @param {object} targetItem - The object being acted upon (optional, for display)
 * @param {string} confirmLabel - Text for the confirm button
 * @param {string} confirmColor - MUI color for the confirm button ('primary', 'error', etc.)
 * @param {boolean} loading - Whether the action is in progress
 * @param {function} onConfirm - Function to call on confirmation
 * @param {function} onClose - Function to call on cancel/close
 */
const ConfirmDialog = ({
  open,
  title,
  description,
  targetItem,
  confirmLabel = 'Confirm',
  confirmColor = 'primary',
  loading = false,
  onConfirm,
  onClose
}) => {
  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      PaperProps={{
        elevation: 0,
        sx: { border: '1px solid', borderColor: 'divider', borderRadius: 2, maxWidth: 440, bgcolor: 'background.paper' }
      }}
    >
      <DialogTitle sx={{ color: 'text.primary', fontWeight: 700, pb: 1 }}>
        {title}
      </DialogTitle>
      
      <DialogContent sx={{ pb: 2 }}>
        <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.6 }}>
          {description}
        </DialogContentText>
        
        {targetItem && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            my: 2,
            p: 2,
            bgcolor: 'background.default',
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
          }}>
            <Avatar 
              src={targetItem.avatar_url}
              sx={{ bgcolor: alpha(ACCENT, 0.15), color: ACCENT, fontWeight: 700 }}
            >
              {targetItem.name?.charAt(0) || '?'}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={700} color="text.primary">
                {targetItem.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {targetItem.email || targetItem.subtext}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ color: 'text.secondary', fontWeight: 500, textTransform: 'none' }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          disabled={loading}
          autoFocus
          startIcon={loading && <CircularProgress size={14} color="inherit" />}
          sx={{
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 1.5,
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' }
          }}
        >
          {loading ? 'Processing...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
