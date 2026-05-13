import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Import MUI layout, icon, and styling components
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); 

  const userRole = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  // Keep authentication layout isolation perfectly intact
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null; 
  }

  return (
    // 1. MINIMALIST SURFACE: Zero shadow, pure white background, crisp 1px bottom divider
    <AppBar 
      position="static" 
      elevation={0} 
      sx={{ 
        bgcolor: 'background.paper', 
        borderBottom: '1px solid',
        borderColor: 'divider',
        mb: 4 
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 4 } }}>
        
        {/* Crisp, sophisticated branding header */}
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 700, 
            color: 'text.primary',
            letterSpacing: '-0.01em'
          }}
        >
          Workload Manager
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          
          {/* 2. MUTED METADATA BADGE: Soft background, 1px outline, distinct but not loud */}
          <Typography 
            variant="caption" 
            sx={{ 
              bgcolor: 'background.default', 
              color: 'text.secondary',
              border: '1px solid',
              borderColor: 'divider',
              px: 1.5, 
              py: 0.5, 
              borderRadius: 1.5, 
              textTransform: 'uppercase', 
              fontWeight: 600,
              letterSpacing: '0.05em'
            }}
          >
            Role: {userRole}
          </Typography>

          {/* Muted action navigation utilizing subtle text tokens */}
          <Button 
            sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'transparent' } }} 
            startIcon={<AccountCircleIcon sx={{ fontSize: 18 }} />}
            onClick={() => navigate('/profile')}
          >
            Profile
          </Button>

          {location.pathname === '/profile' && (
            <Button 
              sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'transparent' } }} 
              onClick={() => navigate(userRole === 'admin' ? '/admin' : '/employee')}
            >
              Dashboard
            </Button>
          )}

          {/* Clean, separated destructive action */}
          <Button 
            sx={{ 
              color: 'text.secondary', 
              borderLeft: '1px solid', 
              borderColor: 'divider', 
              pl: 2, 
              ml: 0.5,
              borderRadius: 0,
              '&:hover': { color: 'error.main', bgcolor: 'transparent' } 
            }} 
            startIcon={<LogoutIcon sx={{ fontSize: 18 }} />} 
            onClick={handleLogout}
          >
            Logout
          </Button>

        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;