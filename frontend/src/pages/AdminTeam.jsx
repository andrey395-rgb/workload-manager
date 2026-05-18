import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  NAVY, NAVY2, NAVY3, ACCENT, TEAL, SURFACE, CARD_BG, 
  STATUS_MAP, normaliseStatus 
} from '../themeTokens'; 
import {
  Box, Typography, Paper, Chip, Button, Card, CardContent,
  Stack, Skeleton, Tooltip, IconButton, InputAdornment, TextField,
  Avatar, alpha, FormControl, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, ToggleButton, ToggleButtonGroup, CircularProgress,
  useTheme
} from '@mui/material';
import {
  DeleteOutlined as DeleteOutlineIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  TaskAlt as TaskAltIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as InProgressIcon,
  EmailOutlined as EmailIcon,
  Sort as SortIcon,
  GridView as GridViewIcon,
  TableRows as TableRowsIcon,
  ManageAccounts as ManageAccountsIcon,
  AdminPanelSettings as AdminIcon,
  Person as EmployeeIcon,
} from '@mui/icons-material';
import Notification from '../components/Notification';
import StatCard from '../components/StatCard';
import ConfirmDialog from '../components/ConfirmDialog';

// ─── Role badge colours ───────────────────────────────────────────────────────
const ROLE_META = {
  admin:    { label: 'Admin',    color: '#7c3aed', bg: alpha('#7c3aed', 0.1), Icon: AdminIcon },
  employee: { label: 'Employee', color: '#0369a1', bg: alpha('#0369a1', 0.1), Icon: EmployeeIcon },
};

/** Resolve role from either a Spatie roles array or a plain `role` string */
const getUserRole = (emp) => {
  if (Array.isArray(emp.roles) && emp.roles.length > 0) {
    const r = emp.roles[0];
    return typeof r === 'object' ? r.name : r;
  }
  return emp.role ?? 'employee';
};

// ─── Role Selector ────────────────────────────────────────────────────────────
function RoleSelector({ emp, onRoleChange, loading }) {
  const currentRole = getUserRole(emp);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <ManageAccountsIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
      <FormControl size="small" variant="standard" disabled={loading}>
        <Select
          value={currentRole}
          onChange={(e) => onRoleChange(emp, e.target.value)}
          disableUnderline
          sx={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: ROLE_META[currentRole]?.color ?? '#0369a1',
            '& .MuiSelect-select': { py: 0, pr: '20px !important', pl: 0 },
            '& .MuiSelect-icon': { fontSize: 14, right: 0 },
          }}
        >
          <MenuItem value="admin">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.75rem' }}>
              <AdminIcon sx={{ fontSize: 14, color: ROLE_META.admin.color }} />
              Admin
            </Box>
          </MenuItem>
          <MenuItem value="employee">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.75rem' }}>
              <EmployeeIcon sx={{ fontSize: 14, color: ROLE_META.employee.color }} />
              Employee
            </Box>
          </MenuItem>
        </Select>
      </FormControl>
      {loading && <CircularProgress size={11} thickness={5} sx={{ color: ACCENT }} />}
    </Box>
  );
}

// ─── Employee Card (grid view) ────────────────────────────────────────────────
function EmployeeCard({ emp, taskCounts, onDelete, onRoleChange, roleLoading }) {
  const total     = taskCounts.total;
  const completed = taskCounts.completed;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Card elevation={0} sx={{
      border: '1px solid', borderColor: 'divider',
      borderRadius: 2, bgcolor: 'background.paper',
      transition: 'box-shadow .15s',
      '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,.08)' },
    }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar 
              src={emp.avatar_url}
              sx={{
                width: 44, height: 44,
                bgcolor: alpha(ACCENT, 0.15), color: ACCENT,
                fontSize: '1rem', fontWeight: 700,
                border: `1.5px solid ${alpha(ACCENT, 0.25)}`,
              }}
            >
              {emp.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                {emp.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{
                display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.25,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                <EmailIcon sx={{ fontSize: 11 }} />{emp.email}
              </Typography>
            </Box>
          </Box>
          
          <Tooltip title="Remove employee">
            <IconButton
              size="small"
              onClick={() => onDelete(emp)}
              sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{
          mb: 1.75, px: 1.25, py: 0.75,
          bgcolor: 'background.default', borderRadius: 1.25,
          border: '1px solid', borderColor: 'divider',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Role
          </Typography>
          <RoleSelector emp={emp} onRoleChange={onRoleChange} loading={roleLoading} />
        </Box>

        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            size="small"
            label={`${taskCounts.completed} done`}
            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, bgcolor: alpha('#059669', 0.1), color: '#059669', '& .MuiChip-label': { px: 0.75 } }}
          />
          <Chip
            size="small"
            label={`${taskCounts.inProgress} active`}
            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, bgcolor: alpha('#d97706', 0.1), color: '#d97706', '& .MuiChip-label': { px: 0.75 } }}
          />
          <Chip
            size="small"
            label={`${taskCounts.pending} pending`}
            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', '& .MuiChip-label': { px: 0.75 } }}
          />
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Completion
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#059669' }}>{pct}%</Typography>
          </Box>
          <Box sx={{ height: 5, borderRadius: 3, bgcolor: alpha('#059669', 0.1), overflow: 'hidden' }}>
            <Box sx={{
              height: '100%', width: `${pct}%`, borderRadius: 3,
              bgcolor: '#059669',
              transition: 'width 0.5s ease',
            }} />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {total} task{total !== 1 ? 's' : ''} assigned
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminTeamPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [employees, setEmployees]   = useState([]);
  const [tasks, setTasks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  const [openNotif, setOpenNotif]     = useState(false);
  const [notifSeverity, setNotifSeverity] = useState('info');

  const [search, setSearch]         = useState('');
  const [sortBy, setSortBy]         = useState('name');
  const [sortDir, setSortDir]       = useState('asc');
  const [viewMode, setViewMode]     = useState('grid');

  // Modal states
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [targetEmp, setTargetEmp]   = useState(null);
  const [deleting, setDeleting]     = useState(false);

  const [roleConfirmOpen, setRoleConfirmOpen] = useState(false);
  const [pendingRoleChange, setPendingRole]   = useState(null); // { emp, newRole }
  const [updatingRole, setUpdatingRole]       = useState(false);

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
      setError('Failed to load team data. Check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  // ── Role change ────────────────────────────────────────────────────────────
  const handleRoleChangeRequest = (emp, newRole) => {
    if (getUserRole(emp) === newRole) return;
    setPendingRole({ emp, newRole });
    setRoleConfirmOpen(true);
  };

  const executeRoleChange = async () => {
    if (!pendingRoleChange) return;
    const { emp, newRole } = pendingRoleChange;
    setUpdatingRole(true);
    
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/users/${emp.id}/role`,
        { role: newRole },
        axiosConfig,
      );
      setEmployees(prev => prev.map(e => {
        if (e.id !== emp.id) return e;
        const updated = { ...e, role: newRole };
        if (Array.isArray(e.roles)) updated.roles = [{ name: newRole }];
        return updated;
      }));
      setSuccess(`${emp.name}'s role updated to ${newRole}.`);
      setNotifSeverity('success');
      setOpenNotif(true);
    } catch {
      setError(`Failed to update ${emp.name}'s role.`);
      setNotifSeverity('error');
      setOpenNotif(true);
    } finally {
      setUpdatingRole(false);
      setRoleConfirmOpen(false);
      setPendingRole(null);
    }
  };

  const taskCountsMap = useMemo(() => {
    const map = {};
    employees.forEach(emp => {
      const empTasks = tasks.filter(t => t.users?.some(u => u.id === emp.id));
      map[emp.id] = {
        total:      empTasks.length,
        completed:  empTasks.filter(t => normaliseStatus(t.status) === 'completed').length,
        inProgress: empTasks.filter(t => normaliseStatus(t.status) === 'in_progress').length,
        pending:    empTasks.filter(t => normaliseStatus(t.status) === 'pending').length,
      };
    });
    return map;
  }, [employees, tasks]);

  const stats = useMemo(() => {
    return {
      total:          employees.length,
      withTasks:      employees.filter(e => (taskCountsMap[e.id]?.total ?? 0) > 0).length,
      totalTasks:     tasks.length,
      completedTasks: tasks.filter(t => normaliseStatus(t.status) === 'completed').length,
    };
  }, [employees, tasks, taskCountsMap]);

  const filtered = useMemo(() => {
    let list = [...employees];
    if (search) list = list.filter(e =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
    );
    
    list.sort((a, b) => {
      let aVal, bVal;
      if (sortBy === 'name')       { aVal = a.name;  bVal = b.name; }
      else if (sortBy === 'email')      { aVal = a.email; bVal = b.email; }
      else if (sortBy === 'role')       { aVal = getUserRole(a); bVal = getUserRole(b); }
      else if (sortBy === 'tasks')      { aVal = taskCountsMap[a.id]?.total ?? 0; bVal = taskCountsMap[b.id]?.total ?? 0; return sortDir === 'asc' ? aVal - bVal : bVal - aVal; }
      else if (sortBy === 'completion') { aVal = taskCountsMap[a.id]?.completed ?? 0; bVal = taskCountsMap[b.id]?.completed ?? 0; return sortDir === 'asc' ? aVal - bVal : bVal - aVal; }
      
      return sortDir === 'asc' ? (aVal ?? '').localeCompare(bVal ?? '') : (bVal ?? '').localeCompare(aVal ?? '');
    });
    return list;
  }, [employees, search, sortBy, sortDir, taskCountsMap]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const confirmDelete = (emp) => { setTargetEmp(emp); setDeleteOpen(true); };

  const executeDelete = async () => {
    if (!targetEmp) return;
    setDeleting(true);
    try {
      await axios.delete(`http://127.0.0.1:8000/api/users/${targetEmp.id}`, axiosConfig);
      setSuccess(`${targetEmp.name} has been removed from the team.`);
      setNotifSeverity('success');
      setOpenNotif(true);
      setEmployees(prev => prev.filter(e => e.id !== targetEmp.id));
      setTasks(prev => prev.map(t => ({ ...t, users: t.users?.filter(u => u.id !== targetEmp.id) ?? [] })));
    } catch {
      setError('Failed to remove employee. Please try again.');
      setNotifSeverity('error');
      setOpenNotif(true);
    } finally {
      setDeleting(false); setDeleteOpen(false); setTargetEmp(null);
    }
  };

  if (loading) return (
    <Box sx={{ p: 4, maxWidth: 1280, mx: 'auto' }}>
      <Skeleton variant="text" width={240} height={48} sx={{ mb: 3 }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
        {[1,2,3,4].map(i => <Skeleton key={i} variant="rounded" height={80} />)}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2.5 }}>
        {[1,2,3,4,5,6].map(i => <Skeleton key={i} variant="rounded" height={200} />)}
      </Box>
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Team
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage your employees and view their workload
          </Typography>
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

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 3.5 }}>
        <StatCard icon={PeopleIcon}       label="Active Employees"  value={stats.total}           accent={TEAL}    />
        <StatCard icon={TaskAltIcon}      label="Assigned Members"   value={stats.withTasks}        accent={ACCENT}  />
        <StatCard icon={CheckCircleIcon}  label="Tasks Completed"  value={stats.completedTasks}   accent="#059669" />
        <StatCard icon={InProgressIcon}   label="Total Tasks"      value={stats.totalTasks}       accent="#d97706" />
      </Box>

      <Paper elevation={0} sx={{
        border: '1px solid', borderColor: 'divider',
        borderRadius: 2, bgcolor: 'background.paper', overflow: 'hidden',
      }}>
        <Box sx={{
          bgcolor: isDark ? alpha('#fff', 0.03) : '#1a1f36', px: 3, py: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid', borderColor: 'divider',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon sx={{ fontSize: 17, color: TEAL }} />
            <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: isDark ? 'text.primary' : '#fff', letterSpacing: '0.02em' }}>
              Employee Directory
            </Typography>
          </Box>
          <Box sx={{
            bgcolor: alpha(TEAL, 0.18), color: TEAL,
            fontSize: '0.65rem', fontWeight: 700,
            px: 1.25, py: 0.3, borderRadius: 1,
            letterSpacing: '0.06em',
          }}>
            {employees.length} MEMBERS
          </Box>
        </Box>

        <Box sx={{
          px: 3, py: 2,
          display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap',
          borderBottom: '1px solid', borderColor: 'divider',
          bgcolor: isDark ? alpha('#fff', 0.015) : '#f8f9fc',
        }}>
          <TextField
            placeholder="Search by name or email…"
            size="small"
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ flex: '1 1 200px', minWidth: 0 }}
          />
          <FormControl size="small" sx={{ width: 180, flexShrink: 0 }}>
            <Select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <MenuItem value="name">Sort: Name</MenuItem>
              <MenuItem value="email">Sort: Email</MenuItem>
              <MenuItem value="role">Sort: Role</MenuItem>
              <MenuItem value="tasks">Sort: Task Count</MenuItem>
              <MenuItem value="completion">Sort: Completion</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title={sortDir === 'asc' ? 'Ascending' : 'Descending'}>
            <IconButton
              size="small"
              onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, width: 34, height: 34, flexShrink: 0 }}
            >
              <SortIcon sx={{
                fontSize: 16,
                transform: sortDir === 'desc' ? 'scaleY(-1)' : 'none',
                transition: 'transform .2s',
              }} />
            </IconButton>
          </Tooltip>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, v) => v && setViewMode(v)}
            size="small"
            sx={{
              flexShrink: 0,
              '& .MuiToggleButton-root': {
                border: '1px solid', borderColor: 'divider',
                px: 1, py: 0.6, color: 'text.secondary',
              },
              '& .Mui-selected': {
                bgcolor: isDark ? 'primary.main' : '#1a1f36',
                color: isDark ? 'primary.contrastText' : '#fff',
                borderColor: isDark ? 'primary.main' : '#1a1f36',
              },
            }}
          >
            <ToggleButton value="grid"><GridViewIcon sx={{ fontSize: 16 }} /></ToggleButton>
            <ToggleButton value="table"><TableRowsIcon sx={{ fontSize: 16 }} /></ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ px: 3, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            SHOWING {filtered.length} OF {employees.length} EMPLOYEES
          </Typography>
        </Box>

        {filtered.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <PeopleIcon sx={{ fontSize: 48, color: 'divider', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">No employees match your search.</Typography>
          </Box>
        ) : viewMode === 'grid' ? (
          <Box sx={{
            p: 3,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 2.5,
          }}>
            {filtered.map(emp => (
              <EmployeeCard
                key={emp.id}
                emp={emp}
                taskCounts={taskCountsMap[emp.id] ?? { total: 0, completed: 0, inProgress: 0, pending: 0 }}
                onDelete={confirmDelete}
                onRoleChange={handleRoleChangeRequest}
                roleLoading={false}
              />
            ))}
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: isDark ? alpha('#fff', 0.02) : '#f8f9fc', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', pl: 3 }}>
                    <TableSortLabel active={sortBy === 'name'} direction={sortBy === 'name' ? sortDir : 'asc'} onClick={() => toggleSort('name')}>
                      Employee
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ bgcolor: isDark ? alpha('#fff', 0.02) : '#f8f9fc', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
                    Email
                  </TableCell>
                  <TableCell sx={{ bgcolor: isDark ? alpha('#fff', 0.02) : '#f8f9fc', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
                    Role
                  </TableCell>
                  <TableCell sx={{ bgcolor: isDark ? alpha('#fff', 0.02) : '#f8f9fc', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
                    Tasks
                  </TableCell>
                  <TableCell sx={{ bgcolor: isDark ? alpha('#fff', 0.02) : '#f8f9fc', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', minWidth: 160 }}>
                    Completion
                  </TableCell>
                  <TableCell sx={{ bgcolor: isDark ? alpha('#fff', 0.02) : '#f8f9fc', width: 48 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(emp => {
                  const tc  = taskCountsMap[emp.id] ?? { total: 0, completed: 0, inProgress: 0, pending: 0 };
                  const pct = tc.total > 0 ? Math.round((tc.completed / tc.total) * 100) : 0;
                  return (
                    <TableRow key={emp.id} sx={{ 
                      '&:hover': { bgcolor: isDark ? alpha('#fff', 0.02) : SURFACE }, 
                      '&:last-child td': { border: 0 }
                    }}>
                      <TableCell sx={{ py: 1.75, pl: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <Avatar 
                            src={emp.avatar_url}
                            sx={{
                              width: 32, height: 32,
                              bgcolor: alpha(ACCENT, 0.15), color: ACCENT,
                              fontSize: '0.8rem', fontWeight: 700,
                              border: `1.5px solid ${alpha(ACCENT, 0.25)}`,
                              flexShrink: 0,
                            }}
                          >
                            {emp.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600} color="text.primary">{emp.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 12 }} />{emp.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <RoleSelector
                          emp={emp}
                          onRoleChange={handleRoleChangeRequest}
                          loading={false}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Chip size="small" label={`${tc.completed} done`}    sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, bgcolor: alpha('#059669', 0.1), color: '#059669', '& .MuiChip-label': { px: 0.75 } }} />
                          <Chip size="small" label={`${tc.inProgress} active`} sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, bgcolor: alpha('#d97706', 0.1), color: '#d97706', '& .MuiChip-label': { px: 0.75 } }} />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ flex: 1, height: 5, borderRadius: 3, bgcolor: alpha('#059669', 0.1), overflow: 'hidden' }}>
                            <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: '#059669', borderRadius: 3, transition: 'width 0.5s ease' }} />
                          </Box>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#059669', minWidth: 32 }}>{pct}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Remove employee">
                          <IconButton size="small" onClick={() => confirmDelete(emp)} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
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
      </Paper>

      {/* ── Confirm Role Change ── */}
      <ConfirmDialog
        open={roleConfirmOpen}
        title="Update User Role?"
        description={`Confirming this change will update the user's access levels. The user will be assigned the ${pendingRoleChange?.newRole?.toUpperCase()} permissions immediately.`}
        targetItem={pendingRoleChange ? { ...pendingRoleChange.emp, subtext: `New Role: ${pendingRoleChange.newRole?.toUpperCase()}` } : null}
        confirmLabel="Update Role"
        loading={updatingRole}
        onConfirm={executeRoleChange}
        onClose={() => setRoleConfirmOpen(false)}
      />

      {/* ── Confirm Delete ── */}
      <ConfirmDialog
        open={deleteOpen}
        title="Remove Employee?"
        description="You are about to permanently remove this employee from the central directory. This will unlink them from all active tasks. This action cannot be undone."
        targetItem={targetEmp}
        confirmLabel="Remove Employee"
        confirmColor="error"
        loading={deleting}
        onConfirm={executeDelete}
        onClose={() => setDeleteOpen(false)}
      />

      <Notification 
        open={openNotif} 
        message={error || success} 
        severity={notifSeverity} 
        onClose={() => setOpenNotif(false)} 
      />
    </Box>
  );
}
