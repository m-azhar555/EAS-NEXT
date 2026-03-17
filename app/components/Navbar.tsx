"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  UserSquare2, 
  ShieldCheck, 
  LogOut, 
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  // 1. Role state define karein
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // 2. Role ko localStorage se fetch karein
    const role = localStorage.getItem('role');
    setUserRole(role ? role.toLowerCase() : null);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    toast.success("See you soon! 👋");
    router.push('/');
  };

  const allLinks = [
    { name: 'Admin', path: '/admin', icon: <ShieldCheck size={18} />, roles: ['admin'] },
    { name: 'Manager', path: '/manager', icon: <LayoutDashboard size={18} />, roles: ['admin', 'manager'] },
    { name: 'Employee', path: '/employee', icon: <UserSquare2 size={18} />, roles: ['admin', 'manager', 'employee'] },
  ];

  // 3. Logic: Sirf wahi links dikhayein jo user ke role ke mutabiq hain
  const visibleLinks = allLinks.filter(link => userRole && link.roles.includes(userRole));

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
      scrolled 
      ? 'py-3 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-xl' 
      : 'py-5 bg-slate-900 border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        
        {/* Logo Section */}
        <Link href="/dashboard" className="group flex items-center gap-2">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
            <Sparkles className="text-white" size={20} />
          </div>
          <span className="text-xl font-black text-white tracking-tighter">
            EAS<span className="text-indigo-400 text-sm ml-1 font-bold italic uppercase tracking-widest">Pro</span>
          </span>
        </Link>

        {/* Navigation Links (Filtered) */}
        <div className="hidden md:flex items-center bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700/50">
          {visibleLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link 
                key={link.path} 
                href={link.path} 
                className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-300 overflow-hidden ${
                  isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{link.icon}</span>
                <span className="relative z-10 text-sm font-bold tracking-tight">{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Action Section */}
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout} 
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl transition-all duration-300 font-bold text-sm shadow-lg shadow-rose-500/10"
          >
            <span>Logout</span>
            <LogOut size={16} />
          </motion.button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;