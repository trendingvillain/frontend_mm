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
  MenuItem,
  Snackbar,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { Search, Edit, Visibility } from '@mui/icons-material';
import { fetchAllInquiries, updateInquiryStatus } from '../../config/api';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [statusDialog, setStatusDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadInquiries();
  }, []);

  useEffect(() => {
    filterInquiries();
  }, [searchTerm, statusFilter, inquiries]);

  const loadInquiries = async () => {
    try {
      const response = await fetchAllInquiries();
      if (response.data.success) {
        setInquiries(response.data.inquiries);
      }
    } catch (error) {
      console.error('Error loading inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInquiries = () => {
    let filtered = inquiries;

    if (searchTerm) {
      filtered = filtered.filter(inquiry =>
        inquiry.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.status === statusFilter);
    }

    setFilteredInquiries(filtered);
  };

  const handleOpenStatusDialog = (inquiry) => {
    setSelectedInquiry(inquiry);
    setNewStatus(inquiry.status);
    setStatusDialog(true);
  };

  const handleOpenViewDialog = (inquiry) => {
    setSelectedInquiry(inquiry);
    setViewDialog(true);
  };

  const handleStatusUpdate = async () => {
    try {
      const response = await updateInquiryStatus(selectedInquiry.id, {
        status: newStatus
      });
      
      if (response.data.success) {
        setInquiries(inquiries.map(inquiry =>
          inquiry.id === selectedInquiry.id
            ? { ...inquiry, status: newStatus }
            : inquiry
        ));
        setSnackbar({
          open: true,
          message: 'Inquiry status updated successfully!',
          severity: 'success'
        });
        setStatusDialog(false);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error updating inquiry status',
        severity: 'error'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'warning';
      case 'responded':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box>
        <Typography>Loading inquiries...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Inquiry Management
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search inquiries..."
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
          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="responded">Responded</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Inquiries Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInquiries.map((inquiry) => (
              <TableRow key={inquiry.id}>
                <TableCell>{inquiry.id}</TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 500 }}>
                    {inquiry.user_name || 'Guest'}
                  </Typography>
                </TableCell>
                <TableCell>
                  {inquiry.product_name || 'General Inquiry'}
                </TableCell>
                <TableCell>{inquiry.phone || 'N/A'}</TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {inquiry.message}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={inquiry.status}
                    color={getStatusColor(inquiry.status)}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell>
                  {new Date(inquiry.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenViewDialog(inquiry)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Update Status">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenStatusDialog(inquiry)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredInquiries.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No inquiries found
          </Typography>
        </Box>
      )}

      {/* View Inquiry Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Inquiry Details</DialogTitle>
        <DialogContent>
          {selectedInquiry && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Customer</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedInquiry.user_name || 'Guest User'}
                </Typography>
              </Box>
              
              {selectedInquiry.user_phone && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{selectedInquiry.user_phone}</Typography>
                </Box>
              )}
              
              {selectedInquiry.product_name && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Product</Typography>
                  <Typography variant="body1">{selectedInquiry.product_name}</Typography>
                </Box>
              )}
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip
                  label={selectedInquiry.status}
                  color={getStatusColor(selectedInquiry.status)}
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">Date</Typography>
                <Typography variant="body1">
                  {new Date(selectedInquiry.created_at).toLocaleString()}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Message
                </Typography>
                <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                  <Typography variant="body1">
                    {selectedInquiry.message}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Update Inquiry Status</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            sx={{ mt: 2 }}
          >
            <MenuItem value="new">New</MenuItem>
            <MenuItem value="responded">Responded</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleStatusUpdate}>
            Update Status
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

export default AdminInquiries;
