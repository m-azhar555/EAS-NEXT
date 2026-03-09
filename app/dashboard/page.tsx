"use client";
import { useState, useEffect, FormEvent } from 'react';

export default function Dashboard() {
  const [amount, setAmount] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleAddExpense = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token'); // Token nikalna zaroori hai

    try {
      const response = await fetch('http://localhost:4000/expenses/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token || '' // Backend mein fetchuser middleware isi ko check karega
        },
        body: JSON.stringify({ amount, purpose }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Expense Added! 💰");
        setAmount('');
        setPurpose('');
      } else {
        alert(data.message || "Error adding expense");
      }
    } catch (error) {
      alert("Server error!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">User Dashboard</h1>
        
        {/* Add Expense Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Submit New Expense</h2>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <input 
                type="number" 
                className="mt-1 w-full p-2 border rounded-md" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Purpose</label>
              <textarea 
                className="mt-1 w-full p-2 border rounded-md" 
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="What was this for?"
                rows={3}
                required 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
            >
              {loading ? "Submitting..." : "Add Expense"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}