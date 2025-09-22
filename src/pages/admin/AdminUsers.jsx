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
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { Search, Visibility, CheckCircle, Cancel } from '@mui/icons-material';
import { fetchAllUsers, updateUserStatus, fetchOrdersByUser } from '../../config/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [viewDialog, setViewDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, statusFilter, roleFilter, users]);

  const loadUsers = async () => {
    try {
      const response = await fetchAllUsers();
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm) ||
        user.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleStatusUpdate = async (userId, newStatus) => {
    try {
      const response = await updateUserStatus(userId, { status: newStatus });
      if (response.data.success) {
        setUsers(users.map(user =>
          user.id === userId ? { ...user, status: newStatus } : user
        ));
        setSnackbar({
          open: true,
          message: `User status updated to ${newStatus}`,
          severity: 'success'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error updating user status',
        severity: 'error'
      });
    }
  };

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    try {
      const response = await fetchOrdersByUser(user.id);
      if (response.data.success) {
        setUserOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error loading user orders:', error);
      setUserOrders([]);
    }
    setViewDialog(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'dealer':
        return 'primary';
      case 'shopkeeper':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box>
        <Typography>Loading users...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        User Management
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search users..."
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
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
          <TextField
            select
            label="Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="dealer">Dealer</MenuItem>
            <MenuItem value="shopkeeper">Shopkeeper</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Business Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>
                  <Typography sx={{ fontWeight: 500 }}>
                    {user.name}
                  </Typography>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={getRoleColor(user.role)}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell>{user.business_name}</TableCell>
                <TableCell>
                  <Chip
                    label={user.status}
                    color={getStatusColor(user.status)}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewUser(user)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    {user.status === 'pending' && (
                      <>
                        <Tooltip title="Approve">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleStatusUpdate(user.id, 'approved')}
                          >
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleStatusUpdate(user.id, 'suspended')}
                          >
                            <Cancel />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredUsers.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No users found
          </Typography>
        </Box>
      )}

      {/* User Details Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Name</Typography>
                  <Typography>{selectedUser.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography>{selectedUser.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Phone</Typography>
                  <Typography>{selectedUser.phone}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Role</Typography>
                  <Chip
                    label={selectedUser.role}
                    color={getRoleColor(selectedUser.role)}
                    size="small"
                  />
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom>
                Business Information
              </Typography>
              <Box sx={{ mb: 3, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Business Name</Typography>
                  <Typography>{selectedUser.business_name}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">GST Number</Typography>
                  <Typography>{selectedUser.gst_number || 'N/A'}</Typography>
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="body2" color="text.secondary">Address</Typography>
                  <Typography>{selectedUser.address}</Typography>
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom>
                Order History ({userOrders.length} orders)
              </Typography>
              {userOrders.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Order ID</TableCell>
                        <TableCell>Delivery Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Items</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userOrders.slice(0, 5).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>#{order.id}</TableCell>
                          <TableCell>
                            {new Date(order.delivery_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={order.status}
                              color={order.status === 'completed' ? 'success' : 'warning'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{order.items?.length || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">No orders found</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog(false)}>Close</Button>
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

export default AdminUsers;