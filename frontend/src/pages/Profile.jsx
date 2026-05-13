import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Import MUI components for layout, form fields, and visual avatars
import { 
  Box, Typography, Paper, TextField, Button, Alert, 
  Avatar, CircularProgress, Grid, Divider 
} from '@mui/material';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';

function Profile() {
  // 1. State to hold current user info loaded from the backend
  const [userId, setUserId] = useState(null);
  const [currentRole, setCurrentRole] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // 2. Controlled Form State variables
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Left blank unless they want to change it
  const [photoFile, setPhotoFile] = useState(null); // Holds the raw binary file
  const [photoPreview, setPhotoPreview] = useState(''); // Holds a temporary URL to preview the picked image

  // UI Status States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const token = localStorage.getItem('token');

  // Standard Axios configuration for text requests
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // Run exactly once when the profile page loads
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Step A: Hit our secure '/me' endpoint to find out who we are
      const meRes = await axios.get('http://127.0.0.1:8000/api/me', axiosConfig);
      const myId = meRes.data.id;
      setUserId(myId);

      // Step B: Now fetch our full profile and Spatie avatar URL
      // (Note: Ensure your backend route in api.php is mapped to '/profile/{id}')
      const profileRes = await axios.get(`http://127.0.0.1:8000/api/profile/${myId}`, axiosConfig);
      
      const loadedUser = profileRes.data.user;
      
      // Populate our React state memory
      setName(loadedUser.name);
      setEmail(loadedUser.email);
      setCurrentRole(localStorage.getItem('role')); // Pull role string from memory
      
      // If Spatie found an image, save its URL
      if (profileRes.data.avatar_url) {
        setAvatarUrl(profileRes.data.avatar_url);
      }

    } catch (error) {
      setErrorMessage('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Function triggered when the user selects a file from their computer
  const handleFileChange = (e) => {
    // e.target.files is an array of files the user picked. We grab the first one.
    const file = e.target.files[0]; 
    
    if (file) {
      setPhotoFile(file); // Save the raw binary file to state ready for Laravel
      
      // Generate a temporary browser URL so the user can preview their new face instantly!
      setPhotoPreview(URL.createObjectURL(file)); 
    }
  };

  // 4. Function triggered when clicking "Save Changes"
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setSaving(true);

    // THE MAGIC: Create a native FormData package instead of standard JSON
    const formData = new FormData();
    
    formData.append('name', name);
    formData.append('email', email);
    
    // Only append password if the user actually typed a new one
    if (password.trim() !== '') {
      formData.append('password', password);
    }

    // Only append the photo if they selected a new file
    if (photoFile) {
      formData.append('profile_photo', photoFile);
    }

    // METHOD SPOOFING: Force PHP to accept our file by masquerading as a PATCH request
    formData.append('_method', 'PATCH');

    try {
      // Notice we send this as a POST request to bypass PHP's multipart/PATCH limitation!
      const response = await axios.post(`http://127.0.0.1:8000/api/profile/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // We MUST tell the server we are sending a multi-part file package
          'Content-Type': 'multipart/form-data', 
        }
      });

      setSuccessMessage('Profile successfully updated!');
      setPassword(''); // Clear the password box for safety
      
      // Update our active avatar URL with the brand-new permanent path from Spatie
      if (response.data.avatar_url) {
        setAvatarUrl(response.data.avatar_url);
        setPhotoPreview(''); // Clear the temporary preview
      }

    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrorMessage('Validation error: Ensure your email is valid and image is under 2MB.');
      } else {
        setErrorMessage('Failed to update profile. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 700, mx: 'auto' }}>
      <Paper sx={{ p: 4, elevation: 3 }}>
        
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 3 }}>
          User Profile
        </Typography>

        {errorMessage && <Alert severity="error" sx={{ mb: 3 }}>{errorMessage}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 3 }}>{successMessage}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSaveChanges}>
            
            {/* AVATAR DISPLAY SECTION */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              
              {/* Prioritize the temporary preview if they picked a file, otherwise show permanent avatar */}
              <Avatar 
                src={photoPreview || avatarUrl} 
                sx={{ width: 120, height: 120, mb: 2, border: '3px solid #1976d2', boxShadow: 2 }} 
              />
              
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'text.secondary' }}>
                Role: {currentRole}
              </Typography>

              {/* Native HTML hidden file input wrapped inside a clean MUI button */}
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ mt: 2 }}
              >
                Upload New Photo
                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                />
              </Button>
              
              {photoFile && (
                <Typography variant="caption" sx={{ mt: 1, color: 'success.main' }}>
                  Selected: {photoFile.name}
                </Typography>
              )}

            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* EDITABLE TEXT FIELDS */}
            <Grid container spacing={2}>
              
              <Grid item xs={12}>
                <TextField
                  label="Full Name"
                  fullWidth
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="New Password (Optional)"
                  type="password"
                  fullWidth
                  placeholder="Leave blank to keep current password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  helperText="Must be at least 8 characters long if changing."
                />
              </Grid>

            </Grid>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              startIcon={<SaveIcon />}
              disabled={saving}
              sx={{ mt: 4 }}
            >
              {saving ? 'Saving Profile...' : 'Save Changes'}
            </Button>

          </form>
        )}
      </Paper>
    </Box>
  );
}

export default Profile;