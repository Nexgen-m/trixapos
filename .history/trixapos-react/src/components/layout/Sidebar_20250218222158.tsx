// import React from 'react';

// interface SidebarProps {
//   isOpen: boolean;
//   categories: string[];
// }

// export function Sidebar({ isOpen, categories }: SidebarProps) {
//   if (!isOpen) return null;

//   return (
//     <div className="bg-gray-800 w-64">
//       <div className="p-4">
//         <h2 className="text-lg font-semibold text-gray-200 mb-4">Categories</h2>
//         <nav className="space-y-2">
//           {categories.map((category) => (
//             <button
//               key={category}
//               className="w-full text-left px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
//             >
//               {category}
//             </button>
//           ))}
//         </nav>
//       </div>
//     </div>
//   );
// }

import React from "react";

interface SidebarProps {
  isOpen: boolean;
  categories: string[];
  onSelectCategory: (category: string) => void; // ✅ Ensure prop is declared
}

export function Sidebar({ isOpen, categories, onSelectCategory }: SidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="bg-gray-800 w-64">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-200 mb-4">Categories</h2>
        <nav className="space-y-2">
          {categories.map((category) => (
            <button
              key={category}
              className="w-full text-left px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
              onClick={() => onSelectCategory(category)} // ✅ Ensure function is used correctly
            >
              {category}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
