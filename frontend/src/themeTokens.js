import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  HourglassEmpty as InProgressIcon,
} from '@mui/icons-material';

export const NAVY    = '#1a1f36';
export const NAVY2   = '#252b45';
export const NAVY3   = '#2f3655';
export const ACCENT  = '#6c63ff';
export const TEAL    = '#00d4b4';
export const SURFACE = '#f8f9fc';
export const CARD_BG = '#ffffff';

export const STATUS_MAP = {
  completed:   { label: 'Completed',   color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: CheckCircleIcon, Icon: CheckCircleIcon },
  in_progress: { label: 'In Progress', color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: InProgressIcon, Icon: InProgressIcon },
  pending:     { label: 'Pending',     color: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', icon: PendingIcon, Icon: PendingIcon },
};

export const STATUS_META = STATUS_MAP;

export const normaliseStatus = (s = 'pending') => {
  const v = (s || '').toLowerCase().replace(/-/g, '_');
  return STATUS_MAP[v] ? v : 'pending';
};
