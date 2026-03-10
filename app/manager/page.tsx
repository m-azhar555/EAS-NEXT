"use client";
import { useState, useEffect } from 'react';

export default function ManagerDashboard() {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  // Pending expenses mangwana
  const fetchPending = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:4000/expenses/all-pending', {
        headers: { 'auth-token': token || '' }
      });
      const data = await response.json();
      if (response.ok) setPendingRequests(data);
    } catch (error) {
      console.error("Error fetching", error);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  // Approve ya Reject karne ka function
  const handleUpdateStatus = async (id: string, status: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:4000/expenses/update-status/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token || ''
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        alert(`Expense ${status}!`);
        fetchPending(); // Table ko update karna
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      alert("Server error!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Manager Dashboard</h1>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Pending Approvals</h2>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="py-2">Employee</th>
                <th className="py-2">Purpose</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((req: any) => (
                <tr key={req._id} className="border-b">
                  {/* Agar employeeId null ho to 'Unknown' dikhaye */}
                  <td className="py-2">{req.employeeId ? req.employeeId.name : 'Unknown User'}</td>
                  <td className="py-2">{req.purpose}</td>
                  <td className="py-2 font-medium">Rs. {req.amount}</td>
                  <td className="py-2 space-x-2">
                    <button 
                      onClick={() => handleUpdateStatus(req._id, 'Approved')}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                      Approve
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(req._id, 'Rejected')}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pendingRequests.length === 0 && <p className="text-gray-500 mt-4 text-center">No pending requests.</p>}
        </div>
      </div>
    </div>
  );
}