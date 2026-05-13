import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';

// Import comprehensive MUI layout, interactive, and feedback components
import { 
  Box, Typography, Paper, TextField, Button, Alert, 
  Select, MenuItem, InputLabel, FormControl, Chip, 
  Grid, Card, CardContent, Tabs, Tab, List, ListItem, 
  ListItemAvatar, ListItemText, Avatar, IconButton, Divider,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';

// Production icons for personnel management
import { 
  DeleteOutlined as DeleteOutlineIcon, 
  Assignment as AssignmentIcon, 
  Badge as BadgeIcon 
} from '@mui/icons-material';

function AdminDashboard() {
  // 1. Global API & UI Processing State
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Controls which admin workspace panel is visible (0 = Tasks, 1 = Personnel)
  const [activeTab, setActiveTab] = useState(0);

  // 2. State variables for the "Create Task" form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]); 

  // 3. State variables for the Employee Removal Confirmation Modal
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [targetEmployee, setTargetEmployee] = useState(null);
  const [processingDelete, setProcessingDelete] = useState(false);

  const theme = useTheme();
  const token = localStorage.getItem('token');

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const usersRes = await axios.get('http://127.0.0.1:8000/api/users', axiosConfig);
      setEmployees(usersRes.data.users);

      const tasksRes = await axios.get('http://127.0.0.1:8000/api/tasks', axiosConfig);
      setTasks(tasksRes.data.tasks);
    } catch (error) {
      setErrorMessage('Failed to load dashboard synchronization streams. Verify network links.');
    }
  };

  // --- WORKSPACE ACTION A: Create Task ---
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (selectedUsers.length === 0) {
      setErrorMessage('Please assign at least one active employee to this execution token.');
      return;
    }

    try {
      await axios.post('http://127.0.0.1:8000/api/tasks', {
        title: title,
        description: description,
        user_ids: selectedUsers
      }, axiosConfig);

      setSuccessMessage('Task successfully generated and assigned across target nodes!');
      
      setTitle('');
      setDescription('');
      setSelectedUsers([]);

      fetchDashboardData();
    } catch (error) {
      setErrorMessage('Payload rejection: Ensure string constraints and parameter arrays are valid.');
    }
  };

  // --- WORKSPACE ACTION B: Employee Revocation Lifecycle ---
  const confirmRevocation = (employee) => {
    setTargetEmployee(employee);
    setDeleteDialogOpen(true);
  };

  const executeEmployeeRevocation = async () => {
    if (!targetEmployee) return;
    
    setErrorMessage('');
    setSuccessMessage('');
    setProcessingDelete(true);

    try {
      await axios.delete(`http://127.0.0.1:8000/api/users/${targetEmployee.id}`, axiosConfig);
      
      setSuccessMessage(`Access tokens permanently revoked for personnel: ${targetEmployee.name}`);
      
      setEmployees(prev => prev.filter(emp => emp.id !== targetEmployee.id));
      
      setTasks(prevTasks => prevTasks.map(t => ({
        ...t,
        users: t.users ? t.users.filter(u => u.id !== targetEmployee.id) : []
      })));

    } catch (error) {
      setErrorMessage('Revocation error: Failed to drop database record. Ensure credentials match.');
    } finally {
      setProcessingDelete(false);
      setDeleteDialogOpen(false);
      setTargetEmployee(null);
    }
  };

  return (
    // Outer Box relies entirely on the global soft slate background established in theme.js
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: 1200, mx: 'auto' }}>
      
      {/* Master Workspace Header */}
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          fontWeight: 700, 
          color: 'text.primary',
          letterSpacing: '-0.02em',
          mb: 3 
        }}
      >
        Administrative Operations Console
      </Typography>

      {errorMessage && <Alert severity="error" sx={{ mb: 3, borderRadius: 1.5 }}>{errorMessage}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 3, borderRadius: 1.5 }}>{successMessage}</Alert>}

      <Grid container spacing={4}>
        
        {/* LEFT COLUMN: Switchboard Workspace (Tabs for Tasks vs. Personnel) */}
        <Grid item xs={12} md={5}>
          {/* Inherits global border override, completely removing heavy drop shadows */}
          <Paper sx={{ overflow: 'hidden' }}>
            
            {/* Minimalist Switchboard */}
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              sx={{ bgcolor: 'background.paper' }}
            >
              <Tab icon={<AssignmentIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Task Engine" />
              <Tab icon={<BadgeIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Personnel Roster" />
            </Tabs>

            {/* PANEL 0: Task Generation Form */}
            {activeTab === 0 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary', fontSize: '1.1rem' }}>
                  Create & Assign Execution Payload
                </Typography>
                
                <form onSubmit={handleCreateTask}>
                  <TextField
                    label="Task Title"
                    fullWidth
                    required
                    margin="normal"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />

                  <TextField
                    label="Task Description"
                    fullWidth
                    multiline
                    rows={3}
                    margin="normal"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />

                  <FormControl fullWidth margin="normal">
                    <InputLabel id="multi-select-label">Assign Personnel</InputLabel>
                    <Select
                      labelId="multi-select-label"
                      multiple
                      value={selectedUsers}
                      onChange={(e) => setSelectedUsers(e.target.value)}
                      label="Assign Personnel"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((userId) => {
                            const emp = employees.find(e => e.id === userId);
                            return (
                              // Flat, clean outlined chips instead of heavy primary blocks
                              <Chip 
                                key={userId} 
                                label={emp ? emp.name : userId} 
                                size="small"
                                variant="outlined"
                                sx={{ borderColor: 'divider', color: 'text.primary', fontWeight: 500 }} 
                              />
                            );
                          })}
                        </Box>
                      )}
                    >
                      {employees.map((emp) => (
                        <MenuItem key={emp.id} value={emp.id} sx={{ py: 1.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {emp.name} <Typography component="span" variant="caption" color="text.secondary">({emp.email})</Typography>
                          </Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    size="large"
                    sx={{ mt: 3, py: 1.5 }}
                  >
                    Publish Task Payload
                  </Button>
                </form>
              </Box>
            )}

            {/* PANEL 1: Interactive Employee Management Engine */}
            {activeTab === 1 && (
              <Box sx={{ p: 0 }}>
                {/* Clean, minimalist flat header bar replacing saturated blue/green blocks */}
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '1.1rem' }}>
                    Active Resource Accounts
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Destructive personnel revocation management console.
                  </Typography>
                </Box>

                {employees.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                    <Typography variant="body2">No active personnel detected in database streams.</Typography>
                  </Box>
                ) : (
                  <List sx={{ p: 0 }}>
                    {employees.map((emp, index) => (
                      <React.Fragment key={emp.id}>
                        <ListItem
                          secondaryAction={
                            <IconButton 
                              edge="end" 
                              aria-label="delete"
                              onClick={() => confirmRevocation(emp)}
                              sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: 'transparent' } }}
                            >
                              <DeleteOutlineIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                          }
                          sx={{ py: 2, px: 3, '&:hover': { bgcolor: 'background.default' } }}
                        >
                          <ListItemAvatar>
                            {/* Sophisticated muted grayscale avatar fills */}
                            <Avatar sx={{ bgcolor: '#f1f5f9', color: 'text.primary', border: '1px solid', borderColor: 'divider', fontWeight: 600, fontSize: '0.9rem' }}>
                              {emp.name.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={<Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>{emp.name}</Typography>}
                            secondary={<Typography variant="caption" color="text.secondary">{emp.email}</Typography>}
                          />
                        </ListItem>
                        {index < employees.length - 1 && <Divider component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            )}

          </Paper>
        </Grid>

        {/* RIGHT COLUMN: The Live Task Board */}
        <Grid item xs={12} md={7}>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              letterSpacing: '-0.01em',
              mb: 2 
            }}
          >
            Active Execution Roster
          </Typography>

          {tasks.length === 0 ? (
            <Paper elevation={0} sx={{ p: 5, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2">No tasks exist in the database yet. Use the switchboard panel on the left to create one!</Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {tasks.map((task) => (
                <Grid item xs={12} key={task.id}>
                  
                  {/* Clean, flat card layout enforcing border indicators */}
                  <Card 
                    elevation={0} 
                    sx={{ 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderLeft: '4px solid',
                      borderLeftColor: task.status === 'completed' ? 'secondary.main' : 'primary.main',
                      borderRadius: 2,
                    }}
                  >
                    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '1.05rem', lineHeight: 1.3 }}>
                          {task.title}
                        </Typography>
                        
                        {/* Calibrated status pill */}
                        <Chip 
                          label={task.status} 
                          sx={{ 
                            bgcolor: task.status === 'completed' ? '#ecfdf5' : '#f1f5f9',
                            color: task.status === 'completed' ? '#059669' : 'text.primary',
                            border: '1px solid',
                            borderColor: task.status === 'completed' ? '#a7f3d0' : 'divider',
                            textTransform: 'uppercase', 
                            fontWeight: 700, 
                            fontSize: '0.65rem',
                            letterSpacing: '0.05em',
                            height: 22
                          }}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
                        {task.description || 'No description provided.'}
                      </Typography>

                      {/* Displaying assigned employees inside flat containers */}
                      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
                        <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 600, color: 'text.secondary', letterSpacing: '0.05em' }}>
                          ASSIGNED NODES
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {task.users && task.users.length > 0 ? (
                            task.users.map(user => (
                              <Chip 
                                key={user.id} 
                                label={user.name} 
                                size="small" 
                                variant="outlined"
                                sx={{ borderColor: 'divider', color: 'text.primary', fontWeight: 500, bgcolor: 'background.default' }} 
                              />
                            ))
                          ) : (
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              Unassigned / Resource Dropped
                            </Typography>
                          )}
                        </Box>
                      </Box>

                    </CardContent>
                  </Card>

                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

      </Grid>

      {/* --- DESTRUCTIVE SAFETY MODAL: Clean, Flat Overrides --- */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !processingDelete && setDeleteDialogOpen(false)}
        PaperProps={{
          elevation: 0,
          sx: { border: '1px solid', borderColor: 'divider', borderRadius: 2, maxWidth: 450 }
        }}
      >
        <DialogTitle sx={{ color: 'text.primary', fontWeight: 700, pb: 1 }}>
          Confirm Revocation of Account?
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.5 }}>
            You are about to execute a permanent database purge for personnel token: 
            <Typography component="span" sx={{ fontWeight: 600, color: 'text.primary', display: 'block', my: 1 }}>
              {targetEmployee?.name} ({targetEmployee?.email})
            </Typography>
            This action instantly destroys their session tokens, severs their access bridges, and unlinks them from active execution payloads.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={processingDelete} 
            sx={{ color: 'text.secondary', fontWeight: 500 }}
          >
            Abort Operation
          </Button>
          <Button 
            onClick={executeEmployeeRevocation} 
            variant="contained" 
            disabled={processingDelete}
            sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' }, color: 'white' }}
            autoFocus
          >
            {processingDelete ? 'Purging Node...' : 'Revoke Access'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}

export default AdminDashboard;