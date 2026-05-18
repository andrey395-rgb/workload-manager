import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField
} from '@mui/material';

function ProjectCreateDialog({ 
  open, 
  onClose, 
  creating, 
  onSubmit, 
  name, 
  setName, 
  description, 
  setDescription 
}) {
  return (
    <Dialog
      open={open}
      onClose={() => !creating && onClose()}
      PaperProps={{ elevation: 0, sx: { border: '1px solid', borderColor: 'divider', borderRadius: 2, maxWidth: 500, bgcolor: 'background.paper' } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Initialize Project Cluster</DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={2.5}>
            <TextField
              label="Project Name"
              fullWidth
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Infrastructure Migration"
            />
            <TextField
              label="Strategic Description"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide high-level context for this project..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} sx={{ color: 'text.secondary', fontWeight: 600 }}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={creating}
            sx={{ bgcolor: 'primary.main', fontWeight: 600, px: 3, borderRadius: 1.5 }}
          >
            {creating ? 'Initializing...' : 'Create Project'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default ProjectCreateDialog;
