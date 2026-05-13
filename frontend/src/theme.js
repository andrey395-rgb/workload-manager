import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light', 
    
    // PRIMARY: Reserved strictly for primary conversion actions (Submit, Active Tabs)
    primary: {
      main: '#0f172a', // Highly sophisticated deep slate/black for primary actions
      light: '#334155',
      dark: '#020617',
      contrastText: '#ffffff',
    },
    
    // SECONDARY: Subtle, calibrated brand accents (Production Green, used sparingly)
    secondary: {
      main: '#10b981', // Clean, premium emerald green (not neon)
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },

    // BACKGROUND: Ultra-clean slate foundation
    background: {
      default: '#f8fafc', // Premium soft slate/off-white canvas
      paper: '#ffffff',   // Pure white containers
    },

    // TEXT: Strict hierarchy tokens
    text: {
      primary: '#0f172a',   // Deep slate (softer and more premium than pure #000)
      secondary: '#64748b', // Highly readable muted metadata gray
    },

    // divider acts as our universal 1px structural line
    divider: '#e2e8f0', 
  },

  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    // Elegant headings
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    // Compact, data-dense body text
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none', // Strips tacky ALL CAPS
      fontWeight: 500,
      fontSize: '0.875rem',
    },
  },

  // COMPONENT OVERRIDES: Enforcing the Flat & Crisp philosophy globally
  components: {
    
    // PAPERS & CARDS: Strip shadows entirely, enforce 1px crisp borders
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: 'none', // ZERO drop shadows
          border: '1px solid #e2e8f0', // Premium flat structural separation
          borderRadius: 8, // Modern, controlled corner rhythm
        },
      },
    },
    
    // BUTTONS: Remove default elevation, enforce modern padding
    MuiButton: {
      defaultProps: {
        disableElevation: true, // Flat design priority
      },
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '6px 16px',
        },
        outlined: {
          borderColor: '#cbd5e1',
          color: '#334155',
          '&:hover': {
            backgroundColor: '#f1f5f9',
            borderColor: '#94a3b8',
          },
        },
      },
    },

    // INPUTS: Clean, flat form fields that align perfectly
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#cbd5e1',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#94a3b8',
          },
        },
      },
    },

    // TABS: Clean, minimal navigation bars without heavy backgrounds
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #e2e8f0',
        },
        indicator: {
          backgroundColor: '#10b981', // Emerald indicator
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
            color: '#0f172a',
            fontWeight: 600,
          },
        },
      },
    },

  },
});

export default theme;