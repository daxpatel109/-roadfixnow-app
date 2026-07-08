import React, { useState } from 'react';
import { useAdmin } from './AdminState';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, Navigation2, CheckCircle2, AlertTriangle, User, Search, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';

const customMarkerIcon = new L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #EF4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(239,68,68,0.8);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const revenueData = [
  { time: '08:00', amount: 12000 },
  { time: '10:00', amount: 25000 },
  { time: '12:00', amount: 48000 },
  { time: '14:00', amount: 39000 },
  { time: '16:00', amount: 84500 },
  { time: '18:00', amount: 92000 }
];

export function AdminOverview() {
  const { cityFilter, role, bookings, mechanics } = useAdmin();

  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(b => b.status !== 'Completed' && b.status !== 'Cancelled').length;
  const completedToday = bookings.filter(b => b.status === 'Completed').length;
  
  const pendingMechanicsCount = mechanics.filter(m => m.rawStatus === 'pending').length;
  const unassignedEmergencyCount = bookings.filter(b => b.status === 'Requested' && (b.urgency === 'Emergency' || b.urgency === 'High')).length;

  // Simulated revenue based on completed jobs (₹500 per job average for demo)
  const totalRevenue = completedToday * 500;
  const pendingPayouts = totalRevenue * 0.8; // Mechanics get 80%

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-navy mb-1">Overview <span className="text-lg font-bold text-gray-500 font-normal">/ {cityFilter}</span></h1>
          <p className="text-gray-500">Welcome back, {role.name}. Here's what's happening today.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">Total Bookings</p>
          <p className="text-3xl font-black text-navy">{totalBookings}</p>
        </div>
        <div className="bg-orange/10 border border-orange/20 p-5 rounded-2xl">
          <p className="text-orange text-xs font-bold uppercase mb-1">Active Bookings</p>
          <p className="text-3xl font-black text-orange">{activeBookings}</p>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">Completed Today</p>
          <p className="text-3xl font-black text-green-600">{completedToday}</p>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">Est. Revenue</p>
          <p className="text-3xl font-black text-navy">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">Pending Payouts</p>
          <p className="text-3xl font-black text-navy">₹{pendingPayouts.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-navy mb-6">Today's Revenue Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                <XAxis dataKey="time" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false}/>
                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false}/>
                <Tooltip contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                <Area type="monotone" dataKey="amount" stroke="#FF6B00" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-100 p-5 rounded-2xl flex gap-4 items-start">
            <AlertTriangle className="text-red-500 shrink-0"/>
            <div>
              <h4 className="font-bold text-red-900 mb-1">High Demand Alert</h4>
              <p className="text-sm text-red-700 mb-3">SG Highway, Ahmedabad has 23% higher demand today. Low towing availability.</p>
              <button className="text-xs font-bold bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200">Alert Partners</button>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-100 p-5 rounded-2xl flex gap-4 items-start">
            <User className="text-yellow-600 shrink-0"/>
            <div>
              <h4 className="font-bold text-yellow-900 mb-1">Pending Verifications</h4>
              <p className="text-sm text-yellow-700 mb-3">{pendingMechanicsCount} new mechanics are waiting for document approval to go online.</p>
              <Link to="/dashboard/admin/verification"><button className="text-xs font-bold bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg hover:bg-yellow-200">Review Now</button></Link>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex gap-4 items-start">
            <Navigation2 className="text-blue-600 shrink-0"/>
            <div>
              <h4 className="font-bold text-blue-900 mb-1">Emergency Jobs Waiting</h4>
              <p className="text-sm text-blue-700 mb-3">{unassignedEmergencyCount} emergency towing requests are unassigned.</p>
              <Link to="/dashboard/admin/live"><button className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200">Assign Manually</button></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminLiveOps() {
  const { bookings, mechanics, assignMechanic } = useAdmin();
  const [selectedBooking, setSelectedBooking] = useState(null);

  const unassigned = bookings.filter(b => b.status === 'Requested');
  const active = bookings.filter(b => b.status !== 'Requested' && b.status !== 'Completed');

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] w-full relative">
      {/* Left Panel: Feed */}
      <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full z-10 shadow-xl">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-black text-navy mb-2">Live Operations</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400"/>
            <input type="text" placeholder="Search ID or Customer" className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-orange"/>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50">
          <p className="text-[10px] font-bold text-gray-500 uppercase px-2 mt-2">Requires Assignment ({unassigned.length})</p>
          {unassigned.map(b => (
            <div key={b.id} onClick={() => setSelectedBooking(b)} className={`p-3 rounded-xl border cursor-pointer transition ${selectedBooking?.id === b.id ? 'bg-orange/5 border-orange/50' : 'bg-white border-gray-200 hover:border-orange/30'}`}>
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm text-navy">{b.id}</span>
                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">{b.urgency}</span>
              </div>
              <p className="text-xs font-bold text-gray-900 mb-1">{b.service}</p>
              <p className="text-[11px] text-gray-500 truncate"><MapPin size={10} className="inline mr-1"/>{b.loc}, {b.city}</p>
            </div>
          ))}
          
          <p className="text-[10px] font-bold text-gray-500 uppercase px-2 mt-4">Active Trip ({active.length})</p>
          {active.map(b => (
            <div key={b.id} onClick={() => setSelectedBooking(b)} className={`p-3 rounded-xl border cursor-pointer transition ${selectedBooking?.id === b.id ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-sm text-navy">{b.id}</span>
                <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">{b.status}</span>
              </div>
              <p className="text-xs font-bold text-gray-900 mb-1">{b.service}</p>
              <p className="text-[11px] text-gray-500 truncate mb-1">Mech: {b.mech}</p>
              <p className="text-[11px] text-gray-500 truncate"><MapPin size={10} className="inline mr-1"/>{b.loc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 bg-[#E5E7EB] relative overflow-hidden flex flex-col items-center justify-center">
        {/* CSS Mock Map Pattern */}
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#CBD5E1 1px, transparent 1px), linear-gradient(90deg, #CBD5E1 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        {/* Live GPS Map Area */}
        {selectedBooking && selectedBooking.lat && selectedBooking.lng ? (
          <MapContainer center={[selectedBooking.lat, selectedBooking.lng]} zoom={15} style={{ height: '100%', width: '100%', zIndex: 1 }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            <Marker position={[selectedBooking.lat, selectedBooking.lng]} icon={customMarkerIcon} />
          </MapContainer>
        ) : (
          <div className="text-center text-gray-500 bg-white/80 backdrop-blur px-6 py-4 rounded-2xl shadow-sm z-10">
            <Map className="mx-auto mb-2 text-gray-400" size={32}/>
            <p className="font-bold">Select a booking to view its live location</p>
          </div>
        )}

        {/* Right Panel: Detail Overlay (if selected) */}
        {selectedBooking && (
          <div className="absolute right-4 top-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[calc(100vh-100px)]">
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-black text-navy">{selectedBooking.id}</h3>
                <button onClick={()=>setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600">×</button>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${selectedBooking.status === 'Requested' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{selectedBooking.status}</span>
            </div>
            
            <div className="p-4 space-y-4 overflow-y-auto">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Customer</p>
                <p className="text-sm font-bold text-navy">{selectedBooking.customer}</p>
                <p className="text-xs text-gray-600">{selectedBooking.vehicle}</p>
              </div>
              
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Issue & Location</p>
                <p className="text-sm font-bold text-red-600 mb-1">{selectedBooking.service}</p>
                <p className="text-xs text-gray-600">{selectedBooking.loc}, {selectedBooking.city}</p>
              </div>

              {selectedBooking.status === 'Requested' ? (
                <div className="bg-orange/5 border border-orange/20 p-3 rounded-xl mt-4">
                  <p className="text-[10px] font-bold text-orange uppercase mb-2">Assign Mechanic Manually</p>
                  <select 
                    className="w-full bg-white border border-gray-300 text-sm rounded px-2 py-1.5 mb-2 outline-none"
                    onChange={(e) => assignMechanic(selectedBooking.id, e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Select nearest partner...</option>
                    {mechanics.filter(m => m.status === 'Online').map(m => (
                      <option key={m.id} value={m.name}>{m.name} ({m.rating}★)</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl mt-4">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Assigned Partner</p>
                  <p className="text-sm font-bold text-navy">{selectedBooking.mech}</p>
                  <p className="text-xs text-gray-600 mt-2 font-bold">ETA: {selectedBooking.eta || '12 mins'}</p>
                  <button className="w-full mt-3 text-xs bg-white border border-gray-300 py-1.5 rounded-lg hover:bg-gray-50 font-bold">Reassign Mechanic</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
