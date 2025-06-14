// src/App.tsx
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from 'react-router';
import { Box, Container, Typography } from '@mui/material';
import axios from 'axios';

import PosPage from './pages/PosPage'; 
import { type Item } from './types';

const API_URL = 'http://127.0.0.1:8000/api/v1/items';

async function itemsLoader(): Promise<Item[]> {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch items:', error);
    // In a real app, you'd want to show a proper error message
    // For now, we'll return an empty array on failure.
    return [];
  }
}


/**
 * This is our main application shell.
 * It will contain things like a header or footer in the future.
 * The <Outlet /> component is where the actual page content will be rendered.
 */
function RootLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header>
        <Box
          sx={{
            bgcolor: 'primary.main',
            p: 2,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* We are now using the emoji directly, wrapped in Typography for styling */}
          <Typography sx={{ mr: 1.5, fontSize: '1.75rem', lineHeight: 1 }}>
            🍿
          </Typography>

          <Typography variant="h6" component="h1">
            Theeni
          </Typography>
        </Box>
      </header>

      {/* The main content area */}
      <Container component="main" sx={{ py: 4, flexGrow: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
}

// Create our browser router configuration using the Data APIs approach
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    // We can add an errorElement here for app-wide error handling
    children: [
      {
        index: true, // This makes it the default child route for '/'
        loader: itemsLoader,
        element: <PosPage />,
      },
      // Other routes like '/admin' or '/reports' can be added later
    ],
  },
]);

function App() {
  // The RouterProvider component takes our router configuration and renders the app
  return <RouterProvider router={router} />;
}

export default App;
