import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export const adminRoles = [
  { id: 'super_admin', name: 'Super Admin' },
  { id: 'ops_manager', name: 'Operations Manager' },
  { id: 'city_manager', name: 'City Manager' },
  { id: 'support_exec', name: 'Support Executive' },
  { id: 'finance_mgr', name: 'Finance Manager' }
];

export const dummyCities = ['All Cities', 'Ahmedabad', 'Gandhinagar', 'Surat', 'Vadodara'];

import { supabase } from '../../lib/supabase';

export function AdminProvider({ children }) {
  const [role, setRole] = useState(adminRoles[0]);
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [bookings, setBookings] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [grossRevenue, setGrossRevenue] = useState(0);
  const [dispatchLogs, setDispatchLogs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [settlements, setSettlements] = useState([]);

  const [servicesList, setServicesList] = useState([
    { name: 'Tyre Puncture Repair', vehicles: 'Bike, Car', base: '₹149', active: true },
    { name: 'Battery Jumpstart', vehicles: 'Bike, Car', base: '₹249', active: true },
    { name: 'Fuel Delivery', vehicles: 'Bike, Car', base: '₹99 + Fuel', active: true },
    { name: 'Towing Service', vehicles: 'Bike, Car', base: '₹499 + /km', active: true },
    { name: 'Key Lockout', vehicles: 'Car', base: '₹199', active: false },
    { name: 'EV Scooter Support', vehicles: 'EV', base: '₹299', active: true }
  ]);

  useEffect(() => {
    fetchBookings();
    fetchUsers();
    fetchDispatchLogs();
    fetchFinances();

    const subscription = supabase
      .channel('admin:repair_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'repair_requests' }, 
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from('repair_requests')
      .select('*, customer:users!customer_id(full_name)')
      .order('created_at', { ascending: false });

    if (data) {
      let revenue = 0;
      const formatted = data.map(r => {
        if (r.status === 'completed' && r.amount) {
          revenue += r.amount;
        }
        return {
          id: r.id.substring(0, 8),
          full_id: r.id,
          customer: r.customer?.full_name || 'Customer',
          vehicle: r.vehicle,
          service: r.problem,
          city: 'Local',
          loc: r.location,
          lat: r.lat,
          lng: r.lng,
          mech: r.mechanic_name || 'Unassigned',
          status: r.status,
          urgency: 'High',
          payMode: 'Online',
          amount: r.amount ? `₹${r.amount}` : '₹0'
        };
      });
      setBookings(formatted);
      // We will now rely on fetchFinances for grossRevenue instead
    }
  };

  const fetchFinances = async () => {
    const { data: pData } = await supabase
      .from('payments')
      .select('*, customer:users!customer_id(full_name), mechanic:users!mechanic_id(full_name)')
      .order('created_at', { ascending: false });

    const { data: sData } = await supabase
      .from('settlements')
      .select('*, mechanic:users!mechanic_id(full_name, email)')
      .order('created_at', { ascending: false });

    if (pData) {
      setPayments(pData);
      const rev = pData.filter(p => p.payment_status === 'paid').reduce((sum, p) => sum + p.amount, 0);
      setGrossRevenue(rev);
    }
    
    if (sData) {
      setSettlements(sData);
    }
  };

  const fetchDispatchLogs = async () => {
    const { data, error } = await supabase
      .from('dispatch_attempts')
      .select(`
        id,
        distance_km,
        status,
        sent_at,
        responded_at,
        repair_requests (id, problem),
        users (full_name)
      `)
      .order('sent_at', { ascending: false });
      
    if (data) {
      setDispatchLogs(data.map(d => ({
        id: d.id.substring(0, 8),
        request_id: d.repair_requests?.id.substring(0, 8) || 'Unknown',
        mechanic: d.users?.full_name || 'Unknown',
        service: d.repair_requests?.problem || 'Unknown',
        distance: `${d.distance_km} km`,
        status: d.status,
        sent_at: new Date(d.sent_at).toLocaleTimeString()
      })));
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch all completed requests to calculate LTV and Payouts
    const { data: reqData } = await supabase
      .from('repair_requests')
      .select('*')
      .eq('status', 'completed');

    if (error) {
      console.error("Supabase fetchUsers Error:", error.message);
    }

    if (data) {
      const requests = reqData || [];

      const mechs = data.filter(u => u.role === 'mechanic').map(m => {
        const mechJobs = requests.filter(r => r.mechanic_id === m.id);
        const totalEarned = mechJobs.reduce((sum, r) => sum + (r.amount || 0), 0) * 0.85;

        return {
          id: m.id.substring(0, 8),
          dbId: m.id,
          name: m.full_name || 'Unknown',
          email: m.email,
          type: 'General',
          city: 'Local',
          rawStatus: m.status || 'active',
          status: m.status === 'pending' ? 'Pending' : 'Online',
          rating: 4.8,
          jobs: mechJobs.length,
          earn: `₹${totalEarned.toLocaleString('en-IN')}`,
          rawEarn: totalEarned // For sorting/filtering payouts
        };
      });

      const custs = data.filter(u => u.role === 'customer').map(c => {
        const custJobs = requests.filter(r => r.customer_id === c.id);
        const ltv = custJobs.reduce((sum, r) => sum + (r.amount || 0), 0);

        return {
          id: c.id.substring(0, 8),
          name: c.full_name || 'Unknown',
          city: 'Local',
          bookings: custJobs.length,
          ltv: `₹${ltv.toLocaleString('en-IN')}`,
          status: 'Active'
        };
      });
      
      setMechanics(mechs);
      setCustomers(custs);
    }
  };

  const assignMechanic = (bookingId, mechName) => {
    // Optimistic UI update, would be a DB call in reality
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, mech: mechName, status: 'Assigned' } : b));
  };

  const updateBookingStatus = (bookingId, status) => {
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status } : b));
  };

  const approveMechanic = async (dbId) => {
    try {
      const { error } = await supabase.from('users').update({ status: 'active' }).eq('id', dbId);
      if (error) throw error;
      fetchUsers(); // Refresh the list
    } catch (err) {
      console.error("Error approving mechanic:", err);
    }
  };

  return (
    <AdminContext.Provider value={{
      role, setRole,
      cityFilter, setCityFilter,
      bookings, setBookings,
      mechanics, setMechanics,
      customers, setCustomers,
      grossRevenue,
      dispatchLogs,
      payments, settlements, fetchFinances,
      servicesList, setServicesList,
      assignMechanic, updateBookingStatus, approveMechanic
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
