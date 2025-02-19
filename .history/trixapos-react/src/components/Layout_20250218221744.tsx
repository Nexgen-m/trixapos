// import React, { useState, useEffect } from "react";
// import { Outlet } from "react-router-dom";
// import { Store, Menu, ChevronDown, Clock } from "lucide-react";
// import { db } from "../lib/frappe";

// interface CompanyInfo {
//   name: string;
//   branch?: string;
// }

// export function Layout() {
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
//   const [username, setUsername] = useState<string>("");
//   const [categories, setCategories] = useState<string[]>([]);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentTime(new Date());
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     const loadCompanyInfo = async () => {
//       try {
//         const company = await db.getDoc("Company", "TrixaPOS");
//         setCompanyInfo(company as CompanyInfo);

//         const user = await db.getDoc(
//           "User",
//           localStorage.getItem("user") || ""
//         );
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
//     <div className="min-h-screen bg-gray-50 flex">
//       {/* Categories Sidebar */}
//       <div
//         className={`bg-gray-800 transition-all duration-300 ${
//           isSidebarOpen ? "w-64" : "w-0"
//         }`}
//       >
//         {isSidebarOpen && (
//           <div className="p-4">
//             <h2 className="text-lg font-semibold text-gray-200 mb-4">
//               Categories
//             </h2>
//             <nav className="space-y-2">
//               {categories.map((category) => (
//                 <button
//                   key={category}
//                   className="w-full text-left px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
//                 >
//                   {category}
//                 </button>
//               ))}
//             </nav>
//           </div>
//         )}
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col">
//         <header>
//           {/* Top Bar */}
//           <div className="bg-blue-600">
//             <div className="mx-auto px-4 py-2 sm:px-6 lg:px-8 flex items-center justify-between text-sm text-white">
//               <div className="flex items-center gap-4">
//                 <button
//                   onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//                   className="p-1 hover:bg-blue-700 rounded-lg transition-colors"
//                 >
//                   <Menu className="h-5 w-5" />
//                 </button>
//                 <div className="flex items-center gap-2">
//                   <Clock className="h-4 w-4" />
//                   <span>{formattedTime}</span>
//                   <span className="text-blue-200">|</span>
//                   <span>{formattedDate}</span>
//                 </div>
//               </div>
//               <div className="flex items-center gap-4">
//                 {username && (
//                   <div className="flex items-center gap-1">
//                     <span className="font-medium">Welcome, {username}</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Main Header */}
//           <div className="bg-white border-b border-gray-200 shadow-sm">
//             <div className="mx-auto px-4 py-4 sm:px-6 lg:px-8">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                   <Store className="h-8 w-8 text-blue-600" />
//                   <div>
//                     <h1 className="text-2xl font-bold text-gray-900">
//                       {companyInfo?.name || "TrixaPOS"}
//                     </h1>
//                     {companyInfo?.branch && (
//                       <p className="text-sm text-blue-600">
//                         Branch: {companyInfo.branch}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <button className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
//                     <span>Options</span>
//                     <ChevronDown className="h-4 w-4" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </header>

//         <main className="flex-1 bg-gray-50">
//           <div className="mx-auto py-6 sm:px-6 lg:px-8">
//             <Outlet />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from ;
import { ItemList } from "../ui/ItemList";
import { db } from "../lib/frappe";

export function Layout() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const itemGroups = await db.getDocList("Item Group", {
          fields: ["name"],
          filters: [["is_group", "=", 0]],
        });
        setCategories(itemGroups.map((group) => group.name));
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    loadCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar categories={categories} isOpen={true} onSelectCategory={setSelectedCategory} />
      <ItemList category={selectedCategory} />
    </div>
  );
}
