import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { AdminPanelSettings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { loginAdmin } from '../../config/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAdminAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loginAdmin(formData);
      if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', 'admin');
        adminLogin(response.data.token);
        navigate('/admin/dashboard');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Admin login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AdminPanelSettings sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography component="h1" variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
              Admin Login
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Admin Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
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
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign In as Admin'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminLogin;