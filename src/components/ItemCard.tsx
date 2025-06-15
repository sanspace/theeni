// src/components/ItemCard.tsx
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
} from '@mui/material';
import { type Item } from '../types';

interface ItemCardProps {
  item: Item;
  onClick: (item: Item) => void;
}

export default function ItemCard({ item, onClick }: ItemCardProps) {
  const imageUrl = item.image_url || 'https://placehold.co/800x800.png?text=No+Image';

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea 
        onClick={() => onClick(item)} 
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        <CardMedia
          component="img"
          // enforce a square shape
          sx={{ aspectRatio: '1 / 1' }}
          image={imageUrl}
          alt={item.name}
        />
        <CardContent sx={{ flexGrow: 1, width: '100%' }}>
          <Typography
            gutterBottom
            component="div"
            noWrap
            sx={{
              fontWeight: 500,
              fontSize: { xs: '0.5 rem', sm: '0.9rem', md: '1rem' }
            }}
          >
            {item.name}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              color="text.secondary"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
            >
              {item.quick_code && `(${item.quick_code})`}
            </Typography>
            <Typography
              color="primary"
              sx={{
                fontWeight: 'bold',
                fontSize: { xs: '0.85rem', sm: '1rem' } 
              }}
            >
              ₹{item.price.toFixed(2)}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
