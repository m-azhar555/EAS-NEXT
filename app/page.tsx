"use client";
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; 
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<string>('employee'); // Default role
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }), // Role bhi bhej rahe hain
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        toast.success(`Welcome back! 🎉`);

        // Backend se aane wale role ke mutabiq redirect
        const userRole = data.role?.toLowerCase();
        if (userRole === 'admin') router.push('/admin');
        else if (userRole === 'manager') router.push('/manager');
        else router.push('/employee');
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
    // overflow-hidden taake scroll bar na aaye
    <div className="fixed inset-0 z-[9999] min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 p-6 md:p-10 border border-slate-100"
      >
        <div className="text-center mb-6">
          <div className="h-12 w-12 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-100 mb-3">
            <Lock className="text-white" size={20} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Login</h2>
          <p className="text-slate-400 font-medium mt-1 text-xs">Access your control panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3 text-slate-300" size={16} />
              <input 
                type="email" 
                placeholder="email@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-transparent focus:border-indigo-500 rounded-xl outline-none transition-all text-sm font-medium text-slate-700" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3 text-slate-300" size={16} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-transparent focus:border-indigo-500 rounded-xl outline-none transition-all text-sm font-medium text-slate-700" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-slate-400 hover:text-indigo-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

           


          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow-xl hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 mt-2 text-sm"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <>Sign In <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="text-center mt-6 border-t border-slate-50 pt-4">
          <p className="text-slate-400 text-xs font-medium">
            Don't have an account?{' '}
            <Link href="/register" className="text-indigo-600 font-bold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}