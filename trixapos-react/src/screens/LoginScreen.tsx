import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';
import { useFrappeAuth } from 'frappe-react-sdk';

export function LoginScreen() {
  const { login, currentUser, isLoading, error: authError } = useFrappeAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState<string>(''); // ✅ Ensure error is a string
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && currentUser) {
      navigate('/trixapos');
    }
  }, [currentUser, isLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
  
    try {
      await login(credentials); // Pass credentials object as a single argument
      navigate('/trixapos');
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    }
  };
  

  if (isLoading) {
    return <div className="text-center py-10">Checking session...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Store className="h-12 w-12 text-indigo-600 mx-auto" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to TrixaPOS</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {(error || authError) && (
            <div className="bg-red-100 text-red-700 p-2 rounded">
              {String(error || authError)} {/* ✅ Convert error to string */}
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-2">
            <input
              type="text"
              name="username"
              required
              placeholder="Username"
              value={credentials.username}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <input
              type="password"
              name="password"
              required
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
