import React, { useState, useEffect } from "react";
import { usePOSStore } from "../../hooks/Stores/usePOSStore";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoryEmoji } from "./categoryIcons"; // Import the icon function

interface ItemGroup {
  name: string;
  parent_item_group?: string;
}

interface GroupedCategories {
  [parent: string]: ItemGroup[];
}

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const { selectedCategory, setSelectedCategory } = usePOSStore();
  const [categories, setCategories] = useState<GroupedCategories>({});
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch item groups from Frappe API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          "/api/method/frappe.client.get_list?doctype=Item Group&fields=[\"name\",\"parent_item_group\"]"
        );
        const result = await response.json();

        if (result.message) {
          // Group categories based on parent
          const grouped: GroupedCategories = {};
          result.message.forEach((category: ItemGroup) => {
            const parent = category.parent_item_group || "root";
            if (!grouped[parent]) grouped[parent] = [];
            grouped[parent].push(category);
          });

          setCategories(grouped);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (!isOpen) return null;

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((g) => g !== groupName)
        : [...prev, groupName]
    );
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };

  return (
    <div className="bg-slate-900 w-64 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <h2 className="text-lg font-semibold text-white">Categories</h2>
      </div>

      {/* Scrollable Categories */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        <div className="p-2">
          {/* All Categories Option without Count */}
          <button
            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
              !selectedCategory
                ? "bg-blue-600 text-white shadow-lg"
                : "text-slate-300 hover:bg-slate-800 hover:shadow-md"
            }`}
            onClick={() => handleCategoryClick("")}
          >
            <span>All Categories</span>
          </button>

          {loading ? (
            <div className="text-slate-400 p-4 text-center">Loading...</div>
          ) : (
            /* Parent Groups with Subcategories */
            Object.entries(categories).map(([parent, subCategories]) => (
              <div key={parent} className="mt-1">
                {parent !== "root" && (
                  <button
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 font-normal text-white ${
                      selectedCategory === parent
                        ? "bg-blue-600 shadow-lg"
                        : "hover:bg-slate-800 hover:shadow-md"
                    }`}
                    onClick={() => toggleGroup(parent)}
                  >
                    <div className="flex items-center">
                      <span className="mr-2">{getCategoryEmoji(parent)}</span>
                      <span className="text-left">{parent}</span>
                    </div>
                    {expandedGroups.includes(parent) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}

                {/* Subcategories */}
                {expandedGroups.includes(parent) &&
                  subCategories.map((category) => (
                    <button
                      key={category.name}
                      className={`w-full text-left px-4 py-2 ml-4 rounded-lg transition-all duration-200 font-medium ${
                        selectedCategory === category.name
                          ? "bg-blue-600/80 text-white shadow-md"
                          : "text-slate-400 hover:bg-slate-800 hover:shadow-sm"
                      }`}
                      onClick={() => handleCategoryClick(category.name)}
                    >
                      {category.name}
                    </button>
                  ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}