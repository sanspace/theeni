// src/pages/CustomersPage.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import axiosInstance from '../api/axiosInstance';
import type { CustomerReportItem } from '../types'; // We'll create this type next

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerReport = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get('/api/v1/reports/customers');
        setCustomers(response.data);
      } catch (error) {
        console.error('Failed to fetch customer report:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomerReport();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        All Customers
      </Typography>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Customer Name</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Email</TableCell>
                <TableCell align="right">Total Orders</TableCell>
                <TableCell align="right">Lifetime Spend</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((customer) => (
                <TableRow hover key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.phone_number || 'N/A'}</TableCell>
                  <TableCell>{customer.email || 'N/A'}</TableCell>
                  <TableCell align="right">{customer.total_orders}</TableCell>
                  <TableCell align="right">
                    ₹{customer.total_spent.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
