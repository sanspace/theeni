// src/components/CheckoutDialog.tsx
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

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CheckoutDialog({ open, onClose }: CheckoutDialogProps) {
  // We read the state directly from the store within the dialog
  const { cart, discountPercentage, clearCart } = useCartStore();

  const subTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const discountAmount = (subTotal * discountPercentage) / 100;
  const finalTotal = subTotal - discountAmount;

  const handleNewOrder = () => {
    clearCart(); // Clear the cart state
    onClose();   // Close the dialog
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
        <Button onClick={handleNewOrder} variant="contained" fullWidth size="large">
          Start New Order
        </Button>
      </DialogActions>
    </Dialog>
  );
}
