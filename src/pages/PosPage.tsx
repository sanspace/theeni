// src/pages/PosPage.tsx
import { useState } from 'react';
import { useLoaderData } from 'react-router';
import Grid from '@mui/material/Grid';
import { type Item } from '../types';
import ItemCard from '../components/ItemCard';
import Cart from '../components/Cart';
import { useCartStore } from '../store/cartStore';
import QuantitySelectorDialog from '../components/QuantitySelectorDialog';
import CheckoutDialog from '../components/CheckoutDialog';
import { useSnackbar } from 'notistack';


function PosPage() {
  const { enqueueSnackbar } = useSnackbar();
  const items = useLoaderData() as Item[];
  const upsertItemInCart = useCartStore((state) => state.upsertItem);

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);

  // When an item card is clicked, we set it as selected to open the dialog
  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
  };

  // This function is called when the user confirms a quantity in the dialog
  const handleConfirmQuantity = (item: Item, quantity: number) => {
    upsertItemInCart(item, quantity);
    setSelectedItem(null); // Close the dialog
    enqueueSnackbar(`${quantity.toFixed(3)}kg of ${item.name} added to cart.`, {
      variant: 'success',
      anchorOrigin: { vertical: 'bottom', horizontal: 'center' } 
    });
  };

  return (
    <>
      <Grid container spacing={4}>
        {/* Column 1: Item Selection */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Grid container spacing={3} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            {items.map((item) => (
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
