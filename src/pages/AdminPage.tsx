// src/pages/AdminPage.tsx
// This page lists all items and allows editing.
// (This is a new file)
import { useState } from 'react';
import { useLoaderData, useRevalidator } from 'react-router';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import { type Item } from '../types';
import EditItemDialog from '../components/EditItemDialog';
import ConfirmationDialog from '../components/ConfirmationDialog';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from '../api/axiosInstance';
import { useSnackbar } from 'notistack';

export default function AdminPage() {
  const initialItems = (useLoaderData() as Item[]) || [];
  const [editingItem, setEditingItem] = useState<Partial<Item> | null>(null);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);

  let revalidator = useRevalidator(); // React Router hook to refetch data

  const { enqueueSnackbar } = useSnackbar();

  const handleCreate = () => {
    // Set editingItem to an empty object to open the dialog in 'Create' mode
    setEditingItem({}); 
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      await axios.delete(`/api/v1/items/${deletingItem.id}`);
      enqueueSnackbar(`'${deletingItem.name}' was deleted successfully.`, { variant: 'success' });
      revalidator.revalidate(); // Refresh the item list
    } catch (error) {
      console.error("Failed to delete item:", error);
      enqueueSnackbar('Failed to delete item.', { variant: 'error' });
    } finally {
      setDeletingItem(null); // Close the dialog
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          Product Management
        </Typography>
        <Button variant="contained" onClick={handleCreate}>
          Create New Item
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Quick Code</TableCell>
              <TableCell>Discount Eligible?</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {initialItems.length > 0 ? (
              initialItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>₹{item.price.toFixed(2)}</TableCell>
                  <TableCell>{item.quick_code || 'N/A'}</TableCell>
                  <TableCell>{item.is_discount_eligible ? 'Yes' : 'No'}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => setEditingItem(item)}><EditIcon /></IconButton>
                    <IconButton onClick={() => setDeletingItem(item)}><DeleteIcon color="error" /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // NEW: Show a helpful message if the table is empty
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No products found.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <EditItemDialog
        item={editingItem}
        open={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSave={() => revalidator.revalidate()} // On save, re-run the loader
      />

      <ConfirmationDialog
        open={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Deletion"
        message={`Are you sure you want to permanently delete '${deletingItem?.name}'? This action cannot be undone.`}
      />
    </Box>
  );
}
