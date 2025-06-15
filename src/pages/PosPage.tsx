// src/pages/PosPage.tsx
import { useState, useMemo, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { type Item } from '../types';
import ItemCard from '../components/ItemCard';
import Cart from '../components/Cart';
import { useCartStore } from '../store/cartStore';
import QuantitySelectorDialog from '../components/QuantitySelectorDialog';
import CheckoutDialog from '../components/CheckoutDialog';
import { useSnackbar } from 'notistack';
import { TextField, InputAdornment, Box, CircularProgress, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from '../api/axiosInstance';

function PosPage() {
  const { enqueueSnackbar } = useSnackbar();
  const upsertItemInCart = useCartStore((state) => state.upsertItem);

  const [allItems, setAllItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/v1/items');
        setAllItems(response.data);
      } catch (error) {
        console.error('Failed to fetch items:', error);
        enqueueSnackbar('Could not load products.', {variant: 'error'})
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, [enqueueSnackbar]);


  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);

  const filteredItems = useMemo(() => {
    if (!searchTerm) {
      return allItems;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return allItems.filter(item =>
      item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      item.quick_code?.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [searchTerm, allItems]);

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
  };

  const handleConfirmQuantity = (item: Item, quantity: number) => {
    upsertItemInCart(item, quantity);
    setSelectedItem(null);
    enqueueSnackbar(`${quantity.toFixed(3)}kg of ${item.name} added to cart`, {
      variant: 'success',
      anchorOrigin: { vertical: 'bottom', horizontal: 'center' }
    });
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && searchTerm) {
      const quickCodeMatch = allItems.find(item => item.quick_code?.toLowerCase() === searchTerm.toLowerCase());
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
    )
  }

  return (
    <>
      <Grid container spacing={4}>
        {/* Column 1: Item Selection */}
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
            <Typography sx={{ mt: 4, textAlign: 'center' }}>No products match your search.</Typography>
          ) : (
            <Grid container spacing={3} sx={{ mt: 0 }}>
              {filteredItems.map((item) => (
                <Grid key={item.id} size={{ xs: 4, sm: 4, md: 4, lg: 3 }}>
                  <ItemCard item={item} onClick={handleItemClick} />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* Column 2: Cart/Order Summary */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Cart onCheckout={() => setCheckoutOpen(true)} />
        </Grid>
      </Grid>
      
      <QuantitySelectorDialog
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onConfirm={handleConfirmQuantity}
      />
      
      <CheckoutDialog
        open={isCheckoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  );
}

export default PosPage;
