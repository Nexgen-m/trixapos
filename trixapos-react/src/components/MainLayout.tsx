// import React, { useState, useEffect } from "react";
// import { Outlet } from "react-router-dom";
// import { useFrappeAuth, useFrappeGetDocList, useFrappeGetDoc } from "frappe-react-sdk";
// import { Sidebar } from "./layout/Sidebar";
// import { TopBar } from "./layout/TopBar";
// import { MainHeader } from "./layout/MainHeader";
// import { Cart } from "./cart/Cart";

// export function MainLayout() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const [username, setUsername] = useState<string>("Demo User");

//   // Get current user with Frappe SDK hooks
//   const { currentUser, isLoading: authLoading } = useFrappeAuth();

//   // Get full user details using useFrappeGetDoc
//   const { data: userDetails, isLoading: userLoading } = useFrappeGetDoc(
//     'User',
//     typeof currentUser === 'string' ? currentUser : '',
//     {
//       fields: ['name', 'full_name', 'email']
//     }
//   );

//   // Fetch companies for company info
//   const { data: companies } = useFrappeGetDocList("Company", {
//     fields: ["name", "company_name"],
//   });

//   // Fetch categories for Sidebar
//   const { data: categories } = useFrappeGetDocList("Item Group", {
//     fields: ["name"],
//     filters: [["is_group", "=", 0]]
//   });

//   // Handle user data updates
//   useEffect(() => {
//     if (!authLoading && !userLoading && currentUser) {
//       if (userDetails?.full_name) {
//         setUsername(userDetails.full_name);
//       } else if (typeof currentUser === 'string') {
//         setUsername(currentUser);
//       }
//     }
//   }, [currentUser, userDetails, authLoading, userLoading]);

//   // Use first company as active one
//   const companyInfo = companies ? companies[0] : { name: "Demo POS", branch: "Main Branch" };

//   return (
//     <div className="h-screen flex flex-col overflow-hidden">
//       <TopBar
//         isSidebarOpen={isSidebarOpen}
//         setIsSidebarOpen={setIsSidebarOpen}
//         username={username}
//       />

//       <div className="flex flex-1 overflow-hidden">
//         <Sidebar
//           isOpen={isSidebarOpen}
//           categories={categories?.map((group) => group.name) || []}
//         />

//         <div className="flex flex-col flex-1 overflow-hidden">
//           <MainHeader companyInfo={companyInfo} />
//           <main className="flex-1 overflow-auto bg-gray-50 p-4">
//             <Outlet />
//           </main>
//         </div>

//         <div className="w-96 bg-gray-900 text-white flex flex-col border-l border-gray-700 overflow-hidden">
//           <Cart />
//         </div>
//       </div>
//     </div>
//   );
// }

//---------------------------------------------------

import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { Sidebar } from './layout/Sidebar';
import { TopBar } from './layout/TopBar';
import { MainHeader } from './layout/MainHeader';
import { Cart } from './cart/Cart';
import { useAuth } from '../lib/auth';
import { Toaster } from 'sonner'; // Import the Toaster component


export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { username, authLoading } = useAuth();

  const { data: companies } = useFrappeGetDocList('Company', {
    fields: ['name', 'company_name'],
  });

  const { data: categories } = useFrappeGetDocList('Item Group', {
    fields: ['name'],
    filters: [['is_group', '=', 0]],
  });

  const companyInfo = companies ? companies[0] : { name: 'Demo POS', branch: 'Main Branch' };

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TopBar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        username={username}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} categories={categories?.map((group) => group.name) || []} />

        <div className="flex flex-col flex-1 overflow-hidden">
          <MainHeader companyInfo={companyInfo} />
          <main className="flex-1 overflow-auto bg-gray-50 p-4">
            <Outlet />
          </main>
        </div>

        <div className="w-96 bg-gray-900 text-white flex flex-col border-l border-gray-700 overflow-hidden">
          <Cart />
        </div>
      </div>
      <Toaster richColors /> {/* Add the Toaster component here */}
    </div>
  );
}
