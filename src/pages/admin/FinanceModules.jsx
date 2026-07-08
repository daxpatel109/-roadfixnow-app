import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { useAdmin } from './AdminState';
import { supabase } from '../../lib/supabase';

export function AdminRevenue() {
  const { grossRevenue } = useAdmin();
  
  const revData = [
    { name: 'Mon', gross: 85000, platform: 12750 },
    { name: 'Tue', gross: 92000, platform: 13800 },
    { name: 'Wed', gross: 78000, platform: 11700 },
    { name: 'Thu', gross: 110000, platform: 16500 },
    { name: 'Fri', gross: 145000, platform: 21750 },
    { name: 'Sat', gross: 180000, platform: 27000 },
    { name: 'Sun', gross: 165000, platform: 24750 },
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-navy mb-1">Revenue Dashboard</h1>
        <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-50 shadow-sm"><Download size={16}/> Export Report</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">Gross Booking Value</p>
          <p className="text-2xl font-black text-navy">₹{grossRevenue.toLocaleString('en-IN')}</p>
          <p className="text-xs text-green-600 font-bold mt-1">+12% vs last week</p>
        </div>
        <div className="bg-orange/10 border border-orange/20 p-5 rounded-2xl">
          <p className="text-orange text-xs font-bold uppercase mb-1">Platform Commission</p>
          <p className="text-2xl font-black text-orange">₹{(grossRevenue * 0.15).toLocaleString('en-IN')}</p>
          <p className="text-xs text-orange/80 font-bold mt-1">15% avg take rate</p>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">Mechanic Payouts</p>
          <p className="text-2xl font-black text-green-600">₹{(grossRevenue * 0.85).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">Refunds</p>
          <p className="text-2xl font-black text-red-500">₹0</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm mb-8">
        <h3 className="font-bold text-navy mb-6">Weekly Revenue Split (Gross vs Platform Fee)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" tickLine={false} axisLine={false}/>
              <YAxis stroke="#6B7280" tickLine={false} axisLine={false}/>
              <RechartsTooltip contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}} cursor={{fill: '#f3f4f6'}}/>
              <Bar dataKey="gross" fill="#0B1220" radius={[4, 4, 0, 0]} name="Gross Booking Value" />
              <Bar dataKey="platform" fill="#FF6B00" radius={[4, 4, 0, 0]} name="Platform Fee" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function AdminPayouts() {
  const { settlements, fetchFinances } = useAdmin();
  
  const handleApprove = async (id) => {
    await supabase.from('settlements').update({ settlement_status: 'paid', settled_at: new Date().toISOString() }).eq('id', id);
    fetchFinances();
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-black text-navy mb-8">Payout Management</h1>
      
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-navy">Pending Settlements</h3>
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md shadow-green-500/20 hover:bg-green-600 transition">Approve All Verified</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Payout ID</th>
                <th className="px-6 py-4">Partner</th>
                <th className="px-6 py-4">Completed Jobs</th>
                <th className="px-6 py-4">Gross Earned</th>
                <th className="px-6 py-4">Platform Fee</th>
                <th className="px-6 py-4">Net Payout</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {settlements.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500 font-bold">No payouts found.</td>
                </tr>
              ) : (
                settlements.map((s, i) => {
                  return (
                    <tr key={s.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-bold text-gray-500">SET-{s.id.substring(0,6).toUpperCase()}</td>
                      <td className="px-6 py-4 font-bold text-navy">{s.mechanic?.full_name || 'Unknown'}<br/><span className="text-[10px] text-gray-400 font-normal">{s.mechanic?.email}</span></td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs">{s.payment_id?.substring(0,8)}</td>
                      <td className="px-6 py-4 text-gray-600">₹{s.gross_amount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-red-500">-₹{s.platform_commission.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 font-black text-green-600">₹{s.mechanic_payout.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${s.settlement_status === 'paid' ? 'bg-green-500/20 text-green-600' : 'bg-orange/20 text-orange'}`}>
                          {s.settlement_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {s.settlement_status === 'pending' ? (
                          <button onClick={() => handleApprove(s.id)} className="text-blue-500 font-bold hover:text-blue-700 bg-blue-500/10 px-3 py-1 rounded-md">Mark Paid</button>
                        ) : (
                          <span className="text-gray-400 text-xs font-bold">{new Date(s.settled_at).toLocaleDateString()}</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
