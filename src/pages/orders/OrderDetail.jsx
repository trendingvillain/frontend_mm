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
  CircularProgress,
  useTheme,
} from '@mui/material';
import { ArrowBack, Receipt, Download } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchOrderById } from '../../config/api';
import logo from './../../logo.png';
import dayjs from 'dayjs';

// --- Theme Constants ---
const ACCENT = '#BF8A00';
const BLACK = '#121212';
const GRAY = '#F5F5F5';

// Print styles for printing with minimal header
const PrintStyles = () => (
  <style>{`
    @media print {
      nav, footer, .navbar, .no-print {
        display: none !important;
      }
      #print-header {
        display: flex !important;
        align-items: center;
        justify-content: flex-start;
        border-bottom: 2px solid ${ACCENT};
        padding: 10px 20px;
        position: fixed;
        top: 0;
        width: 100%;
        background: white;
        z-index: 10000;
      }
      body {
        padding-top: 60px;
      }
    }
  `}</style>
);

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const response = await fetchOrderById(id);
        if (response.data.success) setOrder(response.data.order);
        else setOrder(null);
      } catch (error) {
        console.error('Error fetching order:', error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'confirmed': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getItemTotal = (item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    const weight = Number(item.weight) || 0;
    const calcType = item.calcType || 'quantity';
    if (calcType === 'weight') return (price * weight).toFixed(2);
    return (price * quantity).toFixed(2);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ mt: 4, color: ACCENT }} />
        <Typography sx={{ mt: 2 }}>Loading order details...</Typography>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h6" color="error">Order not found.</Typography>
        <Button variant="contained" sx={{ mt: 4 }} onClick={() => navigate('/orders')}>Back to Orders</Button>
      </Container>
    );
  }

  const hasInvoice = !!order.invoice;

  return (
    <>
      <PrintStyles />
      <Box id="print-header" sx={{ display: 'none', p: 2, borderBottom: `2px solid ${ACCENT}`, bgcolor: 'white' }}>
        <img src={logo} alt="Logo" style={{ height: 40, marginRight: 12 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: BLACK }}>Sivanthi Banana Export</Typography>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: BLACK, textTransform: 'uppercase' }}>Transaction Log: #{order.id}</Typography>
          {hasInvoice && (
            <Button 
              variant="contained" 
              startIcon={<Download />}
              onClick={handlePrint}
              sx={{ bgcolor: ACCENT, color: BLACK, fontWeight: 'bold', borderRadius: 0, '&:hover': { bgcolor: BLACK, color: ACCENT } }}
              className="no-print"
            >
              Download Log
            </Button>
          )}
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: GRAY, border: `1px solid ${BLACK}50`, borderRadius: 0 }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 'bold', textTransform: 'uppercase', borderBottom: `2px solid ${ACCENT}`, mb: 2 }}>
                  Logistics Summary
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Initiated:</strong> {dayjs(order.created_at).format('DD/MM/YYYY')}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  <strong>Delivery Target:</strong> {dayjs(order.delivery_date).format('DD/MM/YYYY')}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  <strong>Client Name:</strong> {order.user_name ?? 'N/A'}
                </Typography>
                <Box sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${BLACK}30` }}>
                  <Chip label={order.status.toUpperCase()} color={getStatusColor(order.status)} size="small" sx={{ fontWeight: 'bold' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {hasInvoice && (
            <Grid item xs={12} md={6}>
              <Card sx={{ bgcolor: GRAY, border: `1px solid ${BLACK}50`, borderRadius: 0 }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', textTransform: 'uppercase', borderBottom: `2px solid ${ACCENT}`, mb: 2, display: 'flex', alignItems: 'center' }}>
                    <Receipt sx={{ mr: 1, color: ACCENT }} /> Financial Summary
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Invoice ID:</strong> {order.invoice.invoice_number}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    <strong>Invoice Date:</strong> {dayjs(order.invoice.created_at).format('DD/MM/YYYY')}
                  </Typography>
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'white', border: `2px solid ${BLACK}` }}>
                    <Typography variant="h6" color="textSecondary">Final Value</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: BLACK }}>
                      ₹{order.invoice.total}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        <Card sx={{ mt: 6, borderRadius: 0, border: `1px solid ${BLACK}50` }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 'bold', textTransform: 'uppercase', borderBottom: `2px solid ${ACCENT}`, mb: 2 }}>
              Itemized Cargo List
            </Typography>
            <TableContainer component={Paper} sx={{ borderRadius: 0, boxShadow: 'none' }}>
              <Table>
                <TableHead sx={{ bgcolor: BLACK }}>
                  <TableRow>
                    <TableCell sx={{ color: ACCENT, fontWeight: 'bold' }}>Product Name</TableCell>
                    <TableCell sx={{ color: ACCENT, fontWeight: 'bold' }} align="center">Quantity</TableCell>
                    <TableCell sx={{ color: ACCENT, fontWeight: 'bold' }} align="center">Weight (kg)</TableCell>
                    {hasInvoice && <>
                      <TableCell sx={{ color: ACCENT, fontWeight: 'bold' }} align="right">Unit Price (₹)</TableCell>
                      <TableCell sx={{ color: ACCENT, fontWeight: 'bold' }} align="right">Subtotal (₹)</TableCell>
                    </>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map(item => {
                    const invoiceItem = hasInvoice ? order.invoice.items.find(i => i.product_id === item.product_id) : item;
                    const subtotal = getItemTotal(invoiceItem);

                    return (
                      <TableRow key={item.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: GRAY } }}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell align="center">{invoiceItem?.quantity ?? item.quantity}</TableCell>
                        <TableCell align="center">{invoiceItem?.weight ?? item.weight} kg</TableCell>
                        {hasInvoice && <>
                          <TableCell align="right">{invoiceItem?.price ?? 'N/A'}</TableCell>
                          <TableCell align="right">{subtotal}</TableCell>
                        </>}
                      </TableRow>
                    );
                  })}
                  {hasInvoice && (
                    <TableRow sx={{ bgcolor: `${BLACK}05` }}>
                      <TableCell colSpan={ hasInvoice ? 4 : 3 }>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: BLACK }}>
                          TOTAL TRANSACTION VALUE
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: ACCENT }}>
                          ₹{order.invoice.total}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};

export default OrderDetail;
