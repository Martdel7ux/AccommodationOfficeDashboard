import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout/Layout.jsx';
import LoadingSpinner from './components/common/LoadingSpinner.jsx';
import SignIn from './pages/SignIn.jsx';
import SignUp from './pages/SignUp.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Listings from './pages/Listings.jsx';
import AddListing from './pages/AddListing.jsx';
import EditListing from './pages/EditListing.jsx';
import ViewListing from './pages/ViewListing.jsx';

function ProtectedLayout() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner text="Loading…" />;
  if (!user)   return <Navigate to="/signin" replace />;
  return <Layout />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner text="Loading…" />;
  if (user)    return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public auth routes */}
          <Route path="/signin" element={<PublicRoute><SignIn /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />

          {/* Protected app routes */}
          <Route element={<ProtectedLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"         element={<Dashboard />} />
            <Route path="/listings"          element={<Listings />} />
            <Route path="/listings/new"      element={<AddListing />} />
            <Route path="/listings/:id/edit" element={<EditListing />} />
            <Route path="/listings/:id"      element={<ViewListing />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
