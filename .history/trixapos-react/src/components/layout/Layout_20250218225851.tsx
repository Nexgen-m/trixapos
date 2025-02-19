// import React, { useState, useEffect } from 'react';
// import { Outlet } from 'react-router-dom';
// import { Store, Menu, ChevronDown, Clock } from 'lucide-react';
// import { useFrappeAuth , useFrappeGetDoc, useFrappeGetDocList } from 'frappe-react-sdk';
// import { Sidebar } from './Sidebar';
// import { TopBar } from './TopBar';
// import { MainHeader } from './MainHeader';

// export function Layout() {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const { currentUser } = useFrappeAuth ();
  
//   const { data: companyInfo } = useFrappeGetDoc('Company', 'TrixaPOS');
//   const { data: categories } = useFrappeGetDocList('Item Group', {
//     fields: ['name'],
//     filters: [['is_group', '=', 0]],
//   });

//   return (
//     <div className="min-h-screen bg-gray-50 flex">
//       <Sidebar 
//         isOpen={isSidebarOpen}
//         categories={categories?.map(group => group.name) || []} onSelectCategory={function (category: string): void {
//           throw new Error('Function not implemented.');
//         } }      />

//       <div className="flex-1 flex flex-col">
//         <header>
//           <TopBar 
//             isSidebarOpen={isSidebarOpen}
//             setIsSidebarOpen={setIsSidebarOpen}
//             username={currentUser?.full_name}
//           />
//           <MainHeader companyInfo={companyInfo} />
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

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useFrappeAuth, useFrappeGetDoc, useFrappeGetDocList } from 'frappe-react-sdk';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MainHeader } from './MainHeader';
import { ItemList } from '..ItemList'; // ✅ Import ItemList

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // ✅ Store selected category

  const { currentUser } = useFrappeAuth();
  const { data: companyInfo } = useFrappeGetDoc('Company', 'TrixaPOS');
  const { data: categories } = useFrappeGetDocList('Item Group', {
    fields: ['name'],
    filters: [['is_group', '=', 0]],
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ✅ Sidebar with Category Filtering */}
      <Sidebar
        isOpen={isSidebarOpen}
        categories={categories?.map(group => group.name) || []}
        onSelectCategory={setSelectedCategory} // ✅ Correctly implemented function
      />

      {/* ✅ Main Content */}
      <div className="flex-1 flex flex-col">
        <header>
          {/* ✅ Top Bar */}
          <TopBar
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            username={currentUser?.full_name}
          />
          {/* ✅ Company Header */}
          <MainHeader companyInfo={companyInfo} />
        </header>

        {/* ✅ Pass selected category to Item List */}
        <main className="flex-1 bg-gray-50">
          <div className="mx-auto py-6 sm:px-6 lg:px-8">
            <ItemList category={selectedCategory} /> {/* ✅ Filters products */}
          </div>
        </main>
      </div>
    </div>
  );
}
