import { normaliseStatus } from '../../themeTokens';

export const deriveProjectStatus = (tasks = []) => {
  if (!tasks.length) return 'pending';
  const statuses = tasks.map(t => normaliseStatus(t.status));
  if (statuses.every(s => s === 'completed')) return 'completed';
  if (statuses.some(s => s === 'in_progress' || s === 'completed')) return 'in_progress';
  return 'pending';
};

export const collectMembers = (tasks = []) => {
  const seen = new Set();
  const members = [];
  tasks.forEach(t => (t.users || []).forEach(u => {
    if (!seen.has(u.id)) { seen.add(u.id); members.push(u); }
  }));
  return members;
};
