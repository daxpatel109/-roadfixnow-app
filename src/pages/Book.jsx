import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bike, Car, Truck, Wrench, Zap, Droplets, MapPin, Search, Phone, MessageSquare, CheckCircle2, Loader2, Star, CreditCard, Banknote, Smartphone, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

// Create a custom Leaflet icon using our orange styling
const customMarkerIcon = new L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #FF6B00; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(255,107,0,0.8);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const mechanicMarkerIcon = new L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #3B82F6; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59,130,246,0.8); display: flex; align-items: center; justify-content: center; font-size: 14px;">🚗</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

// Haversine distance formula in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1);
}

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
}

export default function Book() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [vehicle, setVehicle] = useState(null);
  const [problem, setProblem] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [status, setStatus] = useState('searching');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState(null); // The 4-digit security code
  
  // Checkout & Rating State
  const [mechanic, setMechanic] = useState(null);
  const [mechanicCoords, setMechanicCoords] = useState(null); // Real-time GPS coords
  const [statusTimer, setStatusTimer] = useState(-1);
  const [rating, setRating] = useState(0);
  const [feedbackTag, setFeedbackTag] = useState('');
  const [dbRequest, setDbRequest] = useState(null);

  // Location state
  const [locationName, setLocationName] = useState("Fetching location...");
  const [coordinates, setCoordinates] = useState(null); // [lat, lng]

  const vehicles = [
    { id: 'bike', name: 'Bike', icon: <Bike size={32}/> },
    { id: 'scooter', name: 'Scooter', icon: <Bike size={32}/> },
    { id: 'car', name: 'Car', icon: <Car size={32}/> },
    { id: 'commercial', name: 'Commercial', icon: <Truck size={32}/> }
  ];

  const problems = [
    { id: 'puncture', name: 'Tyre Puncture', icon: <Wrench/> },
    { id: 'battery', name: 'Battery Jumpstart', icon: <Zap/> },
    { id: 'fuel', name: 'Fuel Delivery', icon: <Droplets/> },
    { id: 'towing', name: 'Towing', icon: <Car/> }
  ];

  // Fetch Live Location when hitting step 3
  useEffect(() => {
    if (step === 3 && !coordinates) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setCoordinates([lat, lng]);
            
            // Try to reverse geocode (Optional, but good for display)
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
              const data = await res.json();
              if (data && data.display_name) {
                setLocationName(data.display_name.split(',').slice(0, 3).join(', '));
              } else {
                setLocationName("Current GPS Location");
              }
            } catch (e) {
              setLocationName("Current GPS Location");
            }
          },
          (error) => {
            console.error(error);
            setCoordinates([23.2156, 72.6369]); // Default to Gandhinagar if blocked
            setLocationName("Location Blocked (Default: Gandhinagar)");
          }
        );
      } else {
        setCoordinates([23.2156, 72.6369]);
        setLocationName("Geolocation not supported");
      }
    }
  }, [step, coordinates]);

  // Submit to Database
  const submitRequest = async () => {
    setError('');
    setStep(4); // Radar scanning UI
    try {
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
      setOtp(otpCode);

      const { data, error: dbError } = await supabase
        .from('repair_requests')
        .insert([{ 
          customer_id: user.id,
          vehicle: vehicle.name,
          problem: problem.name,
          location: locationName,
          lat: coordinates[0],
          lng: coordinates[1],
          status: 'searching',
          otp: otpCode
        }])
        .select()
        .single();

      if (dbError) throw dbError;
      setRequestId(data.id);
      setDbRequest(data);
      
      // Launch Smart Dispatch Engine in the background
      executeSmartDispatch(data.id, coordinates[0], coordinates[1]);
      
    } catch (err) {
      console.error(err);
      setError('Failed to create request. Did you create the repair_requests table and add lat/lng?');
      setStep(3); // Go back
    }
  };

  const executeSmartDispatch = async (reqId, lat, lng) => {
    const radiuses = [5, 8, 12];
    let pingedMechanicIds = [];
    
    for (let radius of radiuses) {
      try {
        // 1. Find nearest mechanics via RPC (excluding already pinged ones)
        const { data: nearbyMechanics, error: rpcError } = await supabase.rpc('find_nearest_mechanics', {
          p_lat: lat,
          p_lng: lng,
          p_radius_km: radius,
          p_exclude_ids: pingedMechanicIds
        });

        if (rpcError) throw rpcError;

        if (nearbyMechanics && nearbyMechanics.length > 0) {
          // Track these so we don't ping them again
          const newIds = nearbyMechanics.map(m => m.mechanic_id);
          pingedMechanicIds = [...pingedMechanicIds, ...newIds];

          // 2. Insert into dispatch_attempts
          const attempts = nearbyMechanics.map(m => ({
            repair_request_id: reqId,
            mechanic_id: m.mechanic_id,
            distance_km: m.distance_km,
            status: 'sent',
            expires_at: new Date(Date.now() + 30000).toISOString() // 30s expiry
          }));
          await supabase.from('dispatch_attempts').insert(attempts);

          // 3. Wait 31 seconds for them to accept
          await new Promise(resolve => setTimeout(resolve, 31000));
          
          // 4. Check if someone accepted
          const { data: requestStatus } = await supabase
            .from('repair_requests')
            .select('status')
            .eq('id', reqId)
            .single();

          if (requestStatus && requestStatus.status !== 'searching') {
            return; // Job was accepted or cancelled! Stop dispatching.
          }
        }
      } catch (err) {
        console.error(`Error during dispatch loop at radius ${radius}km:`, err);
        // Continue to next radius even if this one failed
      }
    }

    // 5. If we exhausted all radiuses and no one accepted
    try {
      const { data: requestStatusFinal } = await supabase
        .from('repair_requests')
        .select('status')
        .eq('id', reqId)
        .single();

      if (requestStatusFinal && requestStatusFinal.status === 'searching') {
        setError('No nearby mechanics are available right now. Please try again later.');
        setStep(3); // Reset UI
        await supabase.from('repair_requests').update({ status: 'cancelled' }).eq('id', reqId);
      }
    } catch (err) {
      console.error("Error finalizing dispatch:", err);
    }
  };

  // Map DB status to timer index
  const statusMap = {
    'accepted': 0,
    'en_route': 1,
    'arrived': 2,
    'in_progress': 3,
    'completed': 4,
    'payment_pending': 4,
    'settlement_pending': 5,
    'paid': 5
  };

  const handleRazorpayPayment = async () => {
    setPaymentProcessing(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const currentReqId = dbRequest?.id || requestId;
      
      if (!currentReqId) throw new Error("Missing request ID");

      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_BASE}/api/create-razorpay-order`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({ repair_request_id: currentReqId })
      });
      const order = await res.json();
      
      if (!res.ok) throw new Error(order.error || 'Failed to create order');

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "RoadFixNow",
        description: "Roadside Assistance Repair",
        order_id: order.id,
        handler: async function (response) {
          // 3. Verify on backend
          try {
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const verifyRes = await fetch(`${API_BASE}/api/verify-razorpay-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                repair_request_id: currentReqId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              setStep(7); // Stay on checkout screen, it will refresh status
            } else {
              throw new Error(verifyData.error || 'Verification failed');
            }
          } catch (err) {
            console.error(err);
            setError('Payment verification failed. If money was deducted, it will be refunded.');
          }
        },
        prefill: {
          name: user?.name || "Customer",
          email: user?.email || "customer@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#FF6B00"
        }
      };
      
      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response){
        console.error(response.error);
        setError(`Payment Failed: ${response.error.description}`);
      });
      rzp1.open();

    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Listen to Database Realtime changes + Polling fallback
  useEffect(() => {
    if (!requestId) return;

    // 1. Setup Realtime Subscription
    const subscription = supabase
      .channel(`request_${requestId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'repair_requests', filter: `id=eq.${requestId}` }, 
      (payload) => handleStatusUpdate(payload.new))
      .subscribe();

    // 2. Setup Polling Fallback (in case Realtime is not enabled in Supabase)
    const pollInterval = setInterval(async () => {
      const { data } = await supabase.from('repair_requests').select('*').eq('id', requestId).single();
      if (data) handleStatusUpdate(data);
    }, 3000);

    // 3. Listen to high-frequency Live GPS Broadcasts from Mechanic's Phone
    const trackingChannel = supabase.channel(`tracking_${requestId}`)
      .on('broadcast', { event: 'location' }, (payload) => {
        const { lat, lng } = payload.payload;
        setMechanicCoords([lat, lng]);
        
        // Dynamically update distance using real GPS math
        if (coordinates) {
          const distKm = calculateDistance(coordinates[0], coordinates[1], lat, lng);
          setMechanic(prev => prev ? { ...prev, dist: `${distKm} km` } : null);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
      supabase.removeChannel(trackingChannel);
      clearInterval(pollInterval);
    };
  }, [requestId, step]);

  const handleStatusUpdate = (newData) => {
    if (!newData) return;
    setDbRequest(newData);
    setStatus(newData.status);
    
    if (statusMap[newData.status] !== undefined) {
      setStatusTimer(statusMap[newData.status]);
    }

    if (newData.status === 'accepted' && step !== 6 && step !== 7 && step !== 5) {
      // Create initial mechanic state, distance will auto-update via Broadcast
      setMechanic({ 
        name: newData.mechanic_name || 'Verified Mechanic', 
        rating: '4.8', dist: 'Calculating...', time: '14 min', price: '₹149' 
      });
      setStep(5); // Show Estimate
    }
  };


  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0B1220] py-12 px-4 flex justify-center">
      <div className="w-full max-w-md relative">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: VEHICLE */}
          {step === 1 && (
            <motion.div key="step1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
              <h2 className="text-2xl font-black text-white mb-2">Select Vehicle Type</h2>
              <p className="text-gray-400 text-sm mb-6">What are you driving today?</p>
              <div className="grid grid-cols-2 gap-4">
                {vehicles.map(v => (
                  <button 
                    key={v.id} onClick={() => { setVehicle(v); setStep(2); }}
                    className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-orange/20 hover:border-orange transition-all group"
                  >
                    <div className="text-gray-400 group-hover:text-orange mb-3">{v.icon}</div>
                    <span className="font-bold text-white group-hover:text-orange">{v.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: PROBLEM */}
          {step === 2 && (
            <motion.div key="step2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
              <button onClick={()=>setStep(1)} className="text-sm text-gray-400 hover:text-white mb-4">← Back</button>
              <h2 className="text-2xl font-black text-white mb-2">Select Issue</h2>
              <p className="text-gray-400 text-sm mb-6">What happened to your {vehicle?.name}?</p>
              <div className="flex flex-col gap-3">
                {problems.map(p => (
                  <button 
                    key={p.id} onClick={() => { setProblem(p); setStep(3); }}
                    className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-orange/20 hover:border-orange transition-all text-left group"
                  >
                    <div className="p-3 bg-white/5 rounded-xl text-gray-400 group-hover:text-orange group-hover:bg-orange/10">{p.icon}</div>
                    <span className="font-bold text-white flex-1">{p.name}</span>
                    <span className="text-orange">→</span >
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: LOCATION (LIVE GPS MAP) */}
          {step === 3 && (
            <motion.div key="step3" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
              <button onClick={()=>setStep(2)} className="text-sm text-gray-400 hover:text-white mb-4">← Back</button>
              <h2 className="text-2xl font-black text-white mb-6">Confirm Location</h2>
              
              {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

              <div className="w-full h-56 bg-[#111827] rounded-2xl mb-6 relative overflow-hidden border border-white/10">
                {coordinates ? (
                  <MapContainer center={coordinates} zoom={15} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    <Marker position={coordinates} icon={customMarkerIcon} />
                    <MapUpdater center={coordinates} />
                  </MapContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-400 flex-col gap-2">
                    <Loader2 className="animate-spin w-8 h-8 text-orange" />
                    <p className="text-sm">Acquiring GPS Signal...</p>
                  </div>
                )}
              </div>

              <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
                <p className="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Pickup Location</p>
                <p className="font-bold text-white line-clamp-2">{locationName}</p>
              </div>

              <button 
                onClick={submitRequest} 
                disabled={!coordinates}
                className={`w-full py-4 rounded-xl text-white font-black text-lg transition shadow-[0_0_20px_rgba(255,107,0,0.4)] ${!coordinates ? 'bg-gray-600 cursor-not-allowed opacity-50 shadow-none' : 'bg-orange hover:bg-orange/80'}`}
              >
                FIND NEARBY MECHANIC
              </button>
            </motion.div>
          )}

          {/* STEP 4: RADAR SCANNING */}
          {step === 4 && (
            <motion.div key="step4" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0}} className="flex flex-col items-center justify-center py-20">
              <div className="relative w-48 h-48 rounded-full border border-orange/30 flex items-center justify-center mb-8 bg-orange/5 shadow-[0_0_50px_rgba(255,107,0,0.2)]">
                <motion.div className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(255,107,0,0.8) 100%)' }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }} />
                <div className="absolute inset-2 rounded-full border border-orange/20"></div>
                <Search className="text-orange w-8 h-8 z-20" />
                <motion.div className="absolute top-8 right-10 w-2 h-2 bg-orange rounded-full" animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }} />
                <motion.div className="absolute bottom-12 left-8 w-2 h-2 bg-orange rounded-full" animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.8 }} />
              </div>
              <h2 className="text-2xl font-black text-orange mb-2 text-center">Scanning Area...</h2>
              <p className="text-gray-400 text-center mb-4">Finding the best mechanic for your {vehicle?.name} {problem?.name}</p>
              <p className="text-xs text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                Connected to Database: Waiting for mechanic
              </p>
            </motion.div>
          )}

          {/* STEP 5: ESTIMATE & CONFIRM */}
          {step === 5 && mechanic && (
            <motion.div key="step5" initial={{opacity:0,y:50}} animate={{opacity:1,y:0}} className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-6">
                <div>
                  <h2 className="text-2xl font-black text-white mb-1">Mechanic Found!</h2>
                  <p className="text-gray-400 text-sm">Closest match for {problem?.name}</p>
                </div>
                <div className="text-right bg-green-500/20 px-3 py-1 rounded-lg border border-green-500/30">
                  <span className="block text-xl font-black text-green-400">{mechanic.time}</span>
                  <span className="block text-[10px] text-green-400 uppercase font-bold tracking-widest">ETA</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-8 bg-black/40 p-4 rounded-2xl border border-white/5">
                <div className="w-12 h-12 bg-orange flex items-center justify-center rounded-full font-black text-navy text-xl">
                  {mechanic.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-white">{mechanic.name}</h3>
                  <p className="text-sm text-yellow-400 font-bold">{mechanic.rating} ★ <span className="text-gray-400 font-normal">({mechanic.dist})</span></p>
                </div>
              </div>

              <div className="space-y-3 mb-8 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Service Visit Charge</span>
                  <span>₹99</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Platform Fee</span>
                  <span>₹20</span>
                </div>
                <div className="flex justify-between text-white font-bold border-t border-white/10 pt-3 text-lg">
                  <span>Estimated Total</span>
                  <span className="text-orange">{mechanic.price}</span>
                </div>
                <p className="text-[10px] text-gray-500 text-center mt-2 leading-tight">Actual repair parts cost is paid to the mechanic after inspection.</p>
              </div>

              <button onClick={() => setStep(6)} className="w-full py-4 rounded-xl bg-orange text-white font-black text-lg hover:bg-orange/80 transition shadow-[0_0_20px_rgba(255,107,0,0.4)]">
                CONFIRM BOOKING
              </button>
            </motion.div>
          )}

          {/* STEP 6: LIVE TRACKING */}
          {step === 6 && (
            <motion.div key="step6" initial={{opacity:0}} animate={{opacity:1}} className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                <motion.div className="h-full bg-orange" initial={{width:"0%"}} animate={{width:`${(statusTimer/4)*100}%`}} transition={{duration:0.5}} />
              </div>

              <h2 className="text-2xl font-black text-white mb-6 mt-2">Live Tracking</h2>
              
              {otp && (
                <div className="bg-orange/10 border border-orange/30 p-4 rounded-2xl mb-6 text-center shadow-[0_0_20px_rgba(255,107,0,0.2)]">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Your Secure OTP</p>
                  <p className="text-4xl font-black text-orange tracking-[0.2em]">{otp}</p>
                  <p className="text-xs text-orange/80 mt-2">Share this PIN with the mechanic to start the repair.</p>
                </div>
              )}
              
              <div className="w-full h-48 bg-[#111827] rounded-2xl mb-6 relative overflow-hidden border border-white/10 flex items-center justify-center">
                {coordinates ? (
                  <MapContainer center={coordinates} zoom={14} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                    {/* Customer Marker */}
                    <Marker position={coordinates} icon={customMarkerIcon} />
                    {/* Real-time Mechanic Marker */}
                    {(mechanicCoords || coordinates) && (
                      <Marker 
                        position={mechanicCoords || [coordinates[0] - 0.005, coordinates[1] - 0.005]} 
                        icon={mechanicMarkerIcon} 
                      />
                    )}
                    <MapUpdater center={mechanicCoords || coordinates} />
                  </MapContainer>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Loader2 className="animate-spin w-8 h-8 text-orange" />
                    <p className="text-xs font-bold uppercase tracking-widest">Connecting to GPS...</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mb-8 bg-black/40 p-4 rounded-2xl">
                <div>
                  <h3 className="font-bold text-white">{mechanic?.name}</h3>
                  <p className="text-sm text-gray-400">GJ-01-AB-1234</p>
                </div>
                <div className="flex gap-2">
                  <button className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center border border-green-500/30"><Phone size={18}/></button>
                  <button className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30"><MessageSquare size={18}/></button>
                </div>
              </div>

              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {[
                  { text: "Request Accepted", active: statusTimer >= 0 },
                  { text: "Mechanic on the way", active: statusTimer >= 1 },
                  { text: "Mechanic Arrived", active: statusTimer >= 2 },
                  { text: "Service in Progress", active: statusTimer >= 3 },
                  { text: "Completed", active: statusTimer >= 4 }
                ].map((s, i) => (
                  <div key={i} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full border-4 border-navy shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow transition duration-500 z-10 ${s.active ? 'bg-orange' : 'bg-gray-700'}`}></div>
                    <div className={`w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-2 rounded-xl transition duration-500 ${s.active ? 'bg-white/5 border border-white/10' : 'opacity-50'}`}>
                      <p className={`font-bold text-sm ${s.active ? 'text-white' : 'text-gray-500'}`}>{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {statusTimer >= 4 && (
                <motion.button initial={{opacity:0}} animate={{opacity:1}} onClick={() => setStep(7)} className="w-full mt-8 py-4 rounded-xl bg-green-500 text-white font-black text-lg hover:bg-green-600 transition shadow-[0_0_20px_rgba(34,197,94,0.4)] flex justify-center items-center gap-2">
                  <CheckCircle2 /> PAY & RATE
                </motion.button>
              )}
            </motion.div>
          )}

          {/* STEP 7: CHECKOUT & RATING */}
          {step === 7 && (
            <motion.div key="step7" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white/5 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl">
              <div className="text-center mb-6 pt-4">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                  <CheckCircle2 size={40} className="text-green-500" />
                </div>
                <h3 className="text-white text-2xl font-black uppercase tracking-tight mb-2">
                  {['paid', 'settlement_pending'].includes(dbRequest?.status) ? 'Payment Successful!' : 'Repair Complete'}
                </h3>
                <p className="text-gray-400">
                  {['paid', 'settlement_pending'].includes(dbRequest?.status) 
                    ? `Thank you for choosing RoadFixNow. Your payment has been processed.`
                    : `${mechanic?.name || 'Your mechanic'} has finished the repair.`}
                </p>
              </div>

              {!['paid', 'settlement_pending'].includes(dbRequest?.status) ? (
                <div className="bg-[#111] border border-white/5 p-5 rounded-2xl mb-6 text-center">
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Final Amount</p>
                  <p className="text-white text-4xl font-black flex items-center justify-center gap-1 mb-4">
                    ₹{dbRequest?.amount || 140}
                  </p>
                  <button 
                    onClick={handleRazorpayPayment}
                    disabled={paymentProcessing}
                    className="w-full py-4 rounded-xl bg-orange text-white font-black text-lg hover:bg-orange/80 transition shadow-[0_0_20px_rgba(255,107,0,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {paymentProcessing ? <Loader2 className="animate-spin" /> : <CreditCard />}
                    {paymentProcessing ? "PROCESSING..." : "PAY SECURELY NOW"}
                  </button>
                  {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
                </div>
              ) : (
                <div className="text-center mb-8">
                  <p className="text-white font-bold mb-4">Rate {mechanic?.name || 'Mechanic'}</p>
                  <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setRating(star)} className={`transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-600'}`}>
                        <Star fill={rating >= star ? 'currentColor' : 'none'} size={32} />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <motion.div initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} className="flex flex-wrap justify-center gap-2">
                      {['Fast Service', 'Professional', 'Polite', 'Good Price'].map(tag => (
                        <button key={tag} onClick={() => setFeedbackTag(tag)} className={`text-xs px-3 py-1.5 rounded-full border transition ${feedbackTag === tag ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                          {tag}
                        </button>
                      ))}
                    </motion.div>
                  )}
                  <button 
                    onClick={() => navigate('/dashboard/customer')} 
                    className="w-full mt-6 py-4 rounded-xl bg-white/10 text-white font-black hover:bg-white/20 transition"
                  >
                    RETURN TO DASHBOARD
                  </button>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
