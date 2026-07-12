import React, { Suspense, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Loader2 } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows, Float, Html, useProgress } from '@react-three/drei';

// Preload the optimized car model
useGLTF.preload('/car_optimized.glb');

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center bg-black/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 w-48">
        <Loader2 className="w-8 h-8 text-orange animate-spin mb-2" />
        <span className="text-white font-bold text-sm tracking-widest">{progress.toFixed(0)}% LOADED</span>
      </div>
    </Html>
  );
}

function CarModel() {
  const { scene } = useGLTF('/car_optimized.glb');
  
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

export default function Interactive3DHero() {
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
