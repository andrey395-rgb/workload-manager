import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, Alert, Chip, Button, Card, CardContent,
  Skeleton, Tooltip, IconButton, InputAdornment, TextField,
  Avatar, AvatarGroup, alpha, LinearProgress,
  FormControl, Select, MenuItem,
  ToggleButton, ToggleButtonGroup,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Collapse, Divider,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FolderOutlined as FolderIcon,
  TaskAlt as TaskAltIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as InProgressIcon,
  RadioButtonUnchecked as PendingIcon,
  GridView as GridViewIcon,
  TableRows as ListViewIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Sort as SortIcon,
  Add as AddIcon,
  People as PeopleIcon,
  DeleteOutlined as DeleteOutlineIcon,
  FolderOff as FolderOffIcon,
} from '@mui/icons-material';

// ─── Design tokens ────────────────────────────────────────────────────────────
const NAVY    = '#1a1f36';
const NAVY3   = '#2f3655';
const ACCENT  = '#6c63ff';
const TEAL    = '#00d4b4';
const SURFACE = '#f8f9fc';
const CARD_BG = '#ffffff';

const STATUS_META = {
  completed:   { label: 'Completed',   color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', Icon: CheckCircleIcon },
  in_progress: { label: 'In Progress', color: '#d97706', bg: '#fffbeb', border: '#fde68a', Icon: InProgressIcon },
  pending:     { label: 'Pending',     color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', Icon: PendingIcon },
};

const normaliseStatus = (s = 'pending') => {
  const v = (s || '').toLowerCase().replace(/-/g, '_');
  return STATUS_META[v] ? v : 'pending';
};

// Derive aggregate status based on child task completion vectors
const deriveProjectStatus = (tasks = []) => {
  if (!tasks.length) return 'pending';
  const statuses = tasks.map(t => normaliseStatus(t.status));
  if (statuses.every(s => s === 'completed')) return 'completed';
  if (statuses.some(s => s === 'in_progress' || s === 'completed')) return 'in_progress';
  return 'pending';
};

// Parse unique assigned workspace members across task arrays
const collectMembers = (tasks = []) => {
  const seen = new Set();
  const members = [];
  tasks.forEach(t => (t.users || []).forEach(u => {
    if (!seen.has(u.id)) { seen.add(u.id); members.push(u); }
  }));
  return members;
};

// Grouping Routine: Clones flat backend payload into project-oriented structures
const groupTasksIntoProjects = (tasks = []) => {
  const map = {};
  tasks.forEach(task => {
    // Graceful fallback for orphan tasks or custom IDs
    const pId = task.project_id || 'general'; 
    const pName = task.project_name || (pId === 'general' ? 'General Tasks' : `Project #${pId}`);
    
    if (!map[pId]) {
      map[pId] = {
        id: pId,
        name: pName,
        description: task.project_description || '',
        tasks: []
      };
    }
    map[pId].tasks.push(task);
  });
  return Object.values(map);
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: CARD_BG, height: '100%' }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: alpha(accent, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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

// ─── Task Row ─────────────────────────────────────────────────────────────────
function TaskRow({ task, isAdmin, onDelete }) {
  const key = normaliseStatus(task.status);
  const s   = STATUS_META[key];
  const { Icon } = s;

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
        <Typography variant="body2" sx={{ fontWeight: 600, color: key === 'completed' ? 'text.secondary' : NAVY, textDecoration: key === 'completed' ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {task.title}
        </Typography>
        {task.description && (
          <Typography variant="caption" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
            {task.description}
          </Typography>
        )}
      </Box>
      <Chip
        label={s.label}
        size="small"
        sx={{ bgcolor: s.bg, color: s.color, border: '1px solid', borderColor: s.border, fontWeight: 700, fontSize: '0.6rem', letterSpacing: '0.04em', height: 20, flexShrink: 0, '& .MuiChip-label': { px: 0.75 } }}
      />
      {(task.users || []).length > 0 && (
        <AvatarGroup max={3} sx={{ flexShrink: 0, '& .MuiAvatar-root': { width: 22, height: 22, fontSize: '0.6rem', fontWeight: 700, bgcolor: alpha(ACCENT, 0.15), color: ACCENT, border: `1px solid ${alpha(ACCENT, 0.25)}` } }}>
          {(task.users || []).map(u => <Avatar key={u.id}>{u.name.charAt(0)}</Avatar>)}
        </AvatarGroup>
      )}
      {isAdmin && (
        <Tooltip title="Delete task">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(task); }} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' }, ml: 0.5 }}>
            <DeleteOutlineIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

// ─── Project Card (grid view) ─────────────────────────────────────────────────
function ProjectCard({ project, isAdmin, onDeleteTask }) {
  const [expanded, setExpanded] = useState(false);
  const status  = deriveProjectStatus(project.tasks);
  const s       = STATUS_META[status];
  const members = collectMembers(project.tasks);
  const total   = project.tasks.length;
  const done    = project.tasks.filter(t => normaliseStatus(t.status) === 'completed').length;
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Card elevation={0} sx={{
      border: '1px solid', borderColor: 'divider',
      borderLeft: '4px solid', borderLeftColor: s.color,
      borderRadius: 2, bgcolor: CARD_BG,
      transition: 'box-shadow .15s',
      '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,.08)' },
    }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 0 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flex: 1, pr: 1, minWidth: 0 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: alpha(s.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FolderIcon sx={{ fontSize: 18, color: s.color }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: NAVY, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {project.name}
              </Typography>
              {project.description && (
                <Typography variant="caption" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                  {project.description}
                </Typography>
              )}
            </Box>
          </Box>
          <Chip
            label={s.label}
            size="small"
            sx={{ bgcolor: s.bg, color: s.color, border: '1px solid', borderColor: s.border, fontWeight: 700, fontSize: '0.6rem', height: 22, flexShrink: 0, '& .MuiChip-label': { px: 0.75 } }}
          />
        </Box>

        <Box sx={{ my: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Progress
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: s.color }}>{pct}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={pct}
            sx={{ height: 6, borderRadius: 3, bgcolor: alpha(s.color, 0.1), '& .MuiLinearProgress-bar': { bgcolor: s.color, borderRadius: 3 } }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <TaskAltIcon sx={{ fontSize: 13 }} />{done}/{total} tasks
            </Typography>
            {members.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <PeopleIcon sx={{ fontSize: 13 }} />{members.length} member{members.length !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>
          {members.length > 0 && (
            <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha(ACCENT, 0.15), color: ACCENT, border: `1.5px solid ${alpha(ACCENT, 0.25)}` } }}>
              {members.map(u => <Tooltip key={u.id} title={u.name}><Avatar>{u.name.charAt(0)}</Avatar></Tooltip>)}
            </AvatarGroup>
          )}
        </Box>

        {total > 0 && (
          <>
            <Divider sx={{ mx: -3 }} />
            <Box
              onClick={() => setExpanded(e => !e)}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.25, mx: -3, px: 3, cursor: 'pointer', '&:hover': { bgcolor: SURFACE } }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {expanded ? 'Hide' : 'Show'} Tasks
              </Typography>
              {expanded ? <ExpandLessIcon sx={{ fontSize: 16, color: 'text.secondary' }} /> : <ExpandMoreIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
            </Box>
            <Collapse in={expanded}>
              <Divider sx={{ mx: -3 }} />
              <Box sx={{ mx: -3 }}>
                {project.tasks.map(t => <TaskRow key={t.id} task={t} isAdmin={isAdmin} onDelete={onDeleteTask} />)}
              </Box>
            </Collapse>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Project List Row (list view) ─────────────────────────────────────────────
function ProjectListRow({ project, isAdmin, onDeleteTask }) {
  const [expanded, setExpanded] = useState(false);
  const status  = deriveProjectStatus(project.tasks);
  const s       = STATUS_META[status];
  const members = collectMembers(project.tasks);
  const total   = project.tasks.length;
  const done    = project.tasks.filter(t => normaliseStatus(t.status) === 'completed').length;
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-of-type': { borderBottom: 'none' } }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 2,
        px: 3, py: 2,
        '&:hover': { bgcolor: SURFACE },
      }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: alpha(s.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FolderIcon sx={{ fontSize: 18, color: s.color }} />
        </Box>

        <Box sx={{ flex: '2 1 200px', minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: NAVY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {project.name}
          </Typography>
          {project.description && (
            <Typography variant="caption" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
              {project.description}
            </Typography>
          )}
        </Box>

        <Box sx={{ flex: '0 0 100px', display: { xs: 'none', sm: 'block' } }}>
          <Chip label={s.label} size="small" sx={{ bgcolor: s.bg, color: s.color, border: '1px solid', borderColor: s.border, fontWeight: 700, fontSize: '0.6rem', height: 22, '& .MuiChip-label': { px: 0.75 } }} />
        </Box>

        <Box sx={{ flex: '1 1 120px', display: { xs: 'none', md: 'block' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ flex: 1, height: 5, borderRadius: 3, bgcolor: alpha(s.color, 0.1), overflow: 'hidden' }}>
              <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: s.color, borderRadius: 3 }} />
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: s.color, minWidth: 28 }}>{pct}%</Typography>
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ flex: '0 0 70px', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
          {done}/{total} tasks
        </Typography>

        {members.length > 0 && (
          <AvatarGroup max={3} sx={{ flexShrink: 0, display: { xs: 'none', lg: 'flex' }, '& .MuiAvatar-root': { width: 22, height: 22, fontSize: '0.6rem', fontWeight: 700, bgcolor: alpha(ACCENT, 0.15), color: ACCENT, border: `1px solid ${alpha(ACCENT, 0.25)}` } }}>
            {members.map(u => <Tooltip key={u.id} title={u.name}><Avatar>{u.name.charAt(0)}</Avatar></Tooltip>)}
          </AvatarGroup>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          {total > 0 && (
            <Tooltip title={expanded ? 'Collapse' : 'Expand tasks'}>
              <IconButton size="small" onClick={() => setExpanded(e => !e)} sx={{ color: 'text.secondary' }}>
                {expanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ bgcolor: SURFACE, borderTop: '1px solid', borderColor: 'divider' }}>
          {project.tasks.map(t => <TaskRow key={t.id} task={t} isAdmin={isAdmin} onDelete={onDeleteTask} />)}
        </Box>
      </Collapse>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProjectsPage({ isAdmin = false }) {
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const [search, setSearch]       = useState('');
  const [statusFilter, setFilter] = useState('all');
  const [sortBy, setSortBy]       = useState('name');
  const [sortDir, setSortDir]     = useState('asc');
  const [viewMode, setViewMode]   = useState('grid');

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [targetTask, setTargetTask] = useState(null);
  const [deleting, setDeleting]     = useState(false);

  const token = localStorage.getItem('token');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/tasks', axiosConfig);
      // Fallback handlers if backend wraps payloads inside res.data.tasks or an unmapped envelope
      const rawPayload = Array.isArray(res.data) ? res.data : (res.data.tasks || []);
      setTasks(rawPayload);
    } catch {
      setError('Failed to load system workspace tasks. Verify network endpoints.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteTask = (task) => { setTargetTask(task); setDeleteOpen(true); };

  const executeDeleteTask = async () => {
    if (!targetTask) return;
    setDeleting(true);
    try {
      await axios.delete(`http://127.0.0.1:8000/api/tasks/${targetTask.id}`, axiosConfig);
      setSuccess(`Task "${targetTask.title}" processed state termination.`);
      setTasks(prev => prev.filter(t => t.id !== targetTask.id));
    } catch {
      setError('Failed execution parameters while purging tasks context.');
    } finally {
      setDeleting(false); setDeleteOpen(false); setTargetTask(null);
    }
  };

  // Convert raw payload list dynamically into nested Project Directory views
  const projects = useMemo(() => groupTasksIntoProjects(tasks), [tasks]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total     = projects.length;
    const completed = projects.filter(p => deriveProjectStatus(p.tasks) === 'completed').length;
    const active    = projects.filter(p => deriveProjectStatus(p.tasks) === 'in_progress').length;
    const taskTotal = tasks.length;
    return { total, completed, active, taskTotal };
  }, [projects, tasks]);

  // ── Filtered + sorted ─────────────────────────────────────────────────────
  const filteredProjects = useMemo(() => {
    let list = [...projects];
    if (search) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(search.toLowerCase()) ||
        p.tasks.some(t => t.title.toLowerCase().includes(search.toLowerCase()))
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter(p => deriveProjectStatus(p.tasks) === statusFilter);
    }
    list.sort((a, b) => {
      if (sortBy === 'name') return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      if (sortBy === 'tasks') {
        const diff = a.tasks.length - b.tasks.length;
        return sortDir === 'asc' ? diff : -diff;
      }
      if (sortBy === 'completion') {
        const pctA = a.tasks.length ? a.tasks.filter(t => normaliseStatus(t.status) === 'completed').length / a.tasks.length : 0;
        const pctB = b.tasks.length ? b.tasks.filter(t => normaliseStatus(t.status) === 'completed').length / b.tasks.length : 0;
        return sortDir === 'asc' ? pctA - pctB : pctB - pctA;
      }
      return 0;
    });
    return list;
  }, [projects, search, statusFilter, sortBy, sortDir]);

  // ── Skeleton Loader Screen Placeholder ────────────────────────────────────
  if (loading) return (
    <Box sx={{ p: 4, maxWidth: 1280, mx: 'auto' }}>
      <Skeleton variant="text" width={220} height={48} sx={{ mb: 3 }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 4 }}>
        {[1,2,3,4].map(i => <Skeleton key={i} variant="rounded" height={80} />)}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2.5 }}>
        {[1,2,3,4,5,6].map(i => <Skeleton key={i} variant="rounded" height={200} />)}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: SURFACE, minHeight: '100vh', boxSizing: 'border-box', maxWidth: 1280, mx: 'auto' }}>

      {/* ── Page header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: NAVY, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Project Directory
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {isAdmin ? 'Manage workspace clusters and task targets' : 'Track ongoing deployment scopes contextually'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              size="small"
              sx={{ bgcolor: NAVY, color: '#fff', fontWeight: 700, textTransform: 'none', borderRadius: 1.5, boxShadow: 'none', '&:hover': { bgcolor: NAVY3 }, px: 2 }}
            >
              New Task
            </Button>
          )}
          <Tooltip title="Refresh Directory">
            <IconButton onClick={fetchTasks} sx={{ color: 'text.secondary', border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ── Alerts ── */}
      {error   && <Alert severity="error"   onClose={() => setError('')}   sx={{ mb: 2.5, borderRadius: 1.5 }}>{error}</Alert>}
      {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2.5, borderRadius: 1.5 }}>{success}</Alert>}

      {/* ── Stat cards ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mb: 3.5 }}>
        <StatCard icon={FolderIcon}      label="Workspace Clusters"  value={stats.total}     accent={ACCENT}    />
        <StatCard icon={InProgressIcon}  label="Clusters In Flight"  value={stats.active}    accent="#d97706"   />
        <StatCard icon={CheckCircleIcon} label="Clusters Resolved"   value={stats.completed} accent="#059669"   />
        <StatCard icon={TaskAltIcon}     label="Tasks Tracked"       value={stats.taskTotal} accent={TEAL}      />
      </Box>

      {/* ── Directory Layout Panel ── */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: CARD_BG, overflow: 'hidden' }}>

        <Box sx={{ bgcolor: NAVY, px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FolderIcon sx={{ fontSize: 17, color: TEAL }} />
            <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#fff', letterSpacing: '0.02em' }}>
              Dynamic Task Aggregations
            </Typography>
          </Box>
          <Box sx={{ bgcolor: alpha(TEAL, 0.18), color: TEAL, fontSize: '0.65rem', fontWeight: 700, px: 1.25, py: 0.3, borderRadius: 1, letterSpacing: '0.06em' }}>
            {projects.length} PROJECTS INFERRED
          </Box>
        </Box>

        {/* Dynamic Filters Interface */}
        <Box sx={{ px: 3, py: 2, display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid', borderColor: 'divider', bgcolor: SURFACE }}>
          <TextField
            placeholder="Search tasks or clusters…"
            size="small"
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} /></InputAdornment> }}
            sx={{ flex: '1 1 200px', minWidth: 0 }}
          />

          <ToggleButtonGroup
            value={statusFilter} exclusive
            onChange={(_, v) => v && setFilter(v)}
            size="small"
            sx={{
              flexShrink: 0,
              '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', px: 1.5, py: 0.6, border: '1px solid', borderColor: 'divider', color: 'text.secondary' },
              '& .Mui-selected': { bgcolor: `${NAVY} !important`, color: '#fff !important', borderColor: `${NAVY} !important` },
            }}
          >
            <ToggleButton value="all">All ({stats.total})</ToggleButton>
            <ToggleButton value="pending">Pending</ToggleButton>
            <ToggleButton value="in_progress">Active</ToggleButton>
            <ToggleButton value="completed">Done</ToggleButton>
          </ToggleButtonGroup>

          <FormControl size="small" sx={{ width: 160, flexShrink: 0 }}>
            <Select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <MenuItem value="name">Sort: Project Scope</MenuItem>
              <MenuItem value="tasks">Sort: Loaded Tasks</MenuItem>
              <MenuItem value="completion">Sort: Completion State</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title={sortDir === 'asc' ? 'Ascending Order' : 'Descending Order'}>
            <IconButton
              size="small"
              onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, width: 34, height: 34, flexShrink: 0 }}
            >
              <SortIcon sx={{ fontSize: 16, transform: sortDir === 'desc' ? 'scaleY(-1)' : 'none', transition: 'transform .2s' }} />
            </IconButton>
          </Tooltip>

          <ToggleButtonGroup
            value={viewMode} exclusive
            onChange={(_, v) => v && setViewMode(v)}
            size="small"
            sx={{
              flexShrink: 0,
              '& .MuiToggleButton-root': { border: '1px solid', borderColor: 'divider', px: 1, py: 0.6, color: 'text.secondary' },
              '& .Mui-selected': { bgcolor: `${NAVY} !important`, color: '#fff !important', borderColor: `${NAVY} !important` },
            }}
          >
            <ToggleButton value="grid"><GridViewIcon sx={{ fontSize: 16 }} /></ToggleButton>
            <ToggleButton value="list"><ListViewIcon sx={{ fontSize: 16 }} /></ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ px: 3, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            RETRIEVED {filteredProjects.length} OUT OF {projects.length} WORKSPACE GROUPS
          </Typography>
        </Box>

        {/* Payload Mapping Engines */}
        {filteredProjects.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <FolderOffIcon sx={{ fontSize: 48, color: 'divider', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {projects.length === 0 ? 'Workspace is pristine. Add child actions to render sets.' : 'No matched parameters inside local memory space.'}
            </Typography>
          </Box>
        ) : viewMode === 'grid' ? (
          <Box sx={{ p: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2.5 }}>
            {filteredProjects.map(p => (
              <ProjectCard key={p.id} project={p} isAdmin={isAdmin} onDeleteTask={confirmDeleteTask} />
            ))}
          </Box>
        ) : (
          <Box>
            {filteredProjects.map(p => (
              <ProjectListRow key={p.id} project={p} isAdmin={isAdmin} onDeleteTask={confirmDeleteTask} />
            ))}
          </Box>
        )}
      </Paper>

      {/* ── Targeted Purge Dialog Subsystem ── */}
      <Dialog
        open={deleteOpen}
        onClose={() => !deleting && setDeleteOpen(false)}
        PaperProps={{ elevation: 0, sx: { border: '1px solid', borderColor: 'divider', borderRadius: 2, maxWidth: 440 } }}
      >
        <DialogTitle sx={{ color: NAVY, fontWeight: 700, pb: 1 }}>Purge Instance Scope?</DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.6 }}>
            Confirm targeted memory erasure pipeline targeting task key:
          </DialogContentText>
          {targetTask && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, my: 2, p: 2, bgcolor: SURFACE, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: alpha(ACCENT, 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TaskAltIcon sx={{ fontSize: 20, color: ACCENT }} />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={700} color={NAVY}>{targetTask.title}</Typography>
                <Typography variant="caption" color="text.secondary">Workspace context tracking parameters</Typography>
              </Box>
            </Box>
          )}
          <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.6 }}>
            State context drop commands bypass restoration flags entirely. Proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleting} sx={{ color: 'text.secondary', fontWeight: 500, textTransform: 'none' }}>
            Abort
          </Button>
          <Button
            onClick={executeDeleteTask} variant="contained" disabled={deleting} autoFocus
            sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' }, color: '#fff', fontWeight: 600, textTransform: 'none', borderRadius: 1.5, boxShadow: 'none' }}
          >
            {deleting ? 'Executing Wipe...' : 'Confirm Disconnect'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}