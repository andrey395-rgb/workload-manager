import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import Material UI components for a clean, unified structure
import { Box, TextField, Button, Typography, Paper } from '@mui/material';
import Notification from '../components/Notification';
import WelcomeOverlay from '../components/WelcomeOverlay';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);

  // Welcome state
  const [showWelcome, setShowWelcome] = useState(false);
  const [targetRole, setTargetRole] = useState('');

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your entries.');
      setOpenNotif(true);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/register', {
        name: name,
        email: email,
        password: password,
      });

      const { token, role, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', user.name);

      setTargetRole(role);
      setShowWelcome(true);

    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrorMessage('Validation rejected: Email is already assigned or password constraints failed.');
      } else {
        setErrorMessage('Connection failed. Ensure the target server link is established.');
      }
      setOpenNotif(true);
    } finally {
      setLoading(false);
    }
  };

  const handleWelcomeFinish = () => {
    if (targetRole === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/employee', { replace: true });
    }
  };

  if (showWelcome) {
    return <WelcomeOverlay username={name} onFinish={handleWelcomeFinish} />;
  }

  return (
    // Unified soft slate canvas
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default', px: 2 }}>
      
      {/* Uncompromised surface flatness: zero shadow, strict 1px border profile */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 3, sm: 5 }, 
          width: '100%', 
          maxWidth: 450, 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2 
        }}
      >
        
        {/* Primary action alignment header */}
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
          Initialize Account
        </Typography>

        <form onSubmit={handleRegister}>
          
          <TextField
            label="Full Name"
            type="text"
            fullWidth
            required
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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
            helperText="Minimum 8 characters required."
          />

          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            required
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ mt: 4, mb: 2, py: 1.5 }}
          >
            {loading ? 'Provisioning Allocation...' : 'Register Node'}
          </Button>

          <Button 
            variant="text" 
            fullWidth 
            onClick={() => navigate('/login')}
            sx={{ color: 'text.secondary', fontWeight: 500, '&:hover': { color: 'text.primary', bgcolor: 'transparent' } }}
          >
            Existing account login
          </Button>

        </form>
      </Paper>

      <Notification 
        open={openNotif} 
        message={errorMessage} 
        severity="error" 
        onClose={() => setOpenNotif(false)} 
      />
    </Box>
  );
}

export default Register;