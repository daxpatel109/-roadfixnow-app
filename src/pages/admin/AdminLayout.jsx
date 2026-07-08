import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAdmin, adminRoles, dummyCities } from './AdminState';
import { LayoutDashboard, Map, CalendarCheck, Users, Wrench, ShieldCheck, IndianRupee, CreditCard, Headphones, AlertTriangle, Building2, BarChart3, Settings, Bell, Search, MapPin } from 'lucide-react';

export default function AdminLayout() {
  const { role, setRole, cityFilter, setCityFilter } = useAdmin();
  const location = useLocation();

  const mainLinks = [
    { name: 'Overview', path: '/dashboard/admin', icon: <LayoutDashboard/> },
    { name: 'Live Operations', path: '/dashboard/admin/live', icon: <Map/> },
    { name: 'Bookings', path: '/dashboard/admin/bookings', icon: <CalendarCheck/> },
    { name: 'Customers', path: '/dashboard/admin/customers', icon: <Users/> },
    { name: 'Mechanics', path: '/dashboard/admin/mechanics', icon: <Wrench/> },
    { name: 'Verification', path: '/dashboard/admin/verification', icon: <ShieldCheck/> },
  ];

  const opsLinks = [
    { name: 'Dispatch Logs', path: '/dashboard/admin/dispatch', icon: <Map/> },
    { name: 'Services', path: '/dashboard/admin/services', icon: <Wrench/> },
    { name: 'Pricing', path: '/dashboard/admin/pricing', icon: <IndianRupee/> },
    { name: 'Cities', path: '/dashboard/admin/cities', icon: <MapPin/> },
    { name: 'Revenue', path: '/dashboard/admin/revenue', icon: <BarChart3/> },
    { name: 'Payouts', path: '/dashboard/admin/payouts', icon: <CreditCard/> },
  ];

  const supportLinks = [
    { name: 'Support Tickets', path: '/dashboard/admin/support', icon: <Headphones/> },
    { name: 'Complaints', path: '/dashboard/admin/complaints', icon: <AlertTriangle/> },
    { name: 'Fleet Accounts', path: '/dashboard/admin/fleets', icon: <Building2/> },
    { name: 'Reports', path: '/dashboard/admin/reports', icon: <BarChart3/> },
    { name: 'Settings', path: '/dashboard/admin/settings', icon: <Settings/> },
  ];

  const renderLinks = (links) => links.map((item, i) => {
    const isActive = location.pathname === item.path || (location.pathname === '/dashboard/admin' && item.path === '/dashboard/admin');
    return (
      <Link key={i} to={item.path} className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-orange/10 text-orange' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
        {React.cloneElement(item.icon, { size: 18 })} {item.name}
      </Link>
    );
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* Topbar */}
      <header className="h-16 bg-navy text-white flex items-center justify-between px-6 border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center gap-8 w-1/3">
          <Link to="/" className="text-xl font-black tracking-tight">RoadFix<span className="text-orange">Admin</span></Link>
          <div className="hidden md:flex items-center bg-black/30 rounded-xl px-3 py-1.5 w-64 border border-white/10">
            <Search size={16} className="text-gray-400 mr-2"/>
            <input type="text" placeholder="Search booking, mechanic..." className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-500"/>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 w-2/3">
          <select 
            value={cityFilter} onChange={e => setCityFilter(e.target.value)}
            className="hidden md:block bg-black/30 border border-white/10 text-white text-sm rounded-lg px-3 py-1.5 outline-none"
          >
            {dummyCities.map(c => <option key={c}>{c}</option>)}
          </select>
          <select 
            value={role.id} onChange={e => setRole(adminRoles.find(r => r.id === e.target.value))}
            className="hidden md:block bg-orange/20 border border-orange/50 text-orange text-sm font-bold rounded-lg px-3 py-1.5 outline-none"
          >
            {adminRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <button className="relative p-2 text-gray-400 hover:text-white transition">
            <Bell size={20}/>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-500 border border-white/20 flex items-center justify-center font-bold text-sm ml-2">A</div>
        </div>
      </header>

      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-navy border-r border-white/10 flex-shrink-0 hidden md:flex flex-col overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-1">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 px-4 mt-2">Core</p>
            {renderLinks(mainLinks)}
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 px-4 mt-6">Operations</p>
            {renderLinks(opsLinks)}
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 px-4 mt-6">Support & Admin</p>
            {renderLinks(supportLinks)}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] text-[#111827]">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer/Bottom Nav could go here if needed, but for complex admin panels desktop is assumed primary. I'll add a simple horizontal scroll nav for mobile. */}
      <div className="md:hidden bg-navy w-full overflow-x-auto whitespace-nowrap border-t border-white/10 p-2 flex gap-2 hide-scrollbar">
        {mainLinks.map((item, i) => (
          <Link key={i} to={item.path} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold ${location.pathname === item.path ? 'bg-orange text-white' : 'bg-white/5 text-gray-400'}`}>
            {React.cloneElement(item.icon, { size: 14 })} {item.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
