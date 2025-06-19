// src/components/CustomerOrdersDialog.tsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import axiosInstance from '../api/axiosInstance';
import type { OrderHistoryItem } from '../types';

interface CustomerOrdersDialogProps {
  open: boolean;
  onClose: () => void;
  customerId: number | null;
}

export default function CustomerOrdersDialog({ open, onClose, customerId }: CustomerOrdersDialogProps) {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only fetch data if a customerId is provided
    if (customerId) {
      const fetchOrders = async () => {
        setIsLoading(true);
        try {
          const response = await axiosInstance.get(`/api/v1/customers/${customerId}/orders`);
          setOrders(response.data);
        } catch (error) {
          console.error(`Failed to fetch orders for customer ${customerId}:`, error);
          setOrders([]); // Clear previous results on error
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrders();
    }
  }, [customerId]); // This effect re-runs whenever the customerId changes

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Customer Order History</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell align="right">Order Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow hover key={order.id}>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</TableCell>
                    <TableCell align="right">₹{order.final_total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
