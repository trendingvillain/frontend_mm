import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Grid,
  Typography,
  Card,
  Box,
  Chip,
  Button,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Skeleton
} from '@mui/material';
import {
  Add,
  Remove,
  ShoppingCart,
  HelpOutline,
  TrendingUp,
  LocalShipping,
  EventNote,
  AttachMoney,
  CheckCircleOutline,
  Info
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductById, fetchPriceById, submitInquiry } from '../../config/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Package } from 'lucide-react';

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const API_BASE_URL = "http://localhost:5000";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [prices, setPrices] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [inquiryDialog, setInquiryDialog] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const slideInterval = useRef(null);

  useEffect(() => {
    const loadProductData = async () => {
      try {
        const [productResponse, priceResponse] = await Promise.all([
          fetchProductById(id),
          fetchPriceById(id)
        ]);

        if (productResponse.data.success) {
          setProduct(productResponse.data.product);
        } else {
          setError("Product not found.");
        }

        if (priceResponse.data.success) {
          setPrices(priceResponse.data.prices);
        }
      } catch (err) {
        console.error('Error loading product data:', err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };
    loadProductData();
  }, [id]);

  useEffect(() => {
    if (product?.image_urls?.length > 1) {
      clearInterval(slideInterval.current);
      slideInterval.current = setInterval(() => {
        setMainImageIndex(prev => (prev + 1) % product.image_urls.length);
      }, 4000);
    }
    return () => clearInterval(slideInterval.current);
  }, [product, mainImageIndex]);

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = cart.findIndex(item => item.product_id === parseInt(id));

    if (existingItemIndex >= 0) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push({
        product_id: parseInt(id),
        product_name: product.name,
        quantity: quantity,
        price: prices[0]?.price || 0,
        image_urls: product.image_urls || [],
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    setSnackbar({
      open: true,
      message: `${product.name} added to cart successfully!`,
      severity: 'success'
    });
  };

  const handleInquirySubmit = async () => {
    if (!inquiryMessage.trim()) return;
    try {
      const response = await submitInquiry({
        product_id: parseInt(id),
        message: inquiryMessage
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Inquiry submitted successfully!',
          severity: 'success'
        });
        setInquiryDialog(false);
        setInquiryMessage('');
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || 'Error submitting inquiry.',
          severity: 'error'
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Network error or server issue. Please try again.',
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Skeleton variant="rectangular" width={80} height={80} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width={80} height={80} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width={80} height={80} sx={{ borderRadius: 1 }} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" height={60} />
            <Skeleton variant="text" height={40} width="60%" />
            <Skeleton variant="text" height={30} width="40%" />
            <Skeleton variant="rectangular" height={50} sx={{ my: 2, borderRadius: 2 }} />
            <Skeleton variant="text" height={100} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <Alert severity="error" sx={{ fontSize: '1.1rem', py: 2 }}>{error}</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/products')}>Back to Products</Button>
      </Container>
    );
  }

  const currentPrice = prices[0]?.price || 'Contact for price';
  const images = product?.image_urls?.length > 0 ? product.image_urls : ['/uploads/products/default.jpg'];

  const sortedPrices = [...prices].sort((a, b) => new Date(a.date) - new Date(b.date));

  const chartData = {
    labels: sortedPrices.map(p => new Date(p.date).toLocaleDateString("en-GB")),
    datasets: [{
      label: "Price (₹)",
      data: sortedPrices.map(p => p.price),
      borderColor: "#1976d2",
      backgroundColor: "rgba(25, 118, 210, 0.2)",
      tension: 0.3,
      pointBackgroundColor: "#1976d2",
      pointBorderColor: "#fff",
      pointHoverRadius: 8,
      pointHoverBorderColor: "#1976d2",
    }],
  };

  return (
    <Container maxWidth="lg" sx={{ my: 8 }}>
      <Grid container spacing={6}>
        {/* Left: Images */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 4, mb: 2 }}>
            <Box
              component="img"
              src={`${API_BASE_URL}${images[mainImageIndex]}`}
              alt={product.name}
              sx={{
                width: 550,
                height: 500,
                objectFit: 'cover',
                transition: 'transform 0.4s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
            />
          </Paper>
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, justifyContent: 'center' }}>
            {images.map((img, index) => (
              <Box
                key={index}
                onClick={() => setMainImageIndex(index)}
                sx={{
                  width: { xs: 60, sm: 80, md: 100 },
                  height: { xs: 60, sm: 80, md: 100 },
                  border: mainImageIndex === index ? '3px solid #1976d2' : '2px solid transparent',
                  borderRadius: 2,
                  backgroundImage: `url(${API_BASE_URL}${img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'border-color 0.2s, transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    borderColor: 'primary.light'
                  }
                }}
              />
            ))}
          </Box>
        </Grid>

        {/* Right: Product Details */}
        <Grid item xs={12} md={6}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800, color: 'text.primary' }}>
            {product.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<Package />}
              label={product.packaging}
              size="small"
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<EventNote />}
              label={`${product.shelf_life} days shelf life`}
              size="small"
              color="secondary"
              variant="outlined"
            />
            <Chip
              icon={product.is_active ? <CheckCircleOutline /> : <Info />}
              label={product.is_active ? 'In Stock' : 'Out of Stock'}
              color={product.is_active ? 'success' : 'error'}
              size="small"
            />
          </Box>

          <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 700, mt: 3 }}>
            <Box component="span" sx={{ fontSize: '0.8em', verticalAlign: 'top', mr: 0.5 }}>₹</Box>
            {currentPrice} / {product.packaging || 'Unit'}
          </Typography>

          <Typography variant="body1" paragraph color="text.secondary" sx={{ mb: 3 }}>
            {product.description}
          </Typography>
          
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Restock Date: <Box component="span" sx={{ fontWeight: 400 }}>{product.restock_date}</Box>
          </Typography>
          
          {/* Quantity & Actions */}
          <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, mt: 4, flexWrap: 'wrap' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Quantity:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: 1, p: 0.5 }}>
              <IconButton onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                <Remove />
              </IconButton>
              <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center' }}>{quantity}</Typography>
              <IconButton onClick={() => setQuantity(quantity + 1)} disabled={quantity >= product.available_stock}>
                <Add />
              </IconButton>
            </Box>
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={!product.is_active || product.available_stock === 0}
                sx={{
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  textTransform: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                Add to Cart
              </Button>
              <Button
                variant="outlined"
                startIcon={<HelpOutline />}
                onClick={() => setInquiryDialog(true)}
                sx={{ px: 3, py: 1, fontWeight: 600, textTransform: 'none' }}
              >
                Inquiry
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Price Chart */}
      {prices.length > 0 && (
        <Box sx={{ mt: 8 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp color="primary" /> Price History
          </Typography>
          <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: 6 }}>
            <Line data={chartData} />
          </Paper>
        </Box>
      )}

      {/* Inquiry Dialog */}
      <Dialog open={inquiryDialog} onClose={() => setInquiryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Product Inquiry</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Your message..."
            value={inquiryMessage}
            onChange={(e) => setInquiryMessage(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInquiryDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleInquirySubmit} disabled={!inquiryMessage.trim()}>Send Inquiry</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductDetail;