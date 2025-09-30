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

// --- THEME CONSTANTS ---
const ACCENT_GOLD = '#BF8A00';
const PRIMARY_BLACK = '#121212';
const DEEP_GRAY = '#F5F5F5';
// --- END THEME CONSTANTS ---

// Print styles for hiding non-print content and showing minimal header
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
        border-bottom: 2px solid ${ACCENT_GOLD};
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

  // Updated helper to calculate item total based on calcType
  const getItemTotal = (item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    const weight = Number(item.weight) || 0;
    const calcType = item.calcType || 'quantity';

    if (calcType === 'weight') {
      return (price * weight).toFixed(2);
    } else {
      return (price * quantity).toFixed(2);
    }
  };

  // New function: Triggers browser print dialog for "downloading" the page
  const handleDownloadPage = () => {
    window.print();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ my: 4, color: ACCENT_GOLD }} />
        <Typography variant="h6" sx={{ color: PRIMARY_BLACK }}>
          Loading order manifest...
        </Typography>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h6" color="error" sx={{ borderRadius: 0 }}>
          Order not found. Invalid Transaction ID.
        </Typography>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/orders')}
          sx={{ mt: 2, borderRadius: 0, color: PRIMARY_BLACK, borderColor: PRIMARY_BLACK }}
          variant="outlined"
        >
          Back to Manifest
        </Button>
      </Container>
    );
  }

  const hasInvoice = !!order.invoice;

  return (
    <>
      {/* Inject print styles */}
      <PrintStyles />

      {/* The minimal print header with logo and name, hidden by default but shown in print */}
      <Box
        id="print-header"
        sx={{
          display: 'none',
          mb: 4,
          px: 2,
          py: 1,
          bgcolor: 'white',
          borderBottom: `2px solid ${ACCENT_GOLD}`,
        }}
      >
        <img src={logo} alt="Logo" style={{ height: 40, marginRight: 12 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: PRIMARY_BLACK }}>
          Sivanthi Banana Export
        </Typography>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
        {/* Header and Actions */}
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, color: PRIMARY_BLACK, textTransform: 'uppercase' }}>
            Transaction Log: #{order.id}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {/* Download button hidden in print by no-print class */}
            {hasInvoice && (
              <Button
                className="no-print"
                startIcon={<Download />}
                onClick={handleDownloadPage}
                sx={{
                  borderRadius: 0,
                  bgcolor: ACCENT_GOLD,
                  color: PRIMARY_BLACK,
                  fontWeight: 700,
                  '&:hover': { bgcolor: PRIMARY_BLACK, color: ACCENT_GOLD },
                }}
                variant="contained"
              >
                Download Transaction Log
              </Button>
            )}
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Order Information (Left) */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 0, border: `1px solid ${PRIMARY_BLACK}50` }}>
              <CardContent sx={{ bgcolor: DEEP_GRAY }}>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: 800, color: PRIMARY_BLACK, textTransform: 'uppercase', borderBottom: `2px solid ${ACCENT_GOLD}`, pb: 1, mb: 2 }}
                >
                  Logistics Summary
                </Typography>

                {/* Order Date */}
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    INITIATION DATE
                  </Typography>
                  <Typography sx={{ fontWeight: 500, color: PRIMARY_BLACK }}>{new Date(order.created_at).toLocaleDateString()}</Typography>
                </Box>

                {/* Delivery Date */}
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    TARGET DELIVERY
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: ACCENT_GOLD }}>{new Date(order.delivery_date).toLocaleDateString()}</Typography>
                </Box>

                {/* Customer */}
                <Box sx={{ mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    CLIENT NAME
                  </Typography>
                  <Typography sx={{ fontWeight: 500, color: PRIMARY_BLACK }}>{order.user_name || 'N/A'}</Typography>
                </Box>

                {/* Status */}
                <Box sx={{ pt: 2, mt: 2, borderTop: `1px dashed ${PRIMARY_BLACK}30` }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mr: 1 }}>
                    STATUS:
                  </Typography>
                  <Chip label={order.status.toUpperCase()} color={getStatusColor(order.status)} size="small" sx={{ mt: 0.5, borderRadius: 0, fontWeight: 700 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Invoice Information (Right) */}
          {hasInvoice && (
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 0, border: `1px solid ${PRIMARY_BLACK}50` }}>
                <CardContent sx={{ bgcolor: DEEP_GRAY }}>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 800,
                      color: PRIMARY_BLACK,
                      textTransform: 'uppercase',
                      borderBottom: `2px solid ${ACCENT_GOLD}`,
                      pb: 1,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Receipt sx={{ color: ACCENT_GOLD }} /> Financial Summary
                  </Typography>

                  {/* Invoice Number */}
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      INVOICE ID
                    </Typography>
                    <Typography sx={{ fontWeight: 500, color: PRIMARY_BLACK }}>{order.invoice.invoice_number}</Typography>
                  </Box>

                  {/* Invoice Date */}
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      INVOICE DATE
                    </Typography>
                    <Typography sx={{ fontWeight: 500, color: PRIMARY_BLACK }}>{new Date(order.invoice.created_at).toLocaleDateString()}</Typography>
                  </Box>

                  {/* Total Amount */}
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'white', border: `2px solid ${PRIMARY_BLACK}` }}>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                      FINAL TRANSACTION VALUE
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: PRIMARY_BLACK, display: 'flex', alignItems: 'center' }}>
                      <Box component="span" sx={{ color: ACCENT_GOLD }}>
                        ₹{order.invoice.total}
                      </Box>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Order Items Table */}
        <Card sx={{ mt: 6, borderRadius: 0, border: `1px solid ${PRIMARY_BLACK}50` }}>
          <CardContent>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 800, color: PRIMARY_BLACK, textTransform: 'uppercase', borderBottom: `2px solid ${ACCENT_GOLD}`, pb: 1, mb: 2 }}
            >
              Itemized Cargo List
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 0, border: 'none', boxShadow: 'none' }}>
              <Table>
                <TableHead sx={{ bgcolor: PRIMARY_BLACK }}>
                  <TableRow>
                    <TableCell sx={{ color: ACCENT_GOLD, fontWeight: 700, borderBottom: 'none' }}>Product Name</TableCell>
                    <TableCell align="center" sx={{ color: ACCENT_GOLD, fontWeight: 700, borderBottom: 'none' }}>
                      Quantity
                    </TableCell>
                    <TableCell align="center" sx={{ color: ACCENT_GOLD, fontWeight: 700, borderBottom: 'none' }}>
                      Weight (kg)
                    </TableCell>
                    {hasInvoice && (
                      <>
                        <TableCell align="right" sx={{ color: ACCENT_GOLD, fontWeight: 700, borderBottom: 'none' }}>
                          Unit Price (₹)
                        </TableCell>
                        <TableCell align="right" sx={{ color: ACCENT_GOLD, fontWeight: 700, borderBottom: 'none' }}>
                          Subtotal (₹)
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items?.map((item) => {
                    const invoiceItem = hasInvoice ? order.invoice.items.find((inv) => inv.product_id === item.product_id) : item;
                    const quantity = invoiceItem?.quantity || item.quantity;
                    const price = invoiceItem?.price || 'N/A';
                    const weight = invoiceItem?.weight || 'N/A';
                    const subtotal = getItemTotal(invoiceItem);

                    return (
                      <TableRow key={item.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: DEEP_GRAY } }}>
                        <TableCell>
                          <Typography sx={{ fontWeight: 600, color: PRIMARY_BLACK }}>{item.product_name}</Typography>
                        </TableCell>
                        <TableCell align="center">{quantity}</TableCell>
                        <TableCell align="center">{weight} kg</TableCell>
                        {hasInvoice && (
                          <>
                            <TableCell align="right">₹{price}</TableCell>
                            <TableCell align="right">₹{subtotal}</TableCell>
                          </>
                        )}
                      </TableRow>
                    );
                  })}
                  {/* Total Row */}
                  {hasInvoice && (
                    <TableRow sx={{ bgcolor: PRIMARY_BLACK + '05' }}>
                      <TableCell colSpan={hasInvoice ? 4 : 3}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: PRIMARY_BLACK }}>
                          TOTAL TRANSACTION VALUE
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" sx={{ fontWeight: 800, color: ACCENT_GOLD }}>
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
