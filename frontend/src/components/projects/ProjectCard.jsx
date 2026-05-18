import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, LinearProgress, Divider,
  Collapse, Avatar, AvatarGroup, Tooltip, alpha
} from '@mui/material';
import {
  FolderOutlined as FolderIcon,
  TaskAlt as TaskAltIcon,
  People as PeopleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import TaskRow from './TaskRow';
import { ACCENT, STATUS_MAP, normaliseStatus } from '../../themeTokens';
import { deriveProjectStatus, collectMembers } from './ProjectUtils';

const STATUS_META = STATUS_MAP;

function ProjectCard({ project, isAdmin, onDeleteTask, onEditAssignment, onPickup }) {
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
      borderRadius: 2, bgcolor: 'background.paper',
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
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
          {/* {members.length > 0 && (
            <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.65rem', fontWeight: 700, bgcolor: alpha(ACCENT, 0.15), color: ACCENT, border: `1.5px solid ${alpha(ACCENT, 0.25)}` } }}>
              {members.map(u => <Tooltip key={u.id} title={u.name}><Avatar src={u.avatar_url}>{u.name.charAt(0)}</Avatar></Tooltip>)}
            </AvatarGroup>
          )} */}
        </Box>

        {total > 0 && (
          <>
            <Divider sx={{ mx: -3 }} />
            <Box
              onClick={() => setExpanded(e => !e)}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.25, mx: -3, px: 3, cursor: 'pointer', '&:hover': { bgcolor: 'background.default' } }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {expanded ? 'Hide' : 'Show'} Tasks
              </Typography>
              {expanded ? <ExpandLessIcon sx={{ fontSize: 16, color: 'text.secondary' }} /> : <ExpandMoreIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
            </Box>
            <Collapse in={expanded}>
              <Divider sx={{ mx: -3 }} />
              <Box sx={{ mx: -3 }}>
                {project.tasks.map(t => <TaskRow key={t.id} task={t} isAdmin={isAdmin} onDelete={onDeleteTask} onEditAssignment={onEditAssignment} onPickup={onPickup} />)}        
              </Box>
            </Collapse>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default ProjectCard;
