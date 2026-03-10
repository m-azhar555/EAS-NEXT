"use client";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const Navbar = () => { // Function define kiya
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Manager', path: '/manager' },
    { name: 'Admin', path: '/admin' },
  ];

  return (
    <nav className="bg-slate-900 p-4 text-white shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/dashboard" className="text-xl font-bold">EAS Pro</Link>
        
        <div className="flex space-x-6 items-center">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link key={link.path} href={link.path} className="relative px-2 py-1">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{link.name}</span>
                {isActive && (
                  <motion.div layoutId="underline" className="absolute bottom-0 left-0 h-0.5 w-full bg-indigo-500" />
                )}
              </Link>
            );
          })}
          <button onClick={handleLogout} className="bg-red-500 px-4 py-1 rounded-md">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; // 👈 Yeh line lazmi honi chahiye!