"use client";
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; 
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        toast.success(`Welcome back! 🎉`);

        const role = data.role.toLowerCase();
        if (role === 'admin') router.push('/admin');
        else if (role === 'manager') router.push('/manager');
        else router.push('/dashboard');
      } else {
        toast.error(data.message || "Invalid Credentials");
      }
    } catch (error) {
      toast.error("Server connection failed!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    /* h-screen aur z-index ensure karenge ke page har cheez ke upar dikhe */
    <div className="fixed inset-0 z-[9999] min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 p-8 md:p-12 border border-slate-100 relative"
      >
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="h-14 w-14 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-100 mb-4">
            <Lock className="text-white" size={24} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Login</h2>
          <p className="text-slate-400 font-medium mt-1 text-sm">Access your control panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-300" size={18} />
              <input 
                type="email" 
                placeholder="email@example.com"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-transparent focus:border-indigo-500 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-700" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-300" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-transparent focus:border-indigo-500 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-slate-700" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-indigo-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight size={20} /></>}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-slate-400 text-sm font-medium">
            Don't have an account?{' '}
            <Link href="/register" className="text-indigo-600 font-bold hover:underline underline-offset-4 decoration-2">
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}