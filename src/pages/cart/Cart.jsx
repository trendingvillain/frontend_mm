import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Divider,
  Button,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress // <-- Import CircularProgress
} from '@mui/material';
import { Add, Remove, Delete, ShoppingCart, CalendarToday } from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../../config/api';
import dayjs from 'dayjs';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [orderDialog, setOrderDialog] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(dayjs().add(1, 'day'));
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isLoading, setIsLoading] = useState(false); // <-- New loading state

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
  }, []);

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }
    const updatedCart = cartItems.map(item =>
      item.product_id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (productId) => {
    const updatedCart = cartItems.filter(item => item.product_id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
  };

  const handleConfirmOrder = async () => {
    setIsLoading(true); // <-- Set loading to true
    try {
      const orderData = {
        delivery_date: deliveryDate.format('YYYY-MM-DD'),
        products: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      };

      const response = await createOrder(orderData);

      if (response.data.success) {
        localStorage.removeItem('cart');
        setCartItems([]);
        setSnackbar({
          open: true,
          message: 'Order placed successfully!',
          severity: 'success'
        });
        setOrderDialog(false);
        setTimeout(() => navigate('/orders'), 2000);
      }
    } catch (error) {
      console.error('Error placing order:', error); // Log the error for debugging
      setSnackbar({
        open: true,
        message: 'Error placing order. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false); // <-- Set loading to false, regardless of success or failure
    }
  };

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center', py: 8 }}>
        <ShoppingCart sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" gutterBottom component="div">
          Your Cart is Empty
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph component="div">
          Add some products to your cart to get started!
        </Typography>
        <Button variant="contained" onClick={() => navigate('/products')}>
          Browse Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 600 }} component="div">
        Shopping Cart
      </Typography>

      <Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        gap={4}
      >
        {/* Cart Items */}
        <Box flex={2}>
          <Paper>
            <List>
              {cartItems.map((item, index) => (
                <React.Fragment key={item.product_id}>
                  <ListItem sx={{ py: 2, px: 3, flexWrap: 'wrap' }}>
                    <Box sx={{ mr: 2, mb: { xs: 2, md: 0 } }}>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          backgroundImage: `url(${item.image_url || "https://images.pexels.com/photos/2872755/pexels-photo-2872755.jpeg?auto=compress&cs=tinysrgb&w=200"})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          borderRadius: 1
                        }}
                      />
                    </Box>
                    <ListItemText
                      primary={
                        <Typography variant="h6" sx={{ fontWeight: 600 }} component="div">
                          {item.product_name}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" component="div">
                            Price: ₹{item.price}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            >
                              <Remove />
                            </IconButton>

                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => {
                                const value = parseInt(e.target.value, 10);
                                if (!isNaN(value) && value > 0) updateQuantity(item.product_id, value);
                              }}
                              style={{
                                width: 40,
                                textAlign: 'center',
                                border: '1px solid #ccc',
                                borderRadius: 4,
                                padding: '2px 4px',
                              }}
                            />

                            <IconButton
                              size="small"
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            >
                              <Add />
                            </IconButton>
                          </Box>

                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }} component="div">
                          ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </Typography>
                        <IconButton
                          color="error"
                          onClick={() => removeItem(item.product_id)}
                          sx={{ mt: 1 }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < cartItems.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Order Summary */}
        <Box flex={1}>
          <Paper sx={{ p: 3, position: { xs: 'static', md: 'sticky' }, top: 100 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }} component="div">
              Order Summary
            </Typography>

            <Box sx={{ my: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography component="div">Items ({cartItems.length})</Typography>
                <Typography component="div">₹{getTotalAmount().toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography component="div">Delivery</Typography>
                <Typography color="success.main" component="div">
                  Your Transport
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }} component="div">
                  Total
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }} component="div">
                  ₹{getTotalAmount().toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<CalendarToday />}
              onClick={() => setOrderDialog(true)}
            >
              Place Order
            </Button>

            <Button
              fullWidth
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </Button>
          </Paper>
        </Box>
      </Box>

      {/* Order Confirmation Dialog */}
      <Dialog open={orderDialog} onClose={() => setOrderDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Your Order</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph component="div">
            Please select your preferred delivery date:
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Delivery Date"
              value={deliveryDate}
              onChange={(newValue) => setDeliveryDate(newValue)}
              minDate={dayjs().add(1, 'day')}
              sx={{ width: '100%', mb: 3 }}
            />
          </LocalizationProvider>

          <Typography variant="h6" gutterBottom component="div">
            Order Items:
          </Typography>
          {cartItems.map((item) => (
            <Box
              key={item.product_id}
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
            >
              <Typography component="div">
                {item.product_name} x {item.quantity}
              </Typography>
              <Typography component="div">
                ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
              </Typography>
            </Box>
          ))}

          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }} component="div">
              Total:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }} component="div">
              ₹{getTotalAmount().toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDialog(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmOrder}
            disabled={isLoading} // <-- Disable button when loading
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? 'Placing Order...' : 'Confirm Order'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Cart;