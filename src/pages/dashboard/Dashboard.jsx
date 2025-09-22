import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Chip,
  Paper,
  Alert,
  CircularProgress,
  Skeleton,
  Stack
} from '@mui/material';
import {
  ShoppingCart,
  TrendingUp,
  VpnKey,
  CheckCircleOutline,
  InfoOutlined,
  Visibility,
  LocalShippingOutlined
} from '@mui/icons-material';
import { MapPin, Phone, Mail, Store, Package, Sprout, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchProducts, fetchUserOrders, fetchGallery } from '../../config/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [productsResponse, ordersResponse, galleryResponse] = await Promise.all([
          fetchProducts(),
          fetchUserOrders(),
          fetchGallery()
        ]);
        
        if (productsResponse.data.success) {
          setProducts(productsResponse.data.products.slice(0, 4));
        }
        
        if (ordersResponse.data.success) {
          setRecentOrders(ordersResponse.data.orders.slice(0, 3));
        }

        if (galleryResponse.data.success) {
          setGallery(galleryResponse.data.images);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const handleCloseDialog = () => setSelectedImage(null);
  
  return (
    <Container maxWidth="xl" sx={{ my: 8 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800, color: 'primary.main' }}>
          Welcome back, {user?.name}! 👋
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800 }}>
          Here's a quick overview of your account and the latest products.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

        <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-stone-900 py-24 md:py-32">
                <div className="container mx-auto px-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                      <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
                        Premium Bananas, Globally Delivered 🌍
                      </h1>
                      <p className="mt-4 text-lg md:text-xl text-stone-300">
                        Connecting global markets with the finest, farm-fresh bananas. Our commitment to quality ensures every fruit is a symbol of excellence.
                      </p>
                      <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <button
                          className="bg-yellow-400 text-gray-900 hover:bg-yellow-500 font-bold px-8 py-4 rounded-xl transition-transform transform hover:scale-105"
                          onClick={() => navigate('/products')}
                        >
                          Explore Our Products
                        </button>
                      </div>
                    </div>
                    <div className="relative p-4 rounded-3xl overflow-hidden group">
                      <img
                        src="https://thumbs.dreamstime.com/b/banana-plantation-tenerife-canary-islands-south-171627083.jpg"
                        alt="Banana farm"
                        className="w-full h-80 md:h-[400px] object-cover rounded-2xl shadow-2xl transition-transform duration-500 transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/30 rounded-2xl"></div>
                    </div>
                  </div>
                </div>
              </section>
        
              {/* --- */}
        
              {/* Gallery Section */}
              <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                  <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-gray-900">
                    Our Gallery
                  </h2>
                  {gallery.length > 0 ? (
                    <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
                      {gallery.map((item) => (
                        <div
                          key={item.id}
                          className="mb-4 break-inside-avoid-column relative group cursor-pointer"
                          onClick={() => setSelectedImage(`${API_BASE_URL}${item.image_url}`)}
                        >
                          <img
                            src={`${API_BASE_URL}${item.image_url}`}
                            alt="Gallery"
                            className="w-full rounded-xl object-cover transition-transform duration-300 transform group-hover:scale-105 group-hover:shadow-lg"
                          />
                          <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">No gallery images available.</p>
                  )}
                </div>
              </section>
        
              {/* Lightbox Dialog */}
              {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
                  <div className="relative max-w-4xl max-h-full overflow-y-auto">
                    <button
                      onClick={handleCloseDialog}
                      className="absolute top-4 right-4 text-white z-50 p-2 rounded-full bg-gray-900 bg-opacity-50 hover:bg-opacity-75 transition"
                    >
                      <X size={24} />
                    </button>
                    <img src={selectedImage} alt="Full-size gallery" className="w-full h-full object-contain rounded-lg" />
                  </div>
                </div>
              )}
        

      {/* Featured Products Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Featured Products
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/products')}>
            View All Products
          </Button>
        </Box>
        <Grid container spacing={4}>
          {loading ? (
            Array.from(new Array(4)).map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: '100%', borderRadius: 4, boxShadow: 2 }}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" width="80%" sx={{ fontSize: '1.5rem' }} />
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="rectangular" height={36} sx={{ mt: 2, borderRadius: 2 }} />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            products.map((product) => (
              <Grid item xs={12} sm={6} md={3} key={product.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    boxShadow: 2,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 8,
                      cursor: 'pointer'
                    }
                  }}
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <CardMedia
                    component="img"
                    image={`${API_BASE_URL}${product.image_urls?.[0] || "/uploads/products/default.jpg"}`}
                    alt={product.name}
                    sx={{ height: 200, objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {product.description.length > 50 ? `${product.description.slice(0, 50)}...` : product.description}
                    </Typography>
                    <Chip
                      label={`${product.shelf_life} days shelf life`}
                      size="small"
                      color="secondary"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip
                      label={product.packaging}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{ mt: 'auto', borderRadius: 2 }}
                      startIcon={<Visibility />}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Box>

      {/* Recent Orders Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Recent Orders
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/orders')}>
            View All Orders
          </Button>
        </Box>
        {loading ? (
          <Grid container spacing={3}>
            {Array.from(new Array(3)).map((_, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper sx={{ p: 3, borderRadius: 4, boxShadow: 2 }}>
                  <Skeleton variant="text" width="60%" sx={{ fontSize: '1.5rem' }} />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="50%" />
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : recentOrders.length > 0 ? (
          <Grid container spacing={4}>
            {recentOrders.map((order) => (
              <Grid item xs={12} md={4} key={order.id}>
                <Paper sx={{ p: 3, borderRadius: 4, boxShadow: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Order <span style={{ color: 'primary.main' }}>#{order.id}</span>
                  </Typography>
                  <Chip
                    icon={<LocalShippingOutlined />}
                    label={order.status}
                    color={order.status === 'completed' ? 'success' : order.status === 'shipped' ? 'info' : 'warning'}
                    sx={{ mb: 2, textTransform: 'capitalize' }}
                  />
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Delivery Date:{new Date(order.delivery_date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Items: {order.items?.length || 0}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, boxShadow: 2 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              You haven't placed any orders yet.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => navigate('/products')}
            >
              Start Shopping
            </Button>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;