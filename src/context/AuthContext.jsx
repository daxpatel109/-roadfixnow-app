import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'customer', 'mechanic', or 'admin'
  const [status, setStatus] = useState(null); // 'active', 'pending', etc.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchUserData(session.user.id);
      }
      setLoading(false);
    };

    getSession();

    // Listen for changes on auth state (log in, log out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        setRole(null);
        setStatus(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, status')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      if (data) {
        setRole(data.role);
        setStatus(data.status || 'active');
      }
    } catch (error) {
      console.error('Error fetching user data:', error.message);
      setRole('customer'); // Default fallback
      setStatus('active');
    }
  };

  const login = async (email, password, portalType) => {
    // 1. Secure Hardcoded Admin Login
    if (email === 'admin@roadfixnow.com') {
      if (password === 'AdminSecure@2026') {
        if (portalType !== 'admin') throw new Error("Access denied. Please use the Admin login portal.");
        const adminUser = {
          id: 'super-admin-001',
          email: email,
          user_metadata: { full_name: 'Super Admin' }
        };
        setUser(adminUser);
        setRole('admin');
        setStatus('active');
        return { user: adminUser };
      } else {
        throw new Error("Invalid admin credentials");
      }
    }

    // 2. Normal Supabase Login
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // 3. Verify Portal Access
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (!userError && userData) {
      if (portalType === 'partner' && userData.role !== 'mechanic') {
        await supabase.auth.signOut();
        throw new Error("Access denied. Please use the Customer login portal.");
      }
      if (portalType === 'customer' && userData.role !== 'customer') {
        await supabase.auth.signOut();
        throw new Error("Access denied. Please use the Partner login portal.");
      }
      if (portalType === 'admin' && userData.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error("Access denied. You are not an admin.");
      }
    }

    return data;
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  };

  const verifyResetOtp = async (email, otp, newPassword) => {
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'recovery' });
    if (error) throw error;
    
    if (data.session || data.user) {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
    } else {
      throw new Error("OTP verification failed. Please try again.");
    }
  };

  const registerCustomer = async (email, password, fullName, phone) => {
    // 1. Sign up the user
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    
    if (error) throw error;
    
    // 2. Add them to the users table as a customer
    if (data?.user) {
      const { error: dbError } = await supabase.from('users').insert([
        { id: data.user.id, email: email, full_name: fullName, role: 'customer', phone }
      ]);
      if (dbError) throw dbError;
    }
    
    return data;
  };

  const registerMechanic = async (email, password, fullName, phone) => {
    // 1. Sign up the mechanic
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    
    if (error) throw error;
    
    // 2. Add them to the users table as a pending mechanic
    if (data?.user) {
      const { error: dbError } = await supabase.from('users').insert([
        { id: data.user.id, email: email, full_name: fullName, role: 'mechanic', status: 'pending', phone }
      ]);
      if (dbError) throw dbError;
    }
    
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, role, status, loading, login, registerCustomer, registerMechanic, logout, resetPassword, verifyResetOtp }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
