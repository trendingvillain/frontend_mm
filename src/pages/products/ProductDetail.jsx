import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Grid,
  Typography,
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
import { useNavigate, useParams } from 'react-router-dom';
import { fetchProductById, fetchPriceById, submitInquiry } from '../../config/api';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Package } from 'lucide-react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const ACCENT = '#BF8A00';
const BLACK = '#121212';
const GRAY = '#F5F5F5';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const safeUrl = (url) => `${API_BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [product, setProduct] = useState(null);
  const [prices, setPrices] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const slideInterval = useRef();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, priceRes] = await Promise.all([fetchProductById(id), fetchPriceById(id)]);
        if (prodRes.data.success) setProduct(prodRes.data.product);
        else setError('Product not found.');

        if (priceRes.data.success) setPrices(priceRes.data.prices);
      } catch (err) {
        setError('Error loading product details.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // Auto-slide images for multiple images
  useEffect(() => {
    if (product?.image_urls?.length > 1) {
      slideInterval.current && clearInterval(slideInterval.current);
      slideInterval.current = setInterval(() => {
        setMainImageIndex(i => (i + 1) % product.image_urls.length);
      }, 4000);
    }
    return () => clearInterval(slideInterval.current);
  }, [product]);

  const handleAddToCart = () => {
    let cart = JSON.parse(localStorage.getItem('cart') ?? '[]');
    const idx = cart.findIndex(item => item.product_id === Number(id));
    if (idx > -1) cart[idx].quantity += quantity;
    else cart.push({
      product_id: Number(id),
      product_name: product.name,
      quantity,
      price: prices[0]?.price ?? 0,
      image_urls: product.image_urls ?? []
    });
    localStorage.setItem('cart', JSON.stringify(cart));
    setSnackbar({ open: true, message: `${product.name} added to cart!`, severity: 'success' });
  };

  const handleInquirySubmit = async () => {
    if (!inquiryMessage.trim()) return;
    try {
      const response = await submitInquiry({ product_id: Number(id), message: inquiryMessage });
      if (response.data.success) {
        setSnackbar({ open: true, message: 'Inquiry submitted successfully.', severity: 'success' });
        setInquiryDialogOpen(false);
        setInquiryMessage('');
      } else {
        setSnackbar({ open: true, message: response.data.message || 'Error submitting inquiry.', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Network error. Try again.', severity: 'error' });
    }
  };

  if (loading) return (
    <Container maxWidth="lg" sx={{ mt: 8 }}>
      <CircularProgress size={60} sx={{ my: 4, color: ACCENT }} />
    </Container>
  );

  if (error) return (
    <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
      <Typography color="error" sx={{ mb: 4 }}>{error}</Typography>
      <Button variant="contained" onClick={() => navigate('/products')}>Back to Products</Button>
    </Container>
  );

  const currentPrice = prices[0]?.price ?? 'Contact';
  const images = (product?.image_urls && product.image_urls.length) ? product.image_urls : ['/uploads/default.png'];
  const sortedPrices = [...prices].sort((a, b) => new Date(a.date) - new Date(b.date));

  const chartData = {
    labels: sortedPrices.map(p => dayjs(p.date).format('DD/MM/YYYY')),
    datasets: [{
      label: "Price (₹/unit)",
      data: sortedPrices.map(p => p.price),
      borderColor: ACCENT,
      backgroundColor: `${ACCENT}40`,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 8
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { labels: { color: BLACK } },
      title: { display: true, text: `${product.name} Price Trends`, color: BLACK, font: { size: 18, weight: 'bold' } }
    },
    scales: {
      x: { ticks: { color: BLACK }, grid: { color: `${BLACK}10` } },
      y: { ticks: { color: BLACK }, grid: { color: `${BLACK}10` } }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ my: 8 }}>
      <Grid container spacing={6} sx={{ flexDirection: { xs: 'column', md: 'row' }, alignItems: 'flex-start' }}>

        {/* Left side: Image and thumbnails */}
        <Grid item xs={12} md={6}>
          <Box component="img"
            src={safeUrl(images[mainImageIndex])}
            alt={product.name}
            sx={{
              width: { xs: 400, md: 500 },
              height: { xs: 400, md: 500 },
              objectFit: 'cover',
              transition: 'transform 0.5s',
              "&:hover": { transform: 'scale(1.05)' }
            }}
          />
          <Box sx={{display:'flex',justifyContent: 'center',gap:1,p:2,bgcolor: GRAY,overflowX:'auto'}}>
            {images.map((img,i)=>(
              <Box key={i}
                onClick={() => setMainImageIndex(i)}
                sx={{
                  width: { xs:60, sm:80, md:100 },
                  height: { xs:60, sm:80, md:100 },
                  backgroundImage: `url(${safeUrl(img)})`,
                  backgroundSize: 'cover',
                  borderRadius:0,
                  border: i === mainImageIndex ? `3px solid ${ACCENT}` : `2px solid ${BLACK}30`,
                  cursor:'pointer',
                  transition:'all 0.2s ease',
                  '&:hover': {borderColor: ACCENT, transform:'scale(1.05)'},
                  flexShrink:0
                }}
              />
            ))}
          </Box>
        </Grid>

        {/* Right side: Details */}
        <Grid item xs={12} md={6}>
          <Typography variant="h3" sx={{fontWeight: 800, textTransform: 'uppercase', borderBottom: `3px solid ${ACCENT}`, mb:3}}>
            {product.name}
          </Typography>

          <Box sx={{display:'flex',gap:2, flexWrap:'wrap', mb:2}}>
            <Chip icon={<Package size={18}/>} label={product.packaging.toUpperCase()} sx={{borderRadius:0, borderColor:BLACK, color:BLACK}} />
            <Chip icon={<EventNote/>} label={`${product.shelf_life} DAYS SHELF LIFE`} sx={{borderRadius:0}} />
            <Chip icon={product.is_active ? <CheckCircleOutline /> : <Info />} label={product.is_active ? 'IN STOCK' : 'OUT OF STOCK'} color={product.is_active ? 'success' : 'error'} sx={{borderRadius:0}}/>
          </Box>

          <Typography variant="h3" sx={{mb:1}}>
            
            ₹{currentPrice} <Typography component="span" variant="subtitle1" sx={{color:'text.secondary'}}>/ {product.packaging || 'unit'}</Typography>
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{mb:3}}>
            {product.description}
          </Typography>

          <Typography><strong>Available Stock:</strong> {product.available_stock} {product.packaging || 'units'}</Typography>
          <Typography sx={{mb:3}}><strong>Restock Estimate:</strong> {product.restock_date ? dayjs(product.restock_date).format('DD/MM/YYYY') : 'TBD'}</Typography>

          <Box sx={{display: 'flex', gap: 2, flexWrap:'wrap', alignItems:'center'}}>
            <Box sx={{display:'flex',alignItems:'center', border:`1px solid ${BLACK}`, borderRadius: 1}}>
              <IconButton onClick={() => setQuantity(q => Math.max(1,q-1))} disabled={quantity <= 1}><Remove/></IconButton>
              <Typography sx={{px:2}}>{quantity}</Typography>
              <IconButton onClick={() => setQuantity(q => Math.min(q+1, product.available_stock))} disabled={quantity >= product.available_stock || !product.is_active}><Add/></IconButton>
            </Box>
            <Button variant="contained" disabled={!product.is_active || product.available_stock === 0} onClick={handleAddToCart}
              sx={{ bgcolor: BLACK, color: ACCENT, '&:hover': { bgcolor: ACCENT, color: BLACK }, borderRadius: 0, fontWeight: 'bold', px:4 }}
              startIcon={<ShoppingCart/>}
            >
              Add to Cart
            </Button>
            <Button variant="outlined" onClick={() => setInquiryDialogOpen(true)} 
              sx={{ borderRadius:0, borderColor: BLACK, color: BLACK, '&:hover': { bgcolor: ACCENT, color: BLACK }, px:4, fontWeight:'bold'}}
              startIcon={<HelpOutline/>}
            >
              Inquiry
            </Button>
          </Box>
        </Grid>

      </Grid>

      {prices?.length > 0 && (
        <Box sx={{mt:6}}>
          <Typography variant="h5" sx={{color: BLACK, mb:2, borderBottom: `3px solid ${ACCENT}`}}>
            <TrendingUp sx={{verticalAlign:'middle', mr:1, color: ACCENT}}/>
            Price History
          </Typography>
          <Paper sx={{p:2, boxShadow:6, borderRadius:0, border: `1px solid ${BLACK}30`}}>
            <Line data={chartData} options={chartOptions} />
          </Paper>
        </Box>
      )}

      <Dialog open={inquiryDialogOpen} onClose={() => setInquiryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: BLACK, color: ACCENT, fontWeight: 'bold', borderBottom: `2px solid ${ACCENT}` }}>
          Product Inquiry: {product?.name}
        </DialogTitle>
        <DialogContent>
          <TextField
            multiline
            fullWidth
            rows={4}
            placeholder="Please detail your quantity and specific requirements here..."
            value={inquiryMessage}
            onChange={e => setInquiryMessage(e.target.value)}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                '& fieldset': { borderColor: `${BLACK}80` },
                '&:hover fieldset': { borderColor: ACCENT },
                '&.Mui-focused fieldset': { borderColor: ACCENT, borderWidth: 2 }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ bgcolor: GRAY, justifyContent: 'space-between', p: 2 }}>
          <Button onClick={() => setInquiryDialogOpen(false)} sx={{ color: BLACK, fontWeight: 'bold' }}>Cancel</Button>
          <Button onClick={handleInquirySubmit} disabled={!inquiryMessage.trim()}
            sx={{ bgcolor: BLACK, color: ACCENT, borderRadius: 0, fontWeight: 'bold', '&:hover': { bgcolor: ACCENT, color: BLACK } }}>
            Send Inquiry
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar anchorOrigin={{ vertical:'bottom', horizontal: 'center' }} open={snackbar.open} autoHideDuration={6000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 0, borderLeft: `5px solid ${ACCENT}` }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductDetail;
