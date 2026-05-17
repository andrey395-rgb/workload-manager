import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  NAVY, NAVY2, NAVY3, ACCENT, TEAL, SURFACE, CARD_BG, 
  STATUS_MAP, normaliseStatus 
} from '../themeTokens'; 
import {
  Box, Typography, Paper, Alert, Chip, Button, LinearProgress,
  Card, CardContent, Stack, Skeleton, Tooltip, IconButton,
  InputAdornment, TextField, ToggleButton, ToggleButtonGroup,
  Avatar, alpha, useTheme
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  HourglassEmpty as InProgressIcon,
  PlayArrow as PlayArrowIcon,
  TaskAlt as TaskAltIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import Notification from '../components/Notification';
import StatCard from '../components/StatCard';
import ClockWidget from '../components/ClockWidget';

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, onUpdateStatus }) {
  const theme = useTheme();
  const statusKey = normaliseStatus(task.status);
  const s = STATUS_MAP[statusKey];
  const Icon = s.icon;

  return (
    <Card elevation={0} sx={{
      border: '1px solid', borderColor: 'divider',
      borderLeft: '4px solid', borderLeftColor: s.color,
      borderRadius: 2, bgcolor: 'background.paper',
      transition: 'box-shadow .15s',
      '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,.08)' },
    }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.3, flex: 1, pr: 2 }}>
            {task.title}
          </Typography>
          <Chip
            icon={<Icon sx={{ fontSize: '14px !important', color: `${s.color} !important` }} />}
            label={s.label}
            size="small"
            sx={{
              bgcolor: s.bg, color: s.color, border: '1px solid', borderColor: s.border,
              fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.04em',
              height: 24, flexShrink: 0,
              '& .MuiChip-label': { px: 1 },
            }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.65 }}>
          {task.description || 'No description provided.'}
        </Typography>

        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2, display: 'flex', justifyContent: 'flex-end' }}>  
          {statusKey === 'pending' && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<PlayArrowIcon sx={{ fontSize: 14 }} />}
              onClick={() => onUpdateStatus && onUpdateStatus(task.id, 'in_progress')}
              sx={{
                fontSize: '0.75rem', fontWeight: 700, textTransform: 'none',
                borderColor: ACCENT, color: ACCENT, borderRadius: 1.5,
                '&:hover': { bgcolor: alpha(ACCENT, 0.06), borderColor: ACCENT },
              }}
            >
              Start Task
            </Button>
          )}
          {statusKey === 'in_progress' && (
            <Button
              size="small"
              variant="contained"
              startIcon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
              onClick={() => onUpdateStatus && onUpdateStatus(task.id, 'completed')}
              sx={{
                fontSize: '0.75rem', fontWeight: 700, textTransform: 'none',
                bgcolor: '#059669', color: '#fff', borderRadius: 1.5, boxShadow: 'none',
                '&:hover': { bgcolor: '#047857', boxShadow: 'none' },
              }}
            >
              Mark Done
            </Button>
          )}
          {statusKey === 'completed' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CheckCircleIcon sx={{ fontSize: 15, color: '#059669' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#059669', letterSpacing: '0.04em' }}>
                Completed
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EmployeeDashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const [openNotif, setOpenNotif]     = useState(false);
  const [notifSeverity, setNotifSeverity] = useState('info');

  const [taskSearch, setTaskSearch]       = useState('');
  const [taskStatusFilter, setTaskStatus] = useState('active');

  const token = localStorage.getItem('token');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { fetchMyTasks(); }, []);

  const fetchMyTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/tasks/my', axiosConfig);
      setTasks(res.data.tasks);
    } catch {
      setError('Failed to load tasks. Check your connection and try again.');
      setNotifSeverity('error');
      setOpenNotif(true);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    setError(''); setSuccess('');
    try {
      await axios.patch(`http://127.0.0.1:8000/api/tasks/${taskId}/status`, { status: newStatus }, axiosConfig);
      const msg = `Task moved to "${STATUS_MAP[newStatus]?.label}".`;
      setSuccess(msg);
      setNotifSeverity('success');
      setOpenNotif(true);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      const msg = err.response?.status === 403
        ? "You don't have permission to update this task."
        : 'Status update failed. Please try again.';
      setError(msg);
      setNotifSeverity('error');
      setOpenNotif(true);
    }
  };

  const stats = useMemo(() => ({
    total:      tasks.length,
    completed:  tasks.filter(t => normaliseStatus(t.status) === 'completed').length,
    inProgress: tasks.filter(t => normaliseStatus(t.status) === 'in_progress').length,
    pending:    tasks.filter(t => normaliseStatus(t.status) === 'pending').length,
  }), [tasks]);

  const filteredTasks = useMemo(() => {
    let list = [...tasks];
    if (taskSearch) list = list.filter(t =>
      t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(taskSearch.toLowerCase())
    );
    if (taskStatusFilter === 'active') list = list.filter(t => normaliseStatus(t.status) !== 'completed');
    else if (taskStatusFilter !== 'all') list = list.filter(t => normaliseStatus(t.status) === taskStatusFilter);
    const order = { in_progress: 0, pending: 1, completed: 2 };
    list.sort((a, b) => (order[normaliseStatus(a.status)] ?? 3) - (order[normaliseStatus(b.status)] ?? 3));
    return list;
  }, [tasks, taskSearch, taskStatusFilter]);

  if (loading) return (
    <Box sx={{ p: 4, maxWidth: 900, mx: 'auto' }}>
      <Skeleton variant="text" width={280} height={48} sx={{ mb: 3 }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 4 }}>
        {[1,2,3,4].map(i => <Skeleton key={i} variant="rounded" height={80} />)}
      </Box>
      <Stack spacing={2}>
        {[1,2,3].map(i => <Skeleton key={i} variant="rounded" height={180} />)}
      </Stack>
    </Box>
  );

  return (
    <Box sx={{
      p: { xs: 2, sm: 3, md: 4 },
      bgcolor: 'background.default',
      minHeight: '100vh',
      boxSizing: 'border-box',
      maxWidth: 900, mx: 'auto',
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            My Tasks
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
            Your assigned work and current progress
          </Typography>

          <ClockWidget />
        </Box>
        <Tooltip title="Refresh tasks">
          <IconButton
            onClick={fetchMyTasks}
            sx={{ color: 'text.secondary', border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3.5 }}>
        <StatCard icon={AssignmentIcon}  label="Total Tasks"   value={stats.total}      accent={ACCENT}    />
        <StatCard icon={CheckCircleIcon} label="Completed"     value={stats.completed}  accent="#059669"   />
        <StatCard icon={InProgressIcon}  label="In Progress"   value={stats.inProgress} accent="#d97706"   />
        <StatCard icon={PendingIcon}     label="Pending"       value={stats.pending}    accent="#6366f1"   />
      </Box>

      {stats.total > 0 && (
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'background.paper', mb: 3.5, px: 3, py: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Overall Completion
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#059669' }}>
              {Math.round((stats.completed / stats.total) * 100)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.round((stats.completed / stats.total) * 100)}
            sx={{
              height: 8, borderRadius: 4, bgcolor: alpha('#059669', 0.1),
              '& .MuiLinearProgress-bar': { bgcolor: '#059669', borderRadius: 4 },
            }}
          />
          <Box sx={{ display: 'flex', gap: 3, mt: 1.5 }}>
            {[
              { label: 'Completed', value: stats.completed, color: '#059669' },
              { label: 'In Progress', value: stats.inProgress, color: '#d97706' },
              { label: 'Pending', value: stats.pending, color: '#6366f1' },
            ].map(({ label, value, color }) => (
              <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {value} {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Card>
      )}

      <Paper elevation={0} sx={{
        border: '1px solid', borderColor: 'divider',
        borderRadius: 2, bgcolor: 'background.paper', overflow: 'hidden',
      }}>
        <Box sx={{
          bgcolor: isDark ? alpha('#fff', 0.03) : '#0f172a', px: 3, py: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid', borderColor: 'divider',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TaskAltIcon sx={{ fontSize: 17, color: TEAL }} />
            <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: isDark ? 'text.primary' : '#fff', letterSpacing: '0.02em' }}>
              Task Board
            </Typography>
          </Box>
          <Box sx={{
            bgcolor: alpha(TEAL, 0.18), color: TEAL,
            fontSize: '0.65rem', fontWeight: 700,
            px: 1.25, py: 0.3, borderRadius: 1,
            letterSpacing: '0.06em',
          }}>
            {stats.total} TASKS
          </Box>
        </Box>

        <Box sx={{
          px: 3, py: 2,
          display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap',
          borderBottom: '1px solid', borderColor: 'divider',
          bgcolor: isDark ? alpha('#fff', 0.015) : '#f8f9fc',
        }}>
          <TextField
            placeholder="Search tasks…"
            size="small"
            value={taskSearch}
            onChange={e => setTaskSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ flex: '1 1 180px', minWidth: 0 }}
          />
          <ToggleButtonGroup
            value={taskStatusFilter}
            exclusive
            onChange={(_, v) => v && setTaskStatus(v)}
            size="small"
            sx={{
              flexShrink: 0,
              '& .MuiToggleButton-root': {
                textTransform: 'none', fontWeight: 600, fontSize: '0.75rem',
                px: 1.5, py: 0.6,
                border: '1px solid', borderColor: 'divider', color: 'text.secondary',
              },
              '& .Mui-selected': {
                bgcolor: isDark ? 'primary.main' : '#0f172a',
                color: isDark ? 'primary.contrastText' : '#fff',
                borderColor: isDark ? 'primary.main' : '#0f172a',
              },
            }}
          >
            <ToggleButton value="active">Active ({stats.inProgress + stats.pending})</ToggleButton>
            <ToggleButton value="all">All ({stats.total})</ToggleButton>
            <ToggleButton value="pending">Pending</ToggleButton>
            <ToggleButton value="in_progress">In Progress</ToggleButton>
            <ToggleButton value="completed">Done</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ px: 3, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            SHOWING {filteredTasks.length} TASK{filteredTasks.length !== 1 ? 'S' : ''}
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          {filteredTasks.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <TaskAltIcon sx={{ fontSize: 48, color: 'divider', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {tasks.length === 0
                  ? 'No tasks assigned to you yet.'
                  : 'No tasks match your current filters.'}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {filteredTasks.map(task => (
                <TaskCard key={task.id} task={task} onUpdateStatus={handleUpdateStatus} />
              ))}
            </Stack>
          )}
        </Box>
      </Paper>

      <Notification 
        open={openNotif} 
        message={error || success} 
        severity={notifSeverity} 
        onClose={() => setOpenNotif(false)} 
      />
    </Box>
  );
}
