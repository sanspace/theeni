import { useState, useMemo, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { type Item, type Customer } from '../types';
import ItemCard from '../components/ItemCard';
import Cart from '../components/Cart';
import { useCartStore } from '../store/cartStore';
import QuantitySelectorDialog from '../components/QuantitySelectorDialog';
import CheckoutDialog from '../components/CheckoutDialog';
import CreateCustomerDialog from '../components/CustomerDialog'; // We'll use our simplified dialog
import { useSnackbar } from 'notistack';
import {
  TextField,
  InputAdornment,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axiosInstance from '../api/axiosInstance';

function PosPage() {
  const { enqueueSnackbar } = useSnackbar();
  const { upsertItem, setCustomer } = useCartStore();

  const [allItems, setAllItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE MANAGEMENT FOR ALL DIALOGS ---
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [isCreateCustomerOpen, setCreateCustomerOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState(''); // To pre-fill the create form

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.get('/api/v1/items');
        setAllItems(response.data);
      } catch (error) {
        console.error('Failed to fetch items:', error);
        enqueueSnackbar('Could not load products.', { variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, [enqueueSnackbar]);

  const [searchTerm, setSearchTerm] = useState('');
  const filteredItems = useMemo(() => {
    if (!searchTerm) return allItems;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.quick_code?.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [searchTerm, allItems]);

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
  };

  const handleConfirmQuantity = (item: Item, quantity: number) => {
    upsertItem(item, quantity);
    setSelectedItem(null);
    enqueueSnackbar(`${quantity.toFixed(3)}kg of ${item.name} added to cart`, {
      variant: 'success',
      anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
    });
  };

  // This handler is called when the "Create New" button is clicked in the cart
  const handleOpenCreateCustomer = (name: string) => {
    setNewCustomerName(name);
    setCreateCustomerOpen(true);
  };

  // This handler is called after a customer is successfully created in the dialog
  const handleCustomerCreated = (customer: Customer) => {
    setCustomer(customer); // Set them as the selected customer in the cart
    setCreateCustomerOpen(false); // Close the dialog
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && searchTerm) {
      const quickCodeMatch = allItems.find(
        (item) => item.quick_code?.toLowerCase() === searchTerm.toLowerCase()
      );
      if (quickCodeMatch) {
        setSelectedItem(quickCodeMatch);
        setSearchTerm('');
        return;
      }
      if (filteredItems.length === 1) {
        setSelectedItem(filteredItems[0]);
        setSearchTerm('');
      }
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name or quick code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />
          {filteredItems.length === 0 && !isLoading ? (
            <Typography sx={{ mt: 4, textAlign: 'center' }} color="text.secondary">
              No products match your search.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {filteredItems.map((item) => (
                <Grid key={item.id} size={{ xs: 4, sm: 4, md: 3, lg: 3 }}>
                  <ItemCard item={item} onClick={handleItemClick} />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          {/* Pass the new handler to the Cart component */}
          <Cart
            onCheckout={() => setCheckoutOpen(true)}
            onCreateCustomer={handleOpenCreateCustomer}
          />
        </Grid>
      </Grid>

      <QuantitySelectorDialog
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onConfirm={handleConfirmQuantity}
      />

      <CreateCustomerDialog
        open={isCreateCustomerOpen}
        onClose={() => setCreateCustomerOpen(false)}
        onCustomerCreated={handleCustomerCreated}
        initialName={newCustomerName}
      />

      <CheckoutDialog
        open={isCheckoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  );
}

export default PosPage;
