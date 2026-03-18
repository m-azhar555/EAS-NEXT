"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, ShieldCheck, UserCog, ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// 1. Navbar ko import karein
import Navbar from '../components/Navbar'; 

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const usersPerPage = 5;

  // Security Check: Sirf Admins enter ho saken
  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      toast.error("Unauthorized Access!");
      router.push('/dashboard'); // Employee dashboard par bhej dein
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:4000/admin/users', {
        headers: { 'auth-token': token || '' }
      });
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      toast.error("Server Connection Error");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'employee' : 'admin';
    const token = localStorage.getItem('token');
    setIsUpdating(userId);

    try {
        const response = await fetch(`http://localhost:4000/admin/update-role/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'auth-token': token || '' },
            body: JSON.stringify({ role: newRole })
        });
        if(response.ok) {
            toast.success("Role updated! 🛡️");
            fetchUsers();
        }
    } catch (error) {
        toast.error("Update failed");
    } finally {
        setIsUpdating(null);
    }
  };

  // Search & Pagination Logic
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-900">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={50} />
        <p className="text-slate-400 font-medium">Securing Admin Environment...</p>
      </div>
    );
  }

  return (
    <>
      {/* 2. Navbar yahan place karein */}
      <Navbar />

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        // 3. pt-28 add kiya taake Navbar ke niche se content shuru ho
        className="min-h-screen bg-[#f1f5f9] p-6 lg:p-12"
      >
        <div className="max-w-6xl mx-auto">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 mt-14">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight underline decoration-indigo-500 decoration-4 underline-offset-8">
                System Admin
              </h1>
              <p className="text-slate-500 font-medium mt-4">Manage organization hierarchy and access</p>
            </div>
            
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-3 text-slate-400 group-focus-within:text-indigo-600" size={20} />
              <input 
                type="text"
                placeholder="Search staff members..."
                className="w-full pl-12 pr-4 py-3 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { label: 'Total Staff', val: users.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
              { label: 'Admins', val: users.filter(u => u.role === 'admin').length, icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-100' },
              { label: 'Employees', val: users.filter(u => u.role === 'employee').length, icon: UserCog, color: 'text-emerald-600', bg: 'bg-emerald-100' },
            ].map((stat, i) => (
              <motion.div key={i} whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
                <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}><stat.icon size={28}/></div>
                <div>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-3xl font-black text-slate-800">{stat.val}</h3>
                </div>
              </motion.div>
            ))}
          </div>

          {/* User Table Section */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                  <tr>
                    <th className="p-6 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Team Member</th>
                    <th className="p-6 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Current Privilege</th>
                    <th className="p-6 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence mode='wait'>
                    {currentUsers.map((user, idx) => (
                      <motion.tr 
                        key={user._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-slate-50/50 transition-all"
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-100">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 tracking-tight">{user.name}</p>
                              <p className="text-slate-400 text-xs font-medium">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                            user.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-6 text-right">
                          <button 
                            onClick={() => handleRoleChange(user._id, user.role)}
                            disabled={isUpdating === user._id}
                            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50"
                          >
                            {isUpdating === user._id ? <RefreshCw className="animate-spin mx-auto" size={16}/> : 'Switch Role'}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-8 flex items-center justify-between">
            <p className="text-slate-400 font-bold text-xs">Displaying {currentUsers.length} of {filteredUsers.length} users</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => p - 1)} 
                disabled={currentPage === 1} 
                className="p-3 bg-white rounded-xl shadow-sm disabled:opacity-30 hover:text-indigo-600 transition-colors"
              >
                <ChevronLeft size={20}/>
              </button>
              <button 
                onClick={() => setCurrentPage(p => p + 1)} 
                disabled={currentPage >= totalPages} 
                className="p-3 bg-white rounded-xl shadow-sm disabled:opacity-30 hover:text-indigo-600 transition-colors"
              >
                <ChevronRight size={20}/>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}