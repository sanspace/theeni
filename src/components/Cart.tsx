import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Divider,
  TextField,
  Button,
} from '@mui/material';
import {
  useCartStore,
  selectSubTotal,
  selectDiscountAmount,
  selectFinalTotal,
  selectDiscountableSubTotal,
} from '../store/cartStore';
import type { CartItem } from '../store/cartStore';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useSnackbar } from 'notistack';
import CustomerSearch from './CustomerSearch';

interface CartProps {
  onCheckout: () => void;
  onCreateCustomer: (name: string) => void;
}

export default function Cart({ onCheckout, onCreateCustomer }: CartProps) {
  const { enqueueSnackbar } = useSnackbar();

  const {
    cart,
    incrementItem,
    decrementItem,
    removeItem,
    discountPercentage,
    applyDiscount,
    customer,
    setCustomer,
  } = useCartStore();

  const subTotal = useCartStore(selectSubTotal);
  const discountableSubTotal = useCartStore(selectDiscountableSubTotal);
  const discountAmount = useCartStore(selectDiscountAmount);
  const finalTotal = useCartStore(selectFinalTotal);

  const [discountInput, setDiscountInput] = useState(
    discountPercentage.toString()
  );

  const handleApplyDiscount = () => {
    const percentage = parseFloat(discountInput);
    if (!isNaN(percentage)) {
      applyDiscount(percentage);
      enqueueSnackbar(`${percentage}% discount applied!`, { variant: 'info' });
    }
  };

  const handleDiscountKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleApplyDiscount();
      event.preventDefault();
    }
  };

  const handleRemoveItem = (item: CartItem) => {
    removeItem(item.id);
    enqueueSnackbar(`${item.name} removed from cart`, { variant: 'error' });
  };

  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        position: 'sticky',
        top: 24,
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
          Customer
        </Typography>
        {customer ? (
          <Paper
            elevation={1}
            sx={{
              p: 1.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 'bold' }}>
                {customer.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {customer.phone_number || customer.email}
              </Typography>
            </Box>
            <Button size="small" onClick={() => setCustomer(null)}>
              Remove
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <CustomerSearch
              onSelectCustomer={(c) => setCustomer(c)}
              onCreateNew={onCreateCustomer}
            />
            <Button
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={() => onCreateCustomer('')}
              sx={{ alignSelf: 'flex-start' }}
            >
              Create New
            </Button>
          </Box>
        )}
      </Box>

      <Typography variant="h5" component="h3" gutterBottom>
        Current Order
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {cart.length === 0 ? (
        <Typography color="text.secondary">Your cart is empty.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {cart.map((item) => (
            <Paper
              key={item.id}
              elevation={2}
              sx={{ p: 1.5, display: 'flex', alignItems: 'center' }}
            >
              <Box sx={{ flexGrow: 1, mr: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </Typography>
              </Box>

              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <IconButton
                  onClick={() => decrementItem(item.id)}
                  size="small"
                  color="secondary"
                >
                  <RemoveCircleOutlineIcon />
                </IconButton>
                <Typography
                  sx={{
                    fontWeight: 500,
                    minWidth: '50px',
                    textAlign: 'center',
                  }}
                >
                  {item.quantity.toFixed(3)} kg
                </Typography>
                <IconButton
                  onClick={() => incrementItem(item.id)}
                  size="small"
                  color="primary"
                >
                  <AddCircleOutlineIcon />
                </IconButton>
              </Box>

              <IconButton
                onClick={() => handleRemoveItem(item)}
                size="small"
                sx={{ ml: 1 }}
              >
                <DeleteForeverIcon color="error" />
              </IconButton>
            </Paper>
          ))}
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body1">Subtotal:</Typography>
          <Typography variant="body1">₹{subTotal.toFixed(2)}</Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            label="Discount (%)"
            type="number"
            size="small"
            value={discountInput}
            onChange={(e) => setDiscountInput(e.target.value)}
            onKeyDown={handleDiscountKeyPress}
            sx={{ flexGrow: 1 }}
          />
          <Button variant="outlined" onClick={handleApplyDiscount}>
            Apply
          </Button>
        </Box>

        {discountAmount > 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              color: 'success.main',
            }}
          >
            <Typography variant="body1" color="inherit">
              Discount (on ₹{discountableSubTotal.toFixed(2)}):
            </Typography>
            <Typography variant="body1" color="inherit">
              - ₹{discountAmount.toFixed(2)}
            </Typography>
          </Box>
        )}

        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Total:
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', color: 'primary.main' }}
          >
            ₹{finalTotal.toFixed(2)}
          </Typography>
        </Box>
      </Box>

      <Button
        variant="contained"
        fullWidth
        size="large"
        sx={{ mt: 3 }}
        disabled={cart.length === 0}
        onClick={onCheckout}
      >
        Checkout
      </Button>
    </Box>
  );
}
