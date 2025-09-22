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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  CircularProgress
} from '@mui/material';
import { ArrowBack, Receipt, Download } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchOrderById } from '../../config/api';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const response = await fetchOrderById(id);
      if (response.data.success) {
        setOrder(response.data.order);
      }
    } catch (error) {
      console.error('Error loading order:', error);
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
              <Typography variant="h6">Loading orders details...</Typography>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Order not found.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 600 }}>
          Order #{order.id}
        </Typography>
        <Chip 
          label={order.status.toUpperCase()} 
          color={getStatusColor(order.status)}
          sx={{ fontWeight: 600, fontSize: '1rem', px: 2, py: 1 }}
        />
      </Box>

      <Grid container spacing={4}>
        {/* Order Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Order Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Customer
                </Typography>
                <Typography sx={{ fontWeight: 500 }}>
                  {order.user_name}
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
                  Delivery Date
                </Typography>
                <Typography sx={{ fontWeight: 500 }}>
                  {new Date(order.delivery_date).toLocaleDateString()}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Chip 
                  label={order.status} 
                  color={getStatusColor(order.status)}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Invoice Information */}
        {order.invoice && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Receipt /> Invoice Details
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Invoice Number
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {order.invoice.invoice_number}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Invoice Date
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {new Date(order.invoice.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    ₹{order.invoice.total}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Order Items */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Order Items
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="center">Weight</TableCell>
                  {order.invoice && (
                    <>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items?.map((item) => {
                  const invoiceItem = order.invoice?.items.find(inv => inv.product_id === item.product_id);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 500 }}>
                          {item.product_name}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{invoiceItem.quantity}</TableCell>
                      <TableCell align="center">{invoiceItem.weight} kg</TableCell>
                      {order.invoice && invoiceItem && (
                        <>
                          <TableCell align="right">₹{invoiceItem.price}</TableCell>
                          <TableCell align="right">
                            ₹{(Number(invoiceItem.price) * Number(invoiceItem.quantity)).toFixed(2)}
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  );
                })}
                {order.invoice && (
                  <>
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Divider />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Total Amount
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          ₹{order.invoice.total}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
};

export default OrderDetail;
