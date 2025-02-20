import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useFrappeAuth, useFrappeGetDoc, useFrappeGetDocList } from "frappe-react-sdk";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MainHeader } from "./MainHeader";
import { usePOSStore } from "../../hooks/Stores/usePOSStore";

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { currentUser } = useFrappeAuth();

  // ✅ Dynamically fetch companies instead of hardcoding
  const { data: companies, error: companyError, isLoading: companyLoading } = useFrappeGetDocList("Company", {
    fields: ["name", "company_name"],
  });

  // ✅ Fetch categories for Sidebar
  const { data: categories, error: categoryError, isLoading: categoryLoading } = useFrappeGetDocList("Item Group", {
    fields: ["name"],
    filters: [["is_group", "=", 0]],
  });

  // ✅ Get and set selected category using Zustand store
  const setSelectedCategory = usePOSStore((state) => state.setSelectedCategory);

  // ✅ Select first available company if multiple exist
  const companyInfo = companies ? companies[0] : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1">
        {/* Sidebar with Categories */}
        <Sidebar
          isOpen={isSidebarOpen}
          categories={categories?.map((group) => group.name) || []}
          onSelectCategory={(category) => setSelectedCategory(category)}
        />

        {/* Main Content */}
        <div className="flex flex-col flex-1">
          <header>
            <TopBar
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              username={currentUser?.full_name || "Guest"}
            />

            {/* ✅ Company Info */}
            {companyLoading ? (
              <div className="p-4 text-gray-500">Loading company info...</div>
            ) : companyError ? (
              <div className="p-4 text-red-500">Failed to load company info</div>
            ) : (
              <MainHeader companyInfo={companyInfo} />
            )}
          </header>

          {/* Main Content with Outlet */}
          <main className="flex flex-1 bg-gray-50 overflow-hidden">
            <div className="flex-1 p-6 overflow-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
