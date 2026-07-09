import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useMechanic, mechanicTypes } from './MechanicState';
import { Home, List, Navigation2, IndianRupee, User, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../../components/NotificationBell';

export default function MechanicLayout() {
  const { partnerType, setPartnerType, isOnline } = useMechanic();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', path: '/dashboard/mechanic', icon: <Home/> },
    { name: 'Requests', path: '/dashboard/mechanic/requests', icon: <List/> },
    { name: 'Active Job', path: '/dashboard/mechanic/active-job', icon: <Navigation2/> },
    { name: 'Earnings', path: '/dashboard/mechanic/earnings', icon: <IndianRupee/> },
    { name: 'Profile', path: '/dashboard/mechanic/profile', icon: <User/> },
  ];

  const sidebarOnlyItems = [
    { name: 'Job History', path: '/dashboard/mechanic/history' },
    { name: 'Services', path: '/dashboard/mechanic/services' },
    { name: 'Availability', path: '/dashboard/mechanic/availability' },
    { name: 'Ratings', path: '/dashboard/mechanic/ratings' },
    { name: 'Tools', path: '/dashboard/mechanic/tools' },
    { name: 'Support', path: '/dashboard/mechanic/support' },
    { name: 'Training', path: '/dashboard/mechanic/training' },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-[#0B1220]">
      {/* Top Banner for Demo Partner Selector */}
      <div className="w-full bg-orange text-navy text-xs font-black uppercase tracking-widest px-4 py-2 flex justify-between items-center z-40 hidden md:flex">
        <span>Demo Mode</span>
        <div className="flex items-center gap-2">
          <span>Preview dashboard as:</span>
          <select 
            value={partnerType.id}
            onChange={(e) => setPartnerType(mechanicTypes.find(t => t.id === e.target.value))}
            className="bg-navy text-orange border border-navy rounded px-2 py-0.5 outline-none"
          >
            {mechanicTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 relative overflow-hidden">
        {/* Sidebar (Desktop) */}
        <div className="w-64 bg-[#050810] border-r border-white/10 p-6 flex-shrink-0 hidden md:flex md:flex-col pt-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center font-black text-white text-xl border-2 border-navy">{partnerType.name.charAt(0)}</div>
            <div className="flex-1">
              <h3 className="text-white font-bold truncate w-24" title={partnerType.name}>{partnerType.name}</h3>
              <p className="text-xs font-bold flex items-center gap-1 text-gray-400">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></span>
                {isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
            {user && <NotificationBell userId={user.id} />}
          </div>
          <nav className="space-y-1 overflow-y-auto pb-10 custom-scrollbar">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 mt-4">Main</p>
            {navItems.map((item, i) => (
              <Link key={i} to={item.path} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all ${location.pathname === item.path || (location.pathname==='/dashboard/mechanic' && item.path==='/dashboard/mechanic') ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                {React.cloneElement(item.icon, { size: 18 })} {item.name}
              </Link>
            ))}
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 mt-6">Management</p>
            {sidebarOnlyItems.map((item, i) => (
              <Link key={i} to={item.path} className={`block px-4 py-2 rounded-xl font-bold transition-all text-sm ${location.pathname === item.path ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                {item.name}
              </Link>
            ))}
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 mt-4 rounded-xl font-bold transition-all text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 w-full text-left">
              <LogOut size={16} /> Logout securely
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8 relative">
          <Outlet />
        </div>

        {/* Bottom Nav (Mobile) */}
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-navy/95 backdrop-blur-xl border-t border-white/10 flex justify-around items-center p-3 z-50 pb-safe">
          {navItems.map((item, i) => (
            <Link key={i} to={item.path} className={`flex flex-col items-center gap-1 p-2 rounded-xl ${location.pathname === item.path ? 'text-blue-400' : 'text-gray-500'}`}>
              {React.cloneElement(item.icon, { size: 20 })}
              <span className="text-[10px] font-bold">{item.name}</span>
            </Link>
          ))}
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 p-2 rounded-xl text-gray-500 hover:text-red-400">
            <LogOut size={20} />
            <span className="text-[10px] font-bold">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
