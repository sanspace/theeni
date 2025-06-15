// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Box, Button, Container, Paper, TextField, Typography } from '@mui/material';
import { useAuthStore } from '../store/authStore';
import axiosInstance from '../api/axiosInstance';
import { useSnackbar } from 'notistack';

export default function LoginPage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const login = useAuthStore((state) => state.login);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      // IMPORTANT: FastAPI's OAuth2 form expects 'x-www-form-urlencoded' data.
      // We create URLSearchParams to send the data in this format.
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axiosInstance.post('/token', formData);
      
      const { access_token } = response.data;
      if (access_token) {
        login(access_token); // Save token to our store
        navigate('/'); // Redirect to the main POS page on successful login
      }
    } catch (error) {
      console.error('Login failed:', error);
      enqueueSnackbar('Login failed. Please check your username and password.', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">Sign In</Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
