import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RequireAdmin, RequireAuth } from './app/RouteGuards';
import ErrorBoundary from './components/common/ErrorBoundary';
import { RawProvider } from './store/RawStore';
import { AuthProvider } from './auth/AuthProvider';
import Landing from './pages/public/Landing';
import Auth from './pages/public/Auth';
import DonorDashboard from './pages/donor/Dashboard';
import ListRaw from './pages/donor/ListRaw';
import Offers from './pages/donor/Offers';
import Transactions from './pages/donor/Transactions';
import Impact from './pages/donor/Impact';
import Marketplace from './pages/seeker/Marketplace';
import Matches from './pages/seeker/Matches';
import Assistant from './pages/assistant/Assistant';
import Admin from './pages/admin/Admin';
import Requirements from './pages/seeker/Requirements';
import Profile from './pages/shared/Profile';
import RequirementNew from './pages/seeker/RequirementNew';
import Receipt from './pages/transactions/Receipt';
import MyListings from './pages/donor/MyListings';

export default function App() {
  return (
    <AuthProvider>
      <RawProvider>
        <BrowserRouter>
        <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth/login" element={<Auth mode="login" />} />
          <Route path="/auth/register" element={<Auth mode="register" />} />

          <Route path="/donor/dashboard" element={<RequireAuth><DonorDashboard /></RequireAuth>} />
          <Route path="/donor/listings" element={<RequireAuth><MyListings /></RequireAuth>} />
          <Route path="/donor/listings/new" element={<RequireAuth><ListRaw /></RequireAuth>} />
          <Route path="/donor/listings/:id" element={<RequireAuth><MyListings /></RequireAuth>} />
          <Route path="/donor/offers" element={<RequireAuth><Offers /></RequireAuth>} />
          <Route path="/donor/transactions" element={<RequireAuth><Transactions /></RequireAuth>} />
          <Route path="/donor/impact" element={<RequireAuth><Impact /></RequireAuth>} />
          <Route path="/donor/receipts/:id" element={<RequireAuth><Receipt /></RequireAuth>} />

          <Route path="/seeker/dashboard" element={<RequireAuth><Navigate to="/seeker/marketplace" replace /></RequireAuth>} />
          <Route path="/seeker/marketplace" element={<RequireAuth><Marketplace /></RequireAuth>} />
          <Route path="/seeker/requirements" element={<RequireAuth><Requirements /></RequireAuth>} />
          <Route path="/seeker/requirements/new" element={<RequireAuth><RequirementNew /></RequireAuth>} />
          <Route path="/seeker/matches" element={<RequireAuth><Matches /></RequireAuth>} />

          <Route path="/assistant" element={<RequireAuth><Assistant /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/donor/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/seeker/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth><RequireAdmin><Admin /></RequireAdmin></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </ErrorBoundary>
        </BrowserRouter>
      </RawProvider>
    </AuthProvider>
  );
}
