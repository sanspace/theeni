// src/components/CheckoutDialog.tsx
import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { useCartStore } from '../store/cartStore';
import { useSnackbar } from 'notistack';
import axiosInstance from '../api/axiosInstance';
import type { Customer } from '../types';

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CheckoutDialog({ open, onClose }: CheckoutDialogProps) {
  // 1. GET THE 'customer' OBJECT FROM THE STORE
  const { cart, discountPercentage, customer, clearCart } = useCartStore();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);

  // These calculations now correctly use the selectors from the store for consistency
  const subTotal = useCartStore(
    (state) => state.cart.reduce((total, item) => total + item.price * item.quantity, 0)
  );
  const discountableSubTotal = useCartStore(
    (state) => state.cart.filter(item => item.is_discount_eligible).reduce((total, item) => total + item.price * item.quantity, 0)
  );
  const discountAmount = (discountableSubTotal * discountPercentage) / 100;
  const finalTotal = subTotal - discountAmount;

  const handleNewOrder = async () => {
    setIsLoading(true);

    const orderData = {
      cart: cart.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      discountPercentage: discountPercentage,
      customer_id: customer ? customer.id : null,
    };

    try {
      await axiosInstance.post('/api/v1/orders', orderData);
      enqueueSnackbar('Order saved successfully!', { variant: 'success' });
      clearCart();
      onClose();
    } catch (error) {
      console.error('Failed to save order:', error);
      enqueueSnackbar('Failed to save order. Please try again.', {
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
        Order Summary
      </DialogTitle>
      <DialogContent>
        {/* 2. NEW: CONDITIONALLY RENDER THE CUSTOMER DETAILS AT THE TOP */}
        {customer && (
          <>
            <Box sx={{ my: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Customer:
              </Typography>
              <Typography variant="h6" component="p" sx={{ fontWeight: 500 }}>
                {customer.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {customer.phone_number || customer.email}
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
          </>
        )}

        {/* The list of items remains the same */}
        <List dense>
          {cart.map((item) => (
            <ListItem key={item.id} disableGutters>
              <ListItemText
                primary={`${item.name} (x${item.quantity.toFixed(3)} kg)`}
                secondary={`@ ₹${item.price.toFixed(2)}/kg`}
              />
              <Typography variant="body1">
                ₹{(item.price * item.quantity).toFixed(2)}
              </Typography>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />

        {/* The totals section remains the same */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Subtotal</Typography>
            <Typography>₹{subTotal.toFixed(2)}</Typography>
          </Box>
          {discountAmount > 0 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                color: 'success.main',
              }}
            >
              <Typography color="inherit">
                Discount ({discountPercentage}%)
              </Typography>
              <Typography color="inherit">
                - ₹{discountAmount.toFixed(2)}
              </Typography>
            </Box>
          )}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 1,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Total
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              ₹{finalTotal.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button
          onClick={handleNewOrder}
          variant="contained"
          fullWidth
          size="large"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Start New Order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
