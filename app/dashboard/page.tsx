"use client";
import { useState, useEffect, FormEvent } from 'react';

export default function Dashboard() {
  const [amount, setAmount] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🟢 1. Data Mangwane ka Function
  const fetchMyExpenses = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:4000/expenses/my-expenses', {
        headers: { 'auth-token': token }
      });
      const data = await response.json();
      if (response.ok) {
        setExpenses(data);
      }
    } catch (error) {
      console.error("Error fetching expenses", error);
    }
  };

  // Page load hone par fetchMyExpenses call hoga
  useEffect(() => {
    fetchMyExpenses();
  }, []);

  // 🟢 2. Naya Expense Add karne ka Function
  const handleAddExpense = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:4000/expenses/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token || ''
        },
        body: JSON.stringify({ amount, purpose }),
      });

      if (response.ok) {
        alert("Expense Added! 💰");
        setAmount('');
        setPurpose('');
        fetchMyExpenses(); // List ko update karne ke liye dobara fetch karein
      }
    } catch (error) {
      alert("Server error!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
        
        {/* Form Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Submit New Expense</h2>
          <form onSubmit={handleAddExpense} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Amount (Rs)</label>
              <input type="number" className="mt-1 w-full p-2 border rounded-md" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Purpose</label>
              <input type="text" className="mt-1 w-full p-2 border rounded-md" value={purpose} onChange={(e) => setPurpose(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700">
              {loading ? "Wait..." : "Submit"}
            </button>
          </form>
        </div>

        {/* Table Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">My Expense History</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="py-2">Date</th>
                <th className="py-2">Purpose</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((exp: any) => (
                <tr key={exp._id} className="border-b">
                  <td className="py-2">{new Date(exp.createdAt).toLocaleDateString()}</td>
                  <td className="py-2">{exp.purpose}</td>
                  <td className="py-2 font-medium">Rs. {exp.amount}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                      exp.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                      exp.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {exp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {expenses.length === 0 && <p className="text-gray-500 mt-4 text-center">No expenses found.</p>}
        </div>

      </div>
    </div>
  );
}