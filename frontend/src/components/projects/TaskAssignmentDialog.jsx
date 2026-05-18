import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  FormControl, InputLabel, Select, MenuItem, ListItemAvatar, Avatar, ListItemText, Chip
} from '@mui/material';

function TaskAssignmentDialog({
  open,
  onClose,
  updating,
  onUpdate,
  targetTask,
  employees,
  selectedUsers,
  setSelectedUsers
}) {
  return (
    <Dialog
      open={open}
      onClose={() => !updating && onClose()}
      PaperProps={{ elevation: 0, sx: { border: '1px solid', borderColor: 'divider', borderRadius: 2, maxWidth: 440, bgcolor: 'background.paper' } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Update Task Personnel</DialogTitle>
      <DialogContent>
        {targetTask && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>#{targetTask.task_number}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', display: 'block' }}>{targetTask.title}</Typography>
          </Box>
        )}
        <FormControl fullWidth size="small">
          <InputLabel>Assign Personnel</InputLabel>
          <Select
            multiple 
            value={selectedUsers}
            onChange={e => setSelectedUsers(e.target.value)}
            label="Assign Personnel"
            renderValue={sel => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {sel.map(id => {
                  const emp = employees.find(e => e.id === id);
                  return <Chip key={id} label={emp?.name ?? id} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />;
                })}
              </Box>
            )}
          >
            {employees.map(emp => (
              <MenuItem key={emp.id} value={emp.id}>
                <ListItemAvatar sx={{ minWidth: 36 }}>
                  <Avatar src={emp.avatar_url} sx={{ width: 24, height: 24, fontSize: '0.6rem' }}>
                    {emp.name.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={<Typography variant="body2">{emp.name}</Typography>} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} sx={{ color: 'text.secondary', fontWeight: 600 }}>Cancel</Button>
        <Button
          onClick={onUpdate}
          variant="contained"
          disabled={updating}
          sx={{ bgcolor: 'primary.main', fontWeight: 600, px: 3, borderRadius: 1.5 }}
        >
          {updating ? 'Syncing...' : 'Update Roster'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TaskAssignmentDialog;
