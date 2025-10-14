import { useState } from 'react';
import { Alert, Box, Button, Link, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../../api/client.js';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/auth/register', form);
      setSuccess('Account created! You can now sign in.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Unable to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 480, mx: 'auto', mt: 6 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Create your Soulstone account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Join the community and unlock access to curated rituals, guides, and crystals.
          </Typography>
        </Box>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <TextField label="Full name" name="name" value={form.name} onChange={handleChange} required fullWidth />
        <TextField label="Email" name="email" type="email" value={form.email} onChange={handleChange} required fullWidth />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          helperText="Use at least 8 characters"
          fullWidth
        />
        <Button type="submit" variant="contained" size="large" disabled={loading}>
          {loading ? 'Creating…' : 'Create account'}
        </Button>
        <Typography variant="body2" textAlign="center">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login">
            Sign in
          </Link>
        </Typography>
      </Stack>
    </Box>
  );
};

export default RegisterPage;
