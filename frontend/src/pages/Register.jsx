import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import Material UI components for a clean, unified structure
import { Box, TextField, Button, Typography, Paper, Stack } from '@mui/material';
import { 
  AssignmentTurnedIn as TaskIcon, 
  Groups as TeamIcon, 
  Bolt as SpeedIcon, 
  Shield as SecurityIcon 
} from '@mui/icons-material';
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
      localStorage.setItem('userId', user.id);

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

  const features = [
    {
      icon: <TaskIcon sx={{ fontSize: 32 }} />,
      title: 'Precision Task Engine',
      description: 'Deploy and monitor complex directives with surgical accuracy across your entire organization.'
    },
    {
      icon: <TeamIcon sx={{ fontSize: 32 }} />,
      title: 'Personnel Roster',
      description: 'Maintain high-fidelity oversight of your global workforce and their active workload status.'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 32 }} />,
      title: 'Optimistic Workflows',
      description: 'Experience zero-latency state transitions with our advanced frontend synchronization engine.'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 32 }} />,
      title: 'Enterprise Security',
      description: 'Robust RBAC systems ensuring every node operates strictly within its designated scope.'
    }
  ];

  return (
    // Unified soft slate canvas
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default', px: 2 }}>
      
      {/* Split-view container with integrated branding and registration nodes */}
      <Paper 
        elevation={0} 
        sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          width: '100%', 
          maxWidth: 1000, 
          minHeight: 650,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        {/* Left Section: Feature Branding (Consistent with Login) */}
        <Box 
          sx={{ 
            flex: 1, 
            bgcolor: 'primary.main', 
            color: 'white', 
            p: { xs: 4, md: 6 },
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.03em' }}>
            Workload Manager
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 6 }}>
            The definitive platform for enterprise resource coordination.
          </Typography>

          <Stack spacing={4}>
            {features.map((feature, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box sx={{ color: 'secondary.main', mt: 0.5 }}>
                  {feature.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>
                    {feature.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
          </Box>

          {/* Right Section: Authentication Form */}
        <Box 
          sx={{ 
            flex: 1, 
            p: { xs: 4, sm: 6, md: 8 }, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            bgcolor: 'background.paper'
          }}
        >
          {/* Mobile branding header */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
              Workload Manager
            </Typography>
          </Box>

          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              fontWeight: 700, 
              color: 'text.primary',
              letterSpacing: '-0.02em',
              mb: 1
            }}
          >
            Initialize Account
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
            Create your profile to join the enterprise network.
          </Typography>

          <form onSubmit={handleRegister}>
            <TextField
              label="Full Name"
              type="text"
              fullWidth
              required
              margin="dense"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />

            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              margin="dense"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              margin="dense"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              helperText="Minimum 8 characters required."
            />

            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              required
              margin="dense"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 4, mb: 2, py: 1.5, fontSize: '1rem' }}
            >
              {loading ? 'Provisioning...' : 'Register Node'}
            </Button>

            <Button 
              variant="text" 
              fullWidth 
              onClick={() => navigate('/login')}
              sx={{ color: 'text.secondary', fontWeight: 500, '&:hover': { color: 'text.primary', bgcolor: 'transparent' } }}
            >
              Already have an account? Sign In
            </Button>
          </form>
        </Box>
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