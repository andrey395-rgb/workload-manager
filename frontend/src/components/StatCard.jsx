import React from 'react';
import { Card, CardContent, Box, Typography, alpha } from '@mui/material';
import { NAVY, CARD_BG } from '../themeTokens';

export default function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <Card elevation={0} sx={{
      border: '1px solid', borderColor: 'divider',
      borderRadius: 2, bgcolor: 'background.paper', height: '100%',
    }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: 1.5,
            bgcolor: alpha(accent, 0.12),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon sx={{ fontSize: 20, color: accent }} />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>{value}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>{label}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
