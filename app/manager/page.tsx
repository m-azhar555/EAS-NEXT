"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Check, X, Clock, Loader2, User, FileText, 
  Receipt, Users, Wallet, RefreshCw, Search, ChevronLeft, ChevronRight 
} from 'lucide-react';
import Navbar from '../components/Navbar';

export default function ManagerDashboard() {
  const router = useRouter();
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // --- New Search & Pagination States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  // --------------------------------------

  const [revisedAmounts, setRevisedAmounts] = useState<{ [key: string]: number }>({});
  const [totalEmployees, setTotalEmployees] = useState(0);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const expRes = await fetch('http://localhost:4000/expenses/all-pending', {
        headers: { 'auth-token': token }
      });
      const expData = await expRes.json();
      
      const userRes = await fetch('http://localhost:4000/admin/users', {
        headers: { 'auth-token': token }
      });
      const userData = await userRes.json();

      if (expRes.ok) setPendingRequests(expData);
      if (userRes.ok) setTotalEmployees(userData.length);
    } catch (error) {
      toast.error("Server connection error!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Search & Pagination Logic ---
  const filteredRequests = pendingRequests.filter(req => 
    req.employeeId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const currentRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );
  // ---------------------------------

  const handleUpdateStatus = async (id: string, status: string, originalAmount: number) => {
    const token = localStorage.getItem('token');
    const finalAmount = revisedAmounts[id] || originalAmount;
    setProcessingId(id);

    const updatePromise = fetch(`http://localhost:4000/expenses/update-status/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token || ''
      },
      body: JSON.stringify({ status, amount: finalAmount })
    }).then(async (res) => {
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    });

    toast.promise(updatePromise, {
      loading: 'Processing...',
      success: () => {
        fetchData();
        setProcessingId(null);
        return `Expense ${status}!`;
      },
      error: () => {
        setProcessingId(null);
        return "Failed to update.";
      }
    });
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="text-slate-600 font-medium tracking-tight">Syncing Manager Portal...</p>
      </div>
    );
  }

  return (
    <> 
      <Navbar />
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#f8fafc] p-4 md:p-8 mt-14"
      >
        <div className="max-w-6xl mx-auto space-y-8">
      
          {/* Header & Search Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-8">
            <div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">Manager Dashboard</h1>
              <p className="text-slate-500 mt-1 font-medium italic">Pending review: {filteredRequests.length}</p>
            </div>

            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-3 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Search employee or purpose..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { label: 'To Review', val: pendingRequests.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
              { label: 'Staff Count', val: totalEmployees, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
              { label: 'Total Pending', val: `Rs. ${pendingRequests.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-100' },
            ].map((stat, i) => (
              <motion.div key={i} whileHover={{ y: -5 }} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
                <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}><stat.icon size={28}/></div>
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-2xl font-black text-slate-800">{stat.val}</h3>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                  <tr>
                    <th className="p-6 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Employee</th>
                    <th className="p-6 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Purpose</th>
                    <th className="p-6 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Amount (Edit)</th>
                    <th className="p-6 text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence mode='popLayout'>
                    {currentRequests.map((req: any) => (
                      <motion.tr 
                        key={req._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                              {req.employeeId?.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 leading-tight">{req.employeeId?.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold">{req.employeeId?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <p className="text-sm font-medium text-slate-600">{req.purpose}</p>
                        </td>
                        <td className="p-6">
                          <input 
                            type="number" 
                            className="w-24 p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-400"
                            defaultValue={req.amount}
                            onChange={(e) => setRevisedAmounts({...revisedAmounts, [req._id]: Number(e.target.value)})}
                          />
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleUpdateStatus(req._id, 'Approved', req.amount)}
                              disabled={processingId === req._id}
                              className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                            >
                              <Check size={18} />
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(req._id, 'Rejected', req.amount)}
                              className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {filteredRequests.length === 0 && (
              <div className="py-20 text-center text-slate-400 font-medium">No requests found matching your search.</div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pb-10">
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 disabled:opacity-30 hover:text-indigo-600 transition-all"
                >
                  <ChevronLeft size={20}/>
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 disabled:opacity-30 hover:text-indigo-600 transition-all"
                >
                  <ChevronRight size={20}/>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}