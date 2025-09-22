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
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Skeleton,
  Stack
} from '@mui/material';
import {
  Search,
  Store,
  LocalShipping,
  EventNote,
  AddShoppingCart,
  Visibility,
  CheckCircleOutline,
  Info,
  FilterList
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchProducts } from '../../config/api';
import { Package } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Products = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetchProducts();
        if (response.data.success) {
          setProducts(response.data.products);
        } else {
          setError('Failed to fetch products.');
        }
      } catch (err) {
        console.error('Error loading products:', err);
        setError('An error occurred while loading products.');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const productTypes = useMemo(() => {
    const types = new Set(products.map(p => p.packaging));
    return ['All', ...Array.from(types)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    let result = products;

    if (selectedFilter !== 'All') {
      result = result.filter(product => product.packaging === selectedFilter);
    }

    if (searchTerm) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(lowercasedSearchTerm)
      );
    }

    return result;
  }, [searchTerm, selectedFilter, products]);

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
  };

  if (user?.status === 'pending') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ fontSize: '1.1rem', py: 2 }}>
          Your account is **pending approval**. You can view products but cannot make purchases yet.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ my: 8 }}>
      <Box sx={{ mb: 6, textAlign: { xs: 'center', md: 'left' } }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800, color: 'primary.main' }}>
          Explore Our Harvest 🍌
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph sx={{ maxWidth: 600, mx: { xs: 'auto', md: '0' } }}>
          Discover our selection of fresh, high-quality produce, sourced directly from the best farms.
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search for a specific product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            sx: { borderRadius: 10, bgcolor: 'background.paper', boxShadow: 1 }
          }}
          sx={{ maxWidth: 400 }}
        />
        <Stack direction="row" spacing={1} sx={{ mt: { xs: 2, md: 0 }, flexShrink: 0 }}>
          <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterList sx={{ mr: 0.5 }} /> Filter:
          </Typography>
          {productTypes.map(type => (
            <Chip
              key={type}
              label={type}
              onClick={() => setSelectedFilter(type)}
              color={selectedFilter === type ? 'primary' : 'default'}
              variant={selectedFilter === type ? 'contained' : 'outlined'}
            />
          ))}
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>}

      {/* Product Grid */}
      {loading ? (
        <Grid container spacing={4}>
          {Array.from(new Array(6)).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: 450, borderRadius: 4, boxShadow: 2 }}>
                <Skeleton variant="rectangular" height={250} />
                <CardContent>
                  <Skeleton variant="text" width="80%" sx={{ fontSize: '2rem', mb: 1 }} />
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="90%" sx={{ mt: 2 }} />
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 1 }} />
                  </Box>
                  <Skeleton variant="rectangular" height={36} sx={{ mt: 3, borderRadius: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={4}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card
                  sx={{
                    height: 500,
                    width: 350,
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    boxShadow: 2,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: 8,
                      '& .MuiCardMedia-root': {
                        transform: 'scale(1.05)'
                      }
                    }
                  }}
                  onClick={() => handleProductClick(product.id)}
                >
                  <Box sx={{ height: 220, overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      image={`${API_BASE_URL}${product.image_urls?.[0] || "/uploads/products/default.jpg"}`}
                      alt={product.name}
                      sx={{
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s'
                      }}
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                    <Typography gutterBottom variant="h5" component="h3" sx={{ fontWeight: 700 }}>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph sx={{ flexGrow: 1 }}>
                      {product.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip
                        label={product.packaging}
                        size="small"
                        variant="outlined"
                        icon={<Package fontSize="small" />}
                        color="primary"
                      />
                      <Chip
                        label={`${product.shelf_life} days`}
                        size="small"
                        variant="outlined"
                        icon={<EventNote fontSize="small" />}
                        color="secondary"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'bold' }}>
                        Stock: {product.available_stock} Pieces
                      </Typography>
                      <Chip
                        icon={product.is_active ? <CheckCircleOutline /> : <Info />}
                        label={product.is_active ? 'Available' : 'Out of Stock'}
                        color={product.is_active ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{ mt: 'auto', borderRadius: 2 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product.id);
                      }}
                      disabled={!product.is_active}
                      startIcon={<Visibility />}
                    >
                      {isAuthenticated ? 'View Details' : 'Login to View'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 12, width: '100%' }}>
              <Store sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h4" color="text.secondary" gutterBottom>
                No products found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {searchTerm ? 'Try adjusting your search terms.' : 'Check back later for new product listings.'}
              </Typography>
            </Box>
          )}
        </Grid>
      )}
    </Container>
  );
};

export default Products;