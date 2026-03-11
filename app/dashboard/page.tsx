"use client";
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation'; 
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast'; 
import { 
  PlusCircle, 
  History, 
  Wallet, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  LogOut,
  Loader2 
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [amount, setAmount] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // 🟢 1. Data Fetching with Stats Calculation
  const fetchMyExpenses = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/expenses/my-expenses', {
        headers: { 'auth-token': token }
      });
      const data = await response.json();
      if (response.ok) {
        setExpenses(data);
      }
    } catch (error) {
      toast.error("Network error: Could not load data");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { fetchMyExpenses(); }, []);

  // 🟢 2. Logout Functionality
  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success("Logged out successfully");
    router.push('/login');
  };

  // 🟢 3. Advanced Submission Logic
  const handleAddExpense = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(Number(amount) <= 0) return toast.error("Invalid amount!");

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:4000/expenses/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'auth-token': token || '' },
        body: JSON.stringify({ amount, purpose }),
      });

      if (response.ok) {
        toast.success("Request sent to manager! 🚀"); 
        setAmount('');
        setPurpose('');
        fetchMyExpenses(); 
      } else {
        const data = await response.json();
        toast.error(data.message || "Submission failed");
      }
    } catch (error) {
      toast.error("Server connection lost!");
    } finally {
      setLoading(false);
    }
  };

  // Stats for the cards
  const stats = {
    total: expenses.reduce((acc, curr) => acc + Number(curr.amount), 0),
    pending: expenses.filter(e => e.status === 'Pending').length,
    approved: expenses.filter(e => e.status === 'Approved').length
  };

  if (isFetching) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600 mb-2" size={40} />
        <p className="text-slate-500 font-medium italic">Preparing your workspace...</p>
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
        
        {/* --- Top Header --- */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Employee Portal</h1>
            <p className="text-slate-400 text-sm font-medium">Manage your reimbursements</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all font-bold text-sm"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* --- Quick Stats --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Total Spent" value={`Rs. ${stats.total}`} icon={<Wallet className="text-blue-600"/>} bg="bg-blue-50" />
          <StatCard label="Pending" value={stats.pending} icon={<Clock className="text-amber-600"/>} bg="bg-amber-50" />
          <StatCard label="Approved" value={stats.approved} icon={<CheckCircle2 className="text-emerald-600"/>} bg="bg-emerald-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- Submission Form --- */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-8">
              <div className="flex items-center gap-2 mb-6">
                <PlusCircle className="text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-800">New Request</h2>
              </div>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Amount (PKR)</label>
                  <input 
                    type="number" 
                    className="mt-1 w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 font-semibold" 
                    placeholder="0.00"
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    required 
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Description / Purpose</label>
                  <input 
                    type="text" 
                    className="mt-1 w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 font-semibold" 
                    placeholder="e.g. Travel costs"
                    value={purpose} 
                    onChange={(e) => setPurpose(e.target.value)} 
                    required 
                  />
                </div>
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : "Submit Request"}
                </button>
              </form>
            </div>
          </div>

          {/* --- History Table --- */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center gap-2">
                <History className="text-slate-400" />
                <h2 className="text-xl font-bold text-slate-800">Transaction History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Purpose</th>
                      <th className="py-4 px-6">Amount</th>
                      <th className="py-4 px-6 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <AnimatePresence>
                      {expenses.map((exp, idx) => (
                        <motion.tr 
                          key={exp._id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="hover:bg-slate-50/80 transition-all"
                        >
                          <td className="py-4 px-6 text-xs font-bold text-slate-500">
                            {new Date(exp.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-700">{exp.purpose}</td>
                          <td className="py-4 px-6 font-black text-slate-900">Rs. {exp.amount}</td>
                          <td className="py-4 px-6">
                            <div className="flex justify-center">
                                <StatusBadge status={exp.status} />
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
                {expenses.length === 0 && (
                    <div className="p-20 text-center text-slate-400 italic">No records found yet.</div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
}

// --- Helper Components ---
function StatCard({ label, value, icon, bg }: any) {
  return (
    <div className={`p-6 rounded-3xl ${bg} border border-white/50 shadow-sm flex items-center gap-4`}>
      <div className="p-3 bg-white rounded-2xl shadow-sm">{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    Approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Rejected: "bg-rose-100 text-rose-700 border-rose-200",
    Pending: "bg-amber-100 text-amber-700 border-amber-200"
  };
  const icons: any = {
    Approved: <CheckCircle2 size={12} />,
    Rejected: <XCircle size={12} />,
    Pending: <Clock size={12} />
  };
  return (
    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${styles[status]}`}>
      {icons[status]} {status}
    </span>
  );
}