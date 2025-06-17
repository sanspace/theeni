// src/components/CustomerDialog.tsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import type { Customer } from '../types';
import axiosInstance from '../api/axiosInstance';
import { useSnackbar } from 'notistack';

interface CreateCustomerDialogProps {
  open: boolean;
  onClose: () => void;
  onCustomerCreated: (customer: Customer) => void;
  // This new prop will receive the name from the search box
  initialName?: string;
}

export default function CreateCustomerDialog({
  open,
  onClose,
  onCustomerCreated,
  initialName = '',
}: CreateCustomerDialogProps) {
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  // This effect pre-fills the name field when the dialog opens
  useEffect(() => {
    if (open) {
      setNewName(initialName);
      // Reset other fields
      setNewPhone('');
      setNewEmail('');
    }
  }, [open, initialName]);

  const handleCreateCustomer = async () => {
    if (!newName) {
      enqueueSnackbar('Customer name is required.', { variant: 'warning' });
      return;
    }
    try {
      const response = await axiosInstance.post('/api/v1/customers', {
        name: newName,
        phone_number: newPhone || null,
        email: newEmail || null,
      });
      enqueueSnackbar('Customer created successfully!', { variant: 'success' });
      onCustomerCreated(response.data); // Pass the new customer back
      onClose(); // Close the dialog
    } catch (error) {
      enqueueSnackbar('Failed to create customer.', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Create New Customer</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}
        >
          <TextField
            autoFocus
            required
            label="Full Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <TextField
            label="Phone Number (Optional)"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
          />
          <TextField
            label="Email (Optional)"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCreateCustomer} variant="contained">
          Save Customer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
