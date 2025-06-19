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
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import axiosInstance from '../api/axiosInstance';
import { CSVLink } from 'react-csv';

import OrderDetailsDialog from '../components/OrderDetailsDialog';
import type { OrderDetailLineItem } from '../types';

// A helper to format dates to YYYY-MM-DD
const toYYYYMMDD = (date: Date) => date.toISOString().split('T')[0];

const API_URLS = {
  sales: '/api/v1/reports/sales',
  customers: '/api/v1/reports/customers',
  orders: '/api/v1/reports/orders-details',
};

// --- Main Component ---
export default function ReportsPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [reportTitle, setReportTitle] = useState('');
  const [viewingOrderId, setViewingOrderId] = useState<number | null>(null);

  const today = new Date();
  const [startDate, setStartDate] = useState(toYYYYMMDD(today));
  const [endDate, setEndDate] = useState(toYYYYMMDD(today));

  const fetchDashboardData = async (start: string, end: string, title: string) => {
    setIsLoading(true);
    setReportData(null);
    setReportTitle(`Showing Report For: ${title}`);
    try {
      const [salesRes, customersRes, ordersRes] = await Promise.all([
        axiosInstance.get(API_URLS.sales, { params: { start_date: start, end_date: end } }),
        axiosInstance.get(API_URLS.customers, { params: { start_date: start, end_date: end } }),
        axiosInstance.get(API_URLS.orders, { params: { start_date: start, end_date: end } }),
      ]);
      setReportData({
        summary: salesRes.data.summary,
        salesByItem: salesRes.data.sales_by_item,
        customers: customersRes.data,
        orderDetails: ordersRes.data,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setReportTitle('Failed to load report data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleDatePreset = (preset: 'today' | 'this_week' | 'this_month') => {
    const today = new Date();
    let start = new Date();
    let title = 'Today';
    const dayOfWeek = today.getDay(); // 0=Sunday in JS

    switch (preset) {
      case 'this_week':
        start = new Date(today.setDate(today.getDate() - dayOfWeek));
        title = 'This Week';
        break;
      case 'this_month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        title = 'This Month';
        break;
      default:
        title = `Today`;
    }
    const newStartDate = toYYYYMMDD(start);
    const newEndDate = toYYYYMMDD(new Date());
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    const dateRangeString =
      start.toLocaleDateString('en-IN') ===
      new Date().toLocaleDateString('en-IN')
        ? start.toLocaleDateString('en-IN')
        : `${start.toLocaleDateString(
            'en-IN'
          )} - ${new Date().toLocaleDateString('en-IN')}`;
    fetchDashboardData(newStartDate, newEndDate, `${title} (${dateRangeString})`);
  };

  const handleGenerateCustomReport = () => {
    const title = `${new Date(startDate).toLocaleDateString(
      'en-IN'
    )} to ${new Date(endDate).toLocaleDateString('en-IN')}`;
    fetchDashboardData(startDate, endDate, title);
  };

  useEffect(() => {
    handleDatePreset('today');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const salesCsvHeaders = [
    { label: 'Item Name', key: 'name' },
    { label: 'Quantity Sold (kg)', key: 'total_quantity_sold' },
    { label: 'Total Revenue (INR)', key: 'total_revenue_from_item' },
  ];
  const ordersCsvHeaders = [
    { label: 'Order ID', key: 'id' },
    { label: 'Date', key: 'created_at' },
    { label: 'Customer Name', key: 'customer_name' },
    { label: 'Total Amount', key: 'final_total' },
  ];
  const customersCsvHeaders = [
    { label: 'Customer Name', key: 'name' },
    { label: 'Phone', key: 'phone_number' },
    { label: 'Email', key: 'email' },
    { label: 'Total Orders', key: 'total_orders' },
    { label: 'Total Spent (INR)', key: 'total_spent' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        <TextField type="date" label="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }}/>
        <TextField type="date" label="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }}/>
        <Button variant="contained" onClick={handleGenerateCustomReport} disabled={isLoading}>Generate</Button>
        <Button variant="outlined" onClick={() => handleDatePreset('today')}>Today</Button>
        <Button variant="outlined" onClick={() => handleDatePreset('this_week')}>This Week</Button>
        <Button variant="outlined" onClick={() => handleDatePreset('this_month')}>This Month</Button>
      </Paper>

      {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}

      {reportData && !isLoading && (
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            {reportTitle}
          </Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 4 }}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">₹{reportData.summary.total_revenue.toFixed(2)}</Typography><Typography>Total Revenue</Typography></Paper></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">{reportData.summary.total_orders}</Typography><Typography>Total Orders</Typography></Paper></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">₹{reportData.summary.total_discount_given.toFixed(2)}</Typography><Typography>Total Discount</Typography></Paper></Grid>
          </Grid>
          
          <Paper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={currentTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary" variant="fullWidth">
                <Tab label="Sales by Item" />
                <Tab label="All Orders" />
                <Tab label="Customers" />
              </Tabs>
              <Box sx={{ pr: 2 }}>
                  {currentTab === 0 && (<Button variant="text"><CSVLink data={reportData.salesByItem} headers={salesCsvHeaders} filename={`theeni-sales-by-item-${startDate}-to-${endDate}.csv`} style={{textDecoration:'none', color:'inherit'}}>Export CSV</CSVLink></Button>)}
                  {currentTab === 1 && (<Button variant="text"><CSVLink data={reportData.orderDetails} headers={ordersCsvHeaders} filename={`theeni-orders-${startDate}-to-${endDate}.csv`} style={{textDecoration:'none', color:'inherit'}}>Export CSV</CSVLink></Button>)}
                  {currentTab === 2 && (<Button variant="text"><CSVLink data={reportData.customers} headers={customersCsvHeaders} filename={`theeni-customers-${startDate}-to-${endDate}.csv`} style={{textDecoration:'none', color:'inherit'}}>Export CSV</CSVLink></Button>)}
              </Box>
            </Box>
            
            {currentTab === 0 && (
              <TableContainer><Table stickyHeader><TableHead><TableRow><TableCell>Item</TableCell><TableCell align="right">Quantity Sold (kg)</TableCell><TableCell align="right">Total Revenue</TableCell></TableRow></TableHead><TableBody>{reportData.salesByItem.map((item: any) => (<TableRow hover key={item.id}><TableCell>{item.name}</TableCell><TableCell align="right">{item.total_quantity_sold.toFixed(3)}</TableCell><TableCell align="right">₹{item.total_revenue_from_item.toFixed(2)}</TableCell></TableRow>))}</TableBody></Table></TableContainer>
            )}
            
            {currentTab === 1 && (
              <TableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell><TableCell>Date & Time</TableCell><TableCell>Customer</TableCell><TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.orderDetails.map((order: any) => (
                      <TableRow
                        hover
                        key={order.id}
                        onClick={() => setViewingOrderId(order.id)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</TableCell>
                        <TableCell>{order.customer_name || 'N/A'}</TableCell>
                        <TableCell align="right">₹{order.final_total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {currentTab === 2 && (
              <TableContainer>
                <Table stickyHeader><TableHead><TableRow><TableCell>Customer Name</TableCell><TableCell>Contact Info</TableCell><TableCell align="right">Total Orders</TableCell><TableCell align="right">Total Spent</TableCell></TableRow></TableHead>
                  <TableBody>
                    {reportData.customers.map((customer: any) => (
                      <TableRow hover key={customer.id}>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.phone_number || customer.email || 'N/A'}</TableCell>
                        <TableCell align="right">{customer.total_orders}</TableCell>
                        <TableCell align="right">₹{customer.total_spent.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>
      )}
      <OrderDetailsDialog
        open={!!viewingOrderId}
        onClose={() => setViewingOrderId(null)}
        orderId={viewingOrderId}
      />
    </Box>
  );
}
