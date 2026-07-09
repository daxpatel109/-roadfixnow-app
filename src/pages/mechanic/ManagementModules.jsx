import React, { useEffect, useState } from 'react';
import { useMechanic } from './MechanicState';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IndianRupee, CheckCircle2, Wrench, FileText, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

// Chart data now generated dynamically

export function MechanicEarnings() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalEarned: 0, avg: 0 });
  const [chartData, setChartData] = useState([
    { name: 'Sun', earn: 0 }, { name: 'Mon', earn: 0 }, { name: 'Tue', earn: 0 }, 
    { name: 'Wed', earn: 0 }, { name: 'Thu', earn: 0 }, { name: 'Fri', earn: 0 }, { name: 'Sat', earn: 0 }
  ]);

  useEffect(() => {
    async function fetchEarnings() {
      if (!user) return;
      const { data } = await supabase
        .from('repair_requests')
        .select('*')
        .eq('mechanic_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        const total = data.reduce((sum, job) => sum + (job.amount || 150), 0);
        setStats({ totalEarned: total, avg: Math.round(total / data.length) });
        setTransactions(data);

        // Generate weekly trend chart data based on transactions
        const newChart = [
          { name: 'Sun', earn: 0 }, { name: 'Mon', earn: 0 }, { name: 'Tue', earn: 0 }, 
          { name: 'Wed', earn: 0 }, { name: 'Thu', earn: 0 }, { name: 'Fri', earn: 0 }, { name: 'Sat', earn: 0 }
        ];
        data.forEach(job => {
          const date = new Date(job.created_at);
          const dayIndex = date.getDay();
          const earning = Math.round((job.amount || 150) * 0.85); // Platform fee 15%
          newChart[dayIndex].earn += earning;
        });
        // Shift array so Monday is first
        const shiftedChart = [...newChart.slice(1), newChart[0]];
        setChartData(shiftedChart);
      }
    }
    fetchEarnings();
  }, [user]);
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-black text-white mb-8">Earnings</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
          <p className="text-gray-400 text-xs font-bold uppercase mb-2">Total Earnings</p>
          <p className="text-3xl font-black text-white">₹{stats.totalEarned}</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
          <p className="text-gray-400 text-xs font-bold uppercase mb-2">This Week</p>
          <p className="text-3xl font-black text-green-400">₹{stats.totalEarned}</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
          <p className="text-gray-400 text-xs font-bold uppercase mb-2">Pending Payout</p>
          <p className="text-3xl font-black text-orange">₹0</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
          <p className="text-gray-400 text-xs font-bold uppercase mb-2">Avg. per Job</p>
          <p className="text-3xl font-black text-white">₹{stats.avg}</p>
        </div>
      </div>

      <div className="bg-[#050810] border border-white/10 p-6 rounded-3xl mb-8">
        <h3 className="font-bold text-white mb-6">Weekly Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{backgroundColor:'#111827', borderColor:'#333', borderRadius:'8px'}} itemStyle={{color:'#22C55E'}} cursor={{fill: '#ffffff10'}}/>
              <Bar dataKey="earn" fill="#22C55E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
        <h3 className="font-bold text-white mb-6">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-sm uppercase tracking-widest">
                <th className="py-4 font-bold">Booking ID</th>
                <th className="py-4 font-bold">Service</th>
                <th className="py-4 font-bold">Customer Total</th>
                <th className="py-4 font-bold">Platform Fee</th>
                <th className="py-4 font-bold text-green-400">Your Earning</th>
                <th className="py-4 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {transactions.length === 0 ? (
                <tr><td colSpan="6" className="py-8 text-center text-gray-500">No completed jobs yet</td></tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-white/5">
                    <td className="py-4 text-gray-300 uppercase">{tx.id.substring(0, 8)}</td>
                    <td className="py-4 font-bold text-white">{tx.problem}</td>
                    <td className="py-4 text-gray-400">₹{tx.amount || 150}</td>
                    <td className="py-4 text-gray-400">-₹{Math.round((tx.amount || 150) * 0.15)}</td>
                    <td className="py-4 font-black text-green-400">₹{Math.round((tx.amount || 150) * 0.85)}</td>
                    <td className="py-4 text-right"><span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase">Paid</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function MechanicPlaceholder({ title, description }) {
  return (
    <div className="max-w-3xl mx-auto text-center py-20">
      <Wrench className="w-16 h-16 text-gray-600 mx-auto mb-6" />
      <h1 className="text-3xl font-black text-white mb-4">{title}</h1>
      <p className="text-gray-400 mb-8">{description || "This management module is functioning in the background for the demo."}</p>
    </div>
  );
}

export function MechanicProfile() {
  const { partnerType } = useMechanic();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
    }
    fetchProfile();
  }, [user]);

  const shopName = profile?.shop_name || profile?.full_name || 'Partner Garage';
  const phone = profile?.phone || 'Not provided';
  const initial = shopName.charAt(0).toUpperCase();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-white mb-8">Profile & Verification</h1>
      
      <div className="bg-[#050810] border border-white/10 rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center font-black text-white text-5xl border-4 border-navy">{initial}</div>
        <div className="flex-1 text-center md:text-left">
          <div className="inline-block px-3 py-1 bg-white/10 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-3 border border-white/20">{partnerType.name}</div>
          <h2 className="text-3xl font-black text-white mb-2">{shopName}</h2>
          <p className="text-gray-400 mb-6">{profile?.email} • {phone}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <span className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-xl text-sm font-bold border border-green-500/30"><CheckCircle2 size={16}/> Identity Verified</span>
            <span className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-xl text-sm font-bold border border-green-500/30"><CheckCircle2 size={16}/> Skills Verified</span>
            <span className="flex items-center gap-2 bg-yellow-500/20 text-yellow-500 px-4 py-2 rounded-xl text-sm font-bold border border-yellow-500/30"><FileText size={16}/> Bank Pending</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h3 className="font-bold text-white mb-4">Supported Services</h3>
          <p className="text-sm text-gray-400 mb-6">Based on your {partnerType.name} profile, you will receive jobs for:</p>
          <ul className="space-y-3">
            {partnerType.services.map((s, i) => (
              <li key={i} className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5">
                <span className="text-white font-bold text-sm">{s}</span>
                <ToggleRight className="text-blue-500" />
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
          <h3 className="font-bold text-white mb-4">Tools Inventory</h3>
          <p className="text-sm text-gray-400 mb-6">Keep your inventory updated. Missing tools will pause related job requests.</p>
          <ul className="space-y-3">
            <li className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5">
              <span className="text-white font-bold text-sm">Standard Toolkit</span>
              <ToggleRight className="text-blue-500" />
            </li>
            <li className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5">
              <span className="text-white font-bold text-sm">Jumpstart Cables</span>
              <ToggleRight className="text-blue-500" />
            </li>
            <li className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-red-500/30">
              <span className="text-gray-400 font-bold text-sm line-through">Air Pump / Compressor</span>
              <ToggleLeft className="text-gray-600" />
            </li>
          </ul>
          <p className="text-xs text-red-400 mt-4 bg-red-500/10 p-3 rounded-lg border border-red-500/20">Warning: Missing Air Pump restricts puncture jobs.</p>
        </div>
      </div>
    </div>
  );
}
