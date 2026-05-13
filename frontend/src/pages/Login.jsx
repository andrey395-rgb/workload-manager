import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import Material UI components for a flat, enterprise-grade interface
import { Box, TextField, Button, Typography, Alert, Paper } from '@mui/material';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login', {
        email: email,
        password: password,
      });

      const { token, role } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/employee');
      }

    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMessage('Invalid email or password. Please verify your credentials.');
      } else {
        setErrorMessage('Connection failed. Ensure the authentication server is active.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // Minimalist flex canvas mapping directly to our cool slate base
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default', px: 2 }}>
      
      {/* Zero shadow, pure white content container defined entirely by a 1px structural border */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 3, sm: 5 }, 
          width: '100%', 
          maxWidth: 400,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2
        }}
      >
        
        {/* Grounded, high-end typography layout */}
        <Typography 
          variant="h5" 
          gutterBottom 
          align="center" 
          sx={{ 
            fontWeight: 700, 
            color: 'text.primary',
            letterSpacing: '-0.02em',
            mb: 3
          }}
        >
          Access Workspace
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 1.5 }}>
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleLogin}>
          
          <TextField
            label="Email Address"
            type="email"
            fullWidth
            required
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Primary conversion trigger pulling the deep primary slate fill */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            {loading ? 'Authenticating Token...' : 'Sign In'}
          </Button>

          {/* Muted secondary gateway */}
          <Button 
            variant="text" 
            fullWidth 
            onClick={() => navigate('/register')}
            sx={{ color: 'text.secondary', fontWeight: 500, '&:hover': { color: 'text.primary', bgcolor: 'transparent' } }}
          >
            Create a new account
          </Button>

        </form>
      </Paper>
    </Box>
  );
}

export default Login;