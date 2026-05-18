import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box, Typography
} from '@mui/material';

function TaskDeleteDialog({
  open,
  onClose,
  deleting,
  onConfirm,
  targetTask
}) {
  return (
    <Dialog
      open={open}
      onClose={() => !deleting && onClose()}
      PaperProps={{ elevation: 0, sx: { border: '1px solid', borderColor: 'divider', borderRadius: 2, maxWidth: 440, bgcolor: 'background.paper' } }}
    >
      <DialogTitle sx={{ color: 'text.primary', fontWeight: 700, pb: 1 }}>Confirm Deletion</DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.6 }}>
          Confirming this directive will remove the task node from the active project cluster.
        </DialogContentText>
        {targetTask && (
          <Box sx={{ my: 2, p: 2, bgcolor: 'background.default', borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{targetTask.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>{targetTask.description || 'No description'}</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1 }}>
        <Button onClick={onClose} disabled={deleting} sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'none' }}>Cancel</Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={deleting}
          sx={{ fontWeight: 600, textTransform: 'none', borderRadius: 1.5, boxShadow: 'none' }}
        >
          {deleting ? 'Executing Wipe...' : 'Confirm Disconnect'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TaskDeleteDialog;
