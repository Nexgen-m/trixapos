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


import React, { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  categories: string[];
  onSelectCategory: (category: string) => void;
}

export function Sidebar({ isOpen, categories, onSelectCategory }: SidebarProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="bg-gray-800 w-64">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-200 mb-4">Categories</h2>
        <nav className="space-y-2">
          <button
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              activeCategory === null ? "bg-blue-500 text-white" : "text-gray-300 hover:bg-gray-700"
            }`}
            onClick={() => {
              setActiveCategory(null);
              onSelectCategory("All");
            }}
          >
            All Categories
          </button>

          {categories.map((category) => (
            <button
              key={category}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeCategory === category ? "bg-blue-500 text-white" : "text-gray-300 hover:bg-gray-700"
              }`}
              onClick={() => {
                setActiveCategory(category);
                onSelectCategory(category);
                console.log(`Selected Category: ${category}`);
              }}
            >
              {category}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

