import React, { useEffect, useState } from 'react';
import { Clock, MapPin, CheckCircle2, AlertTriangle, Car, Star, LogOut, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Phone, MessageSquare } from 'lucide-react';

export function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeRequest, setActiveRequest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  const fullName = user?.user_metadata?.full_name || 'Customer';
  const email = user?.email || 'N/A';
  const initial = fullName.charAt(0).toUpperCase();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const { data: activeData } = await supabase
        .from('repair_requests')
        .select('*')
        .eq('customer_id', user.id)
        .neq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (activeData) setActiveRequest(activeData);

      const { data: historyData } = await supabase
        .from('repair_requests')
        .select('*')
        .eq('customer_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
        
      if (historyData) setHistory(historyData);
      if (historyData) setHistory(historyData);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Listen to Database Realtime changes for active request
  useEffect(() => {
    if (!activeRequest) return;
    const subscription = supabase
      .channel(`active_request_${activeRequest.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'repair_requests', filter: `id=eq.${activeRequest.id}` }, 
      (payload) => {
        setActiveRequest(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [activeRequest?.id]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[#0B1220] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-orange animate-spin" />
      </div>
    );
  }

  const renderOverview = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-black text-white">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`col-span-1 md:col-span-2 border rounded-3xl p-6 relative overflow-hidden ${activeRequest ? 'bg-gradient-to-br from-[#111827] to-[#1a1512] border-orange shadow-[0_0_30px_rgba(255,107,0,0.15)]' : 'bg-white/5 border-white/10'}`}>
          <div className="flex items-center gap-3 mb-4 text-orange">
            <AlertTriangle/> <h3 className="font-bold text-white uppercase tracking-widest text-sm">Active Issue</h3>
          </div>
          
          {activeRequest ? (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-2xl font-black text-white mb-1">{activeRequest.problem}</h4>
                  <p className="text-gray-400 text-sm">{activeRequest.vehicle} • {activeRequest.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Status</p>
                  <p className="inline-block px-3 py-1 bg-orange/20 border border-orange/50 text-orange rounded-full text-xs font-bold uppercase">{activeRequest.status}</p>
                </div>
              </div>

              <div className="w-full h-32 bg-[#050810] rounded-2xl relative overflow-hidden border border-white/10 flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <svg className="absolute inset-0 w-full h-full"><motion.path d="M 50 100 Q 150 20 300 80" fill="none" stroke="#FF6B00" strokeWidth="3" strokeDasharray="6,6" initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:2}} /></svg>
                <div className="absolute top-[20px] left-[150px] w-4 h-4 bg-orange rounded-full shadow-[0_0_10px_rgba(255,107,0,1)] animate-ping"></div>
              </div>

              {(activeRequest.status !== 'searching') && (
                <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-12 h-12 bg-orange flex items-center justify-center rounded-full font-black text-navy text-xl">
                      {(activeRequest.mechanic_name || 'M').charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg">{activeRequest.mechanic_name || 'Verified Mechanic'}</h3>
                      <p className="text-sm text-gray-400">GJ-01-AB-1234 • 4.8 ★</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center border border-green-500/30 hover:bg-green-500/30 transition"><Phone size={18}/></button>
                      <button className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 hover:bg-blue-500/30 transition"><MessageSquare size={18}/></button>
                    </div>
                  </div>
                </div>
              )}

              {activeRequest.otp && (
                <div className="bg-orange/10 border border-orange/30 p-4 rounded-xl text-center flex justify-between items-center">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Share OTP</span>
                  <span className="text-3xl font-black text-orange tracking-[0.2em]">{activeRequest.otp}</span>
                </div>
              )}

              <button onClick={() => navigate('/book')} className="w-full py-4 bg-orange text-white font-black text-lg rounded-xl shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:bg-orange/80 transition uppercase tracking-wider">Open Full Tracker & Pay</button>
            </div>
          ) : (
            <div>
              <p className="text-gray-400 mb-6">You have no active breakdowns. Drive safe!</p>
              <button onClick={() => navigate('/book')} className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition">Request Assistance</button>
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <p className="text-white/80 font-bold mb-2 text-sm uppercase tracking-widest">Wallet Balance</p>
          <p className="text-4xl font-black text-white">₹0.00</p>
          <button className="mt-4 px-4 py-3 border border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 transition rounded-xl text-gray-400 font-bold text-sm w-full">+ Add Money</button>
        </div>
      </div>
    </motion.div>
  );

  const renderHistory = () => {
    const totalSpent = history.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-3xl font-black text-white">Service History</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-4">
            <div className="w-14 h-14 bg-orange/20 rounded-full flex items-center justify-center"><CheckCircle2 className="text-orange" /></div>
            <div>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Total Fixes</p>
              <h3 className="text-3xl font-black text-white">{history.length}</h3>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center gap-4">
            <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 font-black text-xl">₹</div>
            <div>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Total Spent</p>
              <h3 className="text-3xl font-black text-white">₹{totalSpent}</h3>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="p-8 text-center bg-white/5 border border-white/10 rounded-3xl text-gray-400">
              You have no past bookings yet.
            </div>
          ) : (
            <AnimatePresence>
              {history.map((b, i) => (
                <motion.div key={b.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition group">
                  <div className="mb-4 sm:mb-0">
                    <p className="font-bold text-white text-lg flex items-center gap-3">
                      {b.problem} <span className="text-xs font-normal text-gray-500 bg-black/50 px-2 py-0.5 rounded-md border border-white/10">ID: {b.id.substring(0, 8)}</span>
                    </p>
                    <p className="text-sm text-gray-400 mt-2 flex items-center gap-2"><MapPin size={14}/> {b.location}</p>
                    <p className="text-sm text-gray-400 mt-1 flex items-center gap-2"><Clock size={14}/> {new Date(b.created_at).toLocaleString()}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-black text-white text-2xl">₹{b.amount || 0}</p>
                    <p className="text-xs font-bold uppercase text-green-400 mt-1 flex items-center gap-1 sm:justify-end"><CheckCircle2 size={12}/> Completed</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    );
  };

  const renderProfile = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-black text-white">My Profile</h1>
      </div>
      
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
        <div className="flex items-center gap-6 mb-8 border-b border-white/10 pb-8">
          <div className="w-24 h-24 bg-orange rounded-full flex items-center justify-center font-black text-navy text-4xl shadow-[0_0_20px_rgba(255,107,0,0.4)]">
            {initial}
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">{fullName}</h2>
            <p className="text-gray-400">{email}</p>
            <p className="inline-block mt-2 px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-400 rounded-full text-xs font-bold uppercase tracking-wider">Active Customer</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Account ID</label>
            <input type="text" value={user.id} disabled className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-gray-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Member Since</label>
            <input type="text" value={new Date(user.created_at).toLocaleDateString()} disabled className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-gray-500 outline-none" />
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-[#0B1220]">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-[#050810] border-r border-white/10 p-6 flex flex-col justify-between flex-shrink-0">
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-orange rounded-full flex items-center justify-center font-black text-navy text-xl shadow-[0_0_15px_rgba(255,107,0,0.4)]">
              {initial}
            </div>
            <div>
              <h3 className="text-white font-bold">{fullName}</h3>
              <p className="text-xs text-gray-400">Customer</p>
            </div>
          </div>
          <nav className="space-y-2 flex md:flex-col overflow-x-auto md:overflow-visible hide-scrollbar pb-4 md:pb-0">
            {['Overview', 'History', 'Profile'].map((item) => (
              <button 
                key={item} 
                onClick={() => setActiveTab(item)}
                className={`whitespace-nowrap text-left px-4 py-3 rounded-xl font-bold transition-all ${activeTab === item ? 'bg-orange/20 text-orange border border-orange/30 shadow-[0_0_15px_rgba(255,107,0,0.15)]' : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
        <button onClick={handleLogout} className="hidden md:flex items-center gap-2 text-gray-500 hover:text-red-400 transition font-bold px-4 py-2 mt-8">
          <LogOut size={18} /> Logout securely
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeTab === 'Overview' && renderOverview()}
        {activeTab === 'History' && renderHistory()}
        {activeTab === 'Profile' && renderProfile()}
      </div>
    </div>
  );
}
