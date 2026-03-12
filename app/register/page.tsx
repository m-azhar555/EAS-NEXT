"use client";
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; 
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { User, Mail, Lock, Loader2, UserPlus, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: "employee" }), 
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Account created! Redirecting to login...");
        setTimeout(() => router.push('/login'), 1500); // Thoda gap de kar bhejenge
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      toast.error("Server connection lost!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        // Max-height ko restrict kiya aur padding thodi kam kar di
        className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 p-6 md:p-10 border border-slate-100"
      >
        <div className="text-center mb-6">
          <div className="h-12 w-12 bg-emerald-500 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-100 mb-3">
            <UserPlus className="text-white" size={20} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Register</h2>
          <p className="text-slate-400 font-medium text-xs mt-1">Join the Expense Approval System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3 text-slate-300" size={16} />
              <input 
                type="text" 
                placeholder="Full Name"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent focus:border-emerald-500 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium text-slate-700" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3 text-slate-300" size={16} />
              <input 
                type="email" 
                placeholder="Email Address"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent focus:border-emerald-500 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium text-slate-700" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3 text-slate-300" size={16} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Create Password"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-transparent focus:border-emerald-500 rounded-xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all text-sm font-medium text-slate-700" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-slate-400 hover:text-emerald-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 mt-2 text-sm"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Create Account"}
          </button>
        </form>

        <div className="text-center mt-6 border-t border-slate-50 pt-4">
          <p className="text-slate-400 text-xs font-medium">
            Already have an account?{' '}
            {/* 🟢 Clickable Login Link */}
            <Link 
              href="/login" 
              className="text-emerald-600 font-bold hover:underline decoration-2 underline-offset-4"
            >
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}s