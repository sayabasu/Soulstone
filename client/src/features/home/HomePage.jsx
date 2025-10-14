import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const HomePage = () => (
  <Grid container spacing={4} alignItems="center" sx={{ minHeight: '70vh' }}>
    <Grid item xs={12} md={6}>
      <Stack spacing={3}>
        <Typography variant="h3" fontWeight={700}>
          Crystals with intention, rituals with heart.
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover ethically sourced crystals, learn from guided rituals, and join a community that celebrates mindful living.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button component={RouterLink} to="/catalog" variant="contained" size="large">
            Shop the catalog
          </Button>
          <Button component={RouterLink} to="/register" variant="outlined" size="large">
            Join the community
          </Button>
        </Stack>
      </Stack>
    </Grid>
    <Grid item xs={12} md={6}>
      <Box
        component="img"
        src="https://images.unsplash.com/photo-1603816245457-4ea4eb4d82f2"
        alt="Soulstone hero"
        sx={{ width: '100%', borderRadius: 4, boxShadow: 6 }}
      />
    </Grid>
  </Grid>
);

export default HomePage;
