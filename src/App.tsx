// src/App.tsx
import { Suspense } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Link as RouterLink,
} from 'react-router';
import {
  Box,
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { type Item } from './types';

// Page Imports
import PosPage from './pages/PosPage';
import ReportsPage from './pages/ReportsPage';
import AdminPage from './pages/AdminPage';

// --- Loader Function ---
const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/items`;

async function itemsLoader(): Promise<Item[]> {
  // This function remains the same
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch items:', error);
    return [];
  }
}

// --- Root Layout Component ---
function RootLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography sx={{ mr: 1.5, fontSize: '1.75rem', lineHeight: 1 }}>
              🍿
            </Typography>
            <Typography variant="h6" component="h1" sx={{ color: 'white' }}>
              Theeni
            </Typography>
          </Box>
          <Box>
            <Button component={RouterLink} to="/" color="inherit">
              POS
            </Button>
            <Button component={RouterLink} to="/reports" color="inherit">
              Reports
            </Button>
            <Button component={RouterLink} to="/admin" color="inherit">
              Admin
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="xl" sx={{ py: 4, flexGrow: 1 }}>
        {/* 2. THIS IS THE FIX: Wrap the Outlet with Suspense */}
        <Suspense
          fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
              <CircularProgress />
            </Box>
          }
        >
          <Outlet />
        </Suspense>
      </Container>
    </Box>
  );
}

// --- Router Definition ---
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <PosPage /> },
      { path: 'reports', element: <ReportsPage /> },
      {
        path: 'admin',
        loader: itemsLoader,
        element: <AdminPage />,
        shouldRevalidate: () => true,
      },
    ],
  },
]);

// --- App Component ---
function App() {
  // The RouterProvider does not take a fallback prop.
  return <RouterProvider router={router} />;
}

export default App;
