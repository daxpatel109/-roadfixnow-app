import React, { useRef, useEffect, Suspense, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldAlert, Zap, Droplets, Wrench, MapPin, Search, CheckCircle2, ChevronRight, Activity, Loader2 } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows, Float, Html, useProgress } from '@react-three/drei';

// Preload the car model
useGLTF.preload('/car.glb');

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center bg-black/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
        <Loader2 className="w-8 h-8 text-orange animate-spin mb-2" />
        <span className="text-white font-bold text-sm tracking-widest">{progress.toFixed(0)}% LOADED</span>
      </div>
    </Html>
  );
}

function CarModel() {
  const { scene } = useGLTF('/car.glb');
  
  // Make sure the materials look dark and glossy for "Black Edition"
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        // Boost metallic look if it has standard materials
        if (child.material) {
          child.material.envMapIntensity = 2.5; // Strong reflections
          child.material.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  return <primitive object={scene} scale={1.2} position={[0, -1, 0]} />;
}

function Interactive3DHero() {
  return (
    <div className="relative w-full max-w-2xl mx-auto h-[450px] md:h-[550px] flex items-center justify-center">
      
      {/* Holographic Platform Background */}
      <div className="absolute inset-x-0 bottom-10 h-48 bg-gradient-to-t from-orange/10 to-transparent blur-3xl rounded-full mix-blend-screen pointer-events-none" />
      
      {/* WebGL Canvas */}
      <div className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [5, 2.5, 6], fov: 40 }} shadows>
          {/* Lighting for Black Edition */}
          <ambientLight intensity={0.4} />
          <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={2} color="#ffffff" castShadow shadow-mapSize={1024} />
          <spotLight position={[-10, 5, 10]} angle={0.3} penumbra={1} intensity={1} color="#ff8800" />
          <pointLight position={[0, -1, 5]} intensity={1} color="#ffffff" />
          
          <Suspense fallback={<Loader />}>
            {/* The Environment map provides realistic reflections which is crucial for black cars */}
            <Environment preset="city" />
            <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
              <CarModel />
            </Float>
            {/* Dark contact shadow below the car */}
            <ContactShadows position={[0, -1.2, 0]} opacity={0.8} scale={10} blur={2.5} far={4} color="#000000" />
          </Suspense>

          <OrbitControls 
            enablePan={false}
            enableZoom={false}
            autoRotate
            autoRotateSpeed={1.0}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>

      {/* Radar Ping Overlay */}
      <motion.div 
        className="absolute bottom-1/4 left-[5%] bg-black/50 backdrop-blur-xl border border-white/10 p-3 rounded-2xl flex items-center gap-3 shadow-2xl z-20 pointer-events-none"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <div className="relative flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
        </div>
        <span className="text-white font-bold text-sm tracking-widest uppercase">Mechanic Dispatched</span>
      </motion.div>
      
      {/* Distance Tracker Overlay */}
      <motion.div 
        className="absolute top-1/4 right-[5%] bg-gradient-to-r from-orange to-red-500 p-[1px] rounded-2xl shadow-[0_0_30px_rgba(255,107,0,0.5)] z-20 pointer-events-none"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <div className="bg-black/80 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center">
          <Activity className="text-orange mb-1" size={20} />
          <span className="text-2xl font-black text-white">8<span className="text-sm font-bold text-gray-400">mins</span></span>
          <span className="text-[10px] uppercase text-orange font-bold tracking-widest">ETA</span>
        </div>
      </motion.div>

    </div>
  );
}



function ServiceCard({ icon, title, desc, price, index }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, translateY: -10, rotateX: 5, rotateY: 5 }}
      style={{ transformStyle: "preserve-3d" }}
      className="group relative bg-[#0b1221] border border-white/5 rounded-3xl p-8 hover:border-orange/50 transition-all cursor-pointer shadow-xl hover:shadow-[0_20px_40px_-10px_rgba(255,107,0,0.2)]"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10" style={{ translateZ: 30 }}>
        <div className="w-16 h-16 bg-gradient-to-br from-orange to-red-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-orange/20 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-gray-400 leading-relaxed mb-6 h-12">{desc}</p>
        <div className="flex items-center justify-between border-t border-white/10 pt-6">
          <div>
            <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest mb-1">Starting from</p>
            <p className="text-green-400 font-black text-xl">{price}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-orange group-hover:text-white text-gray-500 transition-colors">
            <ChevronRight size={20} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  
  return (
    <div className="w-full bg-[#03050a] min-h-screen font-sans selection:bg-orange selection:text-white overflow-hidden">
      
      {/* BACKGROUND PARTICLES/GRADIENTS */}
      <motion.div style={{ y: yBg }} className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-orange/10 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen" />
      </motion.div>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-32 pb-20 px-4 min-h-[90vh] flex flex-col justify-center">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange/20 to-transparent border border-orange/20 rounded-full text-orange font-bold text-xs tracking-widest uppercase mb-8 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange"></span>
              </span>
              India's #1 On-Demand Roadside Assistance
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-[4.8rem] font-black text-white leading-[1.1] mb-8 tracking-tighter">
              Roadside help <br/> reaches you <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange via-yellow-500 to-red-500 drop-shadow-lg pb-2 inline-block">
                before panic does.
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-10 max-w-lg leading-relaxed font-medium">
              Stuck on the highway? Book nearby verified mechanics for tyre puncture, battery jumpstart, fuel delivery, and towing — directly at your location.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5">
              <Link to="/book" className="group relative px-8 py-5 rounded-2xl bg-gradient-to-r from-orange to-red-600 text-white font-black text-lg text-center overflow-hidden shadow-[0_0_40px_rgba(255,107,0,0.4)] hover:shadow-[0_0_60px_rgba(255,107,0,0.6)] transition-all transform hover:-translate-y-1">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center justify-center gap-2">Book Emergency Service <ChevronRight /></span>
              </Link>
              <Link to="/how-it-works" className="px-8 py-5 rounded-2xl bg-white/5 text-white font-bold text-lg text-center border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md transform hover:-translate-y-1">
                How It Works
              </Link>
            </div>
            
            <div className="mt-12 pt-12 border-t border-white/5 grid grid-cols-3 gap-6">
              {[
                { label: 'Emergency Help', value: '24/7' },
                { label: 'Avg. Arrival', value: '18m' },
                { label: 'Mechanics', value: '5k+' }
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-3xl font-black text-white mb-1 tracking-tight">{stat.value}</p>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
          
          <div className="relative h-full flex items-center">
            <Interactive3DHero />
          </div>
          
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="relative z-10 py-32 px-4 bg-black/40 backdrop-blur-2xl border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">What's your emergency?</h2>
            <p className="text-gray-400 text-xl font-medium max-w-2xl mx-auto">Transparent pricing, instant booking, and live tracking. Select a service to see your estimated ETA.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ServiceCard 
              index={0}
              icon={<ShieldAlert size={32}/>} 
              title="Tyre Puncture" 
              price="₹99" 
              desc="Tubeless & tube patch repair right at your location." 
            />
            <ServiceCard 
              index={1}
              icon={<Zap size={32}/>} 
              title="Battery Jumpstart" 
              price="₹149" 
              desc="Dead battery? We'll jumpstart it instantly." 
            />
            <ServiceCard 
              index={2}
              icon={<Droplets size={32}/>} 
              title="Fuel Delivery" 
              price="₹99 + fuel" 
              desc="Out of petrol? We deliver up to 5L of emergency fuel." 
            />
            <ServiceCard 
              index={3}
              icon={<Wrench size={32}/>} 
              title="Towing Service" 
              price="₹499" 
              desc="Flatbed towing safely to the nearest authorized garage." 
            />
          </div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION (3D Cards) */}
      <section className="relative z-10 py-32 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 font-bold text-xs tracking-widest uppercase mb-6">
              The Technology
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter">Built for India’s <br/>roadside chaos.</h2>
            <p className="text-xl text-gray-400 leading-relaxed font-medium max-w-3xl mx-auto">
              Roadside help shouldn't mean calling random numbers and waiting blindly. RoadFixNow turns emergency help into a highly-organized, live-tracked digital experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <MapPin/>, title: "Live Tracking", desc: "Watch your assigned mechanic drive to your exact GPS location in real-time." },
              { icon: <Search/>, title: "Smart Dispatch", desc: "Our algorithm pings only the closest verified experts with the right tools." },
              { icon: <CheckCircle2/>, title: "Upfront Pricing", desc: "No haggling. Know exactly what you'll pay before confirming the request." }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.2, type: "spring" }}
                className="bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 rounded-3xl p-8 text-center backdrop-blur-md relative overflow-hidden group"
              >
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-16 h-16 bg-[#03050a] border border-white/10 rounded-2xl flex items-center justify-center text-blue-400 mx-auto mb-6 shadow-inner">
                  {item.icon}
                </div>
                <h4 className="font-black text-white text-2xl mb-4">{item.title}</h4>
                <p className="text-gray-400 font-medium leading-relaxed text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="relative z-10 py-24 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-orange to-red-600 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-[0_0_100px_rgba(255,107,0,0.3)]"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 relative z-10 tracking-tight">Don't wait for a breakdown.</h2>
          <p className="text-white/80 text-xl mb-10 relative z-10 font-medium max-w-2xl mx-auto">
            Experience the future of roadside assistance today. Test our platform using our interactive demo.
          </p>
          <Link to="/book" className="relative z-10 inline-block px-10 py-5 rounded-2xl bg-white text-red-600 font-black text-lg hover:scale-105 transition-transform shadow-2xl">
            Launch Demo Now
          </Link>
        </motion.div>
      </section>
      
    </div>
  );
}
