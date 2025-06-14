// src/pages/PosPage.tsx
import { useLoaderData } from 'react-router';
import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { type Item } from '../types';
import ItemCard from '../components/ItemCard';

function PosPage() {
  // useLoaderData gives us the data returned from our loader function
  const items = useLoaderData() as Item[];

  const handleItemClick = (item: Item) => {
    // We'll implement this later. For now, we'll just log it.
    console.log(`${item.name} clicked!`);
  };

  return (
    <>
      <Typography variant="h4" component="h2" gutterBottom>
        Select Items
      </Typography>
      <Grid container spacing={3}>
        {items.map((item) => (
          <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <ItemCard item={item} onClick={handleItemClick} />
          </Grid>
        ))}
      </Grid>
    </>
  );
}

export default PosPage;
