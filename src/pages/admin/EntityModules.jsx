import React, { useState } from 'react';
import { useAdmin } from './AdminState';
import { Search, Filter, MoreVertical, ShieldCheck, AlertTriangle } from 'lucide-react';

export function AdminBookings() {
  const { bookings } = useAdmin();

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-navy mb-1">Booking Management</h1>
        <div className="flex gap-2">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm hover:bg-gray-50"><Filter size={16}/> Filter</button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400"/>
            <input type="text" placeholder="Search Bookings..." className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-1.5 text-sm outline-none focus:border-orange"/>
          </div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{bookings.length} Bookings Found</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Service & Location</th>
                <th className="px-6 py-4">Assigned Partner</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-bold text-navy">{b.id}<br/><span className="text-[10px] text-gray-400 font-normal">{b.date}</span></td>
                  <td className="px-6 py-4 text-gray-700 font-bold">{b.customer}<br/><span className="text-[10px] text-gray-400 font-normal">{b.vehicle}</span></td>
                  <td className="px-6 py-4 text-gray-700">{b.service}<br/><span className="text-[10px] text-gray-400">{b.loc}, {b.city}</span></td>
                  <td className="px-6 py-4 text-gray-700 font-bold">{b.mech || <span className="text-red-500 italic font-normal">Unassigned</span>}</td>
                  <td className="px-6 py-4 font-black text-green-600">{b.amount}<br/><span className="text-[10px] text-gray-400 font-normal">{b.payMode}</span></td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      b.status === 'Requested' ? 'bg-red-100 text-red-600' :
                      b.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      b.status === 'Escalated' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{b.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-navy"><MoreVertical size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminCustomers() {
  const { customers } = useAdmin(); 
  const totalCustomers = customers ? customers.length : 0;

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-black text-navy mb-8">Customer Management</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">Total Customers</p>
          <p className="text-3xl font-black text-navy">{totalCustomers}</p>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase mb-1">Repeat Rate</p>
          <p className="text-3xl font-black text-green-600">0%</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Customer ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Total Bookings</th>
                <th className="px-6 py-4">LTV</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-bold text-gray-500">{c.id}</td>
                  <td className="px-6 py-4 font-bold text-navy">{c.name}</td>
                  <td className="px-6 py-4 text-gray-600">{c.city}</td>
                  <td className="px-6 py-4 text-gray-600 font-bold">{c.bookings}</td>
                  <td className="px-6 py-4 font-black text-green-600">{c.ltv}</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-[10px] font-black uppercase">{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminMechanics() {
  const { mechanics } = useAdmin();

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-navy mb-1">Mechanic Management</h1>
        <button className="bg-orange text-white px-4 py-2 rounded-lg font-bold text-sm shadow-[0_0_15px_rgba(255,107,0,0.3)] hover:bg-orange/90 transition">+ Add Partner</button>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Partner Name</th>
                <th className="px-6 py-4">Type & City</th>
                <th className="px-6 py-4">Jobs & Earning</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mechanics.map(m => (
                <tr key={m.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-bold text-gray-500">{m.id}</td>
                  <td className="px-6 py-4 font-bold text-navy flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex justify-center items-center font-black">{m.name.charAt(0)}</div>
                    {m.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{m.type}<br/><span className="text-[10px] text-gray-400">{m.city}</span></td>
                  <td className="px-6 py-4 text-gray-600 font-bold">{m.jobs} Jobs<br/><span className="text-[10px] text-green-600">{m.earn} earned</span></td>
                  <td className="px-6 py-4 font-black text-yellow-500">{m.rating} ★</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                      m.status === 'Online' ? 'bg-green-100 text-green-700' :
                      m.status === 'Busy' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{m.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminVerification() {
  const { mechanics, approveMechanic } = useAdmin();
  const pendingMechanics = mechanics.filter(m => m.rawStatus === 'pending');

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-black text-navy mb-8">Partner Verification</h1>
      
      {pendingMechanics.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-500 font-bold">
          No pending verifications at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pendingMechanics.map(mech => (
            <div key={mech.dbId} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-yellow-100 text-yellow-700 text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl">Pending Review</div>
              <h3 className="font-black text-xl text-navy mb-1">{mech.name}</h3>
              <p className="text-gray-500 text-sm mb-6">{mech.type} • {mech.city}</p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm"><ShieldCheck className="text-green-500" size={18}/> <span className="text-gray-700 line-through">Account Created</span></li>
                <li className="flex items-center gap-3 text-sm"><AlertTriangle className="text-yellow-500" size={18}/> <span className="text-navy font-bold">Document Verification Required</span></li>
              </ul>
              
              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl hover:bg-gray-200 transition">Request Docs</button>
                <button onClick={() => approveMechanic(mech.dbId)} className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 hover:bg-green-600 transition">Approve</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
