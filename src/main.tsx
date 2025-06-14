// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import our theme and MUI providers
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme.ts';

import { SnackbarProvider } from 'notistack';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3} autoHideDuration={2000}>
        {/* CssBaseline resets browser default styles for consistency */}
        <CssBaseline />
        <App />
      </SnackbarProvider>
    </ThemeProvider>
  </React.StrictMode>
);
