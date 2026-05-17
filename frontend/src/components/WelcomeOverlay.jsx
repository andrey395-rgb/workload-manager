import React, { useEffect, useState } from 'react';
import { Box, Typography, Fade, Grow, Avatar, alpha, useTheme } from '@mui/material';
import { CheckCircle as CheckIcon } from '@mui/icons-material';
import { ACCENT, TEAL } from '../themeTokens';

/**
 * Premium Welcome Overlay
 * @param {string} username - User's name to display
 * @param {function} onFinish - Callback after animation ends
 */
const WelcomeOverlay = ({ username, onFinish }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Stay visible for 2.5 seconds then trigger the exit
    const timer = setTimeout(() => {
      setShow(false);
      // Wait for fade out animation before calling onFinish
      setTimeout(onFinish, 800);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <Fade in={show} timeout={800}>
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        bgcolor: 'background.default',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}>
        
        {/* Animated Background Pulse */}
        <Box sx={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          bgcolor: alpha(ACCENT, 0.03),
          filter: 'blur(80px)',
          animation: 'pulse 4s infinite ease-in-out',
          zIndex: -1,
          '@keyframes pulse': {
            '0%, 100%': { transform: 'scale(1)', opacity: 0.5 },
            '50%': { transform: 'scale(1.2)', opacity: 1 },
          }
        }} />

        <Grow in={show} timeout={1000}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '24px',
              bgcolor: alpha(TEAL, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4,
              border: '1px solid',
              borderColor: alpha(TEAL, 0.2),
            }}>
              <CheckIcon sx={{ fontSize: 40, color: TEAL }} />
            </Box> */}

            <Typography variant="h3" sx={{ 
              fontWeight: 800, 
              color: 'text.primary', 
              letterSpacing: '-0.04em',
              mb: 1.5
            }}>
              Have a productive day,
            </Typography>
            
            <Typography variant="h2" sx={{ 
              fontWeight: 900, 
              color: ACCENT, 
              letterSpacing: '-0.04em',
              textTransform: 'capitalize'
            }}>
              {username || 'User'}
            </Typography>

            <Box sx={{ 
              mt: 6, 
              width: 40, 
              height: 4, 
              borderRadius: 2, 
              bgcolor: 'divider',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                bgcolor: ACCENT,
                width: '100%',
                animation: 'loading 2.5s linear forwards',
                '@keyframes loading': {
                  '0%': { transform: 'translateX(-100%)' },
                  '100%': { transform: 'translateX(0)' }
                }
              }} />
            </Box>
          </Box>
        </Grow>
      </Box>
    </Fade>
  );
};

export default WelcomeOverlay;
