import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('frappe_token');
    if (token) {
      navigate('/pos'); // Redirect if already logged in
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://your-frappe-site/api/method/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // For session-based login
        body: JSON.stringify({
          usr: email,
          pwd: password,
        }),
      });

      const data = await response.json();

      if (data?.message === 'Logged In') {
        // Frappe uses session cookies by default. However, store token if returned.
        const token = data?.token || localStorage.getItem('sid'); // sid is Frappe's session ID
        if (token) {
          localStorage.setItem('frappe_token', token);
        }
        navigate('/pos'); // ✅ Redirect to POS
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Store className="h-12 w-12 text-indigo-600 mx-auto" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to TrixaPOS</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}
          <div className="rounded-md shadow-sm -space-y-px">
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-t-md"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-b-md"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full p-2 rounded-md text-white ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
