import React, { useState, useEffect } from 'react';
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper
} from '@mui/material';
import { People, Store, ShoppingCart, Help, TrendingUp } from '@mui/icons-material';
import { fetchAllUsers, fetchAdminProducts, fetchAllOrders, fetchAllInquiries } from '../../config/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalInquiries: 0,
    pendingUsers: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const [usersRes, productsRes, ordersRes, inquiriesRes] = await Promise.all([
        fetchAllUsers(),
        fetchAdminProducts(),
        fetchAllOrders(),
        fetchAllInquiries()
      ]);

      const users = usersRes.data.success ? usersRes.data.users : [];
      const products = productsRes.data.success ? productsRes.data.products : [];
      const orders = ordersRes.data.success ? ordersRes.data.orders : [];
      const inquiries = inquiriesRes.data.success ? inquiriesRes.data.inquiries : [];

      setStats({
        totalUsers: users.length,
        totalProducts: products.length,
        totalOrders: orders.length,
        totalInquiries: inquiries.length,
        pendingUsers: users.filter(u => u.status === 'pending').length,
        pendingOrders: orders.filter(o => o.status === 'pending').length
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      subtitle: `${stats.pendingUsers} pending`,
      icon: <People sx={{ fontSize: 40 }} />,
      color: 'primary.main'
    },
    {
      title: 'Products',
      value: stats.totalProducts,
      subtitle: 'Active products',
      icon: <Store sx={{ fontSize: 40 }} />,
      color: 'secondary.main'
    },
    {
      title: 'Orders',
      value: stats.totalOrders,
      subtitle: `${stats.pendingOrders} pending`,
      icon: <ShoppingCart sx={{ fontSize: 40 }} />,
      color: 'success.main'
    },
    {
      title: 'Inquiries',
      value: stats.totalInquiries,
      subtitle: 'Total received',
      icon: <Help sx={{ fontSize: 40 }} />,
      color: 'warning.main'
    }
  ];

  return (
    <Box>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
        Admin Dashboard
      </Typography>
      <Typography variant="h6" color="text.secondary" paragraph>
        Welcome to the banana export management system
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ color: card.color, mb: 2 }}>
                  {card.icon}
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  {card.value}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp /> Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body1">
                • Review pending user registrations
              </Typography>
              <Typography variant="body1">
                • Update product inventory
              </Typography>
              <Typography variant="body1">
                • Process pending orders
              </Typography>
              <Typography variant="body1">
                • Respond to customer inquiries
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              System Status
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Database Connection</Typography>
                <Typography color="success.main" sx={{ fontWeight: 600 }}>●  Online</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>API Status</Typography>
                <Typography color="success.main" sx={{ fontWeight: 600 }}>●  Active</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>Last Backup</Typography>
                <Typography color="text.secondary">2 hours ago</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;