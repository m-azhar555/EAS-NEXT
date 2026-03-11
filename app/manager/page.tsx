"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Check, X, Clock, Loader2, User, FileText, IndianRupee } from 'lucide-react';

export default function ManagerDashboard() {
  const router = useRouter();
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // 🟢 1. Protected Fetching Logic
  const fetchPending = async () => {
    const token = localStorage.getItem('token');
    
    // Security Check: Token nahi hai to login pe bhejo
    if (!token) {
      toast.error("Unauthorized! Please login.");
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/expenses/all-pending', {
        headers: { 'auth-token': token }
      });
      const data = await response.json();
      if (response.ok) {
        setPendingRequests(data);
      } else {
        toast.error(data.message || "Failed to fetch requests");
      }
    } catch (error) {
      toast.error("Server connection error!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  // 🟢 2. Advanced Approve/Reject Logic with Toast Promises
  // Approve ya Reject karne ka function
  const handleUpdateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('token');
    setProcessingId(id); // Loading shuru karein

    // 1. Pehle fetch API call karein aur `.then()` mein error check karein
    const updatePromise = fetch(`http://localhost:4000/expenses/update-status/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token || ''
      },
      body: JSON.stringify({ status })
    }).then(async (res) => {
      if (!res.ok) {
        throw new Error("Update failed"); // Agar response theek nahi, to error throw karo
      }
      return res.json();
    });

    // 2. Ab us promise ko toast mein pass karein (Bina 'async' ke)
    toast.promise(updatePromise, {
      loading: `${status === 'Approved' ? 'Approving' : 'Rejecting'} request...`,
      success: () => {
        fetchPending(); // Table update karein
        setProcessingId(null); // Loading khatam karein
        return `Expense ${status} Successfully! ${status === 'Approved' ? '✅' : '❌'}`;
      },
      error: () => {
        setProcessingId(null); // Loading khatam karein
        return "Failed to update status.";
      }
    });
  };

  // Full Page Loader
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="text-slate-600 font-medium">Loading Pending Requests...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#f8fafc] p-4 md:p-8"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">Manager Dashboard</h1>
            <p className="text-slate-500 mt-2 flex items-center gap-2">
              <Clock size={18} className="text-amber-500" />
              You have <span className="font-bold text-slate-700">{pendingRequests.length}</span> pending approvals
            </p>
          </div>
        </div>

        {/* Responsive Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Employee Details</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Purpose</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {pendingRequests.map((req: any, index: number) => (
                    <motion.tr 
                      key={req._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      {/* Employee Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                            {req.employeeId ? req.employeeId.name.charAt(0).toUpperCase() : <User size={18} />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{req.employeeId ? req.employeeId.name : 'Unknown User'}</p>
                            <p className="text-xs text-slate-500">{req.employeeId ? req.employeeId.email : 'No email'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Purpose Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                          <FileText size={16} className="text-slate-400" />
                          {req.purpose}
                        </div>
                      </td>

                      {/* Amount Column */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                          Rs. {req.amount.toLocaleString()}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            disabled={processingId === req._id}
                            onClick={() => handleUpdateStatus(req._id, 'Approved')}
                            className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-200 hover:border-emerald-500"
                          >
                            {processingId === req._id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            Approve
                          </button>
                          <button 
                            disabled={processingId === req._id}
                            onClick={() => handleUpdateStatus(req._id, 'Rejected')}
                            className="flex items-center gap-1.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-rose-200 hover:border-rose-500"
                          >
                            {processingId === req._id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                            Reject
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {pendingRequests.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-16 flex flex-col items-center justify-center text-center px-4"
            >
              <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Check size={40} className="text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">All Caught Up!</h3>
              <p className="text-slate-500">There are no pending expense requests to review at the moment.</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}