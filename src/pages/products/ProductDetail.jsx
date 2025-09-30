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
  Skeleton,
  useTheme
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

// --- THEME CONSTANTS ---
const ACCENT_GOLD = '#BF8A00'; 
const PRIMARY_BLACK = '#121212'; 
const DEEP_GRAY = '#F5F5F5';
// --- END THEME CONSTANTS ---

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
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
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={500} sx={{ bgcolor: DEEP_GRAY, borderRadius: 0, border: `1px solid ${PRIMARY_BLACK}40` }} />
            <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'center' }}>
              <Skeleton variant="rectangular" width={100} height={100} sx={{ borderRadius: 0, bgcolor: DEEP_GRAY }} />
              <Skeleton variant="rectangular" width={100} height={100} sx={{ borderRadius: 0, bgcolor: DEEP_GRAY }} />
              <Skeleton variant="rectangular" width={100} height={100} sx={{ borderRadius: 0, bgcolor: DEEP_GRAY }} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" height={60} />
            <Skeleton variant="text" height={40} width="70%" />
            <Skeleton variant="text" height={30} width="50%" sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={150} sx={{ my: 3, borderRadius: 0 }} />
            <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 0 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ fontSize: '1.1rem', py: 2, borderRadius: 0, border: `2px solid ${theme.palette.error.main}` }}>{error}</Alert>
        <Button 
            variant="contained" 
            sx={{ mt: 4, borderRadius: 0, bgcolor: PRIMARY_BLACK, color: 'white', '&:hover': { bgcolor: ACCENT_GOLD, color: PRIMARY_BLACK } }} 
            onClick={() => navigate('/products')}
        >
            Back to Catalogue
        </Button>
      </Container>
    );
  }

  const currentPrice = prices[0]?.price || 'Contact for price';
  const images = product?.image_urls?.length > 0 ? product.image_urls : ['/uploads/products/default.jpg'];

  const sortedPrices = [...prices].sort((a, b) => new Date(a.date) - new Date(b.date));

  const chartData = {
    labels: sortedPrices.map(p => new Date(p.date).toLocaleDateString("en-GB")),
    datasets: [{
      label: "Price (₹/Unit)",
      data: sortedPrices.map(p => p.price),
      borderColor: ACCENT_GOLD,
      backgroundColor: ACCENT_GOLD + '40', // Semi-transparent gold fill
      tension: 0.3,
      pointBackgroundColor: PRIMARY_BLACK,
      pointBorderColor: ACCENT_GOLD,
      pointHoverRadius: 8,
      pointHoverBorderColor: PRIMARY_BLACK,
      pointHoverBackgroundColor: ACCENT_GOLD,
      borderWidth: 3,
    }],
  };
  
  // Chart options to match the theme
  const chartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
          legend: {
              display: true,
              labels: {
                  color: PRIMARY_BLACK,
                  font: { size: 14 }
              }
          },
          title: {
              display: true,
              text: `${product.name} Price Trends`,
              color: PRIMARY_BLACK,
              font: { size: 18, weight: 'bold' }
          }
      },
      scales: {
          x: {
              ticks: { color: PRIMARY_BLACK },
              grid: { color: PRIMARY_BLACK + '10' }
          },
          y: {
              ticks: { color: PRIMARY_BLACK },
              grid: { color: PRIMARY_BLACK + '10' }
          }
      }
  };


  return (
    <Container maxWidth="lg" sx={{ my: 8 }}>
      <Grid container spacing={6}>
        {/* Left: Images */}
        <Grid item xs={12} md={6}>
          {/* Main Image Container */}
          <Paper elevation={3} sx={{ overflow: 'hidden', borderRadius: 0, mb: 2, border: `2px solid ${PRIMARY_BLACK}50` }}>
            <Box
              component="img"
              src={`${API_BASE_URL}${images[mainImageIndex]}`}
              alt={product.name}
              sx={{
                width: '100%',
                height: { xs: 350, md: 500 },
                objectFit: 'cover',
                transition: 'transform 0.5s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
            />
          </Paper>
          {/* Thumbnail Gallery */}
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, justifyContent: 'center', bgcolor: DEEP_GRAY, p: 2 }}>
            {images.map((img, index) => (
              <Box
                key={index}
                onClick={() => setMainImageIndex(index)}
                sx={{
                  width: { xs: 60, sm: 80, md: 100 },
                  height: { xs: 60, sm: 80, md: 100 },
                  // Gold border on selected image
                  border: mainImageIndex === index ? `3px solid ${ACCENT_GOLD}` : `2px solid ${PRIMARY_BLACK}30`,
                  borderRadius: 0,
                  backgroundImage: `url(${API_BASE_URL}${img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'border-color 0.2s, transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    borderColor: ACCENT_GOLD
                  }
                }}
              />
            ))}
          </Box>
        </Grid>

        {/* Right: Product Details */}
        <Grid item xs={12} md={6}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ 
                fontWeight: 800, 
                color: PRIMARY_BLACK,
                textTransform: 'uppercase',
                borderBottom: `3px solid ${ACCENT_GOLD}`,
                pb: 1,
                mb: 3
            }}
          >
            {product.name}
          </Typography>
          
          {/* Tags */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              icon={<Package size={18} style={{ color: ACCENT_GOLD }}/>}
              label={product.packaging.toUpperCase()}
              size="medium"
              sx={{ color: PRIMARY_BLACK, borderColor: PRIMARY_BLACK, bgcolor: 'white', borderRadius: 0, fontWeight: 700 }}
              variant="outlined"
            />
            <Chip
              icon={<EventNote />}
              label={`${product.shelf_life} DAYS SHELF LIFE`}
              size="medium"
              sx={{ color: PRIMARY_BLACK, borderColor: PRIMARY_BLACK, bgcolor: 'white', borderRadius: 0, fontWeight: 700 }}
              variant="outlined"
            />
            <Chip
              icon={product.is_active ? <CheckCircleOutline /> : <Info />}
              label={product.is_active ? 'IN STOCK' : 'OUT OF STOCK'}
              color={product.is_active ? 'success' : 'error'}
              size="medium"
              sx={{ borderRadius: 0, fontWeight: 700 }}
            />
          </Box>

          {/* Price */}
          <Typography variant="h3" color={PRIMARY_BLACK} gutterBottom sx={{ fontWeight: 800, mt: 4, mb: 1 }}>
            <Box component="span" sx={{ fontSize: '0.8em', verticalAlign: 'top', mr: 0.5, color: ACCENT_GOLD, display: 'inline-flex', alignItems: 'center' }}>
                <AttachMoney sx={{ fontSize: 30 }} />
            </Box>
            {currentPrice} <Box component="span" sx={{ fontSize: '0.5em', color: 'text.secondary' }}>/ {product.packaging || 'UNIT'}</Box>
          </Typography>

          {/* Description */}
          <Typography variant="body1" paragraph color="text.secondary" sx={{ mb: 3, pt: 1, borderTop: `1px dashed ${PRIMARY_BLACK}30` }}>
            {product.description}
          </Typography>
          
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: PRIMARY_BLACK, textTransform: 'uppercase' }}>
            Available Stock: <Box component="span" sx={{ fontWeight: 800, color: ACCENT_GOLD }}>{product.available_stock} {product.packaging || 'units'}</Box>
          </Typography>
          
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: PRIMARY_BLACK, textTransform: 'uppercase' }}>
            Restock Estimate: <Box component="span" sx={{ fontWeight: 400 }}>{product.restock_date || 'TBD'}</Box>
          </Typography>
          
          {/* Quantity & Actions */}
          <Paper elevation={1} sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3, mt: 4, flexWrap: 'wrap', border: `1px solid ${ACCENT_GOLD}80`, bgcolor: DEEP_GRAY }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: PRIMARY_BLACK }}>Order Quantity:</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', border: `2px solid ${PRIMARY_BLACK}`, borderRadius: 0, p: 0 }}>
              <IconButton 
                onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                disabled={quantity <= 1}
                sx={{ borderRadius: 0, color: PRIMARY_BLACK, '&:hover': { bgcolor: ACCENT_GOLD, color: PRIMARY_BLACK } }}
              >
                <Remove />
              </IconButton>
              <Typography variant="h6" sx={{ minWidth: 40, textAlign: 'center', fontWeight: 700, color: PRIMARY_BLACK }}>{quantity}</Typography>
              <IconButton 
                onClick={() => setQuantity(quantity + 1)} 
                disabled={quantity >= product.available_stock || !product.is_active}
                sx={{ borderRadius: 0, color: PRIMARY_BLACK, '&:hover': { bgcolor: ACCENT_GOLD, color: PRIMARY_BLACK } }}
              >
                <Add />
              </IconButton>
            </Box>
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={!product.is_active || product.available_stock === 0}
                // High contrast/Gold button
                sx={{
                  px: 3,
                  py: 1,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  borderRadius: 0,
                  bgcolor: PRIMARY_BLACK,
                  color: ACCENT_GOLD,
                  '&:hover': {
                    bgcolor: ACCENT_GOLD,
                    color: PRIMARY_BLACK,
                  },
                  '&.Mui-disabled': {
                    bgcolor: theme.palette.grey[600],
                    color: theme.palette.grey[400],
                  }
                }}
              >
                Add to Cart
              </Button>
              <Button
                variant="outlined"
                startIcon={<HelpOutline />}
                onClick={() => setInquiryDialog(true)}
                // High contrast/Outline button
                sx={{ 
                    px: 3, 
                    py: 1, 
                    fontWeight: 700, 
                    textTransform: 'uppercase',
                    borderRadius: 0,
                    borderColor: PRIMARY_BLACK,
                    color: PRIMARY_BLACK,
                    '&:hover': {
                        borderColor: ACCENT_GOLD,
                        bgcolor: PRIMARY_BLACK,
                        color: ACCENT_GOLD,
                    }
                }}
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
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 4, display: 'flex', alignItems: 'center', gap: 1, color: PRIMARY_BLACK, textTransform: 'uppercase', borderBottom: `3px solid ${ACCENT_GOLD}` }}>
            <TrendingUp color="primary" sx={{ color: ACCENT_GOLD }} /> Price History Analysis
          </Typography>
          <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 0, boxShadow: 6, border: `1px solid ${PRIMARY_BLACK}50` }}>
            <Line data={chartData} options={chartOptions} />
          </Paper>
        </Box>
      )}

      {/* Inquiry Dialog */}
      <Dialog open={inquiryDialog} onClose={() => setInquiryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: PRIMARY_BLACK, color: ACCENT_GOLD, borderBottom: `2px solid ${ACCENT_GOLD}`, fontWeight: 700 }}>
            Product Inquiry: {product.name}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Please detail your quantity and specific requirements here..."
            value={inquiryMessage}
            onChange={(e) => setInquiryMessage(e.target.value)}
            // Themed TextField
            sx={{ 
                mt: 2, 
                '& .MuiOutlinedInput-root': {
                    borderRadius: 0,
                    '& fieldset': { borderColor: PRIMARY_BLACK + '40' },
                    '&:hover fieldset': { borderColor: ACCENT_GOLD },
                    '&.Mui-focused fieldset': { borderColor: ACCENT_GOLD, borderWidth: '2px' },
                }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between', bgcolor: DEEP_GRAY }}>
          <Button onClick={() => setInquiryDialog(false)} sx={{ color: PRIMARY_BLACK, fontWeight: 600 }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleInquirySubmit} 
            disabled={!inquiryMessage.trim()}
            sx={{
                borderRadius: 0,
                bgcolor: PRIMARY_BLACK,
                color: ACCENT_GOLD,
                fontWeight: 700,
                '&:hover': {
                    bgcolor: ACCENT_GOLD,
                    color: PRIMARY_BLACK,
                },
            }}
          >
            Send Inquiry
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {/* Themed Alert for Snackbar */}
        <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity} 
            sx={{ 
                width: '100%', 
                borderRadius: 0,
                borderLeft: `5px solid ${ACCENT_GOLD}` 
            }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductDetail;
