import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Grid,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import { Search, Add } from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { fetchAdminProducts, addPriceToProduct, fetchPriceById } from '../../config/api';
import dayjs from 'dayjs';

const AdminPrices = () => {
  const [products, setProducts] = useState([]);
  const [prices, setPrices] = useState([]);
  const [filteredPrices, setFilteredPrices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [priceDialog, setPriceDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [priceForm, setPriceForm] = useState({
    product_id: '',
    price: '',
    date: dayjs()
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterPrices();
  }, [searchTerm, prices]);

  const loadData = async () => {
    try {
      const productsResponse = await fetchAdminProducts();
      if (productsResponse.data.success) {
        setProducts(productsResponse.data.products);
        
        // Load prices for all products
        const allPrices = [];
        for (const product of productsResponse.data.products) {
          try {
            const priceResponse = await fetchPriceById(product.id);
            if (priceResponse.data.success) {
              const productPrices = priceResponse.data.prices.map(price => ({
                ...price,
                product_name: product.name
              }));
              allPrices.push(...productPrices);
            }
          } catch (error) {
            console.error(`Error loading prices for product ${product.id}:`, error);
          }
        }
        
        // Sort by date descending
        allPrices.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPrices(allPrices);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPrices = () => {
    if (searchTerm) {
      const filtered = prices.filter(price =>
        price.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        price.price.toString().includes(searchTerm)
      );
      setFilteredPrices(filtered);
    } else {
      setFilteredPrices(prices);
    }
  };

  const handleOpenDialog = () => {
    setPriceForm({
      product_id: '',
      price: '',
      date: dayjs()
    });
    setPriceDialog(true);
  };

  const handleCloseDialog = () => {
    setPriceDialog(false);
  };

  const handleFormChange = (field, value) => {
    setPriceForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const formData = {
        product_id: parseInt(priceForm.product_id),
        price: parseFloat(priceForm.price),
        date: priceForm.date.format('YYYY-MM-DD')
      };

      const response = await addPriceToProduct(formData);
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Price added successfully!',
          severity: 'success'
        });
        handleCloseDialog();
        loadData();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error adding price',
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Box>
        <Typography>Loading prices...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Price Management
      </Typography>

      {/* Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          placeholder="Search by product name or price..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
      </Paper>

      {/* Prices Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              
              <TableCell>Product Name</TableCell>
              <TableCell>Price (₹)</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPrices.map((price) => (
              <TableRow key={price.id}>
                
                <TableCell>
                  <Typography sx={{ fontWeight: 500 }}>
                    {price.product_name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                    ₹{price.price}
                  </Typography>
                </TableCell>
                <TableCell>
                  {new Date(price.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(price.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredPrices.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No prices found
          </Typography>
        </Box>
      )}

      {/* Floating Add Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleOpenDialog}
      >
        <Add />
      </Fab>

      {/* Price Dialog */}
      <Dialog open={priceDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Price</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Product"
                  value={priceForm.product_id}
                  onChange={(e) => handleFormChange('product_id', e.target.value)}
                  required
                >
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name} - {product.packaging}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Price (₹)"
                  type="number"
                  step="0.01"
                  value={priceForm.price}
                  onChange={(e) => handleFormChange('price', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Price Date"
                  value={priceForm.date}
                  onChange={(newValue) => handleFormChange('date', newValue)}
                  sx={{ width: '100%' }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!priceForm.product_id || !priceForm.price}
          >
            Add Price
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPrices;