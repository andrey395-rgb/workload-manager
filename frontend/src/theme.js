import { createTheme } from '@mui/material/styles';

/**
 * Workload Manager Dynamic Theme Configuration
 * @param {'light' | 'dark'} mode 
 */
export const getAppTheme = (mode) => createTheme({
  palette: {
    mode,
    
    ...(mode === 'light' ? {
      // LIGHT MODE PALETTE
      primary: {
        main: '#0f172a', 
        light: '#334155',
        dark: '#020617',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#10b981', 
        light: '#34d399',
        dark: '#059669',
        contrastText: '#ffffff',
      },
      background: {
        default: '#f8fafc', 
        paper: '#ffffff',   
      },
      text: {
        primary: '#0f172a',   
        secondary: '#64748b', 
      },
      divider: '#e2e8f0', 
    } : {
      // DARK MODE PALETTE
      primary: {
        main: '#f8fafc', // Soft white for primary actions in dark mode
        light: '#ffffff',
        dark: '#cbd5e1',
        contrastText: '#0f172a',
      },
      secondary: {
        main: '#10b981', // Keep emerald green consistent
        light: '#34d399',
        dark: '#059669',
        contrastText: '#ffffff',
      },
      background: {
        default: '#020617', // Deepest navy for foundational background
        paper: '#0f172a',   // Card/Paper background slightly lighter
      },
      text: {
        primary: '#f8fafc',   // Off-white primary text
        secondary: '#94a3b8', // Muted blue-gray for metadata
      },
      divider: '#1e293b', 
    }),
  },

  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none', 
      fontWeight: 500,
      fontSize: '0.875rem',
    },
  },

  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: 'none',
          border: `1px solid ${mode === 'light' ? '#e2e8f0' : '#1e293b'}`,
          borderRadius: 8,
        },
      },
    },
    
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '6px 16px',
        },
        outlined: {
          borderColor: mode === 'light' ? '#cbd5e1' : '#334155',
          color: mode === 'light' ? '#334155' : '#cbd5e1',
          '&:hover': {
            backgroundColor: mode === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.05)',
            borderColor: mode === 'light' ? '#94a3b8' : '#475569',
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'light' ? '#cbd5e1' : '#334155',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'light' ? '#94a3b8' : '#475569',
          },
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${mode === 'light' ? '#e2e8f0' : '#1e293b'}`,
        },
        indicator: {
          backgroundColor: '#10b981',
          height: 2,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          color: '#64748b',
          '&.Mui-selected': {
            color: mode === 'light' ? '#0f172a' : '#f8fafc',
            fontWeight: 600,
          },
        },
      },
    },
    
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? '#ffffff' : '#0f172a',
          borderBottom: `1px solid ${mode === 'light' ? '#e2e8f0' : '#1e293b'}`,
          color: mode === 'light' ? '#0f172a' : '#f8fafc',
        }
      }
    }
  },
});
