import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, Button, IconButton, InputAdornment, TextField,
  Skeleton, Tooltip, ToggleButton, ToggleButtonGroup, useTheme, alpha
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FolderOutlined as FolderIcon,
  TaskAlt as TaskAltIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as InProgressIcon,
  GridView as GridViewIcon,
  TableRows as ListViewIcon,
  Sort as SortIcon,
  Add as AddIcon,
  FolderOff as FolderOffIcon,
} from '@mui/icons-material';

import Notification from '../components/Notification';
import StatCard from '../components/StatCard';

// Extracted Project Components
import ProjectCard from '../components/projects/ProjectCard';
import ProjectListRow from '../components/projects/ProjectListRow';
import ProjectCreateDialog from '../components/projects/ProjectCreateDialog';
import TaskAssignmentDialog from '../components/projects/TaskAssignmentDialog';
import TaskDeleteDialog from '../components/projects/TaskDeleteDialog';
import { deriveProjectStatus } from '../components/projects/ProjectUtils';

import { ACCENT, TEAL } from '../themeTokens';

export default function ProjectsPage({ isAdmin = false }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [projects, setProjects]   = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const [openNotif, setOpenNotif]     = useState(false);
  const [notifSeverity, setNotifSeverity] = useState('info');

  const [search, setSearch]       = useState('');
  const [viewMode, setViewMode]   = useState('grid');
  const [sortBy, setSortBy]       = useState('name');
  const [sortDir, setSortDir]     = useState('asc');

  // Creation State
  const [createOpen, setCreateOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // Assignment Edit State
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [editTargetTask, setEditTargetTask] = useState(null);
  const [editSelectedUsers, setEditSelectedUsers] = useState([]);
  const [updatingAssignment, setUpdatingAssignment] = useState(false);

  // Deletion State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [targetTask, setTargetTask] = useState(null);
  const [deleting, setDeleting]     = useState(false);

  const token = localStorage.getItem('token');
  const axiosConfig = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  useEffect(() => { fetchWorkspace(); }, []);

  const fetchWorkspace = async () => {
    setLoading(true);
    setError('');
    try {
      const requests = [
        axios.get('http://127.0.0.1:8000/api/projects', axiosConfig),
        axios.get('http://127.0.0.1:8000/api/tasks', axiosConfig)
      ];

      if (isAdmin) {
        requests.push(axios.get('http://127.0.0.1:8000/api/users', axiosConfig));
      }

      const [pRes, tRes, uRes] = await Promise.all(requests);
      
      const projectList = pRes.data.projects || [];
      const globalTasks = tRes.data.tasks || [];

      if (isAdmin && uRes) {
        setEmployees(uRes.data.users || []);
      }

      const enrichedProjects = projectList.map(p => ({
        ...p,
        tasks: globalTasks.filter(t => t.project_id === p.id)
      }));

      setProjects(enrichedProjects);
    } catch {
      setError('Failed to load system workspace. Verify network endpoints.');
      setNotifSeverity('error');
      setOpenNotif(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = useMemo(() => {
    let list = projects.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase())
    );
    list.sort((a, b) => {
      const aVal = sortBy === 'name' ? a.name : a.tasks.length;
      const bVal = sortBy === 'name' ? b.name : b.tasks.length;
      if (typeof aVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return list;
  }, [projects, search, sortBy, sortDir]);

  const stats = useMemo(() => {
    const allTasks = projects.flatMap(p => p.tasks);
    return {
      total: projects.length,
      active: projects.filter(p => deriveProjectStatus(p.tasks) === 'in_progress').length,
      done: projects.filter(p => deriveProjectStatus(p.tasks) === 'completed').length,
      tasks: allTasks.length
    };
  }, [projects]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/projects', {
        name: newProjectName,
        description: newProjectDesc
      }, axiosConfig);
      setSuccess(`Project "${newProjectName}" initialized successfully.`);
      setNotifSeverity('success');
      setOpenNotif(true);
      setCreateOpen(false);
      setNewProjectName('');
      setNewProjectDesc('');
      fetchWorkspace();
    } catch {
      setError('Failed to provision new project cluster.');
      setNotifSeverity('error');
      setOpenNotif(true);
    } finally {
      setCreating(false);
    }
  };

  const handleOpenAssignmentModal = (task) => {
    setEditTargetTask(task);
    setEditSelectedUsers((task.users || []).map(u => u.id));
    setAssignmentOpen(true);
  };

  const handleUpdateAssignment = async () => {
    if (!editTargetTask) return;
    setUpdatingAssignment(true);
    try {
      await axios.patch(`http://127.0.0.1:8000/api/tasks/${editTargetTask.id}/assignment`, {
        user_ids: editSelectedUsers
      }, axiosConfig);
      setSuccess(`Assignments for "${editTargetTask.title}" updated successfully.`);
      setNotifSeverity('success');
      setOpenNotif(true);
      setAssignmentOpen(false);
      fetchWorkspace();
    } catch {
      setError('Failed to update task assignments.');
      setNotifSeverity('error');
      setOpenNotif(true);
    } finally {
      setUpdatingAssignment(false);
    }
  };

  const confirmDeleteTask = (task) => { setTargetTask(task); setDeleteOpen(true); };

  const handlePickup = async (task) => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/tasks/${task.id}/pickup`, {}, axiosConfig);
      setSuccess(`Task "${task.title}" claimed successfully.`);
      setNotifSeverity('success');
      setOpenNotif(true);
      fetchWorkspace();
    } catch {
      setError('Failed to claim task. It might already be fully assigned.');
      setNotifSeverity('error');
      setOpenNotif(true);
    }
  };

  const executeDeleteTask = async () => {
    if (!targetTask) return;
    setDeleting(true);
    try {
      await axios.delete(`http://127.0.0.1:8000/api/tasks/${targetTask.id}`, axiosConfig);
      setSuccess(`Task "${targetTask.title}" processed state termination.`);
      setNotifSeverity('success');
      setOpenNotif(true);
      fetchWorkspace();
    } catch {
      setError('Failed execution parameters while purging tasks context.');
      setNotifSeverity('error');
      setOpenNotif(true);
    } finally {
      setDeleting(false); setDeleteOpen(false); setTargetTask(null);
    }
  };

  if (loading) return (
    <Box sx={{ p: 4, maxWidth: 1280, mx: 'auto' }}>
      <Skeleton variant="text" width={240} height={48} sx={{ mb: 3 }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
        {[1,2,3,4].map(i => <Skeleton key={i} variant="rounded" height={80} />)}
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
        {[1,2,3].map(i => <Skeleton key={i} variant="rounded" height={300} />)}
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
            Project Directory
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Grouped task view by project allocation
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateOpen(true)}
              sx={{ bgcolor: 'primary.main', fontWeight: 600, textTransform: 'none', borderRadius: 1.5 }}
            >
              New Project
            </Button>
          )}
          <Tooltip title="Refresh projects">
            <IconButton
              onClick={fetchWorkspace}
              sx={{ color: 'text.secondary', border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 3.5 }}>
        <StatCard icon={FolderIcon}     label="Total Projects" value={stats.total}  accent={ACCENT}    />
        <StatCard icon={InProgressIcon} label="In Progress"    value={stats.active} accent="#d97706"   />
        <StatCard icon={CheckCircleIcon} label="Completed"      value={stats.done}   accent="#059669"   />
        <StatCard icon={TaskAltIcon}    label="Total Tasks"     value={stats.tasks}  accent={TEAL}      />
      </Box>

      <Paper elevation={0} sx={{
        border: '1px solid', borderColor: 'divider',
        borderRadius: 2, bgcolor: 'background.paper', overflow: 'hidden',
      }}>
        <Box sx={{
          bgcolor: isDark ? alpha('#fff', 0.03) : '#1a1f36', px: 3, py: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FolderIcon sx={{ fontSize: 17, color: TEAL }} />
            <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: isDark ? 'text.primary' : '#fff', letterSpacing: '0.02em' }}>
              Workspace Projects
            </Typography>
          </Box>
          <Box sx={{ bgcolor: alpha(TEAL, 0.18), color: TEAL, fontSize: '0.65rem', fontWeight: 700, px: 1.25, py: 0.3, borderRadius: 1, letterSpacing: '0.06em' }}>
            {projects.length} UNITS
          </Box>
        </Box>

        <Box sx={{
          px: 3, py: 2,
          display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap',
          borderBottom: '1px solid', borderColor: 'divider',
          bgcolor: isDark ? alpha('#fff', 0.01) : '#f8f9fc',
        }}>
          <TextField
            placeholder="Search projects…"
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
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <TextField
              select
              size="small"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              SelectProps={{ native: true }}
              sx={{ width: 160 }}
            >
              <option value="name">Sort: Name</option>
              <option value="tasks">Sort: Task Size</option>
            </TextField>
            <Tooltip title={sortDir === 'asc' ? 'Ascending' : 'Descending'}>
              <IconButton
                size="small"
                onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, width: 34, height: 34 }}
              >
                <SortIcon sx={{ fontSize: 16, transform: sortDir === 'desc' ? 'scaleY(-1)' : 'none', transition: 'transform .2s' }} />
              </IconButton>
            </Tooltip>
          </Box>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, v) => v && setViewMode(v)}
            size="small"
            sx={{
              flexShrink: 0,
              '& .MuiToggleButton-root': { border: '1px solid', borderColor: 'divider', px: 1, py: 0.6, color: 'text.secondary' },
              '& .Mui-selected': { bgcolor: isDark ? 'primary.main' : '#1a1f36', color: isDark ? 'primary.contrastText' : '#fff', borderColor: isDark ? 'primary.main' : '#1a1f36' },
            }}
          >
            <ToggleButton value="grid"><GridViewIcon sx={{ fontSize: 16 }} /></ToggleButton>
            <ToggleButton value="list"><ListViewIcon sx={{ fontSize: 16 }} /></ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ px: 3, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            SHOWING {filteredProjects.length} OF {projects.length} PROJECTS
          </Typography>
        </Box>

        {filteredProjects.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <FolderOffIcon sx={{ fontSize: 48, color: 'divider', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">No projects found.</Typography>
          </Box>
        ) : viewMode === 'grid' ? (
          <Box sx={{ p: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
            {filteredProjects.map(p => (
              <ProjectCard 
                key={p.id} 
                project={p} 
                isAdmin={isAdmin} 
                onDeleteTask={confirmDeleteTask} 
                onEditAssignment={handleOpenAssignmentModal} 
                onPickup={handlePickup}
              />
            ))}
          </Box>
        ) : (
          <Box>
            {filteredProjects.map(p => (
              <ProjectListRow 
                key={p.id} 
                project={p} 
                isAdmin={isAdmin} 
                onDeleteTask={confirmDeleteTask} 
                onEditAssignment={handleOpenAssignmentModal} 
                onPickup={handlePickup}
              />
            ))}
          </Box>
        )}
      </Paper>

      {/* Creation Modal */}
      <ProjectCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        creating={creating}
        onSubmit={handleCreateProject}
        name={newProjectName}
        setName={setNewProjectName}
        description={newProjectDesc}
        setDescription={setNewProjectDesc}
      />

      {/* Assignment Edit Modal */}
      <TaskAssignmentDialog
        open={assignmentOpen}
        onClose={() => setAssignmentOpen(false)}
        updating={updatingAssignment}
        onUpdate={handleUpdateAssignment}
        targetTask={editTargetTask}
        employees={employees}
        selectedUsers={editSelectedUsers}
        setSelectedUsers={setEditSelectedUsers}
      />

      {/* Deletion Confirm Modal */}
      <TaskDeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        deleting={deleting}
        onConfirm={executeDeleteTask}
        targetTask={targetTask}
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
