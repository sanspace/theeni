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

function ItemCard({ item, onClick }: ItemCardProps) {
  // A placeholder image if the item doesn't have one
  const imageUrl = item.image_url || 'https://placehold.co/300x200.png?text=No+Image';

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={() => onClick(item)} sx={{ flexGrow: 1 }}>
        <CardMedia
          component="img"
          height="140"
          image={imageUrl}
          alt={item.name}
        />
        <CardContent>
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

export default ItemCard;
