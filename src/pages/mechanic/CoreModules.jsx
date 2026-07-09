import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMechanic } from './MechanicState';
import { CheckCircle2, MapPin, Navigation2, Star, Shield, Wrench, Clock, FileText, Phone, MessageCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { notificationService } from '../../services/notificationService';
import { BellRing } from 'lucide-react';

const customMarkerIcon = new L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #FF6B00; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(255,107,0,0.8);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

export function MechanicOverview() {
  const { isOnline, setIsOnline, filteredRequests, activeJob } = useMechanic();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ earnings: 0, completed: 0, rating: 4.8, acceptance: 94 });
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setAlertsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handleEnableAlerts = async () => {
    const granted = await notificationService.requestBrowserPermission();
    setAlertsEnabled(granted);
    if (granted) {
      notificationService.showBrowserNotification("Alerts Enabled", "You will now receive notifications for new jobs.");
    }
  };

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      const { data } = await supabase
        .from('repair_requests')
        .select('amount')
        .eq('mechanic_id', user.id)
        .eq('status', 'completed');
      
      if (data) {
        const totalEarned = data.reduce((sum, job) => sum + (job.amount || 150), 0); // fallback 150 if amount is null
        setStats(prev => ({ ...prev, earnings: totalEarned, completed: data.length }));
      }
    }
    fetchStats();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-black text-white">Dashboard Overview</h1>
        <div className="flex items-center gap-4">
          {!alertsEnabled && (
            <button 
              onClick={handleEnableAlerts}
              className="px-4 py-3 rounded-xl font-bold bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <BellRing size={18} /> Enable Job Alerts
            </button>
          )}
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`px-6 py-3 rounded-xl font-black transition-all shadow-lg ${isOnline ? 'bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30' : 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:bg-green-600'}`}
          >
            {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
          </button>
        </div>
      </div>

      {!isOnline && (
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-8 flex items-center gap-4 text-gray-400">
          <AlertTriangle className="text-yellow-500" />
          <p>You are offline. Go online to start receiving nearby job requests.</p>
        </div>
      )}

      {isOnline && activeJob && (
        <div className="bg-gradient-to-r from-blue-900/50 to-[#050810] border border-blue-500/30 p-6 rounded-2xl mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
          <div>
            <p className="text-blue-400 font-bold text-sm uppercase tracking-widest mb-1">Active Trip</p>
            <h3 className="text-xl font-bold text-white">You are currently handling {activeJob.id}</h3>
          </div>
          <button onClick={() => navigate('/dashboard/mechanic/active-job')} className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition">View Details</button>
        </div>
      )}

      {isOnline && !activeJob && filteredRequests.length > 0 && (
        <div className="bg-orange/10 border border-orange/20 p-6 rounded-2xl mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-orange font-bold text-sm uppercase tracking-widest mb-1">New Requests</p>
            <h3 className="text-xl font-bold text-white">You have {filteredRequests.length} new nearby job requests.</h3>
          </div>
          <button onClick={() => navigate('/dashboard/mechanic/requests')} className="w-full sm:w-auto px-6 py-3 bg-orange text-white font-bold rounded-xl shadow-[0_0_20px_rgba(255,107,0,0.4)] hover:bg-orange/80 transition">View Requests</button>
        </div>
      )}

      {isOnline && !activeJob && filteredRequests.length === 0 && (
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-8 text-center py-12">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
            <Navigation2 className="text-blue-400 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Searching for jobs...</h3>
          <p className="text-gray-400">Stay online. High demand is expected near your location.</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
          <p className="text-gray-400 text-xs font-bold uppercase mb-1">Total Earnings</p>
          <p className="text-3xl font-black text-green-400">₹{stats.earnings}</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
          <p className="text-gray-400 text-xs font-bold uppercase mb-1">Jobs Completed</p>
          <p className="text-3xl font-black text-white">{stats.completed}</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
          <p className="text-gray-400 text-xs font-bold uppercase mb-1">Rating</p>
          <p className="text-3xl font-black text-yellow-400">{stats.rating}</p>
        </div>
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
          <p className="text-gray-400 text-xs font-bold uppercase mb-1">Acceptance Rate</p>
          <p className="text-3xl font-black text-white">{stats.acceptance}%</p>
        </div>
      </div>
    </div>
  );
}

function CountdownTimer({ expiresAt, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt) - new Date();
      return Math.max(0, Math.floor(difference / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(timer);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  return (
    <span className={`font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-orange'}`}>
      00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
    </span>
  );
}

export function MechanicRequests() {
  const { filteredRequests, acceptJob, rejectJob, isOnline, activeJob, fetchRequests } = useMechanic();
  const navigate = useNavigate();

  if (!isOnline) {
    return <div className="text-center text-gray-400 py-20">You are offline. Go online on the Overview page to see requests.</div>;
  }

  if (activeJob) {
    return <div className="text-center text-gray-400 py-20">You are currently handling an active job. Finish it first.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-black text-white mb-8 flex items-center gap-3"><div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div> New Requests ({filteredRequests.length})</h1>
      
      {filteredRequests.length === 0 ? (
        <div className="text-center text-gray-400 py-20">No matching requests found for your selected partner type right now.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredRequests.map(job => (
              <motion.div 
                key={job.id} 
                initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.9, opacity:0}}
                className={`bg-[#050810] border rounded-3xl p-6 shadow-2xl relative overflow-hidden ${job.urg === 'Emergency' ? 'border-red-500/50' : 'border-blue-500/30'}`}
              >
                {job.urg === 'Emergency' && <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl">Emergency</div>}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black text-white">{job.problem}</h3>
                    <p className="text-gray-400 text-sm">{job.vehicle} • {job.customer}</p>
                    {job.expires_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        Expires in: <CountdownTimer expiresAt={job.expires_at} />
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-green-400">{job.payout}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Payout</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6 bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <MapPin size={16} className="text-blue-400"/> {job.loc} <span className="font-bold text-white">({job.dist})</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <Clock size={16} className="text-yellow-400"/> Est. Travel: <span className="font-bold text-white">{job.eta}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => { acceptJob(job); navigate('/dashboard/mechanic/active-job'); }} className="flex-1 py-3.5 bg-blue-500 hover:bg-blue-600 transition rounded-xl text-white font-black shadow-[0_0_20px_rgba(59,130,246,0.4)]">ACCEPT</button>
                  <button onClick={() => rejectJob(job)} className="px-6 py-3.5 bg-white/5 hover:bg-white/10 transition rounded-xl text-gray-400 font-bold border border-white/10">Skip</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export function MechanicActiveJob() {
  const { activeJob, jobStatus, setJobStatus, closeJob, updateJobStatus } = useMechanic();
  const navigate = useNavigate();
  const [distance, setDistance] = useState(2.4);
  
  // OTP State
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    if (jobStatus === 1 && distance > 0.1) {
      const timer = setInterval(() => setDistance(d => Math.max(0, d - 0.2)), 1000);
      return () => clearInterval(timer);
    }
  }, [jobStatus, distance]);

  if (!activeJob) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">No active job</h2>
        <p className="text-gray-400 mb-8">You have successfully completed or have no active jobs.</p>
        <button onClick={() => navigate('/dashboard/mechanic/requests')} className="px-8 py-3 bg-blue-500 text-white font-bold rounded-xl">View New Requests</button>
      </div>
    );
  }

  const statusFlow = [
    { label: 'Accept Job', action: 'Start Trip', dbStatus: 'accepted' },
    { label: 'On The Way', action: 'Mark Arrived', dbStatus: 'en_route' },
    { label: 'Arrived', action: 'Enter OTP to Start', dbStatus: 'arrived' },
    { label: 'Inspection', action: 'Start Repair', dbStatus: 'in_progress' },
    { label: 'Repairing', action: 'Complete Service', dbStatus: 'in_progress' },
    { label: 'Completed', action: 'Collect Payment', dbStatus: 'completed' },
    { label: 'Payment', action: 'Close Job', dbStatus: 'completed' }
  ];

  const handleNext = async () => {
    if (jobStatus === 2 && !showOtpInput) {
      // Step 2 is Arrived. Next action is Enter OTP
      setShowOtpInput(true);
      return;
    }

    if (jobStatus === 5) {
      await closeJob(); // This sets it to payment_pending and jobStatus = 6
    } else if (jobStatus === 6) {
      // It will auto transition or they can manually dismiss when paid
      navigate('/dashboard/mechanic');
    } else {
      const nextStatus = jobStatus + 1;
      setJobStatus(nextStatus);
      if (updateJobStatus && statusFlow[nextStatus].dbStatus) {
        await updateJobStatus(statusFlow[nextStatus].dbStatus);
      }
    }
  };

  const handleOtpSubmit = () => {
    if (otpInput === activeJob.otp || (!activeJob.otp && otpInput === '0000')) { // Only fallback if OTP is missing in old jobs
      setShowOtpInput(false);
      setOtpError('');
      handleNext();
    } else {
      setOtpError('Invalid OTP. Ask the customer for the correct 4-digit PIN.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column: Flow & Map */}
      <div>
        <h1 className="text-2xl font-black text-white mb-6">Active Job: {activeJob.id}</h1>
        
        {/* Live GPS Map */}
        <div className="w-full h-64 bg-[#111827] rounded-3xl mb-6 relative overflow-hidden border border-white/10 shadow-xl">
          {activeJob.lat && activeJob.lng ? (
            <MapContainer center={[activeJob.lat, activeJob.lng]} zoom={15} style={{ height: '100%', width: '100%', zIndex: 1 }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <Marker position={[activeJob.lat, activeJob.lng]} icon={customMarkerIcon} />
            </MapContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400 flex-col gap-2">
              <MapPin className="text-orange" />
              <p className="text-sm">No GPS coordinates available</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-gray-400 text-sm font-bold uppercase mb-1">Current Status</p>
              <h3 className="text-2xl font-black text-blue-400">{statusFlow[jobStatus].label}</h3>
            </div>
            {jobStatus === 1 && (
              <div className="text-right">
                <p className="text-3xl font-black text-white">{distance.toFixed(1)}<span className="text-sm font-normal text-gray-400">km</span></p>
              </div>
            )}
          </div>
          
          {showOtpInput ? (
            <div className="bg-black/40 p-6 rounded-2xl border border-orange/50 text-center shadow-[0_0_20px_rgba(255,107,0,0.2)]">
              <h4 className="text-white font-bold mb-4">Enter Customer OTP</h4>
              <input 
                type="text" 
                maxLength="4" 
                value={otpInput} 
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="0000"
                className="w-32 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white text-3xl text-center tracking-widest font-black outline-none focus:border-orange mb-4" 
              />
              {otpError && <p className="text-red-400 text-xs mb-4">{otpError}</p>}
              <div className="flex gap-3">
                <button onClick={() => setShowOtpInput(false)} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 font-bold transition">Cancel</button>
                <button onClick={handleOtpSubmit} className="flex-1 py-3 bg-orange hover:bg-orange/80 rounded-xl text-white font-black transition shadow-[0_0_15px_rgba(255,107,0,0.3)]">VERIFY OTP</button>
              </div>
            </div>
          ) : jobStatus === 6 || activeJob?.status === 'payment_pending' ? (
            <div className="bg-black/40 p-6 rounded-2xl border border-blue-500/30 text-center">
              {['paid', 'settlement_pending'].includes(activeJob?.status) ? (
                <>
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                    <CheckCircle2 size={32} className="text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Payment Received!</h3>
                  <p className="text-gray-400 mb-6">Your payout has been added to pending settlements.</p>
                  <button onClick={finishAndDismiss} className="w-full py-4 rounded-xl bg-white/10 text-white font-black hover:bg-white/20 transition">FINISH & RETURN</button>
                </>
              ) : (
                <>
                  <Loader2 className="w-12 h-12 text-orange mx-auto mb-4 animate-spin" />
                  <h3 className="text-xl font-bold text-white mb-2">Waiting for Payment</h3>
                  <p className="text-gray-400 mb-6">Ask the customer to complete payment securely on their screen.</p>
                </>
              )}
            </div>
          ) : (
            <button onClick={handleNext} className="w-full py-5 bg-blue-500 text-white font-black text-xl rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:bg-blue-600 transition active:scale-95">
              {statusFlow[jobStatus].action}
            </button>
          )}
        </div>
      </div>

      {/* Right Column: Customer & Details */}
      <div className="space-y-6">
        <div className="bg-[#050810] border border-white/10 p-6 rounded-3xl">
          <h3 className="font-bold text-white mb-4 uppercase text-sm tracking-widest text-gray-500">Customer Details</h3>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-black text-white">{activeJob.customer.charAt(0)}</div>
              <div>
                <p className="font-bold text-white text-lg">{activeJob.customer}</p>
                <p className="text-sm text-gray-400">{activeJob.loc}</p>
                {activeJob.customerPhone && (
                  <p className="text-xs text-orange mt-1 font-bold tracking-widest">{activeJob.customerPhone}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center"><Phone size={18}/></button>
              <button className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center"><MessageCircle size={18}/></button>
            </div>
          </div>
        </div>

        <div className="bg-[#050810] border border-white/10 p-6 rounded-3xl">
          <h3 className="font-bold text-white mb-4 uppercase text-sm tracking-widest text-gray-500">Service Details</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Problem</span>
              <span className="font-bold text-white">{activeJob.problem}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Vehicle</span>
              <span className="font-bold text-white">{activeJob.vehicle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Payment Mode</span>
              <span className="font-bold text-white">{activeJob.pay}</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-4 mt-2">
              <span className="text-gray-400">Estimated Payout</span>
              <span className="font-black text-green-400 text-xl">{activeJob.payout}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Checklist based on job Status */}
        {jobStatus >= 3 && jobStatus <= 4 && (
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-white/5 border border-white/10 p-6 rounded-3xl">
            <h3 className="font-bold text-white mb-4 uppercase text-sm tracking-widest text-gray-500">Service Checklist</h3>
            <ul className="space-y-3">
              {['Inspect vehicle condition', 'Confirm repair cost with customer', 'Complete repair securely'].map((task, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-300">
                  <input type="checkbox" className="w-5 h-5 accent-blue-500 rounded bg-black/50 border-white/20" /> {task}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
}
