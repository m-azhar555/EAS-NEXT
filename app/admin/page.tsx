"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // For Animations
import { Search, Users, CreditCard, Clock, ChevronLeft, ChevronRight } from 'lucide-react'; // For Icons

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:4000/admin/users', {
        headers: { 'auth-token': token || '' }
      });
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => { fetchUsers(); }, []);

  // 🔍 Search Logic
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 📄 Pagination Logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#f8fafc] p-4 md:p-8"
    >
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold text-slate-800">System Control Panel</h1>
          
          {/* Advanced Search Bar */}
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-full w-full md:w-80 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* User Table with Hover Effects */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 font-semibold text-slate-600">User Details</th>
                <th className="p-4 font-semibold text-slate-600">Role</th>
                <th className="p-4 font-semibold text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user, index) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={user._id} 
                  className="border-b last:border-0 hover:bg-indigo-50/50 transition-colors cursor-default"
                >
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{user.name}</div>
                    <div className="text-sm text-slate-500">{user.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm underline-offset-4 hover:underline">Edit Role</button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="p-2 rounded-full hover:bg-white border border-slate-200 disabled:opacity-30 shadow-sm transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="font-medium text-slate-600">Page {currentPage} of {Math.ceil(filteredUsers.length / usersPerPage)}</span>
          <button 
            disabled={indexOfLastUser >= filteredUsers.length}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="p-2 rounded-full hover:bg-white border border-slate-200 disabled:opacity-30 shadow-sm transition-all"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}