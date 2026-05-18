/**
 * Navbar.jsx — Side Drawer Navigation (MUI 7)
 *
 * Parent layout must be a flex container:
 * <Box sx={{ display: 'flex', minHeight: '100vh' }}>
 * <Navbar />
 * <Box component="main" sx={{ flexGrow: 1, overflow: 'auto' }}>
 * ...routes...
 * </Box>
 * </Box>
 */

import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Avatar,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Switch,
} from '@mui/material';

import DashboardRoundedIcon          from '@mui/icons-material/DashboardRounded';
// ... (rest of icons)
import AssignmentRoundedIcon         from '@mui/icons-material/AssignmentRounded';
import CalendarMonthRoundedIcon      from '@mui/icons-material/CalendarMonthRounded';
import BarChartRoundedIcon           from '@mui/icons-material/BarChartRounded';
import AccountCircleRoundedIcon      from '@mui/icons-material/AccountCircleRounded';
import SettingsRoundedIcon           from '@mui/icons-material/SettingsRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import LogoutRoundedIcon             from '@mui/icons-material/LogoutRounded';
import ChevronLeftRoundedIcon        from '@mui/icons-material/ChevronLeftRounded';
import MenuRoundedIcon               from '@mui/icons-material/MenuRounded';
import PeopleRoundedIcon             from '@mui/icons-material/PeopleRounded';
import FolderRoundedIcon             from '@mui/icons-material/FolderRounded';
import NotificationsRoundedIcon      from '@mui/icons-material/NotificationsRounded';
import LightModeRoundedIcon          from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon           from '@mui/icons-material/DarkModeRounded';

import { ColorModeContext } from '../App';

// ─── Constants ────────────────────────────────────────────────────────────────

export const DRAWER_OPEN_WIDTH   = 200;
export const DRAWER_CLOSED_WIDTH = 68;

const getTokens = (mode, theme) => ({
  bg:           mode === 'light' ? '#0C0E13' : theme.palette.background.paper,
  bgItem:       'rgba(255,255,255,0.04)',
  bgHover:      'rgba(255,255,255,0.06)',
  bgActive:     'rgba(99,102,241,0.13)',
  accent:       '#818CF8',
  accentBorder: '#6366F1',
  accentMuted:  'rgba(99,102,241,0.35)',
  avatarBg:     '#1E1B4B',
  textPrimary:  '#EEF2FF',
  textSecondary:'#fbfbfb',
  textMuted:    '#374151',
  divider:      'rgba(255,255,255,0.06)',
  logoutHover:  'rgba(239,68,68,0.10)',
  logoutText:   '#FCA5A5',
  transition:   'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
});

// ─── Nav structure ────────────────────────────────────────────────────────────

const buildCategories = (userRole, themeMode, toggleTheme) => [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        icon: <DashboardRoundedIcon />,
        path: userRole === 'admin' ? '/admin' : '/employee',
      },
      { label: 'Projects', icon: <FolderRoundedIcon />, path: '/projects' },
    ],
  },
  ...(userRole === 'admin'
    ? [{
        label: 'Management',
        items: [
          { label: 'Team',     icon: <PeopleRoundedIcon />, path: '/team' },
        ],
      }]
    : []),
  {
    label: 'Preference',
    items: [
      {
        label: themeMode === 'light' ? 'Light Mode' : 'Dark Mode',
        icon: themeMode === 'light' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />,
        action: toggleTheme,
        isToggle: true,
      },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Settings', icon: <SettingsRoundedIcon />,      path: '/settings' },
    ],
  },
];

// ─── NavItem ──────────────────────────────────────────────────────────────────

function NavItem({ item, isOpen, isActive, onClick, T, themeMode }) {
  const button = (
    <ListItemButton
      onClick={onClick}
      sx={{
        mr: 1, ml: 0,
        borderRadius: '0px 10px 10px 0px',
        mb: '2px',
        px: isOpen ? 1.5 : 0,
        py: '7px',
        minHeight: 38,
        justifyContent: isOpen ? 'flex-start' : 'center',
        bgcolor:    isActive ? T.bgActive    : 'transparent',
        color:      isActive ? T.textPrimary : T.textSecondary,
        borderLeft: isActive ? `2px solid ${T.accentBorder}` : '2px solid transparent',
        '&:hover':  { bgcolor: isActive ? T.bgActive : T.bgHover },
        transition: T.transition,
      }}
    >
      <ListItemIcon sx={{
        minWidth: 0, mr: isOpen ? 1.5 : 0,
        color: isActive ? T.accent : T.textSecondary,
        justifyContent: 'center',
        '& svg': { fontSize: 18 },
        transition: T.transition,
      }}>
        {item.icon}
      </ListItemIcon>
      {isOpen && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', minWidth: 0 }}>
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontSize: 13, fontWeight: isActive ? 600 : 400,
              color: T.textPrimary, letterSpacing: '-0.01em', whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis'
            }}
          />
          {item.isToggle && (
            <Switch 
              size="small" 
              checked={themeMode === 'dark'} 
              sx={{ 
                '& .MuiSwitch-switchBase': { color: '#94a3b8' },
                '& .MuiSwitch-switchBase.Mui-checked': { color: T.accent },
                '& .MuiSwitch-track': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            />
          )}
        </Box>
      )}
    </ListItemButton>
  );

  return isOpen ? (
    <ListItem disablePadding>{button}</ListItem>
  ) : (
    <Tooltip title={item.label} placement="right" arrow>
      <ListItem disablePadding sx={{ justifyContent: 'center' }}>{button}</ListItem>
    </Tooltip>
  );
}

// ─── Category label ───────────────────────────────────────────────────────────

function CategoryLabel({ label, isOpen, showDivider, T }) {
  if (!isOpen) return showDivider
    ? <Divider sx={{ mx: 1.5, my: 0.75, borderColor: T.divider }} />
    : null;
  return (
    <Typography sx={{
      fontSize: 9.5, fontWeight: 700, color: T.textPrimary,
      textTransform: 'uppercase', letterSpacing: '0.1em',
      px: 2.5, pt: 1.5, pb: 0.5,
    }}>
      {label}
    </Typography>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const T = getTokens(theme.palette.mode, theme);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [isOpen,     setIsOpen]     = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarUrl,  setAvatarUrl]  = useState('');
  const [imgError,   setImgError]   = useState(false);
  const [userId,     setUserId]     = useState(null);

  const userRole = localStorage.getItem('role')     || 'Pending';
  const username = localStorage.getItem('username') || 'User';
  const token = localStorage.getItem('token');

  const initials = username
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    setAvatarUrl('');
    setImgError(false);
    setUserId(null);       
  }, [token]);

  const fetchUserData = useCallback(async () => {
    if (!token) return;
    const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const meRes = await axios.get('http://127.0.0.1:8000/api/me', axiosConfig);
      const currentUserId = meRes.data.id;
      setUserId(currentUserId);

      const profileRes = await axios.get(
        `http://127.0.0.1:8000/api/profile/${currentUserId}`,
        axiosConfig,
      );

      if (profileRes.data.avatar_url) {
        setAvatarUrl(profileRes.data.avatar_url);
        setImgError(false);
      }
    } catch {
    }
  }, [token]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'token') {
        fetchUserData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchUserData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  if (location.pathname === '/login' || location.pathname === '/register') return null;

  const categories  = buildCategories(userRole, theme.palette.mode, colorMode.toggleColorMode);
  const drawerWidth = isMobile ? DRAWER_OPEN_WIDTH : (isOpen ? DRAWER_OPEN_WIDTH : DRAWER_CLOSED_WIDTH);
  const showImage   = Boolean(avatarUrl) && !imgError;

  const drawerContent = (
    <>
      {/* ── Header ── */}
      <Box sx={{
        display: 'flex', alignItems: 'center',
        justifyContent: (isOpen || isMobile) ? 'space-between' : 'center',
        px: (isOpen || isMobile) ? 2 : 0, height: 56,
        borderBottom: `1px solid ${T.divider}`, flexShrink: 0,
      }}>
        {(isOpen || isMobile) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 26, height: 26, borderRadius: '7px', flexShrink: 0,
              background: `linear-gradient(135deg, ${T.accentBorder} 0%, #4338CA 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#fff', lineHeight: 1 }}>W</Typography>
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: T.textPrimary, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              Workload Manager
            </Typography>
          </Box>
        )}
        {!isMobile ? (
          <IconButton
            onClick={() => setIsOpen((v) => !v)} size="small"
            sx={{ color: T.textSecondary, borderRadius: '8px', width: 32, height: 32, '&:hover': { color: T.textPrimary, bgcolor: T.bgHover } }}
          >
            {isOpen ? <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} /> : <MenuRoundedIcon sx={{ fontSize: 18 }} />}
          </IconButton>
        ) : (
          <IconButton
            onClick={() => setMobileOpen(false)} size="small"
            sx={{ color: T.textSecondary, borderRadius: '8px', width: 32, height: 32, '&:hover': { color: T.textPrimary, bgcolor: T.bgHover } }}
          >
            <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>

      {/* ── User block ── */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: (isOpen || isMobile) ? 1.75 : 0, py: 1.25,
        justifyContent: (isOpen || isMobile) ? 'flex-start' : 'center',
        borderBottom: `1px solid ${T.divider}`, flexShrink: 0,
      }}>
        <Avatar
          src={showImage ? avatarUrl : undefined}
          imgProps={{
            onError: () => setImgError(true),
            referrerPolicy: 'no-referrer',
          }}
          sx={{
            width: 32, height: 32,
            bgcolor: T.avatarBg, color: T.accent,
            fontSize: 11, fontWeight: 700, flexShrink: 0,
            border: `1px solid ${T.accentMuted}`,
            '& img': { objectFit: 'cover' },
          }}
        >
          {!showImage && initials}
        </Avatar>

        {(isOpen || isMobile) && (
          <Box sx={{ overflow: 'hidden' }}>
            <Typography noWrap sx={{ fontSize: 12.5, fontWeight: 600, color: T.textPrimary, lineHeight: 1.3 }}>
              {username}
            </Typography>
            <Typography sx={{ fontSize: 9.5, color: T.accent, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              {userRole}
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Nav categories ── */}
      <Box sx={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1,
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: T.divider, borderRadius: 4 },
      }}>
        {categories.map((cat, idx) => (
          <Box key={cat.label}>
            <CategoryLabel label={cat.label} isOpen={isOpen || isMobile} showDivider={idx > 0} T={T} />
            <List disablePadding>
              {cat.items.map((item) => (
                <NavItem
                  key={item.path || item.label} item={item} isOpen={isOpen || isMobile}
                  isActive={location.pathname === item.path}
                  onClick={() => {
                    if (item.action) item.action();
                    else {
                      navigate(item.path);
                      if (isMobile) setMobileOpen(false);
                    }
                  }}
                  T={T}
                  themeMode={theme.palette.mode}
                />
              ))}
            </List>
          </Box>
        ))}
      </Box>

      {/* ── Logout footer ── */}
      <Box sx={{ borderTop: `1px solid ${T.divider}`, p: 1, flexShrink: 0 }}>
        {(isOpen || isMobile) ? (
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: '10px', px: 1.5, py: '7px', color: T.textSecondary,
              '&:hover': { bgcolor: T.logoutHover, color: T.logoutText, '& .logout-icon': { color: T.logoutText } },
              transition: T.transition,
            }}
          >
            <ListItemIcon className="logout-icon" sx={{ minWidth: 0, mr: 1.5, color: 'inherit', '& svg': { fontSize: 18 }, transition: T.transition }}>
              <LogoutRoundedIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 13, fontWeight: 400, letterSpacing: '-0.01em' }} />
          </ListItemButton>
        ) : (
          <Tooltip title="Logout" placement="right" arrow>
            <ListItemButton
              onClick={handleLogout}
              sx={{ borderRadius: '10px', justifyContent: 'center', py: '7px', color: T.textSecondary, '&:hover': { bgcolor: T.logoutHover, color: T.logoutText }, transition: T.transition }}
            >
              <LogoutRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemButton>
          </Tooltip>
        )}
      </Box>
    </>
  );

  return (
    <>
      {isMobile && (
        <AppBar 
          position="fixed" 
          elevation={0}
          sx={{ 
            display: { md: 'none' }, 
            bgcolor: theme.palette.mode === 'light' ? '#fff' : '#0f172a',
            borderBottom: `1px solid ${theme.palette.divider}`,
            color: theme.palette.text.primary,
          }}
        >
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: 56 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: 26, height: 26, borderRadius: '7px',
                background: `linear-gradient(135deg, ${T.accentBorder} 0%, #4338CA 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>W</Typography>
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Workload Manager</Typography>
            </Box>
            <IconButton onClick={() => setMobileOpen(true)} color="inherit">
              <MenuRoundedIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: isMobile ? 0 : drawerWidth,
          flexShrink: 0,
          transition: T.transition,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: T.bg,
            border: 'none',
            overflowX: 'hidden',
            borderRadius: isMobile ? 0 : '0 12px 12px 0',
            overflowY: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: `width 0.22s cubic-bezier(0.4, 0, 0.2, 1)`,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

export default Navbar;