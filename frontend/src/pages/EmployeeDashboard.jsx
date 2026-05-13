import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import Material UI components for a flat, clean enterprise layout
import { 
  Box, Typography, Paper, Grid, Card, CardContent, 
  Button, Chip, Alert, CircularProgress 
} from '@mui/material';

import { 
  PlayArrow as PlayArrowIcon, 
  CheckCircle as CheckCircleIcon 
} from '@mui/icons-material';

function EmployeeDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const token = localStorage.getItem('token');

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/tasks/my', axiosConfig);
      setTasks(response.data.tasks);
    } catch (error) {
      setErrorMessage('Failed to load your assigned workload stream. Verify network status.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await axios.patch(`http://127.0.0.1:8000/api/tasks/${taskId}/status`, {
        status: newStatus
      }, axiosConfig);

      setSuccessMessage(`Execution status successfully transitioned to ${newStatus}.`);

      // Optimistic UI update maintaining state synchronicity
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

    } catch (error) {
      if (error.response && error.response.status === 403) {
        setErrorMessage('Authorization fault: Modifying this record requires explicit allocation.');
      } else {
        setErrorMessage('Status update rejected. Please attempt reconciliation.');
      }
    }
  };

  return (
    // Outer canvas explicitly aligned to the global slate base
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1000, mx: 'auto' }}>
      
      {/* Premium typographic alignment */}
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          fontWeight: 700, 
          color: 'text.primary',
          letterSpacing: '-0.02em' 
        }}
      >
        My Work Operations
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 4, fontSize: '0.95rem' }}>
        Track and reconcile operational directives provisioned directly to your account.
      </Typography>

      {errorMessage && <Alert severity="error" sx={{ mb: 3, borderRadius: 1.5 }}>{errorMessage}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 3, borderRadius: 1.5 }}>{successMessage}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress size={36} sx={{ color: 'text.secondary' }} />
        </Box>
      ) : tasks.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', color: 'text.secondary', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2">Your workload allocation queue is currently empty.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {tasks.map((task) => (
            <Grid item xs={12} md={6} key={task.id}>
              
              {/* Uncompromised flat card with absolute 1px divider separation */}
              <Card 
                elevation={0} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderLeft: '3px solid',
                  borderLeftColor: task.status === 'completed' ? '#10b981' : task.status === 'in_progress' ? '#f59e0b' : '#334155',
                  borderRadius: 2,
                  bgcolor: 'background.paper'
                }}
              >
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '1.05rem', lineHeight: 1.3 }}>
                      {task.title}
                    </Typography>

                    {/* Muted, highly intentional status pill */}
                    <Chip 
                      label={task.status} 
                      sx={{ 
                        bgcolor: task.status === 'completed' ? '#ecfdf5' : task.status === 'in_progress' ? '#fef3c7' : '#f1f5f9',
                        color: task.status === 'completed' ? '#059669' : task.status === 'in_progress' ? '#d97706' : 'text.primary',
                        border: '1px solid',
                        borderColor: task.status === 'completed' ? '#a7f3d0' : task.status === 'in_progress' ? '#fde68a' : 'divider',
                        textTransform: 'uppercase', 
                        fontWeight: 700, 
                        fontSize: '0.65rem',
                        letterSpacing: '0.05em',
                        height: 22
                      }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3, lineHeight: 1.6 }}>
                    {task.description || 'No description provided.'}
                  </Typography>

                  {/* Clean, integrated action layout directly above a 1px rule */}
                  <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                    
                    {task.status === 'pending' && (
                      <Button 
                        size="small" 
                        variant="outlined" 
                        startIcon={<PlayArrowIcon sx={{ fontSize: 16 }} />}
                        onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                        sx={{ 
                          borderColor: 'divider', 
                          color: 'text.primary',
                          '&:hover': { borderColor: '#f59e0b', color: '#d97706', bgcolor: '#fffbeb' }
                        }}
                      >
                        Start Directive
                      </Button>
                    )}

                    {task.status === 'in_progress' && (
                      <Button 
                        size="small" 
                        variant="outlined" 
                        startIcon={<CheckCircleIcon sx={{ fontSize: 16 }} />}
                        onClick={() => handleUpdateStatus(task.id, 'completed')}
                        sx={{ 
                          borderColor: 'divider', 
                          color: 'text.primary',
                          '&:hover': { borderColor: '#10b981', color: '#059669', bgcolor: '#ecfdf5' }
                        }}
                      >
                        Reconcile Complete
                      </Button>
                    )}

                    {task.status === 'completed' && (
                      <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5, letterSpacing: '0.02em' }}>
                        <CheckCircleIcon sx={{ fontSize: 16 }} /> Directive Finished
                      </Typography>
                    )}

                  </Box>

                </CardContent>
              </Card>

            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default EmployeeDashboard;