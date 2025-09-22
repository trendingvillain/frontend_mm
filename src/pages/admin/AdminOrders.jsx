import React, { useState, useEffect } from "react";
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
  Grid,
  MenuItem,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { Search, Edit, Receipt, Visibility } from "@mui/icons-material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  fetchAllOrders,
  updateOrderStatus,
  createOrderInvoice,
} from "../../config/api";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusDialog, setStatusDialog] = useState(false);
  const [invoiceDialog, setInvoiceDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [statusForm, setStatusForm] = useState({
    status: "",
    delivery_date: dayjs(),
  });
  const [invoiceForm, setInvoiceForm] = useState({
    invoice_number: "",
    items: [],
    total: 0,
  });

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, orders]);

  const loadOrders = async () => {
    try {
      const response = await fetchAllOrders();
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (searchTerm) {
      const filtered = orders.filter(
        (order) =>
          order.order_id.toString().includes(searchTerm) ||
          order.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  };

  const handleOpenStatusDialog = (order) => {
    setSelectedOrder(order);
    setStatusForm({
      status: order.status,
      delivery_date: dayjs(order.delivery_date),
    });
    setStatusDialog(true);
  };

  const handleOpenInvoiceDialog = (order) => {
    setSelectedOrder(order);
    const nextInvoiceNumber = `INV-${String(orders.length + 1).padStart(3, "0")}`;
    setInvoiceForm({
      invoice_number: nextInvoiceNumber,
      items: order.items.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        weight: item.weight || 0,
        price: 0,
        calcType: "quantity",
        subtotal: 0,
      })),
      total: 0,
    });
    setInvoiceDialog(true);
  };

  const handleStatusUpdate = async () => {
    try {
      const response = await updateOrderStatus(selectedOrder.order_id, {
        status: statusForm.status,
        delivery_date: statusForm.delivery_date.format("YYYY-MM-DD"),
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Order status updated successfully!",
          severity: "success",
        });
        setStatusDialog(false);
        loadOrders();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error updating order status",
        severity: "error",
      });
    }
  };

  // ✅ Update invoice item
  const updateInvoiceItem = (index, field, value) => {
    const updatedItems = [...invoiceForm.items];
    updatedItems[index][field] = value;

    // Recalculate subtotal
    if (updatedItems[index].calcType === "quantity") {
      updatedItems[index].subtotal =
        updatedItems[index].quantity * updatedItems[index].price;
    } else {
      updatedItems[index].subtotal =
        updatedItems[index].weight * updatedItems[index].price;
    }

    // Recalculate total
    const newTotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);

    setInvoiceForm({ ...invoiceForm, items: updatedItems, total: newTotal });
  };

  // ✅ Handle calc type change
  const handleCalcTypeChange = (index, value) => {
    const updatedItems = [...invoiceForm.items];
    updatedItems[index].calcType = value;

    // Recalculate subtotal
    if (value === "quantity") {
      updatedItems[index].subtotal =
        updatedItems[index].quantity * updatedItems[index].price;
    } else {
      updatedItems[index].subtotal =
        updatedItems[index].weight * updatedItems[index].price;
    }

    const newTotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);

    setInvoiceForm({ ...invoiceForm, items: updatedItems, total: newTotal });
  };

  // ✅ Handle invoice create
  const handleInvoiceCreate = async () => {
    try {
      const response = await createOrderInvoice(selectedOrder.order_id, invoiceForm);
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: "Invoice created successfully!",
          severity: "success",
        });
        setInvoiceDialog(false);
        loadOrders();
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error creating invoice",
        severity: "error",
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "confirmed":
        return "info";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Box>
        <Typography>Loading orders...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Order Management
      </Typography>

      {/* Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          placeholder="Search by order ID, customer name, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 400 }}
        />
      </Paper>

      {/* Orders Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Delivery Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Items</TableCell>
              <TableCell>Invoice</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.order_id}>
                <TableCell>#{order.order_id}</TableCell>
                <TableCell>{order.user_name}</TableCell>
                <TableCell>{order.user_address}</TableCell>
                <TableCell>{order.user_phone}</TableCell>
                <TableCell>{new Date(order.delivery_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status)}
                    size="small"
                    sx={{ textTransform: "capitalize" }}
                  />
                </TableCell>
                <TableCell>
                  {order.items.map((item, index) => (
                    <Typography key={index} variant="body2">
                      {item.product_name} x {item.quantity} | {item.weight} kg
                    </Typography>
                  ))}
                </TableCell>
                <TableCell>
                  {order.invoice_number ? (
                    <Chip label={order.invoice_number} color="success" size="small" />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No Invoice
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Update Status">
                      <IconButton size="small" onClick={() => handleOpenStatusDialog(order)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    {!order.invoice_number && order.status !== "cancelled" && (
                      <Tooltip title="Create Invoice">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenInvoiceDialog(order)}
                        >
                          <Receipt />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => navigate(`/admin/orders/${order.order_id}`)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredOrders.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No orders found
          </Typography>
        </Box>
      )}

      {/* Status Update Dialog */}
      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={statusForm.status}
                  onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <DatePicker
                  label="Delivery Date"
                  value={statusForm.delivery_date}
                  onChange={(newValue) => setStatusForm({ ...statusForm, delivery_date: newValue })}
                  sx={{ width: "100%" }}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleStatusUpdate}>
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invoice Creation Dialog */}
      <Dialog open={invoiceDialog} onClose={() => setInvoiceDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Invoice</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Invoice Number"
                value={invoiceForm.invoice_number}
                onChange={(e) =>
                  setInvoiceForm({ ...invoiceForm, invoice_number: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Amount"
                type="number"
                value={invoiceForm.total}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Invoice Items
              </Typography>
              {invoiceForm.items.map((item, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={2}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {item.product_name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="Quantity"
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateInvoiceItem(index, "quantity", parseInt(e.target.value) || 0)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="Weight"
                        type="number"
                        value={item.weight}
                        onChange={(e) =>
                          updateInvoiceItem(index, "weight", parseFloat(e.target.value) || 0)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="Price (₹)"
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) =>
                          updateInvoiceItem(index, "price", parseFloat(e.target.value) || 0)
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <RadioGroup
                        row
                        value={item.calcType}
                        onChange={(e) => handleCalcTypeChange(index, e.target.value)}
                      >
                        <FormControlLabel value="quantity" control={<Radio />} label="Qty" />
                        <FormControlLabel value="weight" control={<Radio />} label="Wt" />
                      </RadioGroup>
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        ₹{item.subtotal?.toFixed(2) || "0.00"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInvoiceDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleInvoiceCreate}
            disabled={!invoiceForm.invoice_number || invoiceForm.total === 0}
          >
            Create Invoice
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminOrders;