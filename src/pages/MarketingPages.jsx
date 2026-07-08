import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, MapPin, Wrench, ShieldAlert, ChevronDown, Plus, Mail, Phone, Map } from 'lucide-react';

export function Pricing() {
  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-white mb-4">Transparent <span className="text-orange">Pricing</span></h1>
        <div className="inline-block px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full text-sm font-black tracking-widest uppercase shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse mb-6">Service Launching Soon</div>
        <p className="text-xl text-gray-400">No hidden fees. Know the estimate before you book.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {/* Basic */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-orange/50 transition relative overflow-hidden">
          <h3 className="text-2xl font-black text-white mb-2">Pay Per Service</h3>
          <p className="text-gray-400 mb-6 text-sm">No subscription. Pay only when you need help.</p>
          <div className="mb-6"><span className="text-sm text-cyan-400 font-black tracking-widest uppercase animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.3)] px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full">Launching Soon</span></div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle2 className="text-orange" size={18}/> 24/7 Availability</li>
            <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle2 className="text-orange" size={18}/> Live Tracking</li>
            <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle2 className="text-orange" size={18}/> Standard ETA</li>
          </ul>
          <Link to="/book" className="block w-full py-3 text-center bg-white/10 hover:bg-white/20 transition rounded-xl font-bold text-white">Book Now</Link>
        </div>
        {/* Plus */}
        <div className="bg-gradient-to-br from-[#111827] to-[#1a1512] border-2 border-orange rounded-3xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(255,107,0,0.2)]">
          <div className="absolute top-0 right-0 bg-orange text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">Recommended</div>
          <h3 className="text-2xl font-black text-white mb-2">RoadFix Plus</h3>
          <p className="text-gray-400 mb-6 text-sm">Monthly roadside safety plan for peace of mind.</p>
          <div className="mb-6"><span className="text-sm text-cyan-400 font-black tracking-widest uppercase animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.3)] px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full">Launching Soon</span></div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle2 className="text-orange" size={18}/> Priority Support</li>
            <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle2 className="text-orange" size={18}/> Discounted Service Charges</li>
            <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle2 className="text-orange" size={18}/> Free Jumpstarts (1/mo)</li>
          </ul>
          <button className="w-full py-3 text-center bg-orange hover:bg-orange/80 transition rounded-xl font-bold text-white shadow-[0_0_15px_rgba(255,107,0,0.4)]">Subscribe Now</button>
        </div>
        {/* Fleet */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-orange/50 transition">
          <h3 className="text-2xl font-black text-white mb-2">Fleet Plan</h3>
          <p className="text-gray-400 mb-6 text-sm">For delivery companies and small logistics.</p>
          <div className="mb-6"><span className="text-sm text-cyan-400 font-black tracking-widest uppercase animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.3)] px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full">Launching Soon</span></div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle2 className="text-orange" size={18}/> Dashboard Access</li>
            <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle2 className="text-orange" size={18}/> Monthly Billing</li>
            <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle2 className="text-orange" size={18}/> Dedicated Account Manager</li>
          </ul>
          <Link to="/contact" className="block w-full py-3 text-center bg-white/10 hover:bg-white/20 transition rounded-xl font-bold text-white">Contact Sales</Link>
        </div>
      </div>
      <p className="text-center text-xs text-gray-500 mt-8 max-w-2xl mx-auto">Note: Final repair cost depends on vehicle condition, distance, parts, and mechanic inspection. RoadFixNow provides platform connectivity and pricing estimates.</p>
    </div>
  );
}

export function HowItWorks() {
  const steps = [
    { title: "Choose your vehicle", desc: "Select if you're driving a bike, car, or commercial vehicle." },
    { title: "Select the problem", desc: "Tap on Tyre Puncture, Battery Dead, Fuel Empty, etc." },
    { title: "Share live location", desc: "We automatically detect your exact breakdown spot." },
    { title: "Get matched", desc: "Our radar finds the closest verified mechanic in seconds." },
    { title: "Track, repair, and pay", desc: "Track them live on the map, get the issue fixed, and pay online." }
  ];

  return (
    <div className="pt-24 pb-20 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-white mb-4">How it <span className="text-orange">Works</span></h1>
        <p className="text-xl text-gray-400">5 simple steps to get back on the road.</p>
      </div>
      <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-white/10">
        {steps.map((s, i) => (
          <div key={i} className="relative flex items-center md:justify-between md:odd:flex-row-reverse group">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange border-4 border-navy text-white font-black shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg z-10">{i+1}</div>
            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-3xl bg-white/5 border border-white/10 ml-4 md:ml-0 hover:bg-white/10 transition">
              <h3 className="font-bold text-xl text-white mb-2">{s.title}</h3>
              <p className="text-gray-400">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Partner() {
  const { registerMechanic } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', shop: '', city: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await registerMechanic(formData.email, formData.password, formData.name);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 px-4 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
      <div>
        <h1 className="text-5xl font-black text-white mb-6">Partner With <span className="text-orange">Us</span></h1>
        <p className="text-xl text-gray-400 mb-8">Are you a local mechanic, puncture shop, or towing provider? Join RoadFixNow and grow your business.</p>
        <ul className="space-y-6 mb-12">
          <li className="flex items-start gap-4"><CheckCircle2 className="text-orange mt-1"/> <div><h4 className="font-bold text-white text-lg">Get nearby leads</h4><p className="text-sm text-gray-400">Stop waiting for customers. We send jobs directly to your phone.</p></div></li>
          <li className="flex items-start gap-4"><CheckCircle2 className="text-orange mt-1"/> <div><h4 className="font-bold text-white text-lg">Increase Daily Jobs</h4><p className="text-sm text-gray-400">Fill your idle time with nearby emergency requests.</p></div></li>
          <li className="flex items-start gap-4"><CheckCircle2 className="text-orange mt-1"/> <div><h4 className="font-bold text-white text-lg">Digital Payments</h4><p className="text-sm text-gray-400">Get paid instantly into your bank account after every job.</p></div></li>
        </ul>
      </div>
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl h-fit">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-black text-white">Partner Registration</h3>
          <Link to="/partner/login" className="text-sm font-bold text-orange hover:underline">Already a Partner?</Link>
        </div>
        
        {success ? (
          <div className="bg-green-500/10 border border-green-500/50 p-6 rounded-xl text-center">
            <CheckCircle2 className="text-green-500 w-12 h-12 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-white mb-2">Application Submitted!</h4>
            <p className="text-gray-400">Your account is currently under review by our Admin team. You will be able to log in once approved.</p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && <p className="text-red-400 bg-red-400/10 p-3 rounded-lg text-sm">{error}</p>}
            <input required type="text" placeholder="Full Name" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition" />
            <input required type="email" placeholder="Email Address" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition" />
            <input required type="password" placeholder="Password" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition" />
            <div className="grid grid-cols-2 gap-4">
              <input required type="tel" placeholder="Mobile Number" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition" />
              <input required type="text" placeholder="Garage / Shop" value={formData.shop} onChange={e=>setFormData({...formData, shop: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition" />
            </div>
            <select required value={formData.city} onChange={e=>setFormData({...formData, city: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-gray-400 focus:border-orange outline-none transition">
              <option value="">Select City</option><option>Ahmedabad</option><option>Pune</option><option>Bangalore</option>
            </select>
            <button disabled={loading} className="w-full py-4 rounded-xl bg-orange text-white font-black text-lg hover:bg-orange/80 transition shadow-[0_0_20px_rgba(255,107,0,0.4)] mt-4 disabled:opacity-50">
              {loading ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function Cities() {
  const cities = ['Ahmedabad', 'Gandhinagar', 'Surat', 'Vadodara', 'Rajkot', 'Mumbai', 'Pune', 'Delhi NCR', 'Bangalore', 'Hyderabad'];
  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto text-center">
      <h1 className="text-5xl font-black text-white mb-4">Service <span className="text-orange">Areas</span></h1>
      <p className="text-xl text-gray-400 mb-16">RoadFixNow is expanding across India's major highways and cities.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {cities.map((c, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-orange/20 hover:border-orange transition cursor-pointer flex flex-col items-center">
            <MapPin className="text-orange mb-3" size={32}/>
            <h3 className="font-bold text-white">{c}</h3>
            <p className="text-xs text-gray-500 mt-1">15+ Mechanics</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Services() {
  const srvs = ['Tyre Puncture Repair', 'Battery Jumpstart', 'Battery Replacement', 'Fuel Delivery', 'Towing Service', 'Bike Breakdown Repair', 'Car Breakdown Repair', 'Key Lockout Assistance', 'Minor On-Road Repairs', 'Night Emergency Visit'];
  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
      <h1 className="text-5xl font-black text-white mb-4 text-center">All <span className="text-orange">Services</span></h1>
      <p className="text-xl text-gray-400 mb-16 text-center">Whatever the issue, we have a specialist nearby.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {srvs.map((s, i) => (
          <Link to={`/services/${s.toLowerCase().replace(/ /g, '-')}`} key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition block group">
            <div className="flex justify-between items-center mb-4">
              <Wrench className="text-orange group-hover:scale-110 transition"/>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">from ₹99</span>
            </div>
            <h3 className="font-bold text-white text-lg mb-2">{s}</h3>
            <p className="text-sm text-gray-400">Professional assistance arriving in under 20 mins.</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function ServiceDetail() {
  const { id } = useParams();
  const title = id ? id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Service';
  return (
    <div className="pt-24 pb-20 px-4 max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-orange to-red-600 rounded-3xl p-10 mb-12 shadow-[0_0_40px_rgba(255,107,0,0.2)]">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{title}? Help is on the way.</h1>
        <p className="text-lg text-white/80 mb-8 max-w-2xl">Don't panic. Our verified local mechanics specialize in {title.toLowerCase()} and can reach your exact location fast.</p>
        <Link to="/book" className="px-8 py-4 bg-navy text-white font-black rounded-xl hover:bg-[#050810] transition inline-block">BOOK THIS SERVICE</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">What's Included</h2>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-2 text-gray-300"><CheckCircle2 className="text-green-400" size={18}/> Expert Mechanic Visit</li>
            <li className="flex items-center gap-2 text-gray-300"><CheckCircle2 className="text-green-400" size={18}/> Diagnostic check</li>
            <li className="flex items-center gap-2 text-gray-300"><CheckCircle2 className="text-green-400" size={18}/> Transparent Pricing Estimate</li>
          </ul>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-gray-400 text-sm uppercase font-bold tracking-widest mb-2">Pricing Estimate</p>
          <p className="text-4xl font-black text-white mb-2">₹149<span className="text-sm text-gray-400 font-normal"> base</span></p>
          <p className="text-sm text-gray-400 mb-4">+ parts & labor depending on inspection.</p>
          <div className="flex items-center gap-2 text-orange text-sm font-bold"><Clock size={16}/> Average Arrival: 18 mins</div>
        </div>
      </div>
    </div>
  );
}

export function About() {
  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto text-center">
      <ShieldAlert className="w-20 h-20 text-orange mx-auto mb-8"/>
      <h1 className="text-5xl font-black text-white mb-8">Our <span className="text-orange">Mission</span></h1>
      <p className="text-xl text-gray-300 leading-relaxed mb-6">
        Every day, thousands of vehicles break down on Indian roads. Drivers are left stranded, relying on random numbers, haggling over prices, and waiting with zero updates.
      </p>
      <p className="text-xl text-gray-300 leading-relaxed mb-12">
        RoadFixNow exists to organize India’s roadside assistance network. We connect stranded motorists with verified local mechanics instantly, bringing trust, transparency, and speed to roadside emergencies.
      </p>
      <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-12">
        <div><h3 className="text-3xl font-black text-white">Trust</h3><p className="text-gray-400 mt-2">Verified Partners</p></div>
        <div><h3 className="text-3xl font-black text-white">Speed</h3><p className="text-gray-400 mt-2">18m Avg ETA</p></div>
        <div><h3 className="text-3xl font-black text-white">Clarity</h3><p className="text-gray-400 mt-2">No Hidden Fees</p></div>
      </div>
    </div>
  );
}

export function Contact() {
  return (
    <div className="pt-24 pb-20 px-4 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
      <div>
        <h1 className="text-5xl font-black text-white mb-4">Get in <span className="text-orange">Touch</span></h1>
        <p className="text-xl text-gray-400 mb-8">For business inquiries, fleet partnerships, or general support.</p>
        <div className="space-y-6">
          <div className="flex items-center gap-4"><Phone className="text-orange"/><span className="text-white">1800-DEMO-ROAD</span></div>
          <div className="flex items-center gap-4"><Mail className="text-orange"/><span className="text-white">hello@roadfixnow.demo</span></div>
          <div className="flex items-center gap-4"><Map className="text-orange"/><span className="text-white">Demo Startup Hub, Bangalore, India</span></div>
        </div>
      </div>
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
        <form className="space-y-4" onSubmit={(e)=>e.preventDefault()}>
          <input type="text" placeholder="Name" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none" />
          <input type="email" placeholder="Email" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none" />
          <textarea rows="4" placeholder="Message" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none"></textarea>
          <button className="w-full py-4 rounded-xl bg-orange text-white font-black hover:bg-orange/80 transition">SEND MESSAGE</button>
        </form>
      </div>
    </div>
  );
}

export function FAQ() {
  const faqs = [
    { q: "How does roadside booking work?", a: "Simply open our app, select your vehicle and problem, confirm location, and we will dispatch the nearest mechanic." },
    { q: "Is this available 24/7?", a: "Yes! Our platform connects you with night-shift emergency mechanics." },
    { q: "How is pricing calculated?", a: "You pay a base visit fee to the platform. The mechanic provides a repair estimate upon inspection." },
    { q: "Can I track the mechanic?", a: "Absolutely. Our live tracking works exactly like a cab booking app." }
  ];
  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
      <h1 className="text-5xl font-black text-white mb-12 text-center">Frequently Asked <span className="text-orange">Questions</span></h1>
      <div className="space-y-4">
        {faqs.map((f, i) => (
          <details key={i} className="group bg-white/5 border border-white/10 rounded-2xl cursor-pointer">
            <summary className="flex items-center justify-between p-6 font-bold text-white text-lg list-none">
              {f.q}
              <ChevronDown className="text-gray-500 group-open:rotate-180 transition" />
            </summary>
            <div className="px-6 pb-6 text-gray-400">{f.a}</div>
          </details>
        ))}
      </div>
    </div>
  );
}

export function TermsPrivacy() {
  const { pageId } = useParams();
  const isTerms = pageId === 'terms';
  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
      <h1 className="text-4xl font-black text-white mb-8">{isTerms ? 'Terms of Use' : 'Privacy Policy'}</h1>
      <div className="prose prose-invert prose-orange max-w-none text-gray-400">
        <p>This is a demo page for RoadFixNow.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque elit, tristique placerat feugiat ac, facilisis vitae arcu. Proin eget egestas augue. Praesent ut sem nec arcu pellentesque aliquet non eget volutpat.</p>
        <p>Actual legal documents would go here in production.</p>
      </div>
    </div>
  );
}

