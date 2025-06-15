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
import axios from 'axios';
import { enqueueSnackbar, useSnackbar } from 'notistack';

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
}

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/orders`;

export default function CheckoutDialog({ open, onClose }: CheckoutDialogProps) {
  // We read the state directly from the store within the dialog
  const { cart, discountPercentage, clearCart } = useCartStore();
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);

  const subTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const discountAmount = (subTotal * discountPercentage) / 100;
  const finalTotal = subTotal - discountAmount;

  const handleNewOrder = async () => {
    setIsLoading(true); // Disable button
    
    // 1. Prepare the data in the format the backend expects
    const orderData = {
      cart: cart.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      discountPercentage: discountPercentage
    };
    
    try {
      // 2. Send the data to the backend
      await axios.post(API_URL, orderData);
      
      enqueueSnackbar('Order saved successfully!', { variant: 'success' });
      
      // 3. Clear the cart and close the dialog on success
      clearCart();
      onClose();
    } catch (error) {
      console.error("Failed to save order:", error);
      enqueueSnackbar('Failed to save order. Please try again.', { variant: 'error' });
    } finally {
      setIsLoading(false); // Re-enable button
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Order Summary</DialogTitle>
      <DialogContent>
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
        {/* Totals Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Subtotal</Typography>
            <Typography>₹{subTotal.toFixed(2)}</Typography>
          </Box>
          {discountAmount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
              <Typography color="inherit">Discount ({discountPercentage}%)</Typography>
              <Typography color="inherit">- ₹{discountAmount.toFixed(2)}</Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>₹{finalTotal.toFixed(2)}</Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button 
          onClick={handleNewOrder} 
          variant="contained" 
          fullWidth 
          size="large"
          disabled={isLoading} // Disable button while submitting
        >
          {isLoading ? 'Saving...' : 'Start New Order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
