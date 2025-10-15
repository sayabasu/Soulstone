import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth.js';

const NavigationBar = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography
          component={RouterLink}
          to="/"
          variant="h6"
          sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 600 }}
        >
          Soulstone
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button component={RouterLink} to="/catalog" color="primary">
            Catalog
          </Button>
          {isAuthenticated ? (
            <Button onClick={logout} color="primary" variant="outlined">
              Logout
            </Button>
          ) : (
            <Button component={RouterLink} to="/login" color="primary" variant="contained">
              Sign In
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
