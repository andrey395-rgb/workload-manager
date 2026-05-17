import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import {
  Box, Typography, Paper, TextField, Button, Avatar,
  CircularProgress, Divider, Card, CardContent, Skeleton,
  alpha, Chip, Tabs, Tab, Switch, FormControlLabel, Stack,
  useTheme
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  EmailOutlined as EmailIcon,
  LockOutlined as LockIcon,
  PaletteOutlined as PaletteIcon,
  LightModeOutlined as LightModeIcon,
  DarkModeOutlined as DarkModeIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import { ColorModeContext } from '../App';
import { NAVY, ACCENT, TEAL, SURFACE, CARD_BG } from '../themeTokens';

// ─── Shared Components ────────────────────────────────────────────────────────

function SettingsSection({ icon: Icon, title, children }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <Box sx={{
          width: 32, height: 32, borderRadius: 1,
          bgcolor: alpha(ACCENT, 0.1),
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Icon sx={{ fontSize: 18, color: ACCENT }} />
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: isDark ? 'primary.main' : NAVY }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ pl: { md: 6 } }}>
        {children}
      </Box>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Settings() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile State
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const photoFileRef = useRef(null);

  // Notifications
  const [openNotif, setOpenNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSeverity, setNotifSeverity] = useState('info');

  const token = localStorage.getItem('token');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const meRes = await axios.get('http://127.0.0.1:8000/api/me', axiosConfig);
      const myId = meRes.data.id;
      setUserId(myId);

      const profileRes = await axios.get(`http://127.0.0.1:8000/api/profile/${myId}`, axiosConfig);
      const u = profileRes.data.user;

      setName(u.name);
      setEmail(u.email);
      setCurrentRole(localStorage.getItem('role') || 'User');
      if (profileRes.data.avatar_url) setAvatarUrl(profileRes.data.avatar_url);
    } catch (err) {
      showNotif('Failed to load profile data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotif = (msg, sev = 'info') => {
    setNotifMessage(msg);
    setNotifSeverity(sev);
    setOpenNotif(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      photoFileRef.current = file;
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const patchPayload = { name, email };
      if (password.trim()) patchPayload.password = password;

      await axios.patch(`http://127.0.0.1:8000/api/profile/${userId}`, patchPayload, axiosConfig);

      let newAvatarUrl = null;
      if (photoFileRef.current) {
        const formData = new FormData();
        formData.append('profile_photo', photoFileRef.current);
        const uploadRes = await axios.post(
          `http://127.0.0.1:8000/api/profile/${userId}/photo`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        newAvatarUrl = uploadRes.data.avatar_url ?? null;
      }

      showNotif('Settings saved successfully.', 'success');
      setPassword('');
      setPhotoFile(null);
      photoFileRef.current = null;
      if (newAvatarUrl) {
        setAvatarUrl(newAvatarUrl);
        setPhotoPreview('');
      }
    } catch (err) {
      const msg = err.response?.status === 422 
        ? 'Validation error. Please check your inputs.' 
        : 'Failed to update settings.';
      showNotif(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

  if (loading) return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Skeleton variant="text" width={200} height={40} sx={{ mb: 4 }} />
      <Skeleton variant="rounded" height={400} />
    </Box>
  );

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 4 }, 
      bgcolor: 'background.default', 
      minHeight: '100vh',
      maxWidth: 1000,
      mx: 'auto'
    }}>
      
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
          sx={{ color: 'text.secondary', fontWeight: 600 }}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
          Settings
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        
        <Tabs 
          value={activeTab} 
          onChange={(_, v) => setActiveTab(v)}
          sx={{ 
            px: 2, 
            bgcolor: isDark ? alpha('#fff', 0.02) : '#fff',
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Tab label="Profile" sx={{ py: 2, fontWeight: 700, textTransform: 'none' }} />
          <Tab label="Appearance" sx={{ py: 2, fontWeight: 700, textTransform: 'none' }} />
        </Tabs>

        <Box sx={{ p: { xs: 3, md: 5 } }}>
          
          {/* TAB 0: PROFILE */}
          {activeTab === 0 && (
            <Box component="form" onSubmit={handleSaveProfile}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '200px 1fr' }, gap: 5 }}>
                
                {/* Avatar Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Avatar
                    src={photoPreview || avatarUrl}
                    sx={{
                      width: 120, height: 120, mb: 2,
                      bgcolor: alpha(ACCENT, 0.1), color: ACCENT,
                      fontSize: '2.5rem', fontWeight: 800,
                      border: `4px solid ${isDark ? '#1e293b' : '#fff'}`,
                      boxShadow: `0 0 0 1px ${theme.palette.divider}`
                    }}
                  >
                    {!photoPreview && !avatarUrl && initials}
                  </Avatar>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>{name}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>{currentRole.toUpperCase()}</Typography>
                  
                  <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    startIcon={<CloudUploadIcon />}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                  >
                    Change Photo
                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                  </Button>
                </Box>

                {/* Info Section */}
                <Box>
                  <SettingsSection icon={PersonIcon} title="Personal Information">
                    <Stack spacing={2.5}>
                      <TextField 
                        label="Full Name" 
                        fullWidth 
                        size="small" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                      />
                      <TextField 
                        label="Email Address" 
                        fullWidth 
                        size="small" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                      />
                    </Stack>
                  </SettingsSection>

                  <Divider sx={{ my: 4 }} />

                  <SettingsSection icon={LockIcon} title="Security">
                    <TextField 
                      label="New Password" 
                      type="password" 
                      fullWidth 
                      size="small" 
                      placeholder="Leave blank to keep current"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Use at least 8 characters with a mix of letters and numbers.
                    </Typography>
                  </SettingsSection>

                  <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={saving}
                      startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                      sx={{ 
                        borderRadius: 2, 
                        px: 4, 
                        py: 1.2, 
                        fontWeight: 700,
                        bgcolor: isDark ? 'primary.main' : NAVY,
                        color: isDark ? 'primary.contrastText' : '#fff'
                      }}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {/* TAB 1: APPEARANCE */}
          {activeTab === 1 && (
            <Box sx={{ maxWidth: 600 }}>
              <SettingsSection icon={PaletteIcon} title="Theme Preference">
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Choose how the Workload Manager interface looks to you. Select between Light and Dark themes.
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  
                  {/* Light Option */}
                  <Card 
                    onClick={() => colorMode.mode === 'dark' && colorMode.toggleColorMode()}
                    sx={{ 
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: colorMode.mode === 'light' ? ACCENT : 'divider',
                      bgcolor: '#fff',
                      p: 2,
                      transition: 'all 0.2s'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <LightModeIcon sx={{ color: colorMode.mode === 'light' ? ACCENT : 'text.disabled' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>Light Mode</Typography>
                    </Box>
                    <Box sx={{ height: 60, bgcolor: '#f8fafc', borderRadius: 1, border: '1px solid #e2e8f0' }} />
                  </Card>

                  {/* Dark Option */}
                  <Card 
                    onClick={() => colorMode.mode === 'light' && colorMode.toggleColorMode()}
                    sx={{ 
                      cursor: 'pointer',
                      border: '2px solid',
                      borderColor: colorMode.mode === 'dark' ? ACCENT : 'divider',
                      bgcolor: '#0f172a',
                      p: 2,
                      transition: 'all 0.2s'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <DarkModeIcon sx={{ color: colorMode.mode === 'dark' ? ACCENT : 'text.disabled' }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fafc' }}>Dark Mode</Typography>
                    </Box>
                    <Box sx={{ height: 60, bgcolor: '#020617', borderRadius: 1, border: '1px solid #1e293b' }} />
                  </Card>

                </Box>

                <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: alpha(ACCENT, 0.05), borderRadius: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Quick Toggle</Typography>
                    <Typography variant="caption" color="text.secondary">Switch between modes instantly</Typography>
                  </Box>
                  <Switch 
                    checked={colorMode.mode === 'dark'} 
                    onChange={colorMode.toggleColorMode}
                    color="secondary"
                  />
                </Box>
              </SettingsSection>
            </Box>
          )}

        </Box>
      </Paper>

      <Notification 
        open={openNotif} 
        message={notifMessage} 
        severity={notifSeverity} 
        onClose={() => setOpenNotif(false)} 
      />
    </Box>
  );
}
