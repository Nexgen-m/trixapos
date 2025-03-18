// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Store } from "lucide-react";
// import { useFrappeAuth } from "frappe-react-sdk";

// export function LoginScreen() {
//   const { login, currentUser, isLoading, error: authError } = useFrappeAuth();
//   const [credentials, setCredentials] = useState({ username: "", password: "" });
//   const [error, setError] = useState<string>(""); // ✅ Ensures error is always a string
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!isLoading && currentUser) {
//       console.log("✅ User session found! Redirecting to POS...");
//       navigate("/trixapos");
//     }
//   }, [currentUser, isLoading, navigate]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setCredentials({ ...credentials, [e.target.name]: e.target.value });
//   };

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(""); // ✅ Reset error message

//     try {
//       await login(credentials);
//       navigate("/trixapos");
//     } catch (err) {
//       console.error("❌ Login error:", err);

//       // ✅ Ensure error message is always a string
//       if (typeof err === "string") {
//         setError(err);
//       } else if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError("Login failed. Please try again.");
//       }
//     }
//   };

//   if (isLoading) {
//     return <div className="text-center py-10">Checking session...</div>;
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div className="text-center">
//           <Store className="h-12 w-12 text-indigo-600 mx-auto" />
//           <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to TrixaPOS</h2>
//         </div>
//         <form className="mt-8 space-y-6" onSubmit={handleLogin}>
//           {/* ✅ Fix Error Message Rendering */}
//           {error && (
//             <div className="bg-red-100 text-red-700 p-2 rounded">
//               {error}
//             </div>
//           )}
//           <div className="rounded-md shadow-sm space-y-2">
//             <input
//               type="text"
//               name="username"
//               required
//               placeholder="Username"
//               value={credentials.username}
//               onChange={handleChange}
//               className="w-full p-2 border border-gray-300 rounded-md"
//             />
//             <input
//               type="password"
//               name="password"
//               required
//               placeholder="Password"
//               value={credentials.password}
//               onChange={handleChange}
//               className="w-full p-2 border border-gray-300 rounded-md"
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full p-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
//           >
//             Sign in
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Store } from "lucide-react";
import { useFrappeAuth } from "frappe-react-sdk";

export function LoginScreen() {
  
  const { login, currentUser, isLoading, error: authError } = useFrappeAuth();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state, or default to /trixapos
  const from = (location.state as any)?.from?.pathname || "/trixapos";

  useEffect(() => {
    if (!isLoading && currentUser) {
      console.log("✅ User session found! Redirecting...");
      navigate(from, { replace: true });
    }
  }, [currentUser, isLoading, navigate, from]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(credentials);
      // The useEffect will handle the redirect after successful login
    } catch (err) {
      console.error("❌ Login error:", err);

      if (typeof err === "string") {
        setError(err);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed. Please try again.");
      }
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
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <input
              type="text"
              name="username"
              required
              placeholder="Username"
              value={credentials.username}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="password"
              name="password"
              required
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full p-3 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}