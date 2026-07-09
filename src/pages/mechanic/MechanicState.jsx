import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';

const MechanicContext = createContext();

export const mechanicTypes = [
  { id: 'bike_only', name: 'Bike-Only Mechanic', services: ['Bike puncture', 'Chain issue', 'Brake issue', 'Bike battery'] },
  { id: 'car_mechanic', name: 'Car Mechanic', services: ['Car battery', 'Car breakdown', 'Minor engine issue'] },
  { id: 'tyre_partner', name: 'Tyre/Puncture Partner', services: ['Bike tyre', 'Car tyre', 'Tubeless repair', 'Air filling', 'Tyre Puncture'] },
  { id: 'battery_partner', name: 'Battery Partner', services: ['Battery jumpstart', 'Battery replacement'] },
  { id: 'towing_partner', name: 'Towing Partner', services: ['Bike towing', 'Car towing', 'Accident pickup', 'Towing'] },
  { id: 'fuel_delivery', name: 'Fuel Delivery Partner', services: ['Petrol delivery', 'Diesel delivery', 'Fuel Delivery'] },
  { id: 'night_mechanic', name: 'Night Emergency Mechanic', services: ['Night repair', 'Puncture', 'Battery'] },
  { id: 'garage_partner', name: 'Garage Partner', services: ['Major repair', 'Towing destination'] },
  { id: 'ev_technician', name: 'EV Technician', services: ['EV scooter support', 'Battery check'] },
  { id: 'commercial_partner', name: 'Commercial Vehicle Partner', services: ['Tempo help', 'Light commercial repair'] },
];

export function MechanicProvider({ children }) {
  const { user } = useAuth();
  const [partnerType, setPartnerType] = useState(mechanicTypes[0]);
  const [isOnline, setIsOnlineState] = useState(true);
  const [activeJob, setActiveJob] = useState(null);
  const [jobStatus, setJobStatus] = useState(0); 
  const [requests, setRequests] = useState([]);

  // Wrapper to update DB when online status changes
  const setIsOnline = async (status) => {
    setIsOnlineState(status);
    if (user) {
      try {
        await supabase.from('users').update({ is_online: status }).eq('id', user.id);
      } catch (err) {
        console.error("Failed to update online status:", err);
      }
    }
  };

  // Sync location and availability to mechanic_locations table
  useEffect(() => {
    if (!user) return;

    const updateLocation = (lat, lng, status) => {
      supabase.from('mechanic_locations').upsert({
        mechanic_id: user.id,
        latitude: lat,
        longitude: lng,
        availability_status: status,
        last_location_update: new Date().toISOString()
      }, { onConflict: 'mechanic_id' }).then(({ error }) => {
        if (error) console.error("Failed to update mechanic location:", error);
      });
    };

    const targetStatus = !isOnline ? 'offline' : (activeJob ? 'busy' : 'online');

    if (targetStatus !== 'offline' && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateLocation(pos.coords.latitude, pos.coords.longitude, targetStatus);
        },
        (error) => {
          console.error("GPS Error:", error);
          if (error.code === 1) { // Permission Denied
            alert("Location permission is required to go online and receive jobs.");
            setIsOnlineState(false);
          }
        }
      );
    } else if (targetStatus === 'offline') {
      updateLocation(0, 0, 'offline'); 
    }
  }, [isOnline, activeJob, user]);

  // Subscribe to dispatch_attempts and handle active job GPS broadcasting
  useEffect(() => {
    let watchId;
    let trackingChannel;

    if (isOnline) {
      fetchRequests();
      
      const subscription = supabase
        .channel('public:dispatch_attempts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'dispatch_attempts', filter: `mechanic_id=eq.${user?.id}` }, 
          (payload) => {
            if (payload.eventType === 'INSERT') {
              notificationService.playBeep();
              notificationService.showBrowserNotification('New RoadFixNow job', 'A customer near you needs roadside assistance.');
            }
            fetchRequests();
          }
        )
        .subscribe();

      // If handling an active job, start broadcasting GPS
      if (activeJob) {
        trackingChannel = supabase.channel(`tracking_${activeJob.id}`);
        trackingChannel.subscribe();

        if ("geolocation" in navigator) {
          watchId = navigator.geolocation.watchPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              trackingChannel.send({
                type: 'broadcast',
                event: 'location',
                payload: { lat: latitude, lng: longitude }
              });
            },
            (error) => console.error("GPS Error:", error),
            { enableHighAccuracy: true, maximumAge: 0 }
          );
        }
      }

      return () => {
        supabase.removeChannel(subscription);
        if (watchId) navigator.geolocation.clearWatch(watchId);
        if (trackingChannel) supabase.removeChannel(trackingChannel);
      };
    }
  }, [isOnline, activeJob]);

  const fetchRequests = async () => {
    if (!user) return;
    
    // Clean up expired ones locally before fetching (or just rely on backend filter)
    const { data, error } = await supabase
      .from('dispatch_attempts')
      .select(`
        id,
        distance_km,
        expires_at,
        repair_requests (
          id,
          customer_id,
          vehicle,
          problem,
          location,
          lat,
          lng,
          amount,
          otp
        )
      `)
      .eq('mechanic_id', user.id)
      .eq('status', 'sent');

    if (error) console.error("Error fetching dispatches:", error);

    if (data) {
      const now = new Date();
      const validDispatches = data.filter(d => new Date(d.expires_at) > now && d.repair_requests);

      const formatted = validDispatches.map(d => ({
        id: d.repair_requests.id,
        dispatch_id: d.id,
        customer: 'Customer',
        vehicle: d.repair_requests.vehicle,
        problem: d.repair_requests.problem,
        loc: d.repair_requests.location,
        lat: d.repair_requests.lat,
        lng: d.repair_requests.lng,
        dist: `${d.distance_km} km`,
        eta: Math.ceil(d.distance_km * 3) + ' min',
        payout: '₹' + (d.repair_requests.amount || 149),
        urg: 'Standard',
        pay: 'UPI',
        expires_at: d.expires_at,
        otp: d.repair_requests.otp
      }));
      setRequests(formatted);
    }
  };

  const filteredRequests = requests;

  const acceptJob = async (job) => {
    try {
      const { data, error } = await supabase.rpc('accept_dispatch_job', {
        p_repair_request_id: job.id,
        p_mechanic_id: user.id
      });

      if (error) throw error;
      
      if (!data.success) {
        alert(data.message); // Job already taken
        setRequests(requests.filter(r => r.id !== job.id));
        return;
      }

      // Fetch customer contact info
      const { data: contactData } = await supabase.rpc('get_assigned_contact_info', {
        p_request_id: job.id
      });
      
      let enrichedJob = { ...job };
      if (contactData && contactData.length > 0) {
        enrichedJob.customer = contactData[0].name || job.customer;
        enrichedJob.customerPhone = contactData[0].phone;
      }

      setActiveJob(enrichedJob);
      setJobStatus(0);
      setRequests(requests.filter(r => r.id !== job.id));
    } catch (err) {
      console.error(err);
      alert("Failed to accept job.");
    }
  };

  const rejectJob = async (job) => {
    try {
      await supabase
        .from('dispatch_attempts')
        .update({ status: 'rejected', responded_at: new Date().toISOString() })
        .eq('id', job.dispatch_id);
        
      setRequests(requests.filter(r => r.id !== job.id));
    } catch (err) {
      console.error(err);
    }
  };

  const updateJobStatus = async (newStatusText) => {
    if (!activeJob) return;
    await supabase
      .from('repair_requests')
      .update({ status: newStatusText })
      .eq('id', activeJob.id);
  };

  const closeJob = async () => {
    if (activeJob) {
      const amountValue = activeJob.payout ? parseFloat(activeJob.payout.replace(/[^0-9.-]+/g,"")) : 149;
      await supabase
        .from('repair_requests')
        .update({ status: 'payment_pending', amount: amountValue })
        .eq('id', activeJob.id);
    }
    // We don't remove activeJob yet; they stay on the tracking screen waiting for payment!
    setJobStatus(6); 
  };

  const finishAndDismiss = () => {
    setActiveJob(null);
    setJobStatus(0);
  };

  // Trigger Sweeper periodically
  useEffect(() => {
    if (isOnline) {
      const sweeperInterval = setInterval(() => {
        fetch('/api/sweeper').catch(e => console.error(e));
      }, 60000);
      return () => clearInterval(sweeperInterval);
    }
  }, [isOnline]);

  return (
    <MechanicContext.Provider value={{
      partnerType, setPartnerType,
      isOnline, setIsOnline,
      activeJob, jobStatus, setJobStatus,
      requests, filteredRequests,
      fetchRequests,
      acceptJob, rejectJob,
      updateJobStatus, closeJob, finishAndDismiss
    }}>
      {children}
    </MechanicContext.Provider>
  );
}

export const useMechanic = () => useContext(MechanicContext);
