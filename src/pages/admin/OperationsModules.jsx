import React from 'react';
import { useAdmin, dummyCities } from './AdminState';
import { ToggleRight, MapPin, IndianRupee, Map as MapIcon } from 'lucide-react';

export function AdminServices() {
  const { servicesList, setServicesList } = useAdmin();

  const toggleService = (index) => {
    const updated = [...servicesList];
    updated[index].active = !updated[index].active;
    setServicesList(updated);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-navy mb-1">Service Management</h1>
        <button className="bg-orange text-white px-4 py-2 rounded-lg font-bold text-sm shadow-[0_0_15px_rgba(255,107,0,0.3)] hover:bg-orange/90 transition">+ Add Service</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicesList.map((s, i) => (
          <div key={i} className={`bg-white border p-6 rounded-2xl shadow-sm transition ${s.active ? 'border-gray-200' : 'border-red-200 opacity-70'}`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-navy text-lg">{s.name}</h3>
              <button onClick={() => toggleService(i)} className="focus:outline-none">
                <ToggleRight className={s.active ? 'text-blue-500' : 'text-gray-300'} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Supported: <span className="font-bold text-gray-700">{s.vehicles}</span></p>
            <div className="flex justify-between items-center border-t border-gray-100 pt-4">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Base Price</p>
                <p className="font-black text-navy">{s.base}</p>
              </div>
              <button className="text-sm font-bold text-blue-500 hover:text-blue-600">Edit Price</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminPricing() {
  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <h1 className="text-3xl font-black text-navy mb-8">Pricing Control</h1>
      
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm mb-8">
        <h3 className="font-bold text-navy mb-4">Global Modifiers</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="font-bold text-navy text-sm">Platform Fee Commission</p>
              <p className="text-xs text-gray-500">Percentage deducted from mechanic payout.</p>
            </div>
            <div className="flex items-center gap-2">
              <input type="text" defaultValue="15%" className="w-16 bg-white border border-gray-300 rounded px-2 py-1 text-center font-bold text-navy" />
              <button className="text-blue-500 font-bold text-sm ml-2">Save</button>
            </div>
          </div>
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="font-bold text-navy text-sm">Night Emergency Surcharge</p>
              <p className="text-xs text-gray-500">Added to base price between 10 PM - 6 AM.</p>
            </div>
            <div className="flex items-center gap-2">
              <input type="text" defaultValue="₹99" className="w-16 bg-white border border-gray-300 rounded px-2 py-1 text-center font-bold text-navy" />
              <button className="text-blue-500 font-bold text-sm ml-2">Save</button>
            </div>
          </div>
          <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl border border-red-100">
            <div>
              <p className="font-bold text-red-900 text-sm">Dynamic Surge Pricing</p>
              <p className="text-xs text-red-700">Currently active in Ahmedabad.</p>
            </div>
            <ToggleRight className="text-red-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminCities() {
  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-navy mb-1">City Operations</h1>
        <button className="bg-navy text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-navy/90 transition">+ Add City</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dummyCities.filter(c => c !== 'All Cities').map((city, i) => (
          <div key={i} className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm hover:border-orange/50 transition cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange/10 rounded-full flex items-center justify-center text-orange"><MapPin size={20}/></div>
              <h3 className="font-black text-navy text-lg">{city}</h3>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Active Partners</span><span className="font-bold text-navy">124</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Avg ETA</span><span className="font-bold text-navy">16 min</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><span className="font-bold text-green-600">Active</span></div>
            </div>
            <div className="h-20 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden relative flex items-center justify-center">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#A0AEC0 1px, transparent 1px), linear-gradient(90deg, #A0AEC0 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>
              <MapIcon className="text-gray-400 z-10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDispatchLogs() {
  const { dispatchLogs } = useAdmin();

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-black text-navy mb-8">Smart Dispatch Analytics</h1>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between">
          <h3 className="font-bold text-navy">Live Dispatch Pings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Mechanic Pinged</th>
                <th className="px-6 py-4">Distance</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dispatchLogs?.length === 0 ? (
                <tr><td colSpan="6" className="p-6 text-center text-gray-400">No dispatch data yet.</td></tr>
              ) : (
                dispatchLogs?.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-bold text-gray-600">{log.request_id}</td>
                    <td className="px-6 py-4 font-bold text-navy">{log.service}</td>
                    <td className="px-6 py-4 font-bold text-navy">{log.mechanic}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{log.distance}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                        log.status === 'accepted' ? 'bg-green-100 text-green-700' : 
                        log.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        log.status === 'expired' ? 'bg-gray-100 text-gray-700' :
                        log.status === 'sent' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{log.sent_at}</td>
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
