// src/pages/CustomersPage.tsx
import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import axiosInstance from '../api/axiosInstance';
import type { CustomerReportItem } from '../types';
import Fuse from 'fuse.js';
import { useSnackbar } from 'notistack';

// Import Dialogs and Icons
import ConfirmationDialog from '../components/ConfirmationDialog';
import CustomerOrdersDialog from '../components/CustomerOrdersDialog';
import DeleteIcon from '@mui/icons-material/Delete';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SearchIcon from '@mui/icons-material/Search';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  // State for managing the dialogs
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerReportItem | null>(null);
  const [viewingCustomerId, setViewingCustomerId] = useState<number | null>(null);

  const fetchCustomerReport = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/api/v1/reports/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customer report:', error);
      enqueueSnackbar('Failed to load customers', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fuse = useMemo(() => new Fuse(customers, { keys: ['name', 'phone_number', 'email'], threshold: 0.4 }), [customers]);
  const filteredCustomers = searchTerm ? fuse.search(searchTerm).map((result) => result.item) : customers;

  const handleDeleteConfirm = async () => {
    if (!deletingCustomer) return;
    try {
      await axiosInstance.delete(`/api/v1/customers/${deletingCustomer.id}`);
      enqueueSnackbar(`Customer '${deletingCustomer.name}' was deleted.`, { variant: 'success' });
      fetchCustomerReport(); // Refetch the data to update the grid
    } catch (error) {
      enqueueSnackbar('Failed to delete customer.', { variant: 'error' });
    } finally {
      setDeletingCustomer(null); // Close the dialog
    }
  };

  // Define the columns for the Data Grid, including our custom Actions column
  const columns: GridColDef<CustomerReportItem>[] = [
    { field: 'name', headerName: 'Customer Name', minWidth: 220, flex: 1 },
    { field: 'phone_number', headerName: 'Phone Number', minWidth: 150, flex: 1, sortable: false },
    { field: 'email', headerName: 'Email', minWidth: 220, flex: 1, sortable: false },
    { field: 'total_orders', headerName: 'Total Orders', type: 'number', width: 130, align: 'right', headerAlign: 'right' },
    {
      field: 'total_spent',
      headerName: 'Lifetime Spend',
      type: 'number',
      width: 160,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value: number) => `₹${value.toFixed(2)}`,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      filterable: false,
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<CustomerReportItem>) => (
        <>
          <Tooltip title="View Order History">
            <IconButton onClick={() => setViewingCustomerId(params.row.id)}>
              <ReceiptLongIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Customer">
            <IconButton onClick={() => setDeletingCustomer(params.row)}>
              <DeleteIcon color="error" />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 0 }}>
          All Customers
        </Typography>
        <TextField
          variant="outlined" size="small" placeholder="Fuzzy search customers..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>), }}
        />
      </Box>

      <Paper sx={{ height: '75vh', width: '100%' }}>
        <DataGrid
          rows={filteredCustomers}
          columns={columns}
          loading={isLoading}
          slots={{}}
          initialState={{
            pagination: { paginationModel: { pageSize: 25 } },
            sorting: { sortModel: [{ field: 'total_spent', sort: 'desc' }] },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* Render the dialogs, they will appear when their state is set */}
      <CustomerOrdersDialog
        open={!!viewingCustomerId}
        onClose={() => setViewingCustomerId(null)}
        customerId={viewingCustomerId}
      />
      <ConfirmationDialog
        open={!!deletingCustomer}
        onClose={() => setDeletingCustomer(null)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Deletion"
        message={`Are you sure you want to permanently delete '${deletingCustomer?.name}'? This will not delete their past orders, but will anonymize them.`}
      />
    </Box>
  );
}
