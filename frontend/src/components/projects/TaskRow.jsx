import React from 'react';
import {
  Box, Typography, Chip, Avatar, AvatarGroup, Tooltip, IconButton, Button, alpha
} from '@mui/material';
import {
  People as PeopleIcon,
  DeleteOutlined as DeleteOutlineIcon,
  AddCircleOutline as ClaimIcon,
} from '@mui/icons-material';
import { ACCENT, STATUS_MAP, normaliseStatus, TEAL } from '../../themeTokens';

const STATUS_META = STATUS_MAP;

function TaskRow({ task, isAdmin, onDelete, onEditAssignment, onPickup }) {
  const key = normaliseStatus(task.status);
  const s   = STATUS_META[key];
  const { Icon } = s;

  const isAssigned = (task.users || []).length > 0;
  const currentUserId = parseInt(localStorage.getItem('userId'));
  const isMeAssigned = (task.users || []).some(u => u.id === currentUserId);

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.5,
      px: 2, py: 1.25,
      borderBottom: '1px solid', borderColor: 'divider',
      '&:last-of-type': { borderBottom: 'none' },
      '&:hover': { bgcolor: alpha(ACCENT, 0.03) },
    }}>
      <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: s.bg, border: `1.5px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon sx={{ fontSize: 13, color: s.color }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, bgcolor: 'action.hover', px: 0.6, py: 0.2, borderRadius: 0.5, fontSize: '0.65rem' }}>
            #{task.task_number}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: key === 'completed' ? 'text.secondary' : 'text.primary', textDecoration: key === 'completed' ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}> 
            {task.title}
          </Typography>
          {!isAssigned && (
             <Chip 
               label="VACANT" 
               size="small" 
               sx={{ height: 16, fontSize: '0.55rem', fontWeight: 800, bgcolor: alpha(TEAL, 0.1), color: TEAL, border: `1px solid ${alpha(TEAL, 0.2)}` }} 
             />
          )}
        </Box>
        {task.description && (
          <Typography variant="caption" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', ml: 4.5 }}>
            {task.description}
          </Typography>
        )}
      </Box>
      <Chip
        label={s.label}
        size="small"
        sx={{ bgcolor: s.bg, color: s.color, border: '1px solid', borderColor: s.border, fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.04em', height: 20, flexShrink: 0, '& .MuiChip-label': { px: 0.75 } }}
      />
      
      {isAssigned && (
        <AvatarGroup max={3} sx={{ flexShrink: 0, '& .MuiAvatar-root': { width: 22, height: 22, fontSize: '0.6rem', fontWeight: 700, bgcolor: alpha(ACCENT, 0.15), color: ACCENT, border: `1px solid ${alpha(ACCENT, 0.25)}` } }}>
          {(task.users || []).map(u => <Avatar key={u.id} src={u.avatar_url}>{u.name.charAt(0)}</Avatar>)}
        </AvatarGroup>
      )}

      {!isAdmin && !isMeAssigned && (
        <Button
          size="small"
          startIcon={<ClaimIcon sx={{ fontSize: '14px !important' }} />}
          onClick={(e) => { e.stopPropagation(); onPickup(task); }}
          sx={{ 
            height: 24, 
            fontSize: '0.65rem', 
            fontWeight: 700, 
            textTransform: 'none',
            bgcolor: alpha(TEAL, 0.1),
            color: TEAL,
            '&:hover': { bgcolor: alpha(TEAL, 0.2) },
            ml: 1
          }}
        >
          Claim
        </Button>
      )}

      {isAdmin && (
        <Box sx={{ display: 'flex', gap: 0.5, ml: 0.5 }}>
          <Tooltip title="Edit Assignment">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEditAssignment(task); }} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
              <PeopleIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete task">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(task); }} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
              <DeleteOutlineIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
}

export default TaskRow;
