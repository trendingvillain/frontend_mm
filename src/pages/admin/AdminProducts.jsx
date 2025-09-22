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
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Grid,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Search, Add, Edit } from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { fetchAdminProducts, addProduct, updateProduct } from '../../config/api';
import dayjs from 'dayjs';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    packaging: '',
    shelf_life: '',
    available_stock: '',
    restock_date: dayjs().add(1, 'day'),
    is_active: true,
    images: [], // store selected File objects
    existingImages: [], // for edit, existing image URLs
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, products]);

  const loadProducts = async () => {
    try {
      const response = await fetchAdminProducts();
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        packaging: product.packaging,
        shelf_life: product.shelf_life || '',
        available_stock: product.available_stock,
        restock_date: dayjs(product.restock_date),
        is_active: product.is_active,
        images: [],
        existingImages: product.image_urls || [],
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        packaging: '',
        shelf_life: '',
        available_stock: '',
        restock_date: dayjs().add(1, 'day'),
        is_active: true,
        images: [],
        existingImages: [],
      });
    }
    setProductDialog(true);
  };

  const handleCloseDialog = () => {
    setProductDialog(false);
    setEditingProduct(null);
  };

  const handleFormChange = (field, value) => {
    setProductForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e) => {
    setProductForm(prev => ({
      ...prev,
      images: Array.from(e.target.files)
    }));
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('packaging', productForm.packaging);
      formData.append('shelf_life', productForm.shelf_life);
      formData.append('available_stock', productForm.available_stock);
      formData.append('restock_date', productForm.restock_date.format('YYYY-MM-DD'));
      formData.append('is_active', productForm.is_active);

      // append new images
      productForm.images.forEach(file => {
        formData.append('images', file);
      });

      let response;
      if (editingProduct) {
        response = await updateProduct(editingProduct.id, formData);
      } else {
        response = await addProduct(formData);
      }

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: `Product ${editingProduct ? 'updated' : 'added'} successfully!`,
          severity: 'success'
        });
        handleCloseDialog();
        loadProducts();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error ${editingProduct ? 'updating' : 'adding'} product`,
        severity: 'error'
      });
    }
  };

  if (loading) return <Typography>Loading products...</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Product Management
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          sx={{ minWidth: 300 }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Packaging</TableCell>
              <TableCell>Shelf Life</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Restock Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Images</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell>{product.packaging}</TableCell>
                <TableCell>{product.shelf_life} days</TableCell>
                <TableCell>{product.available_stock}</TableCell>
                <TableCell>{new Date(product.restock_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label={product.is_active ? 'Active' : 'Inactive'}
                    color={product.is_active ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {product.image_urls && product.image_urls.map((url, idx) => (
                    <img key={idx} src={url} alt={product.name} width={50} style={{ marginRight: 4 }} />
                  ))}
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit Product">
                    <IconButton size="small" onClick={() => handleOpenDialog(product)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredProducts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">No products found</Typography>
        </Box>
      )}

      <Fab color="primary" aria-label="add" sx={{ position: 'fixed', bottom: 16, right: 16 }} onClick={() => handleOpenDialog()}>
        <Add />
      </Fab>

      {/* Product Dialog */}
      <Dialog open={productDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Product Name"
                  value={productForm.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth label="Packaging"
                  value={productForm.packaging}
                  onChange={(e) => handleFormChange('packaging', e.target.value)}
                  placeholder="e.g., Box of 20 kg"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth label="Description"
                  multiline rows={3}
                  value={productForm.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth label="Shelf Life (days)"
                  type="number"
                  value={productForm.shelf_life}
                  onChange={(e) => handleFormChange('shelf_life', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth label="Available Stock"
                  type="number"
                  value={productForm.available_stock}
                  onChange={(e) => handleFormChange('available_stock', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <DatePicker
                  label="Restock Date"
                  value={productForm.restock_date}
                  onChange={(newValue) => handleFormChange('restock_date', newValue)}
                  sx={{ width: '100%' }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={productForm.is_active}
                      onChange={(e) => handleFormChange('is_active', e.target.checked)}
                    />
                  }
                  label="Active Product"
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="outlined" component="label">
                  Upload Images
                  <input type="file" multiple hidden onChange={handleFileChange} />
                </Button>
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  {productForm.existingImages.map((url, idx) => (
                    <img key={idx} src={url} alt={`Existing ${idx}`} width={60} />
                  ))}
                  {productForm.images.map((file, idx) => (
                    <img key={idx} src={URL.createObjectURL(file)} alt={`New ${idx}`} width={60} />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!productForm.name || !productForm.description}>
            {editingProduct ? 'Update' : 'Add'} Product
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminProducts;
