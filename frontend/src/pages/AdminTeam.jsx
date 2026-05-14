import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, Alert, Chip, Button, Card, CardContent,
  Stack, Skeleton, Tooltip, IconButton, InputAdornment, TextField,
  Avatar, alpha, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, FormControl, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, ToggleButton, ToggleButtonGroup, CircularProgress,
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
  PersonOff as PersonOffIcon,
  ManageAccounts as ManageAccountsIcon,
  AdminPanelSettings as AdminIcon,
  Person as EmployeeIcon,
} from '@mui/icons-material';

// ─── Design tokens ────────────────────────────────────────────────────────────
const NAVY    = '#1a1f36';
const NAVY2   = '#252b45';
const NAVY3   = '#2f3655';
const ACCENT  = '#6c63ff';
const TEAL    = '#00d4b4';
const SURFACE = '#f8f9fc';
const CARD_BG = '#ffffff';

const normaliseStatus = (s = 'pending') => {
  const v = (s || '').toLowerCase().replace('-', '_');
  return ['completed', 'in_progress', 'pending'].includes(v) ? v : 'pending';
};

/** Resolve role from either a Spatie roles array or a plain `role` string */
const getUserRole = (emp) => {
  if (Array.isArray(emp.roles) && emp.roles.length > 0) {
    const r = emp.roles[0];
    return typeof r === 'object' ? r.name : r;
  }
  return emp.role ?? 'employee';
};

// ─── Role badge colours ───────────────────────────────────────────────────────
const ROLE_META = {
  admin:    { label: 'Admin',    color: '#7c3aed', bg: alpha('#7c3aed', 0.1), Icon: AdminIcon },
  employee: { label: 'Employee', color: '#0369a1', bg: alpha('#0369a1', 0.1), Icon: EmployeeIcon },
};

function RoleBadge({ role }) {
  const meta = ROLE_META[role] ?? ROLE_META.employee;
  return (
    <Chip
      size="small"
      icon={<meta.Icon sx={{ fontSize: '11px !important', color: `${meta.color} !important` }} />}
      label={meta.label}
      sx={{
        height: 20,
        fontSize: '0.62rem',
        fontWeight: 700,
        bgcolor: meta.bg,
        color: meta.color,
        border: `1px solid ${alpha(meta.color, 0.2)}`,
        letterSpacing: '0.02em',
        '& .MuiChip-label': { px: 0.75 },
        '& .MuiChip-icon': { ml: 0.5 },
      }}
    />
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <Card elevation={0} sx={{
      border: '1px solid', borderColor: 'divider',
      borderRadius: 2, bgcolor: CARD_BG, height: '100%',
    }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: 1.5,
            bgcolor: alpha(accent, 0.12),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon sx={{ fontSize: 20, color: accent }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: NAVY, lineHeight: 1 }}>{value}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{label}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

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
      borderRadius: 2, bgcolor: CARD_BG,
      transition: 'box-shadow .15s',
      '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,.08)' },
    }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{
              width: 44, height: 44,
              bgcolor: alpha(ACCENT, 0.15), color: ACCENT,
              fontSize: '1rem', fontWeight: 700,
              border: `1.5px solid ${alpha(ACCENT, 0.25)}`,
            }}>
              {emp.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: NAVY, lineHeight: 1.2 }}>
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
              sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' }, mt: -0.5, mr: -0.5 }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Role selector row */}
        <Box sx={{
          mb: 1.75, px: 1.25, py: 0.75,
          bgcolor: SURFACE, borderRadius: 1.25,
          border: '1px solid', borderColor: 'divider',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Role
          </Typography>
          <RoleSelector emp={emp} onRoleChange={onRoleChange} loading={roleLoading} />
        </Box>

        {/* Task breakdown chips */}
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

        {/* Completion progress */}
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
  const [employees, setEmployees]   = useState([]);
  const [tasks, setTasks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  const [search, setSearch]         = useState('');
  const [sortBy, setSortBy]         = useState('name');
  const [sortDir, setSortDir]       = useState('asc');
  const [viewMode, setViewMode]     = useState('grid');

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [targetEmp, setTargetEmp]   = useState(null);
  const [deleting, setDeleting]     = useState(false);

  // Track which employee IDs are currently saving a role change
  const [roleLoadingIds, setRoleLoadingIds] = useState(new Set());

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
  const handleRoleChange = async (emp, newRole) => {
    if (getUserRole(emp) === newRole) return;

    setRoleLoadingIds(prev => new Set(prev).add(emp.id));
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/users/${emp.id}/role`,
        { role: newRole },
        axiosConfig,
      );
      // Optimistic update — works for both `role` string and `roles` array shapes
      setEmployees(prev => prev.map(e => {
        if (e.id !== emp.id) return e;
        const updated = { ...e, role: newRole };
        if (Array.isArray(e.roles)) {
          updated.roles = [{ name: newRole }];
        }
        return updated;
      }));
      setSuccess(`${emp.name}'s role updated to ${newRole}.`);
    } catch {
      setError(`Failed to update ${emp.name}'s role. Please try again.`);
    } finally {
      setRoleLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(emp.id);
        return next;
      });
    }
  };

  // ── Task counts ────────────────────────────────────────────────────────────
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

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:          employees.length,
    withTasks:      employees.filter(e => (taskCountsMap[e.id]?.total ?? 0) > 0).length,
    totalTasks:     tasks.length,
    completedTasks: tasks.filter(t => normaliseStatus(t.status) === 'completed').length,
  }), [employees, tasks, taskCountsMap]);

  // ── Filtered + sorted ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...employees];
    if (search) list = list.filter(e =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
    );
    list.sort((a, b) => {
      let aVal, bVal;
      if (sortBy === 'name')       { aVal = a.name;  bVal = b.name; }
      if (sortBy === 'email')      { aVal = a.email; bVal = b.email; }
      if (sortBy === 'role')       { aVal = getUserRole(a); bVal = getUserRole(b); }
      if (sortBy === 'tasks')      { aVal = taskCountsMap[a.id]?.total ?? 0; bVal = taskCountsMap[b.id]?.total ?? 0; return sortDir === 'asc' ? aVal - bVal : bVal - aVal; }
      if (sortBy === 'completion') { aVal = taskCountsMap[a.id]?.completed ?? 0; bVal = taskCountsMap[b.id]?.completed ?? 0; return sortDir === 'asc' ? aVal - bVal : bVal - aVal; }
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
      setEmployees(prev => prev.filter(e => e.id !== targetEmp.id));
      setTasks(prev => prev.map(t => ({ ...t, users: t.users?.filter(u => u.id !== targetEmp.id) ?? [] })));
    } catch {
      setError('Failed to remove employee. Please try again.');
    } finally {
      setDeleting(false); setDeleteOpen(false); setTargetEmp(null);
    }
  };

  // ── Skeleton ───────────────────────────────────────────────────────────────
  if (loading) return (
    <Box sx={{ p: 4, maxWidth: 1280, mx: 'auto' }}>
      <Skeleton variant="text" width={240} height={48} sx={{ mb: 3 }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 4 }}>
        {[1,2,3,4].map(i => <Skeleton key={i} variant="rounded" height={80} />)}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2.5 }}>
        {[1,2,3,4,5,6].map(i => <Skeleton key={i} variant="rounded" height={200} />)}
      </Box>
    </Box>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{
      p: { xs: 2, sm: 3, md: 4 },
      bgcolor: SURFACE,
      minHeight: '100vh',
      boxSizing: 'border-box',
      maxWidth: 1280, mx: 'auto',
    }}>
      {/* ── Page header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: NAVY, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
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

      {/* ── Alerts ── */}
      {error   && <Alert severity="error"   onClose={() => setError('')}   sx={{ mb: 2.5, borderRadius: 1.5 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2.5, borderRadius: 1.5 }}>{success}</Alert>}

      {/* ── Stat cards ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3.5 }}>
        <StatCard icon={PeopleIcon}       label="Total Employees"  value={stats.total}           accent={TEAL}    />
        <StatCard icon={TaskAltIcon}      label="Active Members"   value={stats.withTasks}        accent={ACCENT}  />
        <StatCard icon={CheckCircleIcon}  label="Tasks Completed"  value={stats.completedTasks}   accent="#059669" />
        <StatCard icon={InProgressIcon}   label="Total Tasks"      value={stats.totalTasks}       accent="#d97706" />
      </Box>

      {/* ── Employee list panel ── */}
      <Paper elevation={0} sx={{
        border: '1px solid', borderColor: 'divider',
        borderRadius: 2, bgcolor: CARD_BG, overflow: 'hidden',
      }}>
        {/* Panel header */}
        <Box sx={{
          bgcolor: NAVY, px: 3, py: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon sx={{ fontSize: 17, color: TEAL }} />
            <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#fff', letterSpacing: '0.02em' }}>
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

        {/* Controls bar */}
        <Box sx={{
          px: 3, py: 2,
          display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap',
          borderBottom: '1px solid', borderColor: 'divider',
          bgcolor: SURFACE,
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

          {/* View mode toggle */}
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
                bgcolor: `${NAVY} !important`,
                color: '#fff !important',
                borderColor: `${NAVY} !important`,
              },
            }}
          >
            <ToggleButton value="grid"><GridViewIcon sx={{ fontSize: 16 }} /></ToggleButton>
            <ToggleButton value="table"><TableRowsIcon sx={{ fontSize: 16 }} /></ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Result count */}
        <Box sx={{ px: 3, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            SHOWING {filtered.length} OF {employees.length} EMPLOYEES
          </Typography>
        </Box>

        {/* ── Content ── */}
        {filtered.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <PersonOffIcon sx={{ fontSize: 48, color: 'divider', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">No employees match your search.</Typography>
          </Box>
        ) : viewMode === 'grid' ? (

          /* ── Grid view ── */
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
                onRoleChange={handleRoleChange}
                roleLoading={roleLoadingIds.has(emp.id)}
              />
            ))}
          </Box>

        ) : (

          /* ── Table view ── */
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: SURFACE, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', pl: 3 }}>
                    <TableSortLabel active={sortBy === 'name'} direction={sortBy === 'name' ? sortDir : 'asc'} onClick={() => toggleSort('name')}>
                      Employee
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ bgcolor: SURFACE, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
                    <TableSortLabel active={sortBy === 'email'} direction={sortBy === 'email' ? sortDir : 'asc'} onClick={() => toggleSort('email')}>
                      Email
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ bgcolor: SURFACE, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
                    <TableSortLabel active={sortBy === 'role'} direction={sortBy === 'role' ? sortDir : 'asc'} onClick={() => toggleSort('role')}>
                      Role
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ bgcolor: SURFACE, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary' }}>
                    <TableSortLabel active={sortBy === 'tasks'} direction={sortBy === 'tasks' ? sortDir : 'asc'} onClick={() => toggleSort('tasks')}>
                      Tasks
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ bgcolor: SURFACE, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', minWidth: 160 }}>
                    <TableSortLabel active={sortBy === 'completion'} direction={sortBy === 'completion' ? sortDir : 'asc'} onClick={() => toggleSort('completion')}>
                      Completion
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ bgcolor: SURFACE, width: 48 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(emp => {
                  const tc  = taskCountsMap[emp.id] ?? { total: 0, completed: 0, inProgress: 0, pending: 0 };
                  const pct = tc.total > 0 ? Math.round((tc.completed / tc.total) * 100) : 0;
                  return (
                    <TableRow key={emp.id} sx={{ '&:hover': { bgcolor: SURFACE }, '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ py: 1.75, pl: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <Avatar sx={{
                            width: 32, height: 32,
                            bgcolor: alpha(ACCENT, 0.15), color: ACCENT,
                            fontSize: '0.8rem', fontWeight: 700,
                            border: `1.5px solid ${alpha(ACCENT, 0.25)}`,
                            flexShrink: 0,
                          }}>
                            {emp.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600} color={NAVY}>{emp.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 12 }} />{emp.email}
                        </Typography>
                      </TableCell>

                      {/* ── Role cell ── */}
                      <TableCell>
                        <RoleSelector
                          emp={emp}
                          onRoleChange={handleRoleChange}
                          loading={roleLoadingIds.has(emp.id)}
                        />
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Chip size="small" label={`${tc.completed} done`}    sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, bgcolor: alpha('#059669', 0.1), color: '#059669', '& .MuiChip-label': { px: 0.75 } }} />
                          <Chip size="small" label={`${tc.inProgress} active`} sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, bgcolor: alpha('#d97706', 0.1), color: '#d97706', '& .MuiChip-label': { px: 0.75 } }} />
                          <Chip size="small" label={`${tc.pending} pending`}   sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, bgcolor: alpha('#6366f1', 0.1), color: '#6366f1', '& .MuiChip-label': { px: 0.75 } }} />
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

      {/* ── Delete confirmation modal ── */}
      <Dialog
        open={deleteOpen}
        onClose={() => !deleting && setDeleteOpen(false)}
        PaperProps={{
          elevation: 0,
          sx: { border: '1px solid', borderColor: 'divider', borderRadius: 2, maxWidth: 440 },
        }}
      >
        <DialogTitle sx={{ color: NAVY, fontWeight: 700, pb: 1 }}>Remove Employee?</DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.6 }}>
            You are about to permanently remove:
          </DialogContentText>
          {targetEmp && (
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              my: 2, p: 2, bgcolor: SURFACE,
              borderRadius: 1.5, border: '1px solid', borderColor: 'divider',
            }}>
              <Avatar sx={{ bgcolor: alpha(ACCENT, 0.15), color: ACCENT, fontWeight: 700 }}>
                {targetEmp.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight={700} color={NAVY}>{targetEmp.name}</Typography>
                <Typography variant="caption" color="text.secondary">{targetEmp.email}</Typography>
              </Box>
            </Box>
          )}
          <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.6 }}>
            This will unlink them from all active tasks. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1 }}>
          <Button
            onClick={() => setDeleteOpen(false)} disabled={deleting}
            sx={{ color: 'text.secondary', fontWeight: 500, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={executeDelete} variant="contained" disabled={deleting} autoFocus
            sx={{
              bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' },
              color: '#fff', fontWeight: 600, textTransform: 'none',
              borderRadius: 1.5, boxShadow: 'none',
            }}
          >
            {deleting ? 'Removing…' : 'Remove Employee'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}