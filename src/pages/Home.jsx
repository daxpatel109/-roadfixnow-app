import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldAlert, Zap, Droplets, Wrench, Clock, Star, MapPin } from 'lucide-react';

function HeroAnimation() {
  return (
    <div className="relative w-full max-w-lg mx-auto h-[350px] bg-[#050810] rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(255,107,0,0.15)] flex flex-col justify-end pb-8">
      
      {/* Moving Highway lines (The Road) */}
      <div className="absolute bottom-8 w-full h-[2px] opacity-30 pointer-events-none" style={{ backgroundImage: 'linear-gradient(90deg, transparent 50%, #fff 50%)', backgroundSize: '100px 100%', animation: 'moveRoad 0.5s linear infinite' }} />
      <style>{`@keyframes moveRoad { from { background-position: 100px 0; } to { background-position: 0px 0; } }`}</style>
      
      {/* The Car Container */}
      <motion.div 
        className="relative w-full h-[200px] flex items-center justify-center"
        initial={{ x: -400 }}
        animate={{ x: 0, y: [0, -3, 0] }}
        transition={{ x: { duration: 1.5, ease: "easeOut" }, y: { repeat: Infinity, duration: 0.3, ease: "easeInOut" } }}
      >
        {/* Headlight Beam */}
        <motion.div 
          className="absolute right-[0%] top-[42%] w-[200px] h-[40px] bg-gradient-to-r from-yellow-100/40 to-transparent blur-md origin-left transform -rotate-12 pointer-events-none z-0"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 0.2, repeat: Infinity, ease: "linear" }}
        />

        {/* The Tata Sierra Image (with Night Mode Filters) */}
        <img 
          src="/tata-yellow.png" 
          alt="Rescue Vehicle" 
          className="relative z-10 w-[80%] object-contain brightness-[0.4] contrast-[1.2] drop-shadow-2xl"
        />

        {/* Headlight Blinker (Right side) */}
        <motion.div 
          className="absolute right-[17%] top-[42%] w-4 h-4 bg-yellow-200 rounded-full blur-[2px] shadow-[0_0_30px_10px_rgba(253,224,71,0.8)] z-20"
          animate={{ opacity: [0, 1, 0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Taillight Blinker (Left side) */}
        <motion.div 
          className="absolute left-[19%] top-[34%] w-3 h-4 bg-red-600 rounded-full blur-[2px] shadow-[0_0_30px_10px_rgba(255,0,0,0.8)] z-20"
          animate={{ opacity: [0, 1, 0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        />
      </motion.div>

      {/* Mechanic Radar Overlay */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 1, ease: "easeOut" }}
        className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-30"
      >
        <motion.div 
          animate={{ scale: [1, 1.05, 1], boxShadow: ["0 0 20px rgba(249,115,22,0.4)", "0 0 40px rgba(249,115,22,0.8)", "0 0 20px rgba(249,115,22,0.4)"] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-orange/20 backdrop-blur-md text-orange px-4 py-2 rounded-full text-sm font-black border border-orange/50 flex items-center gap-2 whitespace-nowrap"
        >
          <Zap size={16} className="text-orange animate-pulse" /> Rescue En Route (8 Mins)
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section className="relative pt-20 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-navy via-navy to-[#050810]"></div>
        <div className="max-w-7xl mx-auto relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full text-orange font-bold text-sm mb-6 shadow-sm">
              🚀 India's #1 On-Demand Roadside Assistance
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight mb-6">
              Roadside help reaches you <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange to-yellow">before panic does.</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-lg">
              Book nearby verified mechanics for tyre puncture, battery jumpstart, fuel delivery, and towing — directly at your location.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/book" className="px-8 py-4 rounded-xl bg-orange text-white font-black text-lg hover:bg-orange/80 transition shadow-[0_0_30px_rgba(255,107,0,0.4)]">
                Book Demo Service
              </Link>
              <Link to="/how-it-works" className="px-8 py-4 rounded-xl bg-white/5 text-white font-bold text-lg border border-white/10 hover:bg-white/10 transition">
                View How It Works
              </Link>
            </div>
            <div className="mt-10 flex gap-8">
              <div>
                <p className="text-3xl font-black text-white">24/7</p>
                <p className="text-gray-400 text-sm">Emergency Help</p>
              </div>
              <div>
                <p className="text-3xl font-black text-white">18m</p>
                <p className="text-gray-400 text-sm">Avg. Arrival</p>
              </div>
              <div>
                <p className="text-3xl font-black text-white">5k+</p>
                <p className="text-gray-400 text-sm">Mechanics</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <HeroAnimation />
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="py-24 bg-[#0B1220] px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">What's your emergency?</h2>
            <p className="text-gray-400 text-lg">Select a service to see estimated pricing and ETA.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <ShieldAlert size={32}/>, title: "Tyre Puncture", price: "from ₹99", desc: "Tubeless & tube patch repair at your location." },
              { icon: <Zap size={32}/>, title: "Battery Jumpstart", price: "from ₹149", desc: "Dead battery? We'll jumpstart it instantly." },
              { icon: <Droplets size={32}/>, title: "Fuel Delivery", price: "from ₹99 + fuel", desc: "Out of petrol? We deliver up to 5L fuel." },
              { icon: <Wrench size={32}/>, title: "Towing Service", price: "from ₹499", desc: "Flatbed towing to nearest garage." }
            ].map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition cursor-pointer group">
                <div className="text-orange mb-4 group-hover:scale-110 transition-transform">{s.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{s.desc}</p>
                <p className="text-green-400 font-bold">{s.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="py-24 bg-[#050810] px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-8">Built for India’s roadside assistance gap</h2>
          <p className="text-xl text-gray-400 leading-relaxed mb-12">
            Roadside help is still unorganized. People call random numbers, wait without updates, and don’t know the price. RoadFixNow turns emergency vehicle help into a simple live booking experience connecting customers, mechanics, and towing partners.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <MapPin className="mx-auto text-orange w-12 h-12 mb-4" />
              <h4 className="font-bold text-white mb-2">Live Location Tracking</h4>
              <p className="text-sm text-gray-400">Track your mechanic on the map just like a cab.</p>
            </div>
            <div>
              <Star className="mx-auto text-yellow w-12 h-12 mb-4" />
              <h4 className="font-bold text-white mb-2">Verified Mechanics</h4>
              <p className="text-sm text-gray-400">Background checked and highly rated local partners.</p>
            </div>
            <div>
              <Clock className="mx-auto text-green w-12 h-12 mb-4" />
              <h4 className="font-bold text-white mb-2">Transparent Pricing</h4>
              <p className="text-sm text-gray-400">Know the estimated cost before you book.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 px-4 bg-gradient-to-b from-[#0B1220] to-[#FF6B00]/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-black text-white mb-6">Ready to turn roadside panic into one simple booking?</h2>
          <p className="text-xl text-gray-400 mb-10">
            Explore the demo flow and see how RoadFixNow can become India’s on-demand roadside assistance platform.
          </p>
          <Link to="/book" className="px-10 py-5 rounded-2xl bg-orange text-white font-black text-xl hover:bg-orange/80 transition shadow-[0_0_40px_rgba(255,107,0,0.5)] inline-flex items-center gap-3">
            Try Demo Booking <ShieldAlert />
          </Link>
        </div>
      </section>
    </div>
  );
}
