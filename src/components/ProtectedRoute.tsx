// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: ('admin' | 'cashier')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { token, user } = useAuthStore();

  // If user is not logged in, redirect to the login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified and the user's role is not in the allowed list, redirect
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to home page if role doesn't match
    return <Navigate to="/" replace />;
  }

  // If all checks pass, render the protected component
  return children;
}
