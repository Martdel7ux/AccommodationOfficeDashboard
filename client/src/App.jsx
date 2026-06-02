import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Listings from './pages/Listings.jsx';
import AddListing from './pages/AddListing.jsx';
import EditListing from './pages/EditListing.jsx';
import ViewListing from './pages/ViewListing.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/new" element={<AddListing />} />
          <Route path="/listings/:id/edit" element={<EditListing />} />
          <Route path="/listings/:id" element={<ViewListing />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
