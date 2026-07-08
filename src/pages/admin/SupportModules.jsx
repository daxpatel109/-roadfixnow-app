import React from 'react';
import { Headphones, AlertTriangle, Building2, BarChart3, Settings as SettingsIcon, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export function AdminSupport() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-black text-navy mb-8">Support Tickets</h1>
      
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Customer/Partner</th>
                <th className="px-6 py-4">Issue</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-bold text-gray-500">T-1004</td>
                <td className="px-6 py-4 font-bold text-navy">Karan Joshi<br/><span className="text-[10px] text-gray-400 font-normal">Customer</span></td>
                <td className="px-6 py-4 text-gray-700">Mechanic late by 30 mins<br/><span className="text-[10px] text-gray-400">Ref: RFN-2045</span></td>
                <td className="px-6 py-4"><span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">High</span></td>
                <td className="px-6 py-4"><span className="bg-orange/20 text-orange px-2.5 py-1 rounded-md text-[10px] font-black uppercase">Open</span></td>
                <td className="px-6 py-4"><button className="text-blue-500 font-bold hover:text-blue-700">Resolve</button></td>
              </tr>
              <tr className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-bold text-gray-500">T-1005</td>
                <td className="px-6 py-4 font-bold text-navy">Shakti Battery<br/><span className="text-[10px] text-gray-400 font-normal">Partner</span></td>
                <td className="px-6 py-4 text-gray-700">Customer unreachable<br/><span className="text-[10px] text-gray-400">Ref: RFN-2042</span></td>
                <td className="px-6 py-4"><span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Medium</span></td>
                <td className="px-6 py-4"><span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-[10px] font-black uppercase">Resolved</span></td>
                <td className="px-6 py-4"><button className="text-gray-400 font-bold hover:text-gray-600">View</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminComplaints() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-black text-navy mb-8">Complaints & Safety</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
          <AlertTriangle className="text-red-500 mb-2" />
          <h3 className="font-bold text-red-900">High Risk Reports</h3>
          <p className="text-3xl font-black text-red-600">2</p>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold text-gray-500">Pending Investigations</h3>
          <p className="text-3xl font-black text-navy">14</p>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold text-gray-500">Suspended Partners</h3>
          <p className="text-3xl font-black text-navy">5</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Complaint ID</th>
                <th className="px-6 py-4">Reported By</th>
                <th className="px-6 py-4">Against</th>
                <th className="px-6 py-4">Type & Severity</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-bold text-gray-500">CMP-088</td>
                <td className="px-6 py-4 font-bold text-navy">Meera Trivedi<br/><span className="text-[10px] text-gray-400">Customer</span></td>
                <td className="px-6 py-4 font-bold text-navy">Raju Tyres<br/><span className="text-[10px] text-gray-400">Partner</span></td>
                <td className="px-6 py-4 text-gray-700">Overcharging / Fake Parts<br/><span className="text-[10px] font-bold text-red-600 uppercase">High Severity</span></td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="text-red-500 font-bold hover:text-red-700 bg-red-50 px-3 py-1 rounded">Suspend</button>
                    <button className="text-blue-500 font-bold hover:text-blue-700 bg-blue-50 px-3 py-1 rounded">Investigate</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminFleets() {
  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-navy mb-1">Fleet & B2B Accounts</h1>
        <button className="bg-navy text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-navy/90 transition">+ Add Fleet Account</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'SwiftDelivery Fleet', vehicles: 450, requests: 124, bill: '₹48,500', status: 'Active' },
          { name: 'CityBike Rentals', vehicles: 1200, requests: 340, bill: '₹1,12,000', status: 'Active' },
          { name: 'Urban Logistics Co.', vehicles: 85, requests: 12, bill: '₹8,900', status: 'Payment Pending' }
        ].map((fleet, i) => (
          <div key={i} className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm hover:border-orange/50 transition">
            <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400"><Building2 size={24}/></div>
              <div>
                <h3 className="font-black text-navy text-lg leading-tight">{fleet.name}</h3>
                <span className={`text-[10px] font-bold uppercase ${fleet.status === 'Active' ? 'text-green-600' : 'text-orange'}`}>{fleet.status}</span>
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Covered Vehicles</span><span className="font-bold text-navy">{fleet.vehicles}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Monthly Requests</span><span className="font-bold text-navy">{fleet.requests}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Current Bill</span><span className="font-black text-green-600">{fleet.bill}</span></div>
            </div>
            <button className="w-full text-center text-sm font-bold text-blue-500 border border-blue-100 bg-blue-50 py-2 rounded-xl hover:bg-blue-100">View Invoices</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminReports() {
  const chartData = [
    { name: 'Week 1', bikes: 400, cars: 240, ev: 100 },
    { name: 'Week 2', bikes: 300, cars: 139, ev: 200 },
    { name: 'Week 3', bikes: 500, cars: 480, ev: 250 },
    { name: 'Week 4', bikes: 450, cars: 390, ev: 300 },
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-navy mb-1">Reports & Analytics</h1>
        <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-50 shadow-sm"><Download size={16}/> Export Full CSV</button>
      </div>

      <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm mb-8">
        <h3 className="font-bold text-navy mb-6">Service Demand by Vehicle Type (Monthly)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" tickLine={false} axisLine={false}/>
              <YAxis stroke="#6B7280" tickLine={false} axisLine={false}/>
              <RechartsTooltip contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 4px 6px -1px rgb(0 0 0 / 0.1)'}} cursor={{fill: '#f3f4f6'}}/>
              <Bar dataKey="bikes" fill="#FF6B00" radius={[4, 4, 0, 0]} name="Bike Services" />
              <Bar dataKey="cars" fill="#0B1220" radius={[4, 4, 0, 0]} name="Car Services" />
              <Bar dataKey="ev" fill="#16A34A" radius={[4, 4, 0, 0]} name="EV Support" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function AdminSettings() {
  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <h1 className="text-3xl font-black text-navy mb-8">Platform Settings</h1>
      
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-8 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-bold text-navy flex items-center gap-2"><SettingsIcon size={18}/> General Configuration</h3>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Company Name</label>
            <input type="text" defaultValue="RoadFixNow India Pvt Ltd" className="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-orange" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Support Email</label>
              <input type="text" defaultValue="support@roadfixnow.in" className="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-orange" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Emergency Number</label>
              <input type="text" defaultValue="1800-123-4567" className="w-full bg-gray-50 border border-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-orange" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-bold text-navy flex items-center gap-2"><AlertTriangle size={18}/> Demo Settings</h3>
        </div>
        <div className="p-6 space-y-4">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4 accent-orange" />
            <span className="text-sm font-bold text-gray-700">Enable Auto-Assign Mechanic (Demo)</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4 accent-orange" />
            <span className="text-sm font-bold text-gray-700">Force Surge Pricing Everywhere</span>
          </label>
          <button className="mt-4 bg-navy text-white px-6 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-navy/90 transition">Save Settings</button>
        </div>
      </div>
    </div>
  );
}
