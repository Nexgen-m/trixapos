// import React, { useState, useEffect } from 'react';
// import { Outlet } from 'react-router-dom';
// import { useFrappeGetDocList } from 'frappe-react-sdk';
// import { Sidebar } from './layout/Sidebar';
// import { TopBar } from './layout/TopBar';
// import { MainHeader } from './layout/MainHeader';
// import { Cart } from './cart/Cart';
// import { useAuth } from '../lib/auth';
// import { Toaster } from 'sonner'; // Import the Toaster component


// export function MainLayout() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const { username, authLoading } = useAuth();

//   const { data: companies } = useFrappeGetDocList('Company', {
//     fields: ['name', 'company_name'],
//   });

//   const { data: categories } = useFrappeGetDocList('Item Group', {
//     fields: ['name'],
//     filters: [['is_group', '=', 0]],
//   });

//   const companyInfo = companies ? companies[0] : { name: 'Demo POS', branch: 'Main Branch' };

//   if (authLoading) {
//     return <div className="flex justify-center items-center h-screen">Loading...</div>;
//   }

//   return (
//     <div className="h-screen flex flex-col overflow-hidden">
//       <TopBar
//         isSidebarOpen={isSidebarOpen}
//         setIsSidebarOpen={setIsSidebarOpen}
//         username={username}
//       />

//       <div className="flex flex-1 overflow-hidden">
//         <Sidebar isOpen={isSidebarOpen} categories={categories?.map((group) => group.name) || []} />

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
//       <Toaster richColors /> {/* Add the Toaster component here */}
//     </div>
//   );
// }

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { Sidebar } from './layout/Sidebar';
import { TopBar } from './layout/TopBar';
import { MainHeader } from './layout/MainHeader';
import { Cart } from './cart/Cart';
import { useAuth } from '../lib/auth';
import { usePOSStore } from '@/hooks/Stores/usePOSStore';
import { Toaster } from 'sonner'; // Import the Toaster component

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { username, authLoading } = useAuth();
  const { isVerticalLayout } = usePOSStore(); // Get current layout mode

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
        route={"/trixapos"}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* ✅ Sidebar is only visible in horizontal mode */}
        {!isVerticalLayout && (
          <Sidebar isOpen={isSidebarOpen} categories={categories?.map((group) => group.name) || []} />
        )}

        <div className="flex flex-col flex-1 overflow-hidden">
          <MainHeader companyInfo={companyInfo} />
          <main className="flex-1 overflow-auto bg-gray-50 p-4">
            <Outlet />
          </main>
        </div>

        {/* ✅ Cart is only visible in horizontal mode */}
        {!isVerticalLayout && (
          <div className="w-96 bg-gray-900 text-white flex flex-col border-l border-gray-700 overflow-hidden">
            <Cart />
          </div>
        )}
      </div>
      <Toaster richColors /> {/* Toaster remains globally available */}
    </div>
  );
}
