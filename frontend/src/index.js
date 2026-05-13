import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 1. Import MUI Theme tools
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// 2. Import our custom master theme
import theme from './theme';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* ThemeProvider passes our green palette down the tree */}
    <ThemeProvider theme={theme}>
      
      {/* CssBaseline acts like a global CSS reset. It automatically applies our background.default color to the entire browser window! */}
      <CssBaseline />
      
      <App />
      
    </ThemeProvider>
  </React.StrictMode>
);