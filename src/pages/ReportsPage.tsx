// src/pages/ReportsPage.tsx
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { CSVLink } from 'react-csv';

// A helper to format dates to YYYY-MM-DD
const toYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/reports/sales`;

export default function ReportsPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [startDate, setStartDate] = useState(toYYYYMMDD(new Date()));
  const [endDate, setEndDate] = useState(toYYYYMMDD(new Date()));

  const fetchReport = async (start: string, end: string) => {
    setIsLoading(true);
    setReportData(null);
    try {
      const response = await axios.get(API_URL, {
        params: { start_date: start, end_date: end }
      });
      setReportData(response.data);
    } catch (error) {
      console.error("Failed to fetch report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = () => {
    fetchReport(startDate, endDate);
  };
  
  const setToday = () => {
    const today = toYYYYMMDD(new Date());
    setStartDate(today);
    setEndDate(today);
    fetchReport(today, today);
  };
  
  // Automatically fetch today's report on initial page load
  useEffect(() => {
    setToday();
  }, []);

  const csvHeaders = [
    { label: 'Item Name', key: 'name' },
    { label: 'Quantity Sold (kg)', key: 'total_quantity_sold' },
    { label: 'Total Revenue (INR)', key: 'total_revenue_from_item' }
  ]

  const csvFilename = `theeni-sales-${startDate}-to-${endDate}.csv`;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Sales Reports</Typography>
      
      <Paper sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <TextField type="date" label="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }}/>
        <TextField type="date" label="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }}/>
        <Button variant="contained" onClick={handleGenerateReport} disabled={isLoading}>Generate Report</Button>
        <Button variant="outlined" onClick={setToday}>Today's Report</Button>
        <Button
          variant="outlined"
          color="secondary"
          disabled={!reportData || isLoading}
        >
          {/* The CSVLink component wraps our button text. It's not visible itself. */}
          <CSVLink
            data={reportData ? reportData.sales_by_item : []}
            headers={csvHeaders}
            filename={csvFilename}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            Export to CSV
          </CSVLink>
        </Button>
      </Paper>

      {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}

      {reportData && !isLoading && (
        <Grid container spacing={3}>
          {/* Summary Cards - CORRECTED */}
          <Grid size={{ xs: 12, sm: 4 }}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">₹{reportData.summary.total_revenue.toFixed(2)}</Typography><Typography>Total Revenue</Typography></Paper></Grid>
          <Grid size={{ xs: 12, sm: 4 }}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">{reportData.summary.total_orders}</Typography><Typography>Total Orders</Typography></Paper></Grid>
          <Grid size={{ xs: 12, sm: 4 }}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">₹{reportData.summary.total_discount_given.toFixed(2)}</Typography><Typography>Total Discount</Typography></Paper></Grid>
          
          {/* Sales by Item Table - CORRECTED */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>Sales by Item</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Quantity Sold (kg)</TableCell>
                    <TableCell align="right">Total Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.sales_by_item.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="right">{item.total_quantity_sold.toFixed(3)}</TableCell>
                      <TableCell align="right">₹{item.total_revenue_from_item.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
