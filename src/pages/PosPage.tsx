// src/pages/PosPage.tsx
import { useState, useMemo } from 'react';
import { useLoaderData } from 'react-router';
import Grid from '@mui/material/Grid';
import { type Item } from '../types';
import ItemCard from '../components/ItemCard';
import Cart from '../components/Cart';
import { useCartStore } from '../store/cartStore';
import QuantitySelectorDialog from '../components/QuantitySelectorDialog';
import CheckoutDialog from '../components/CheckoutDialog';
import { useSnackbar } from 'notistack';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

function PosPage() {
  const { enqueueSnackbar } = useSnackbar();
  const allItems = useLoaderData() as Item[];
  const upsertItemInCart = useCartStore((state) => state.upsertItem);

  // --- State and Logic for Search ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);

  // Filter items based on search term. useMemo prevents unnecessary recalculations.
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
    enqueueSnackbar(`${quantity.toFixed(3)}kg of ${item.name} added to cart.`, { 
      variant: 'success',
      anchorOrigin: { vertical: 'bottom', horizontal: 'center' }
    });
  };

  // Handler for pressing Enter in the search bar
  const handleSearchKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && searchTerm) {
      // Check for an exact quick code match first
      const quickCodeMatch = allItems.find(item => item.quick_code?.toLowerCase() === searchTerm.toLowerCase());
      if (quickCodeMatch) {
        setSelectedItem(quickCodeMatch);
        setSearchTerm(''); // Clear search after quick add
        return;
      }
      // If no exact quick code match, but there is exactly one item filtered, select it
      if (filteredItems.length === 1) {
        setSelectedItem(filteredItems[0]);
        setSearchTerm(''); // Clear search after quick add
      }
    }
  };

  return (
    <>
      <Grid container spacing={4}>
        {/* Column 1: Item Selection */}
        <Grid size={{ xs: 12, md: 7 }}>
          {/* --- Search Bar --- */}
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
            sx={{ mb: 3 }} // Add some margin below the search bar
          />
          
          {/* Item Grid - maps over 'filteredItems' */}
          <Grid container spacing={3} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            {filteredItems.map((item) => (
              <Grid key={item.id}>
                <ItemCard item={item} onClick={handleItemClick} />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Column 2: Cart/Order Summary */}
        <Grid size={{ xs: 12, md: 5 }}>
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
