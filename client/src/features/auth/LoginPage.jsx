import { useState } from 'react';
import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../../api/client.js';
import { useAuth } from '../../hooks/useAuth.js';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      navigate('/catalog');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 420, mx: 'auto', mt: 6 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to continue exploring the Soulstone collection.
          </Typography>
        </Box>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required fullWidth />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          fullWidth
        />
        <Button type="submit" variant="contained" size="large" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>
        <Typography variant="body2" textAlign="center">
          New to Soulstone?{' '}
          <Link component={RouterLink} to="/register">
            Create an account
          </Link>
        </Typography>
      </Stack>
    </Box>
  );
};

export default LoginPage;
