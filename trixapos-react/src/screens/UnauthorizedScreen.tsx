import React from 'react';
import { useNavigate } from 'react-router-dom';

export function UnauthorizedScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold text-red-600">Access Denied</h1>
      <p className="text-lg text-gray-700 mt-4">You are not allowed to use TrixaPOS.</p>
      <button
        onClick={() => navigate('/')}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Return to Home
      </button>
    </div>
  );
}
