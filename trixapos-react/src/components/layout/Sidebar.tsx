import React, { useState } from "react";
import { usePOSStore } from "../../hooks/Stores/usePOSStore";

interface SidebarProps {
  isOpen: boolean;
  categories: string[];
}

export function Sidebar({ isOpen, categories }: SidebarProps) {
  const setSelectedCategory = usePOSStore((state) => state.setSelectedCategory);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  if (!isOpen) return null;

  return (
    <div className="bg-gray-800 w-64 h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-200 mb-4">Categories</h2>
        <nav className="space-y-2">
          <button
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              activeCategory === "All" ? "bg-blue-500 text-white" : "text-gray-300 hover:bg-gray-700"
            }`}
            onClick={() => {
              setActiveCategory("All");
              setSelectedCategory(""); // Empty means all categories
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
                setSelectedCategory(category);
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
