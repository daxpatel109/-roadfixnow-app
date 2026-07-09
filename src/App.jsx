import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, ShieldAlert, LogOut } from 'lucide-react';
import Home from './pages/Home';
import Book from './pages/Book';
import { CustomerDashboard } from './pages/Dashboards';
import { Pricing, HowItWorks, Partner, Cities, Services, ServiceDetail, About, Contact, FAQ, TermsPrivacy } from './pages/MarketingPages';
import Login from './pages/Login'; // Will rename/split later
import { AuthProvider } from './context/AuthContext';
import 'leaflet/dist/leaflet.css';
import { StrictCustomerRoute, AnyAuthRoute, PartnerRoute, AdminRoute } from './components/ProtectedRoute';
import NotificationBell from './components/NotificationBell';

import { 
  MechanicProvider, MechanicLayout, MechanicOverview, MechanicRequests, 
  MechanicActiveJob, MechanicEarnings, MechanicProfile, MechanicPlaceholder 
} from './pages/mechanic';

import {
  AdminProvider, AdminLayout, AdminOverview, AdminLiveOps, AdminBookings,
  AdminCustomers, AdminMechanics, AdminVerification, AdminServices, AdminPricing,
  AdminCities, AdminRevenue, AdminPayouts, AdminSupport, AdminComplaints,
  AdminFleets, AdminReports, AdminSettings, AdminDispatchLogs
} from './pages/admin';

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// ----------------------------------------------------------------------------
// PORTAL 1: CUSTOMER SHELL (Global Navbar + Marketing + Customer Dashboards)
// ----------------------------------------------------------------------------
import { useAuth } from './context/AuthContext';

function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  
  const dashboardPath = role === 'admin' ? '/dashboard/admin' : role === 'mechanic' ? '/dashboard/mechanic' : '/dashboard/customer';
  
  const initial = user?.user_metadata?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U';

  const navLinks = [
    { name: 'Services', path: '/services' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Become a Partner', path: '/partner' },
  ];

  return (
    <nav className="fixed w-full z-50 bg-[#0B1220]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <ShieldAlert className="text-orange w-8 h-8" />
              <span className="font-black text-xl text-white tracking-tight">RoadFix<span className="text-orange">Now</span></span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.path} className={`transition-colors font-bold text-sm ${location.pathname === link.path ? 'text-orange' : 'text-gray-300 hover:text-white'}`}>
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <NotificationBell userId={user.id} />
                <Link to={dashboardPath} className="flex items-center gap-2 group transition-all mr-2">
                  <div className="w-9 h-9 bg-orange rounded-full flex items-center justify-center font-black text-navy text-sm shadow-[0_0_15px_rgba(255,107,0,0.4)] group-hover:scale-105 transition-transform">
                    {initial}
                  </div>
                  <span className="font-bold text-sm text-white group-hover:text-orange transition-colors hidden lg:block">
                    {user.user_metadata?.full_name?.split(' ')[0] || 'Dashboard'}
                  </span>
                </Link>
                <button 
                  onClick={async () => { await logout(); navigate('/login'); }} 
                  className="text-gray-400 hover:text-red-400 transition"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-gray-300 hover:text-white font-bold text-sm transition-colors">Sign In</Link>
            )}
            <Link to="/book" className="bg-orange hover:bg-orange/80 text-white px-6 py-2 rounded-full font-black text-sm transition-all shadow-[0_0_15px_rgba(255,107,0,0.3)] hover:shadow-[0_0_25px_rgba(255,107,0,0.5)]">
              BOOK HELP
            </Link>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-white p-2">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[#0B1220] border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">
                {link.name}
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-2 px-3">
              {user ? (
                <Link to="/dashboard/customer" onClick={() => setIsOpen(false)} className="block text-center text-white bg-white/10 py-3 rounded-xl font-bold">My Dashboard</Link>
              ) : (
                <Link to="/login" onClick={() => setIsOpen(false)} className="block text-center text-gray-300 hover:text-white font-bold">Sign In</Link>
              )}
              <Link to="/book" onClick={() => setIsOpen(false)} className="block text-center bg-orange text-white px-4 py-3 rounded-xl font-black">BOOK HELP</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function CustomerShell() {
  return (
    <div className="min-h-screen flex flex-col bg-navy">
      <Navbar />
      <div className="flex-1 pt-16">
        <Outlet />
      </div>
      <footer className="bg-[#050810] border-t border-white/10 py-12 text-center text-gray-400">
        <p>&copy; 2026 RoadFixNow. Customer Support Portal.</p>
      </footer>
    </div>
  );
}

// ----------------------------------------------------------------------------
// MAIN APP ROUTER
// ----------------------------------------------------------------------------
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>

          {/* PORTAL 1: CUSTOMER (Has global Navbar) */}
          <Route element={<CustomerShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/book" element={<AnyAuthRoute><Book /></AnyAuthRoute>} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/partner" element={<Partner />} />
            <Route path="/cities" element={<Cities />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/login" element={<Login />} />
            {/* The Customer Dashboard */}
            <Route path="/dashboard/customer" element={<StrictCustomerRoute><CustomerDashboard /></StrictCustomerRoute>} />
          </Route>

          {/* PORTAL 2: PARTNER (Mechanic Layout handles its own Nav) */}
          <Route path="/partner/login" element={<Login />} />
          <Route path="/dashboard/mechanic/*" element={
            <PartnerRoute>
              <MechanicProvider>
                <Routes>
                  <Route element={<MechanicLayout />}>
                    <Route path="" element={<MechanicOverview />} />
                    <Route path="requests" element={<MechanicRequests />} />
                    <Route path="active-job" element={<MechanicActiveJob />} />
                    <Route path="earnings" element={<MechanicEarnings />} />
                    <Route path="profile" element={<MechanicProfile />} />
                    <Route path="*" element={<MechanicPlaceholder />} />
                  </Route>
                </Routes>
              </MechanicProvider>
            </PartnerRoute>
          } />

          {/* PORTAL 3: ADMIN (Admin Layout handles its own Nav) */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/dashboard/admin/*" element={
            <AdminRoute>
              <AdminProvider>
                <Routes>
                  <Route element={<AdminLayout />}>
                    <Route path="" element={<AdminOverview />} />
                    <Route path="live" element={<AdminLiveOps />} />
                    <Route path="bookings" element={<AdminBookings />} />
                    <Route path="customers" element={<AdminCustomers />} />
                    <Route path="mechanics" element={<AdminMechanics />} />
                    <Route path="verification" element={<AdminVerification />} />
                    <Route path="services" element={<AdminServices />} />
                    <Route path="pricing" element={<AdminPricing />} />
                    <Route path="cities" element={<AdminCities />} />
                    <Route path="dispatch" element={<AdminDispatchLogs />} />
                    <Route path="revenue" element={<AdminRevenue />} />
                    <Route path="payouts" element={<AdminPayouts />} />
                    <Route path="support" element={<AdminSupport />} />
                    <Route path="complaints" element={<AdminComplaints />} />
                    <Route path="fleets" element={<AdminFleets />} />
                    <Route path="reports" element={<AdminReports />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>
                </Routes>
              </AdminProvider>
            </AdminRoute>
          } />

        </Routes>
      </Router>
    </AuthProvider>
  );
}
