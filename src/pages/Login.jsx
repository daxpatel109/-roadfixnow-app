import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, registerCustomer, registerMechanic, resetPassword, verifyResetOtp, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const portalType = location.pathname.includes('/admin') ? 'admin' : location.pathname.includes('/partner') ? 'partner' : 'customer';

  // Redirect if already logged in based on role
  React.useEffect(() => {
    if (role) {
      if (role === 'admin') navigate('/dashboard/admin', { replace: true });
      else if (role === 'mechanic') navigate('/dashboard/mechanic', { replace: true });
      else navigate('/dashboard/customer', { replace: true });
    }
  }, [role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        if (!otpSent) {
          await resetPassword(email);
          setOtpSent(true);
        } else {
          await verifyResetOtp(email, otpCode, newPassword);
          setIsForgotPassword(false);
          setOtpSent(false);
          setIsLogin(true);
          alert("Password successfully reset! You can now log in.");
        }
      } else {
        if (isLogin) {
          await login(email, password);
        } else {
          if (portalType === 'partner') {
            await registerMechanic(email, password, fullName);
          } else {
            await registerCustomer(email, password, fullName);
          }
        }
      }
    } catch (err) {
      setError(err?.message || (typeof err === 'object' ? JSON.stringify(err) : 'Failed to authenticate'));
    } finally {
      setLoading(false);
    }
  };

  const getPortalConfig = () => {
    if (portalType === 'admin') {
      return { title: 'Admin Secure Login', sub: 'Authorized personnel only.', color: 'text-red-500', bgGlow: 'bg-red-500/10', hideRegister: true };
    }
    if (portalType === 'partner') {
      return { title: isLogin ? 'Partner Login' : 'Partner Sign Up', sub: isLogin ? 'Sign in to access your mechanic dashboard.' : 'Register as a certified mechanic.', color: 'text-blue-500', bgGlow: 'bg-blue-500/10', hideRegister: false };
    }
    return { title: isLogin ? 'Welcome Back' : 'Join RoadFixNow', sub: isLogin ? 'Sign in to access your dashboard' : 'Create a customer account to book services', color: 'text-orange', bgGlow: 'bg-orange/10', hideRegister: false };
  };

  const config = getPortalConfig();

  // Reset form when toggling forgot password
  React.useEffect(() => {
    setError('');
    setOtpSent(false);
  }, [isForgotPassword]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#050810] flex items-center justify-center p-4 relative overflow-hidden w-full">
      {/* Background Glows */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] blur-[120px] rounded-full pointer-events-none ${config.bgGlow}`}></div>

      <div className="w-full max-w-[1000px] bg-white/5 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl relative z-10 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Branding (Hidden on mobile) */}
        <div className="hidden md:flex md:w-1/2 bg-navy p-12 flex-col justify-between relative overflow-hidden border-r border-white/10">
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-orange/20 rounded-full blur-[80px]"></div>
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-black text-white tracking-tight mb-4">RoadFix<span className="text-orange">Now</span></h1>
            <p className="text-gray-400 text-lg">Your 24/7 on-demand vehicle rescue platform.</p>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md"><ShieldAlert className="text-orange w-6 h-6"/></div>
              <div><h4 className="text-white font-bold">Verified Mechanics</h4><p className="text-xs text-gray-400">Strictly vetted professionals</p></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md"><ArrowRight className="text-blue-400 w-6 h-6"/></div>
              <div><h4 className="text-white font-bold">Instant Dispatch</h4><p className="text-xs text-gray-400">Live GPS tracking</p></div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-black text-white mb-2">
              {isForgotPassword ? (otpSent ? 'Enter OTP' : 'Reset Password') : config.title}
            </h2>
            <p className="text-sm text-gray-400">
              {isForgotPassword ? (otpSent ? 'Check your email for the 6-digit recovery OTP.' : 'Enter your email to receive a recovery OTP.') : config.sub}
            </p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-2xl text-sm mb-6 text-center font-bold">
              {error}
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {isForgotPassword ? (
              <>
                {!otpSent ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                      <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-orange focus:bg-black/60 outline-none transition" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Recovery OTP</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input type="text" placeholder="123456" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-orange focus:bg-black/60 outline-none transition tracking-[1em]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-orange focus:bg-black/60 outline-none transition" />
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                      <input type="text" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-orange focus:bg-black/60 outline-none transition" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-orange focus:bg-black/60 outline-none transition" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
                    {isLogin && portalType !== 'admin' && (
                      <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs text-gray-400 hover:text-white transition">Forgot Password?</button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:border-orange focus:bg-black/60 outline-none transition" />
                  </div>
                </div>
              </>
            )}

            <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} disabled={loading} className="w-full py-4 rounded-2xl bg-orange text-white font-black flex items-center justify-center gap-2 hover:bg-orange/90 transition shadow-[0_0_30px_rgba(255,107,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed mt-8 text-lg">
              {loading ? <Loader2 className="animate-spin" /> : isForgotPassword ? (otpSent ? 'Update Password' : 'Send Recovery OTP') : isLogin ? 'Sign In Securely' : 'Create Account'}
            </motion.button>
          </form>

          {isForgotPassword ? (
            <div className="mt-8 text-center border-t border-white/10 pt-6">
              <button onClick={() => setIsForgotPassword(false)} className="text-gray-400 text-sm hover:text-white transition">
                ← Back to Login
              </button>
            </div>
          ) : (!config.hideRegister) && (
            <div className="mt-8 text-center border-t border-white/10 pt-6">
              <p className="text-gray-400 text-sm">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="ml-2 text-white font-bold hover:text-orange transition border-b border-transparent hover:border-orange pb-0.5">
                  {isLogin ? 'Sign Up Now' : 'Sign In'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
