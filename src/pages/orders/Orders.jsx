import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress // <-- Import CircularProgress
} from '@mui/material';
import { ShoppingCart, Receipt } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchUserOrders } from '../../config/api';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await fetchUserOrders();
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'confirmed':
        return 'info';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ my: 4 }} /> {/* <-- Display CircularProgress */}
        <Typography variant="h6">Loading orders...</Typography>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center', py: 8 }}>
        <ShoppingCart sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          No Orders Yet
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          You haven't placed any orders yet. Start shopping to see your orders here!
        </Typography>
        <Button variant="contained" onClick={() => navigate('/products')}>
          Browse Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }}>
        My Orders
      </Typography>

      <Grid container spacing={3}>
        {orders.map((order) => (
          <Grid item xs={12} key={order.id}>
            <Card sx={{ '&:hover': { boxShadow: 4 } }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Order #{order.id}
                  </Typography>
                  <Chip
                    label={order.status.toUpperCase()}
                    color={getStatusColor(order.status)}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Order Details
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                      <List dense>
                        {order.items.map((item, index) => (
                          <React.Fragment key={item.id}>
                            <ListItem sx={{ px: 0 }}>
                              <ListItemText
                                primary={
                                  <Typography sx={{ fontWeight: 500 }}>
                                    {item.product_name}
                                  </Typography>
                                }
                                secondary={`Quantity: ${item.quantity}`}
                              />
                            </ListItem>
                            {index < order.items.length - 1 && <Divider />}
                          </React.Fragment>
                        ))}
                      </List>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Order Info
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Delivery Date
                        </Typography>
                        <Typography sx={{ fontWeight: 500 }}>
                          {new Date(order.delivery_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Order Date
                        </Typography>
                        <Typography sx={{ fontWeight: 500 }}>
                          {new Date(order.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Items
                        </Typography>
                        <Typography sx={{ fontWeight: 500 }}>
                          {order.items.length} item(s)
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Receipt />}
                        onClick={() => navigate(`/orders/${order.order_code}`)}
                        fullWidth
                        disabled={['pending', 'confirmed', 'cancelled'].includes(order.status)}
                      >
                        View Details
                      </Button>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Orders;