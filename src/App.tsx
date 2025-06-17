// src/App.tsx
import { Suspense } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Link as RouterLink,
  useNavigate,
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

import { type Item } from './types';

// Page Imports
import PosPage from './pages/PosPage';
import ReportsPage from './pages/ReportsPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import CustomersPage from './pages/CustomersPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';

import axios from './api/axiosInstance';

// --- Loader Function ---
async function itemsLoader(): Promise<Item[]> {
  // This function remains the same
  try {
    const response = await axios.get('/api/v1/items');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch items:', error);
    return [];
  }
}

// --- Root Layout Component ---
function RootLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
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
            {/* The POS button is visible to any logged-in user */}
            {user && (
              <Button component={RouterLink} to="/" color="inherit">
                POS
              </Button>
            )}

            {/* Reports and Admin buttons are now visible ONLY to admins */}
            {user?.role === 'admin' && (
              <>
                <Button component={RouterLink} to="/reports" color="inherit">
                  Reports
                </Button>
                <Button component={RouterLink} to="/customers" color="inherit">
                  Customers
                </Button>
                <Button component={RouterLink} to="/admin" color="inherit">
                  Admin
                </Button>
              </>
            )}

            {/* The Logout button is visible to any logged-in user */}
            {user && (
              <Button onClick={handleLogout} color="inherit">
                Logout
              </Button>
            )}
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
      {
        index: true,
        element: (
          // The POS page is accessible to everyone that's logged in
          <ProtectedRoute allowedRoles={['admin', 'cashier']}>
            <PosPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'reports',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        loader: itemsLoader,
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPage />
          </ProtectedRoute>
        ),
        shouldRevalidate: () => true,
      },
      {
        path: 'customers',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <CustomersPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
]);

// --- App Component ---
function App() {
  // The RouterProvider does not take a fallback prop.
  return <RouterProvider router={router} />;
}

export default App;
