"use client";
import { useState, FormEvent } from 'react';
import toast from 'react-hot-toast';


export default function Register() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

 const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
        const response = await fetch('http://localhost:4000/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password, role: "employee" }), // Role default employee rakha hai
        });

        const data = await response.json();

        if (response.ok) {
            toast.success("Registration Successful! 🎉");
            // Yahan aap user ko login page par redirect kar sakte hain
        } else {
            toast.error(data.message || "Registration failed");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Server se connect nahi ho pa raha!");
    }
};

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Name</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded" 
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              className="w-full p-2 border rounded" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              className="w-full p-2 border rounded" 
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}