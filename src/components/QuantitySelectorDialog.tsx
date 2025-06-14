// src/components/QuantitySelectorDialog.tsx
import { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import { type Item } from '../types';

interface QuantitySelectorDialogProps {
  item: Item | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (item: Item, quantity: number) => void;
}

const quickPicks = [0.25, 0.5, 1, 2]; // in kg

export default function QuantitySelectorDialog({ item, open, onClose, onConfirm }: QuantitySelectorDialogProps) {
  const [quantity, setQuantity] = useState('1');

  useEffect(() => {
    if (open) {
      setQuantity('1');
    }
  }, [open]);

  if (!item) return null;

  const handleConfirm = () => {
    const numericQuantity = parseFloat(quantity);
    if (!isNaN(numericQuantity) && numericQuantity > 0) {
      onConfirm(item, numericQuantity);
    }
  };

  const handleQuantityKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleConfirm();
      event.preventDefault();
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Select Quantity for {item.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          <TextField
            autoFocus
            label="Quantity (in kg)"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            onKeyDown={handleQuantityKeyPress}
            fullWidth
            inputProps={{ step: "0.05", min: "0" }}
          />

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Quick Picks:
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
              {quickPicks.map(qty => (
                <Button 
                  key={qty} 
                  // THIS IS THE KEY CHANGE:
                  // The button now directly calls onConfirm with its quantity.
                  onClick={() => onConfirm(item, qty)}
                  variant="outlined" // Changed back to outlined for clarity, as there's no "selected" state now
                  color="primary"
                  sx={{ flexGrow: 1 }}
                >
                  {qty < 1 ? `${qty * 1000}g` : `${qty}kg`}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose}>Cancel</Button>
        {/* This button is now primarily for mouse users or custom text-field entries */}
        <Button onClick={handleConfirm} variant="contained">
          Add to Order
        </Button>
      </DialogActions>
    </Dialog>
  );
}
