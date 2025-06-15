// src/components/EditItemDialog.tsx
// This is the pop-up form for editing an item.
// (This is a new file)
import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControlLabel, Switch } from '@mui/material';
import { type Item } from '../types';
import axios from '../api/axiosInstance';
import { useSnackbar } from 'notistack';

interface EditItemDialogProps {
  item: Partial<Item> | null;
  open: boolean;
  onClose: () => void;
  onSave: () => void; // To trigger a data refresh
}

export default function EditItemDialog({ item, open, onClose, onSave }: EditItemDialogProps) {
  const [formData, setFormData] = useState<Partial<Item>>({});
  const { enqueueSnackbar } = useSnackbar();

  const isEditMode = item && item.id;

  useEffect(() => {
    // If an item is passed, we're editing, so pre-fill the form.
    // Otherwise, we're creating, so start with a blank form.
    setFormData(item || {});
  }, [item]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {

    // Basic validation
    if (!formData.name || !formData.price) {
      enqueueSnackbar('Item Name and Price are required.', { variant: 'warning' });
      return;
    }

    // Create a sanitized payload with the correct data types before sending.
    const payload = {
      ...formData,
      price: parseFloat(String(formData.price)) || 0, // Ensure price is a number
      quick_code: formData.quick_code || null, // Ensure empty string becomes null
      image_url: formData.image_url || null, // Ensure empty string becomes null
      is_discount_eligible: !!formData.is_discount_eligible, // Ensure it's a boolean
    };

    try {
      if (isEditMode) {
        // UPDATE (PUT request)
        await axios.put(`/api/v1/items/${payload.id}`, payload);
        enqueueSnackbar('Item updated successfully!', { variant: 'success' });
      } else {
        // CREATE (POST request)
        await axios.post('/api/v1/items', payload);
        enqueueSnackbar('Item created successfully!', { variant: 'success' });
      }
      onSave(); // Tell the parent page to refetch data
      onClose();
    } catch (error) {
      console.error("Failed to save item:", error);
      enqueueSnackbar(`Failed to save item.`, { variant: 'error' });
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditMode ? `Edit Item: ${item?.name}` : 'Create New Item'}</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        <TextField name="name" label="Item Name" value={formData.name || ''} onChange={handleChange} />
        <TextField name="price" label="Price" type="number" value={formData.price || ''} onChange={handleChange} />
        <TextField name="quick_code" label="Quick Code" value={formData.quick_code || ''} onChange={handleChange} />
        <TextField name="image_url" label="Image URL" value={formData.image_url || ''} onChange={handleChange} />
        <FormControlLabel
          control={<Switch name="is_discount_eligible" checked={!!formData.is_discount_eligible} onChange={handleChange} />}
          label="Eligible for Discount"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save Changes</Button>
      </DialogActions>
    </Dialog>
  );
}
