// src/theme.ts
import { createTheme } from '@mui/material/styles';

// Let's define a warm, inviting color palette for our snacks shop
const theme = createTheme({
  palette: {
    primary: {
      main: '#FF6F00', // A nice, warm orange
    },
    secondary: {
      main: '#4E342E', // A deep brown, like chocolate or coffee
    },
    background: {
      default: '#F5F5F5', // A slightly off-white background
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    // You can define other typography styles here
  },
});

export default theme;
