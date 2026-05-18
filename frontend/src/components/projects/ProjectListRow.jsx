import React, { useState } from 'react';
import {
  Box, Typography, Chip, Collapse, Avatar, AvatarGroup, Tooltip, IconButton, alpha
} from '@mui/material';
import {
  FolderOutlined as FolderIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import TaskRow from './TaskRow';
import { ACCENT, STATUS_MAP, normaliseStatus } from '../../themeTokens';
import { deriveProjectStatus, collectMembers } from './ProjectUtils';

const STATUS_META = STATUS_MAP;

function ProjectListRow({ project, isAdmin, onDeleteTask, onEditAssignment, onPickup }) {
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
        '&:hover': { bgcolor: 'background.default' },
      }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: alpha(s.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <FolderIcon sx={{ fontSize: 18, color: s.color }} />
        </Box>

        <Box sx={{ flex: '2 1 200px', minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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

        {/* {members.length > 0 && (
          <AvatarGroup max={3} sx={{ flexShrink: 0, display: { xs: 'none', lg: 'flex' }, '& .MuiAvatar-root': { width: 22, height: 22, fontSize: '0.6rem', fontWeight: 700, bgcolor: alpha(ACCENT, 0.15), color: ACCENT, border: `1.5px solid ${alpha(ACCENT, 0.25)}` } }}>
            {members.map(u => <Tooltip key={u.id} title={u.name}><Avatar src={u.avatar_url}>{u.name.charAt(0)}</Avatar></Tooltip>)}
          </AvatarGroup>
        )} */}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          {(
            <Tooltip title={expanded ? 'Collapse' : 'Expand tasks'}>
              <IconButton size="small" onClick={() => setExpanded(e => !e)} sx={{ color: 'text.secondary' }}>
                {expanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ bgcolor: 'background.default', borderTop: '1px solid', borderColor: 'divider' }}>
          {project.tasks.map(t => <TaskRow key={t.id} task={t} isAdmin={isAdmin} onDelete={onDeleteTask} onEditAssignment={onEditAssignment} onPickup={onPickup} />)}
        </Box>
      </Collapse>
    </Box>
  );
}

export default ProjectListRow;
