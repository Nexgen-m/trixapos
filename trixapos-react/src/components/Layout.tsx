// import React, { useState, useEffect } from "react";
// import { Outlet } from "react-router-dom";
// import { Store, Clock, Menu, Settings } from "lucide-react";
// import { db } from "../lib/frappe"; // Assuming `db` is your data fetching utility
// import { Cart } from "./cart/Cart"; // Importing the Cart component

// interface CompanyInfo {
//   name: string;
//   branch?: string;
// }

// export function Layout() {
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
//   const [username, setUsername] = useState<string>("Demo User");
//   const [categories, setCategories] = useState<string[]>([]);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);

//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     const loadCompanyInfo = async () => {
//       try {
//         const company = await db.getDoc("Company", "TrixaPOS");
//         setCompanyInfo(company as CompanyInfo);

//         const user = await db.getDoc("User", localStorage.getItem("user") || "");
//         setUsername(user.full_name || user.name);

//         const itemGroups = await db.getDocList("Item Group", {
//           fields: ["name"],
//           filters: [["is_group", "=", 0]],
//         });
//         setCategories(itemGroups.map((group) => group.name));
//       } catch (error) {
//         console.error("Error loading company info:", error);
//       }
//     };

//     loadCompanyInfo();
//   }, []);

//   const formattedTime = currentTime.toLocaleTimeString();
//   const formattedDate = currentTime.toLocaleDateString("en-US", {
//     weekday: "long",
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   });

//   return (
//     <div className="flex flex-col h-screen">
//       {/* Header */}
//       <header className="bg-blue-600 text-white flex items-center justify-between px-4 py-2">
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//             className="p-1 hover:bg-blue-700 rounded-lg transition-colors"
//           >
//             <Menu className="h-5 w-5" />
//           </button>
//           <Store className="h-6 w-6" />
//           <span className="text-lg font-bold">{companyInfo?.name || "TrixaPOS"}</span>
//           <span className="text-sm">{companyInfo?.branch || "Main Branch"}</span>
//         </div>
//         <div className="flex items-center gap-4">
//           <Clock className="h-5 w-5" />
//           <span>{formattedTime}</span>
//           <span className="text-blue-200">|</span>
//           <span>{formattedDate}</span>
//           <span className="font-medium">Welcome, {username}</span>
//           <button className="p-1 hover:bg-blue-700 rounded-lg transition-colors">
//             <Settings className="h-5 w-5" />
//           </button>
//         </div>
//       </header>

//       {/* Main Layout: Left Sidebar | Main Content | Right Sidebar (Cart) */}
//       <div className="flex flex-1 overflow-hidden">
        
//         {/* Left Sidebar (Intact) */}
//         <div className={`bg-gray-800 transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-0"} overflow-y-auto`}>
//           {isSidebarOpen && (
//             <div className="p-4">
//               <h2 className="text-lg font-semibold text-gray-200 mb-4">Categories</h2>
//               <nav className="space-y-2">
//                 {categories.map((category) => (
//                   <button
//                     key={category}
//                     className="w-full text-left px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
//                   >
//                     {category}
//                   </button>
//                 ))}
//               </nav>
//             </div>
//           )}
//         </div>

//         {/* Main Content Area */}
//         <main className="flex-1 bg-gray-100 overflow-auto">
//           <div className="mx-auto py-6 sm:px-6 lg:px-8">
//             <Outlet /> {/* Dynamic content from React Router */}
//           </div>
//         </main>

//         {/* Right Sidebar (Cart) */}
//         <div className="w-96 bg-gray-900 h-full flex flex-col border-l border-gray-700 overflow-hidden">
//           <div className="flex items-center justify-between p-4 border-b border-gray-700 text-white">
//             <div className="flex items-center gap-2">
//               <span className="font-semibold">Current Order</span>
//             </div>
//             <span className="text-sm">0 items</span>
//           </div>
//           <div className="flex-1 overflow-y-auto">
//             <Cart /> {/* Cart component rendered here */}
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }
// // 