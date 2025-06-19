// src/components/OrderDetailsDialog.tsx
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
import type { OrderDetailLineItem } from '../types';

interface OrderDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  orderId: number | null;
}

export default function OrderDetailsDialog({ open, onClose, orderId }: OrderDetailsDialogProps) {
  const [lineItems, setLineItems] = useState<OrderDetailLineItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only fetch data if an orderId is provided and the dialog is open
    if (open && orderId) {
      const fetchOrderItems = async () => {
        setIsLoading(true);
        try {
          const response = await axiosInstance.get(`/api/v1/orders/${orderId}/items`);
          setLineItems(response.data);
        } catch (error) {
          console.error(`Failed to fetch items for order ${orderId}:`, error);
          setLineItems([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchOrderItems();
    }
  }, [open, orderId]); // This effect re-runs when the dialog is opened for a new order

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Details for Order #{orderId}</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2, border: 'none', boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Price/Unit</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.item_name}</TableCell>
                    <TableCell align="center">{item.quantity.toFixed(3)} kg</TableCell>
                    <TableCell align="right">₹{item.price_per_unit.toFixed(2)}</TableCell>
                    <TableCell align="right">₹{item.subtotal.toFixed(2)}</TableCell>
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
