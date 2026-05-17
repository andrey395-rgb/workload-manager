import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Autocomplete, Chip, alpha
} from '@mui/material';
import {
  Add as AddIcon,
  AccessTime as ClockIcon,
  Close as CloseIcon,
  Public as GlobalIcon
} from '@mui/icons-material';
import { NAVY, ACCENT, SURFACE, CARD_BG } from '../themeTokens';

/**
 * Single Clock Display Component
 */
const TimeDisplay = ({ timezone, label, onRemove, isLocal = false }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const dateString = time.toLocaleDateString('en-US', {
    timeZone: timezone,
    month: 'short',
    day: 'numeric'
  });

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      px: 2,
      py: 1,
      bgcolor: 'background.default',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1.5,
      position: 'relative',
      minWidth: 160,
      '&:hover .remove-clock': { opacity: 1 }
    }}>
      <Box>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', lineHeight: 1, mb: 0.5, textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.05em' }}>
          {label} {isLocal && '(Local)'}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1, letterSpacing: '-0.02em' }}>
          {timeString}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
          {dateString}
        </Typography>
      </Box>

      {!isLocal && (
        <IconButton
          className="remove-clock"
          size="small"
          onClick={onRemove}
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            width: 20,
            height: 20,
            opacity: 0,
            transition: 'opacity 0.2s',
            '&:hover': { bgcolor: '#fee2e2', color: 'error.main' }
          }}
        >
          <CloseIcon sx={{ fontSize: 12 }} />
        </IconButton>
      )}
    </Box>
  );
};

/**
 * Main Clock Widget Manager
 */
const ClockWidget = () => {
  const [clocks, setClocks] = useState(() => {
    const saved = localStorage.getItem('dashboard_clocks');
    return saved ? JSON.parse(saved) : []; // Array of { tz, label }
  });

  const [open, setOpen] = useState(false);
  const [selectedTz, setSelectedTz] = useState(null);
  const [customLabel, setLabel] = useState('');

  // Get all supported timezones from the browser
  const allTimezones = Intl.supportedValuesOf('timeZone');

  const addClock = () => {
    if (!selectedTz) return;
    const newClock = { tz: selectedTz, label: customLabel || selectedTz.split('/').pop().replace('_', ' ') };
    const next = [...clocks, newClock];
    setClocks(next);
    localStorage.setItem('dashboard_clocks', JSON.stringify(next));
    setOpen(false);
    setSelectedTz(null);
    setLabel('');
  };

  const removeClock = (index) => {
    const next = clocks.filter((_, i) => i !== index);
    setClocks(next);
    localStorage.setItem('dashboard_clocks', JSON.stringify(next));
  };

  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
      
      {/* Local Clock (Fixed) */}
      <TimeDisplay timezone={localTz} label="Current" isLocal />

      {/* Custom Clocks */}
      {clocks.map((c, i) => (
        <TimeDisplay 
          key={i} 
          timezone={c.tz} 
          label={c.label} 
          onRemove={() => removeClock(i)} 
        />
      ))}

      {/* Add Button */}
      <Tooltip title="Add timezone clock">
        <IconButton 
          onClick={() => setOpen(true)}
          sx={{ 
            border: '1px dashed', 
            borderColor: 'divider', 
            borderRadius: 1.5,
            width: 44,
            height: 44,
            '&:hover': { bgcolor: alpha(ACCENT, 0.05), borderColor: ACCENT, color: ACCENT }
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Selection Modal */}
      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ elevation: 0, sx: { border: '1px solid', borderColor: 'divider', borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: NAVY }}>Add World Clock</DialogTitle>
        <DialogContent sx={{ minWidth: 320 }}>
          <Autocomplete
            options={allTimezones}
            value={selectedTz}
            onChange={(_, val) => setSelectedTz(val)}
            renderInput={(params) => <TextField {...params} label="Select Timezone" margin="normal" size="small" fullWidth autoFocus />}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Label (Optional)"
            fullWidth
            size="small"
            value={customLabel}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. London Office"
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: 'text.secondary', textTransform: 'none' }}>Cancel</Button>
          <Button 
            onClick={addClock} 
            variant="contained" 
            disabled={!selectedTz}
            sx={{ bgcolor: NAVY, textTransform: 'none', borderRadius: 1.5, px: 3, boxShadow: 'none', '&:hover': { bgcolor: ACCENT, boxShadow: 'none' } }}
          >
            Add Clock
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClockWidget;
