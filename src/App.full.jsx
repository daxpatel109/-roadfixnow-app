import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X, ShieldAlert } from 'lucide-react';
import Home from './pages/Home';
import Book from './pages/Book';
import { CustomerDashboard } from './pages/Dashboards';
import { Pricing, HowItWorks, Partner, Cities, Services, ServiceDetail, About, Contact, FAQ, TermsPrivacy, Login } from './pages/MarketingPages';

import { 
  MechanicProvider, MechanicLayout, MechanicOverview, MechanicRequests, 
  MechanicActiveJob, MechanicEarnings, MechanicProfile, MechanicPlaceholder 
} from './pages/mechanic';

import {
  AdminProvider, AdminLayout, AdminOverview, AdminLiveOps, AdminBookings,
  AdminCustomers, AdminMechanics, AdminVerification, AdminServices, AdminPricing,
  AdminCities, AdminRevenue, AdminPayouts, AdminSupport, AdminComplaints,
  AdminFleets, AdminReports, AdminSettings
} from './pages/admin';

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  
  if (location.pathname.startsWith('/dashboard/mechanic') || location.pathname.startsWith('/dashboard/admin')) return null;

  return (
    <nav className="fixed top-0 w-full bg-navy/90 backdrop-blur-md border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <ShieldAlert className="text-orange" />
            <span className="text-xl font-black text-white tracking-tight">RoadFix<span className="text-orange">Now</span></span>
            <span className="hidden md:inline-block ml-2 px-2 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded text-[10px] font-black uppercase tracking-wider animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.3)]">Launching Soon</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link to="/services" className="text-sm font-bold text-gray-300 hover:text-white transition">Services</Link>
            <Link to="/how-it-works" className="text-sm font-bold text-gray-300 hover:text-white transition">How It Works</Link>
            <Link to="/partner" className="text-sm font-bold text-gray-300 hover:text-white transition">Partner</Link>
            <Link to="/login" className="text-sm font-bold text-gray-300 hover:text-white transition">Login</Link>
            <Link to="/book" className="px-5 py-2 rounded-full bg-orange text-white font-bold hover:bg-orange/80 transition shadow-[0_0_15px_rgba(255,107,0,0.4)]">Book Help</Link>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-navy border-b border-white/10 pb-4 px-4 flex flex-col gap-4">
          <Link to="/services" onClick={()=>setIsOpen(false)}>Services</Link>
          <Link to="/how-it-works" onClick={()=>setIsOpen(false)}>How It Works</Link>
          <Link to="/partner" onClick={()=>setIsOpen(false)}>Partner</Link>
          <Link to="/login" onClick={()=>setIsOpen(false)}>Login</Link>
          <Link to="/book" onClick={()=>setIsOpen(false)} className="text-orange font-bold">Book Help</Link>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  const location = useLocation();
  if (location.pathname.startsWith('/dashboard/mechanic') || location.pathname.startsWith('/dashboard/admin')) return null;

  return (
    <footer className="bg-[#050810] py-12 border-t border-white/5 mt-auto relative z-40">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-black text-white mb-4">RoadFix<span className="text-orange">Now</span></h3>
          <p className="text-gray-400 text-sm">On-Spot Vehicle Help, Anytime. Anywhere. Built for India's roads.</p>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="font-bold mb-2">Company</h4>
          <Link to="/about" className="text-gray-400 text-sm hover:text-white">About Us</Link>
          <Link to="/services" className="text-gray-400 text-sm hover:text-white">Services</Link>
          <Link to="/partner" className="text-gray-400 text-sm hover:text-white">Partner with us</Link>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="font-bold mb-2">Support</h4>
          <Link to="/faq" className="text-gray-400 text-sm hover:text-white">FAQ</Link>
          <Link to="/contact" className="text-gray-400 text-sm hover:text-white">Contact Us</Link>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="font-bold mb-2">Legal</h4>
          <Link to="/terms" className="text-gray-400 text-sm hover:text-white">Terms of Use</Link>
          <Link to="/privacy" className="text-gray-400 text-sm hover:text-white">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-navy">
        <Navbar />
        <Routes>
          <Route path="/*" element={
            <div className="flex-1 pt-16">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/book" element={<Book />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/partner" element={<Partner />} />
                <Route path="/cities" element={<Cities />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:id" element={<ServiceDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/:pageId" element={<TermsPrivacy />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard/customer" element={<CustomerDashboard />} />
              </Routes>
            </div>
          }/>

          <Route path="/dashboard/mechanic/*" element={
            <MechanicProvider>
              <Routes>
                <Route element={<MechanicLayout />}>
                  <Route path="" element={<MechanicOverview />} />
                  <Route path="requests" element={<MechanicRequests />} />
                  <Route path="active-job" element={<MechanicActiveJob />} />
                  <Route path="earnings" element={<MechanicEarnings />} />
                  <Route path="profile" element={<MechanicProfile />} />
                  <Route path="history" element={<MechanicPlaceholder title="Job History" />} />
                  <Route path="services" element={<MechanicPlaceholder title="Service Categories" />} />
                  <Route path="availability" element={<MechanicPlaceholder title="Availability" />} />
                  <Route path="ratings" element={<MechanicPlaceholder title="Ratings & Reviews" />} />
                  <Route path="tools" element={<MechanicPlaceholder title="Tools Inventory" />} />
                  <Route path="support" element={<MechanicPlaceholder title="Support Center" />} />
                  <Route path="training" element={<MechanicPlaceholder title="Training Guidelines" />} />
                </Route>
              </Routes>
            </MechanicProvider>
          }/>

          {/* New Admin Dashboard Routes */}
          <Route path="/dashboard/admin/*" element={
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
          }/>

        </Routes>
        <Footer />
      </div>
    </Router>
  );
}
