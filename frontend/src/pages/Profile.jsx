import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  NAVY, NAVY2, NAVY3, ACCENT, TEAL, SURFACE, CARD_BG, 
  STATUS_MAP, normaliseStatus 
} from '../themeTokens'; // Adjust the '../' path depending on what folder your page is in
import {
  Box, Typography, Paper, TextField, Button, Alert,
  Avatar, CircularProgress, Divider, Card, CardContent,
  Skeleton, alpha, Chip, Tooltip,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  EmailOutlined as EmailIcon,
  LockOutlined as LockIcon,
  BadgeOutlined as BadgeIcon,
  EditOutlined as EditIcon,
} from '@mui/icons-material';
import Notification from '../components/Notification';

// ─── Field Row ────────────────────────────────────────────────────────────────
function FieldRow({ icon: Icon, label, children }) {
  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
      <Box sx={{
        width: 36, height: 36, borderRadius: 1.5, flexShrink: 0, mt: 0.25,
        bgcolor: alpha(ACCENT, 0.1),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon sx={{ fontSize: 17, color: ACCENT }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.75 }}>
          {label}
        </Typography>
        {children}
      </Box>
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Profile() {
  const [userId, setUserId]           = useState(null);
  const [currentRole, setCurrentRole] = useState('');
  const [avatarUrl, setAvatarUrl]     = useState('');

  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [photoFile, setPhotoFile]     = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  const photoFileRef = useRef(null); // always holds the latest File object
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');

  const [openNotif, setOpenNotif]     = useState(false);
  const [notifSeverity, setNotifSeverity] = useState('info');

  const token = localStorage.getItem('token');
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { fetchUserData(); }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const meRes = await axios.get('http://127.0.0.1:8000/api/me', axiosConfig);
      const myId  = meRes.data.id;
      setUserId(myId);

      const profileRes = await axios.get(`http://127.0.0.1:8000/api/profile/${myId}`, axiosConfig);
      const u = profileRes.data.user;

      setName(u.name);
      setEmail(u.email);
      setCurrentRole(localStorage.getItem('role') || 'User');
      if (profileRes.data.avatar_url) setAvatarUrl(profileRes.data.avatar_url);
    } catch {
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      photoFileRef.current = file; // keep a ref so handleSave always sees it
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setSaving(true);

    const latestFile = photoFileRef.current;

    try {
      // Step 1: Update name / email / password via PATCH (plain JSON)
      const patchPayload = { name, email };
      if (password.trim()) patchPayload.password = password;

      await axios.patch(
        `http://127.0.0.1:8000/api/profile/${userId}`,
        patchPayload,
        axiosConfig,
      );

      // Step 2: Upload photo separately if a new file was picked.
      // Spatie Media Library needs a dedicated multipart POST.
      // IMPORTANT: do NOT set Content-Type manually — the browser must set it
      // so it can include the correct multipart boundary; without it Laravel
      // cannot parse the body and Spatie never receives the file.
      let newAvatarUrl = null;
      if (latestFile) {
        const formData = new FormData();
        formData.append('profile_photo', latestFile);

        const uploadRes = await axios.post(
          `http://127.0.0.1:8000/api/profile/${userId}/photo`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        newAvatarUrl = uploadRes.data.avatar_url ?? null;
      }

      setSuccess('Profile updated successfully.');
      setNotifSeverity('success');
      setOpenNotif(true);
      setPassword('');
      photoFileRef.current = null;
      setPhotoFile(null);
      if (newAvatarUrl) { setAvatarUrl(newAvatarUrl); setPhotoPreview(''); }

    } catch (err) {
      setError(err.response?.status === 422
        ? 'Validation error: check your email and ensure the image is under 2 MB.'
        : 'Failed to update profile. Please try again.');
      setNotifSeverity('error');
      setOpenNotif(true);
    } finally {
      setSaving(false);
    }
  };

  const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
  const roleLabel = (currentRole || 'user').charAt(0).toUpperCase() + (currentRole || 'user').slice(1);

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 760, mx: 'auto', bgcolor: SURFACE, minHeight: '100vh' }}>
      <Skeleton variant="text" width={180} height={48} sx={{ mb: 3 }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '240px 1fr' }, gap: 3 }}>
        <Skeleton variant="rounded" height={320} />
        <Skeleton variant="rounded" height={420} />
      </Box>
    </Box>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: SURFACE, minHeight: '100vh', boxSizing: 'border-box', maxWidth: 860, mx: 'auto' }}>

      {/* ── Page header ── */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: NAVY, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          Profile
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage your personal information and account settings
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSave} encType="multipart/form-data" sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '220px 1fr' },
        gap: 3,
        alignItems: 'start',
      }}>

        {/* ── LEFT: Avatar card ── */}
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: CARD_BG }}>
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

            {/* Avatar */}
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Avatar
                src={photoPreview || avatarUrl}
                sx={{
                  width: 100, height: 100,
                  bgcolor: alpha(ACCENT, 0.15), color: ACCENT,
                  fontSize: '1.75rem', fontWeight: 700,
                  border: `3px solid ${alpha(ACCENT, 0.25)}`,
                  boxShadow: `0 0 0 4px ${alpha(ACCENT, 0.08)}`,
                }}
              >
                {!photoPreview && !avatarUrl && initials}
              </Avatar>
              {/* Edit overlay hint */}
              {/* <Box sx={{
                position: 'absolute', bottom: 0, right: 0,
                width: 28, height: 28, borderRadius: '50%',
                bgcolor: NAVY, border: '2px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <EditIcon sx={{ fontSize: 13, color: '#fff' }} />
              </Box> */}
            </Box>

            {/* Name + role */}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: NAVY, lineHeight: 1.2 }}>
              {name || '—'}
            </Typography>
            <Chip
              label={roleLabel}
              size="small"
              sx={{
                mt: 0.75, mb: 2.5,
                bgcolor: alpha(TEAL, 0.12), color: '#047857',
                fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.05em',
                height: 22, '& .MuiChip-label': { px: 1 },
              }}
            />

            <Divider sx={{ width: '100%', mb: 2.5 }} />

            {/* Upload button */}
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon sx={{ fontSize: 15 }} />}
              fullWidth
              size="small"
              sx={{
                fontWeight: 700, textTransform: 'none', fontSize: '0.78rem',
                borderColor: 'divider', color: 'text.secondary', borderRadius: 1.5,
                '&:hover': { borderColor: ACCENT, color: ACCENT, bgcolor: alpha(ACCENT, 0.04) },
              }}
            >
              Upload Photo
              <input type="file" hidden accept="image/jpeg,image/png,image/jpg" onChange={handleFileChange} />
            </Button>

            {photoFile && (
              <Typography variant="caption" sx={{ mt: 1, color: '#059669', fontWeight: 500, wordBreak: 'break-all', textAlign: 'center' }}>
                ✓ {photoFile.name}
              </Typography>
            )}

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.5 }}>
              JPG or PNG, max 2 MB
            </Typography>
          </CardContent>
        </Card>

        {/* ── RIGHT: Edit form ── */}
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: CARD_BG }}>

          {/* Card header */}
          <Box sx={{ bgcolor: NAVY, px: 3, py: 2, borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon sx={{ fontSize: 17, color: TEAL }} />
            <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#fff', letterSpacing: '0.02em' }}>
              Account Information
            </Typography>
          </Box>

          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Full Name */}
              <FieldRow icon={PersonIcon} label="Full Name">
                <TextField
                  fullWidth required size="small"
                  placeholder="Your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                />
              </FieldRow>

              {/* Email */}
              <FieldRow icon={EmailIcon} label="Email Address">
                <TextField
                  fullWidth required size="small"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                />
              </FieldRow>

              <Divider />

              {/* Password */}
              <FieldRow icon={LockIcon} label="Change Password">
                <TextField
                  fullWidth size="small"
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  helperText="Minimum 8 characters if changing."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                />
              </FieldRow>

            </Box>

            {/* Save button */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={14} sx={{ color: 'inherit' }} /> : <SaveIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: NAVY, color: '#fff', fontWeight: 700,
                  textTransform: 'none', borderRadius: 1.5,
                  px: 3, py: 1.2, boxShadow: 'none',
                  '&:hover': { bgcolor: NAVY3, boxShadow: 'none' },
                  '&.Mui-disabled': { bgcolor: alpha(NAVY, 0.4), color: '#fff' },
                }}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </Box>
          </CardContent>
        </Card>

      </Box>

      <Notification 
        open={openNotif} 
        message={error || success} 
        severity={notifSeverity} 
        onClose={() => setOpenNotif(false)} 
      />
    </Box>
  );
}