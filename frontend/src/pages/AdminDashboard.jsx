import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

import {
  Box, Typography, Paper, TextField, Button, Alert,
  Select, MenuItem, InputLabel, FormControl, Chip,
  Grid, Card, CardContent, Tabs, Tab, List, ListItem,
  ListItemAvatar, ListItemText, Avatar, IconButton, Divider,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  LinearProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TableSortLabel, InputAdornment,
  ToggleButton, ToggleButtonGroup, Badge, Tooltip, Stack,
  Skeleton, alpha, useTheme
} from '@mui/material';

import {
  DeleteOutlined as DeleteOutlineIcon,
  Assignment as AssignmentIcon,
  Badge as BadgeIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  HourglassEmpty as InProgressIcon,
  People as PeopleIcon,
  TaskAlt as TaskAltIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
  EmailOutlined as EmailIcon,
  WorkOutline as WorkIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

import Notification from '../components/Notification';
import StatCard from '../components/StatCard';
import ClockWidget from '../components/ClockWidget';
import { 
  NAVY, NAVY2, NAVY3, ACCENT, TEAL, SURFACE, CARD_BG, 
  STATUS_MAP, normaliseStatus 
} from '../themeTokens';

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task }) {
  const theme = useTheme();
  const statusKey = normaliseStatus(task.status);
  const s = STATUS_MAP[statusKey];
  const Icon = s.icon;
  const progress = statusKey === 'completed' ? 100 : statusKey === 'in_progress' ? 55 : 10;

  return (
    <Card elevation={0} sx={{
      border: '1px solid', borderColor: 'divider',
      borderLeft: '4px solid', borderLeftColor: s.color,
      borderRadius: 2, bgcolor: 'background.paper',
      transition: 'box-shadow .15s',
      '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,.08)' }
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
              '& .MuiChip-label': { px: 1 }
            }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.65, minHeight: 40 }}>
          {task.description || 'No description provided.'}
        </Typography>

        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Progress
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: s.color }}>{progress}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6, borderRadius: 3, bgcolor: alpha(s.color, 0.12),
              '& .MuiLinearProgress-bar': { bgcolor: s.color, borderRadius: 3 }
            }}
          />
        </Box>

        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
          <Typography variant="caption" sx={{
            display: 'block', mb: 1, fontWeight: 600, color: 'text.secondary',
            letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.65rem'
          }}>
            Assigned To
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {task.users && task.users.length > 0 ? (
              task.users.map(u => (
                <Tooltip key={u.id} title={u.email || u.name}>
                  <Chip
                    avatar={<Avatar src={u.avatar_url} sx={{ bgcolor: ACCENT, color: '#fff !important', fontSize: '0.65rem', fontWeight: 700 }}>{u.name.charAt(0)}</Avatar>}
                    label={u.name}
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: 'divider', color: 'text.primary', fontWeight: 500, bgcolor: 'background.default', fontSize: '0.75rem' }}
                  />
                </Tooltip>
              ))
            ) : (
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>Unassigned</Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [tasks, setTasks]             = useState([]);
  const [employees, setEmployees]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [errorMessage, setError]      = useState('');
  const [successMessage, setSuccess]  = useState('');
  const [activeTab, setActiveTab]     = useState(0);

  const [openNotif, setOpenNotif]     = useState(false);
  const [notifSeverity, setNotifSeverity] = useState('info');

  const [title, setTitle]                 = useState('');
  const [description, setDescription]     = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [empSearch, setEmpSearch]     = useState('');
  const [empSort, setEmpSort]         = useState('name');
  const [empSortDir, setEmpSortDir]   = useState('asc');

  const [taskSearch, setTaskSearch]         = useState('');
  const [taskStatusFilter, setTaskStatus]   = useState('all');

  const [deleteOpen, setDeleteOpen]         = useState(false);
  const [targetEmployee, setTarget]         = useState(null);
  const [processingDelete, setDeleting]     = useState(false);

  const token = localStorage.getItem('token');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, tRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/users', axiosConfig),
        axios.get('http://127.0.0.1:8000/api/tasks', axiosConfig),
      ]);
      setEmployees(uRes.data.users);
      setTasks(tRes.data.tasks);
    } catch {
      setError('Failed to load dashboard data. Check your network connection.');
      setNotifSeverity('error');
      setOpenNotif(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    let list = [...employees];
    if (empSearch) list = list.filter(e =>
      e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
      e.email.toLowerCase().includes(empSearch.toLowerCase())
    );
    list.sort((a, b) => {
      const aVal = empSort === 'name' ? a.name : a.email;
      const bVal = empSort === 'name' ? b.name : b.email;
      return empSortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
    return list;
  }, [employees, empSearch, empSort, empSortDir]);

  const filteredTasks = useMemo(() => {
    let list = [...tasks];
    if (taskSearch) list = list.filter(t =>
      t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(taskSearch.toLowerCase())
    );
    if (taskStatusFilter === 'pending') {
      list = list.filter(t => {
        const s = normaliseStatus(t.status);
        return s === 'pending' || s === 'in_progress';
      });
    } else if (taskStatusFilter === 'completed') {
      list = list.filter(t => normaliseStatus(t.status) === 'completed');
    }
    return list;
  }, [tasks, taskSearch, taskStatusFilter]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => normaliseStatus(t.status) === 'completed').length;
    const pendingAndActive = tasks.filter(t => {
      const s = normaliseStatus(t.status);
      return s === 'pending' || s === 'in_progress';
    }).length;

    return {
      total,
      completed,
      pending: pendingAndActive,
    };
  }, [tasks]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!selectedUsers.length) { 
      setError('Assign at least one employee to this task.'); 
      setNotifSeverity('error');
      setOpenNotif(true);
      return; 
    }
    try {
      await axios.post('http://127.0.0.1:8000/api/tasks', { title, description, user_ids: selectedUsers }, axiosConfig);
      setSuccess('Task created and assigned successfully!');
      setNotifSeverity('success');
      setOpenNotif(true);
      setTitle(''); setDescription(''); setSelectedUsers([]);
      fetchData();
    } catch {
      setError('Failed to create task. Please check the form values.');
      setNotifSeverity('error');
      setOpenNotif(true);
    }
  };

  const confirmDelete  = (emp) => { setTarget(emp); setDeleteOpen(true); };

  const executeDelete = async () => {
    if (!targetEmployee) return;
    setError(''); setSuccess(''); setDeleting(true);
    try {
      await axios.delete(`http://127.0.0.1:8000/api/users/${targetEmployee.id}`, axiosConfig);
      setSuccess(`${targetEmployee.name} has been removed successfully.`);
      setNotifSeverity('success');
      setOpenNotif(true);
      setEmployees(prev => prev.filter(e => e.id !== targetEmployee.id));
      setTasks(prev => prev.map(t => ({ ...t, users: t.users?.filter(u => u.id !== targetEmployee.id) ?? [] })));
    } catch {
      setError('Failed to remove employee. Please try again.');
      setNotifSeverity('error');
      setOpenNotif(true);
    } finally {
      setDeleting(false); setDeleteOpen(false); setTarget(null);
    }
  };

  const toggleSort = (col) => {
    if (empSort === col) setEmpSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setEmpSort(col); setEmpSortDir('asc'); }
  };

  if (loading) return (
    <Box sx={{ p: 4, maxWidth: 1280, mx: 'auto' }}>
      <Skeleton variant="text" width={320} height={48} sx={{ mb: 3 }} />
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[1,2,3,4].map(i => <Grid item xs={6} md={3} key={i}><Skeleton variant="rounded" height={80} /></Grid>)}
      </Grid>
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}><Skeleton variant="rounded" height={500} /></Grid>
        <Grid item xs={12} md={7}><Skeleton variant="rounded" height={500} /></Grid>
      </Grid>
    </Box>
  );

  return (
    <Box sx={{
      p: { xs: 2, sm: 3, md: 4 },
      bgcolor: 'background.default',
      minHeight: '100vh',
      boxSizing: 'border-box',
      maxWidth: 1280, mx: 'auto',
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
            Manage your team and track task execution
          </Typography>
          <ClockWidget />
        </Box>
        <Tooltip title="Refresh data">
          <IconButton
            onClick={fetchData}
            sx={{ color: 'text.secondary', border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3.5 }}>
        <Grid item xs={6} sm={3}><StatCard icon={TaskAltIcon}    label="Total Tasks"   value={stats.total}      accent={ACCENT}    /></Grid>
        <Grid item xs={6} sm={3}><StatCard icon={CheckCircleIcon} label="Completed"    value={stats.completed}  accent="#059669"   /></Grid>
        <Grid item xs={6} sm={3}><StatCard icon={InProgressIcon}  label="In Progress"  value={stats.inProgress} accent="#d97706"   /></Grid>
        <Grid item xs={6} sm={3}><StatCard icon={PeopleIcon}      label="Employees"    value={employees.length} accent={TEAL}      /></Grid>
      </Grid>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '420px 1fr' },
        gap: 3,
        alignItems: 'start',
      }}>

        <Paper elevation={0} sx={{
          border: '1px solid', borderColor: 'divider',
          borderRadius: 2, bgcolor: 'background.paper',
          overflow: 'hidden',
          minWidth: 0,
        }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="fullWidth"
            sx={{
              bgcolor: isDark ? alpha('#fff', 0.03) : '#0f172a',
              '& .MuiTab-root': {
                color: isDark ? 'text.secondary' : 'rgba(255,255,255,0.55)', fontWeight: 600,
                fontSize: '0.8rem', minHeight: 48,
                textTransform: 'none', letterSpacing: '0.02em',
              },
              '& .Mui-selected': { color: isDark ? 'text.primary' : '#ffffff !important' },
              '& .MuiTabs-indicator': { bgcolor: TEAL, height: 3 },
            }}
          >
            <Tab
              icon={<AssignmentIcon sx={{ fontSize: 17 }} />}
              iconPosition="start"
              label="Create Task"
            />
            <Tab
              icon={
                <Badge
                  badgeContent={employees.length}
                  color="primary"
                  sx={{ '& .MuiBadge-badge': { bgcolor: TEAL, color: '#0f172a', fontWeight: 700, fontSize: '0.6rem' } }}
                >
                  <BadgeIcon sx={{ fontSize: 17 }} />
                </Badge>
              }
              iconPosition="start"
              label="Employees"
            />
          </Tabs>

          {activeTab === 0 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mb: 2.5 }}>
                New Task Assignment
              </Typography>

              <Box component="form" onSubmit={handleCreateTask}>
                <TextField
                  label="Task Title" fullWidth required size="small"
                  value={title} onChange={e => setTitle(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Task Description" fullWidth multiline rows={3} size="small"
                  value={description} onChange={e => setDescription(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth size="small" sx={{ mb: 3 }}>
                  <InputLabel>Assign Personnel</InputLabel>
                  <Select
                    multiple value={selectedUsers}
                    onChange={e => setSelectedUsers(e.target.value)}
                    label="Assign Personnel"
                    renderValue={sel => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {sel.map(id => {
                          const emp = employees.find(e => e.id === id);
                          return (
                            <Chip
                              key={id} label={emp?.name ?? id} size="small" variant="outlined"
                              sx={{ borderColor: 'divider', fontSize: '0.72rem', height: 22 }}
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {employees.map(emp => (
                      <MenuItem key={emp.id} value={emp.id}>
                        <ListItemAvatar sx={{ minWidth: 36 }}>
                          <Avatar src={emp.avatar_url} sx={{ width: 26, height: 26, bgcolor: ACCENT, fontSize: '0.7rem', fontWeight: 700 }}>
                            {emp.name.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography variant="body2" fontWeight={600}>{emp.name}</Typography>}
                          secondary={<Typography variant="caption" color="text.secondary">{emp.email}</Typography>}
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  type="submit" variant="contained" fullWidth size="large"
                  startIcon={<AddIcon />}
                  sx={{
                    bgcolor: isDark ? 'primary.main' : '#0f172a', 
                    color: isDark ? 'primary.contrastText' : '#fff', 
                    fontWeight: 700, letterSpacing: '0.02em',
                    borderRadius: 1.5, py: 1.4, textTransform: 'none',
                    '&:hover': { bgcolor: isDark ? alpha(theme.palette.primary.main, 0.9) : '#2f3655' },
                    boxShadow: 'none',
                  }}
                >
                  Publish Task
                </Button>
              </Box>
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              <Box sx={{
                p: 2,
                borderBottom: '1px solid', borderColor: 'divider',
                display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap',
              }}>
                <TextField
                  placeholder="Search employees…" size="small" value={empSearch}
                  onChange={e => setEmpSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      </InputAdornment>
                    )
                  }}
                  sx={{ flex: 1, minWidth: 0 }}
                />
                <FormControl size="small" sx={{ width: 130, flexShrink: 0 }}>
                  <Select value={empSort} onChange={e => setEmpSort(e.target.value)} displayEmpty>
                    <MenuItem value="name">Sort: Name</MenuItem>
                    <MenuItem value="email">Sort: Email</MenuItem>
                  </Select>
                </FormControl>
                <Tooltip title={`Direction: ${empSortDir === 'asc' ? 'A → Z' : 'Z → A'}`}>
                  <IconButton
                    size="small"
                    onClick={() => setEmpSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                    sx={{
                      border: '1px solid', borderColor: 'divider',
                      borderRadius: 1, width: 34, height: 34, flexShrink: 0,
                    }}
                  >
                    <SortIcon sx={{
                      fontSize: 16,
                      transform: empSortDir === 'desc' ? 'scaleY(-1)' : 'none',
                      transition: 'transform .2s',
                    }} />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ px: 2.5, py: 1.25, bgcolor: isDark ? alpha('#fff', 0.01) : '#f8fafc', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {filteredEmployees.length} of {employees.length} employees
                </Typography>
              </Box>

              {filteredEmployees.length === 0 ? (
                <Box sx={{ p: 5, textAlign: 'center' }}>
                  <PeopleIcon sx={{ fontSize: 40, color: 'divider', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">No employees match your search.</Typography>
                </Box>
              ) : (
                <TableContainer sx={{ maxHeight: 420 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{
                          bgcolor: isDark ? alpha('#fff', 0.02) : '#f8fafc', fontWeight: 700, fontSize: '0.7rem',
                          letterSpacing: '0.06em', textTransform: 'uppercase',
                          color: 'text.secondary', pl: 2.5,
                        }}>
                          <TableSortLabel
                            active={empSort === 'name'}
                            direction={empSort === 'name' ? empSortDir : 'asc'}
                            onClick={() => toggleSort('name')}
                          >
                            Employee
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{
                          bgcolor: isDark ? alpha('#fff', 0.02) : '#f8fafc', fontWeight: 700, fontSize: '0.7rem',
                          letterSpacing: '0.06em', textTransform: 'uppercase',
                          color: 'text.secondary',
                        }}>
                          <TableSortLabel
                            active={empSort === 'email'}
                            direction={empSort === 'email' ? empSortDir : 'asc'}
                            onClick={() => toggleSort('email')}
                          >
                            Contact
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ bgcolor: isDark ? alpha('#fff', 0.02) : '#f8fafc', width: 48 }} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredEmployees.map(emp => {
                        const taskCount = tasks.filter(t => t.users?.some(u => u.id === emp.id)).length;
                        return (
                          <TableRow
                            key={emp.id}
                            sx={{ '&:hover': { bgcolor: isDark ? alpha('#fff', 0.02) : SURFACE }, '&:last-child td': { border: 0 } }}
                          >
                            <TableCell sx={{ py: 1.5, pl: 2.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                <Avatar 
                                  src={emp.avatar_url}
                                  sx={{
                                    width: 32, height: 32,
                                    bgcolor: alpha(ACCENT, 0.15), color: ACCENT,
                                    fontSize: '0.8rem', fontWeight: 700,
                                    border: '1.5px solid', borderColor: alpha(ACCENT, 0.25),
                                    flexShrink: 0,
                                  }}
                                >
                                  {emp.name.charAt(0)}
                                </Avatar>
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography
                                    variant="body2" fontWeight={600} color="text.primary"
                                    sx={{ lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                  >
                                    {emp.name}
                                  </Typography>
                                  <Chip
                                    label={`${taskCount} task${taskCount !== 1 ? 's' : ''}`}
                                    size="small"
                                    sx={{
                                      height: 16, fontSize: '0.6rem', fontWeight: 600,
                                      bgcolor: alpha(TEAL, 0.12), color: '#059669', mt: 0.25,
                                      '& .MuiChip-label': { px: 0.75 },
                                    }}
                                  />
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ maxWidth: 140 }}>
                              <Typography
                                variant="caption" color="text.secondary"
                                sx={{
                                  display: 'flex', alignItems: 'center', gap: 0.5,
                                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }}
                              >
                                <EmailIcon sx={{ fontSize: 12, flexShrink: 0 }} />{emp.email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Remove employee">
                                <IconButton
                                  size="small"
                                  onClick={() => confirmDelete(emp)}
                                  sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: 'transparent' } }}
                                >
                                  <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </Paper>

        <Box sx={{ 
          minWidth: 0, 
          width: '100%',
          height: 'calc(100vh - 240px)', 
          minHeight: 500,                
          overflowY: 'auto',             
          pr: 1.5,                       
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          '&::-webkit-scrollbar-thumb': { 
            bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', 
            borderRadius: '4px',
            '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' }
          },
        }}>
          
          <Box sx={{
            display: 'flex', gap: 1.5, mb: 2.5,
            flexWrap: 'wrap', alignItems: 'center',
          }}>
            <TextField
              placeholder="Search tasks…" size="small" value={taskSearch}
              onChange={e => setTaskSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  </InputAdornment>
                )
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
              <ToggleButton value="all">All ({stats.total})</ToggleButton>
              <ToggleButton value="pending">Pending ({stats.pending})</ToggleButton>
              <ToggleButton value="completed">Done ({stats.completed})</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Typography
            variant="caption" color="text.secondary" fontWeight={600}
            sx={{ display: 'block', mb: 1.5, letterSpacing: '0.04em' }}
          >
            SHOWING {filteredTasks.length} TASK{filteredTasks.length !== 1 ? 'S' : ''}
          </Typography>

          {filteredTasks.length === 0 ? (
            <Paper elevation={0} sx={{
              p: 6, textAlign: 'center',
              border: '1px solid', borderColor: 'divider', borderRadius: 2,
              bgcolor: 'background.paper'
            }}>
              <TaskAltIcon sx={{ fontSize: 48, color: 'divider', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {tasks.length === 0
                  ? 'No tasks yet. Create one using the panel on the left!'
                  : 'No tasks match your current filters.'}
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {filteredTasks.map(task => <TaskCard key={task.id} task={task} />)}
            </Stack>
          )}
        </Box>

      </Box>

      <Dialog
        open={deleteOpen}
        onClose={() => !processingDelete && setDeleteOpen(false)}
        PaperProps={{
          elevation: 0,
          sx: { border: '1px solid', borderColor: 'divider', borderRadius: 2, maxWidth: 440, bgcolor: 'background.paper' }
        }}
      >
        <DialogTitle sx={{ color: 'text.primary', fontWeight: 700, pb: 1 }}>
          Remove Employee?
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.6 }}>
            You are about to permanently remove:
          </DialogContentText>
          {targetEmployee && (
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              my: 2, p: 2, bgcolor: 'background.default',
              borderRadius: 1.5, border: '1px solid', borderColor: 'divider',
            }}>
              <Avatar src={targetEmployee.avatar_url} sx={{ bgcolor: alpha(ACCENT, 0.15), color: ACCENT, fontWeight: 700 }}>
                {targetEmployee.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={700} color="text.primary">{targetEmployee.name}</Typography>
                <Typography variant="caption" color="text.secondary">{targetEmployee.email}</Typography>
              </Box>
            </Box>
          )}
          <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.6 }}>
            This will unlink them from all active tasks. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1 }}>
          <Button
            onClick={() => setDeleteOpen(false)} disabled={processingDelete}
            sx={{ color: 'text.secondary', fontWeight: 500, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={executeDelete} variant="contained" disabled={processingDelete} autoFocus
            sx={{
              bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' },
              color: '#fff', fontWeight: 600, textTransform: 'none',
              borderRadius: 1.5, boxShadow: 'none',
            }}
          >
            {processingDelete ? 'Removing…' : 'Remove Employee'}
          </Button>
        </DialogActions>
      </Dialog>

      <Notification 
        open={openNotif} 
        message={errorMessage || successMessage} 
        severity={notifSeverity} 
        onClose={() => setOpenNotif(false)} 
      />
    </Box>
  );
}
