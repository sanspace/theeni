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
  const initialItems = (useLoaderData() as Item[]) || [];
  const upsertItemInCart = useCartStore((state) => state.upsertItem);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);

  const filteredItems = useMemo(() => {
    if (!searchTerm) {
      return initialItems;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return initialItems.filter(item =>
      item.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      item.quick_code?.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [searchTerm, initialItems]);

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
      const quickCodeMatch = initialItems.find(item => item.quick_code?.toLowerCase() === searchTerm.toLowerCase());
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
          
          <Grid container spacing={3}>
            {filteredItems.map((item) => (
              <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <ItemCard item={item} onClick={handleItemClick} />
              </Grid>
            ))}
          </Grid>
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
