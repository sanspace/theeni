// src/pages/AdminPage.tsx
// This page lists all items and allows editing.
// (This is a new file)
import { useState } from 'react';
import { useLoaderData, useRevalidator } from 'react-router';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { type Item } from '../types';
import EditItemDialog from '../components/EditItemDialog';

export default function AdminPage() {
  const initialItems = (useLoaderData() as Item[]) || [];
  const [editingItem, setEditingItem] = useState<Partial<Item> | null>(null);
  let revalidator = useRevalidator(); // React Router hook to refetch data

  const handleCreate = () => {
    // Set editingItem to an empty object to open the dialog in 'Create' mode
    setEditingItem({}); 
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
                    <Button variant="outlined" onClick={() => setEditingItem(item)}>
                      Edit
                    </Button>
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
    </Box>
  );
}
