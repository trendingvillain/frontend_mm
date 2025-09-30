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
  CircularProgress,
  useTheme, // Added useTheme to access theme palette for styling
} from '@mui/material';
import { ShoppingCart, Receipt } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { fetchUserOrders } from '../../config/api';

// --- THEME CONSTANTS ---
const ACCENT_GOLD = '#BF8A00'; 
const PRIMARY_BLACK = '#121212'; 
const DEEP_GRAY = '#F5F5F5';
// --- END THEME CONSTANTS ---

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

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
        return 'success'; // Green
      case 'confirmed':
        return 'info';    // Blue/Cyan
      case 'pending':
        return 'warning'; // Amber/Orange
      case 'cancelled':
        return 'error';   // Red
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ my: 4, color: ACCENT_GOLD }} />
        <Typography variant="h6" sx={{ color: PRIMARY_BLACK }}>Loading order...</Typography>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center', py: 8, bgcolor: DEEP_GRAY, border: `2px solid ${PRIMARY_BLACK}` }}>
        <ShoppingCart sx={{ fontSize: 80, color: ACCENT_GOLD, mb: 2 }} />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: PRIMARY_BLACK }}>
          NO ACTIVE SHIPMENTS
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          You haven't placed any orders yet. Begin procurement to see your transaction history here.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/products')}
          sx={{ 
            borderRadius: 0, 
            bgcolor: PRIMARY_BLACK, 
            color: ACCENT_GOLD,
            fontWeight: 700,
            '&:hover': { bgcolor: ACCENT_GOLD, color: PRIMARY_BLACK }
          }}
        >
          BROWSE PREMIUM CATALOGUE
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, color: PRIMARY_BLACK, textTransform: 'uppercase' }}>
        Client Order 
      </Typography>
      <Box sx={{ width: 100, height: 4, bgcolor: ACCENT_GOLD, mb: 4 }} />

      <Grid container spacing={4}>
        {orders.map((order) => (
          <Grid item xs={12} key={order.id}>
            <Card 
              sx={{ 
                borderRadius: 0, 
                border: `2px solid ${PRIMARY_BLACK}`, // Strong Black Border
                transition: 'box-shadow 0.3s, border-color 0.3s',
                '&:hover': { 
                    boxShadow: 8, 
                    border: `2px solid ${ACCENT_GOLD}` // Gold border on hover
                } 
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: PRIMARY_BLACK }}>
                    TRANSACTION ID: #{order.id}
                  </Typography>
                  <Chip
                    label={order.status.toUpperCase()}
                    color={getStatusColor(order.status)}
                    sx={{ borderRadius: 0, fontWeight: 700, minWidth: 100 }}
                  />
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 600, borderBottom: `1px solid ${DEEP_GRAY}`, pb: 1 }}>
                      CARGO CONTENTS
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 0, bgcolor: DEEP_GRAY }}>
                      <List dense disablePadding>
                        {order.items.map((item, index) => (
                          <React.Fragment key={item.id}>
                            <ListItem sx={{ px: 0 }}>
                              <ListItemText
                                primary={
                                  <Typography sx={{ fontWeight: 600, color: PRIMARY_BLACK }}>
                                    {item.product_name}
                                  </Typography>
                                }
                                secondary={<Typography variant="body2" color="text.secondary">Quantity: {item.quantity} Units</Typography>}
                              />
                            </ListItem>
                            {index < order.items.length - 1 && <Divider component="li" sx={{ my: 0.5 }} />}
                          </React.Fragment>
                        ))}
                      </List>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 600, borderBottom: `1px solid ${DEEP_GRAY}`, pb: 1 }}>
                      LOGISTICS DATA
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 0, bgcolor: DEEP_GRAY }}>
                      
                      {/* Delivery Date */}
                      <Box sx={{ mb: 2, borderBottom: '1px dashed #CCC' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                          Target Delivery
                        </Typography>
                        <Typography sx={{ fontWeight: 700, color: ACCENT_GOLD }}>
                          {new Date(order.delivery_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      
                      {/* Order Date */}
                      <Box sx={{ mb: 2, borderBottom: '1px dashed #CCC' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                          Initiation Date
                        </Typography>
                        <Typography sx={{ fontWeight: 500 }}>
                          {new Date(order.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      
                      {/* Item Count */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                          Total Lines
                        </Typography>
                        <Typography sx={{ fontWeight: 500 }}>
                          {order.items.length} item(s)
                        </Typography>
                      </Box>
                      
                      {/* View Details Button */}
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Receipt />}
                        onClick={() => navigate(`/orders/${order.order_code}`)} // Assuming order.id is used for detail page
                        fullWidth
                        disabled={['pending', 'confirmed', 'cancelled'].includes(order.status)}
                        sx={{
                            borderRadius: 0,
                            borderColor: PRIMARY_BLACK,
                            color: PRIMARY_BLACK,
                            fontWeight: 700,
                            '&:hover': {
                                borderColor: ACCENT_GOLD,
                                bgcolor: PRIMARY_BLACK,
                                color: ACCENT_GOLD,
                            },
                            '&.Mui-disabled': {
                                borderColor: theme.palette.grey[400],
                                color: theme.palette.grey[600],
                            }
                        }}
                      >
                        ACCESS FULL LOG
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
