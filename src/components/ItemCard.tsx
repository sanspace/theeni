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
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {item.name}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {item.quick_code && `(${item.quick_code})`}
            </Typography>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
              ₹{item.price.toFixed(2)}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
