// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Settings,
//   MoreVertical,
//   Monitor,
//   Smartphone,
//   LayoutGrid,
//   List,
//   LogOut,
// } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Popover,
//   PopoverTrigger,
//   PopoverContent,
// } from "@/components/ui/popover";
// import { Button } from "@/components/ui/button";
// import { useAuth } from "@/lib/auth";
// import { usePOSStore } from "../../hooks/Stores/usePOSStore";

// // Reusable Checkbox Toggle Component
// interface ToggleOptionProps {
//   label: string;
//   checked: boolean;
//   onChange: () => void;
//   icon: React.ReactNode;
// }

// const ToggleOption: React.FC<ToggleOptionProps> = ({
//   label,
//   checked,
//   onChange,
//   icon,
// }) => (
//   <label className="flex items-center space-x-3 cursor-pointer">
//     <input
//       type="checkbox"
//       checked={checked}
//       onChange={onChange}
//       className="peer hidden"
//     />
//     <div className="h-5 w-5 flex items-center justify-center border-2 border-gray-300 rounded peer-checked:border-blue-600 peer-checked:bg-blue-600 transition">
//       {checked && icon}
//     </div>
//     <span className="text-sm font-medium text-gray-900">{label}</span>
//   </label>
// );

// export function OptionsMenu() {
//   const { verifyUserPassword, logoutUser } = useAuth();
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
//   const [password, setPassword] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const navigate = useNavigate();

//   // Get values and actions from POS store
//   const isCompactMode = usePOSStore((state) => state.isCompactMode);
//   const isVerticalLayout = usePOSStore((state) => state.isVerticalLayout);
//   const isFullScreenMode = usePOSStore((state) => state.isFullScreenMode);
//   const setIsCompactMode = usePOSStore((state) => state.setIsCompactMode);
//   const setIsFullScreenMode = usePOSStore((state) => state.setIsFullScreenMode);
//   const toggleLayout = usePOSStore((state) => state.toggleLayout);

//   // Handle full-screen mode toggle
//   const handleFullScreenModeToggle = () => {
//     setIsFullScreenMode(!isFullScreenMode);
//   };

//   // Handle compact mode toggle
//   const handleCompactModeToggle = () => {
//     setIsCompactMode(!isCompactMode);
//   };

//   // Handle layout toggle
//   const handleLayoutToggle = () => {
//     toggleLayout();
//   };

//   // Handle logout
//   const handleLogout = async () => {
//     setErrorMessage("");
//     const isValid = await verifyUserPassword(password);

//     if (isValid) {
//       await logoutUser();
//       navigate("/login", { replace: true }); // Redirect to login page
//     } else {
//       setErrorMessage("Incorrect password. Please try again.");
//     }
//   };

//   return (
//     <>
//       {/* Hidden inputs to trick password managers */}
//       <div style={{ display: "none", visibility: "hidden" }}>
//         <input type="text" name="fakeusernameremembered" />
//         <input type="password" name="fakepasswordremembered" />
//       </div>

//       {/* Popover Menu */}
//       <Popover>
//         <PopoverTrigger asChild>
//           <Button
//             variant="ghost"
//             className="p-3 rounded-full transition-all hover:bg-gray-300"
//           >
//             <MoreVertical className="h-6 w-6" />
//           </Button>
//         </PopoverTrigger>
//         <PopoverContent
//           align="end"
//           className="w-64 p-2 space-y-2 shadow-lg bg-white rounded-lg"
//         >
//           <button className="w-full flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg text-base">
//             Open Form View <span className="text-gray-500">Ctrl+F</span>
//           </button>
//           <button className="w-full flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg text-base">
//             Toggle Recent Orders <span className="text-gray-500">Ctrl+O</span>
//           </button>
//           <button className="w-full flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg text-base">
//             Save as Draft <span className="text-gray-500">Ctrl+S</span>
//           </button>
//           <button
//             onClick={() => setIsLogoutDialogOpen(true)}
//             className="w-full flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg text-base text-red-600 font-semibold"
//           >
//             Close the POS <span className="text-gray-500">⇧+Ctrl+C</span>
//           </button>
//           <div className="border-t my-2"></div>
//           <button
//             onClick={() => setIsDialogOpen(true)}
//             className="w-full flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg text-base font-medium"
//           >
//             Display Settings <Settings className="h-5 w-5 text-gray-600" />
//           </button>
//         </PopoverContent>
//       </Popover>

//       {/* Display Settings Dialog */}
//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle>Display Settings</DialogTitle>
//           </DialogHeader>
//           <div className="py-4 space-y-6">
//             {/* Layout Toggle */}
//             <div className="space-y-2">
//               <h3 className="text-sm font-medium text-gray-500">Layout</h3>
//               <ToggleOption
//                 label={isVerticalLayout ? "Vertical Layout" : "Horizontal Layout"}
//                 checked={isVerticalLayout}
//                 onChange={handleLayoutToggle}
//                 icon={
//                   isVerticalLayout ? (
//                     <Smartphone className="h-4 w-4 text-white" />
//                   ) : (
//                     <Monitor className="h-4 w-4 text-white" />
//                   )
//                 }
//               />
//               <p className="text-xs text-gray-500 mt-2">
//                 {isVerticalLayout
//                   ? "Vertical layout stacks the cart below the item list"
//                   : "Horizontal layout places the cart beside the item list"}
//               </p>
//             </div>

//             {/* Compact Mode Toggle */}
//             <div className="space-y-2 border-t pt-4">
//               <h3 className="text-sm font-medium text-gray-500">Display Mode</h3>
//               <ToggleOption
//                 label={isCompactMode ? "Compact Mode" : "Full Mode"}
//                 checked={isCompactMode}
//                 onChange={handleCompactModeToggle}
//                 icon={
//                   isCompactMode ? (
//                     <List className="h-4 w-4 text-white" />
//                   ) : (
//                     <LayoutGrid className="h-4 w-4 text-white" />
//                   )
//                 }
//               />
//               <p className="text-xs text-gray-500 mt-2">
//                 {isCompactMode
//                   ? "Compact mode shows simplified item cards without images"
//                   : "Full mode displays detailed item cards with images"}
//               </p>
//             </div>

//             {/* Full Screen Mode Toggle */}
//             <div className="space-y-2 border-t pt-4">
//               <h3 className="text-sm font-medium text-gray-500">Full Screen Mode</h3>
//               <ToggleOption
//                 label={isFullScreenMode ? "Full Screen Mode" : "Normal Mode"}
//                 checked={isFullScreenMode}
//                 onChange={handleFullScreenModeToggle}
//                 icon={
//                   isFullScreenMode ? (
//                     <Monitor className="h-4 w-4 text-white" />
//                   ) : (
//                     <Smartphone className="h-4 w-4 text-white" />
//                   )
//                 }
//               />
//               <p className="text-xs text-gray-500 mt-2">
//                 {isFullScreenMode
//                   ? "Full screen mode maximizes the POS interface"
//                   : "Normal mode displays the POS interface in a standard window"}
//               </p>
//             </div>
//           </div>
//           <div className="flex justify-end pt-4 border-t">
//             <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Logout Confirmation Dialog */}
//       <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle>Confirm Logout</DialogTitle>
//           </DialogHeader>
//           <form onSubmit={(e) => e.preventDefault()} autoComplete="off">
//             <div className="py-4 space-y-4">
//               <p>Please enter your password to confirm logout.</p>
//               <input
//                 type="password"
//                 placeholder="Enter password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded-md"
//                 autoComplete="new-password"
//                 name="logoutPassword"
//                 data-form-type="other"
//               />

//               {errorMessage && <p className="text-red-500">{errorMessage}</p>}
//               <div className="flex justify-end space-x-2">
//                 <Button
//                   variant="outline"
//                   onClick={() => setIsLogoutDialogOpen(false)}
//                 >
//                   Cancel
//                 </Button>
//                 <Button onClick={handleLogout} className="bg-red-500 text-white">
//                   Logout
//                 </Button>
//               </div>
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// }

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  MoreVertical,
  Monitor,
  Smartphone,
  LayoutGrid,
  List,
  LogOut,
  Check,
  FileText,
  Clock,
  Save,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { usePOSStore } from "../../hooks/Stores/usePOSStore";
import { usePOSProfile } from "../../hooks/fetchers/usePOSProfile";  // Import the usePOSProfile hook

// Reusable Checkbox Toggle Component with improved visual feedback
interface ToggleOptionProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  icon: React.ReactNode;
  description?: string;
}

const ToggleOption: React.FC<ToggleOptionProps> = ({
  label,
  checked,
  onChange,
  icon,
  description,
}) => (
  <div className="flex flex-col space-y-2">
    <label className="flex items-center space-x-3 cursor-pointer">
      <div 
        onClick={onChange}
        className={`h-6 w-6 flex items-center justify-center rounded-md transition-all ${
          checked 
            ? "bg-blue-600 text-white" 
            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
        }`}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        {description && (
          <span className="text-xs text-gray-500">{description}</span>
        )}
      </div>
      <div className="ml-auto">
        {checked && <Check className="h-5 w-5 text-blue-600" />}
      </div>
    </label>
  </div>
);

// Option Menu Item Component
interface OptionMenuItemProps {
  label: string;
  shortcut?: string;
  icon?: React.ReactNode;
  onClick: () => void;
  className?: string;
}

const OptionMenuItem: React.FC<OptionMenuItemProps> = ({
  label,
  shortcut,
  icon,
  onClick,
  className = "",
}) => (
  <button 
    className={`w-full flex items-center p-3 hover:bg-gray-100 rounded-lg text-base ${className}`}
    onClick={onClick}
  >
    {icon && <span className="mr-3">{icon}</span>}
    <span>{label}</span>
    {shortcut && <span className="ml-auto text-gray-500 text-sm">{shortcut}</span>}
  </button>
);

export function OptionsMenu() {
  const { verifyUserPassword, logoutUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Get values and actions from POS store
  const isCompactMode = usePOSStore((state) => state.isCompactMode);
  const isVerticalLayout = usePOSStore((state) => state.isVerticalLayout);
  const isFullScreenMode = usePOSStore((state) => state.isFullScreenMode);
  const setIsCompactMode = usePOSStore((state) => state.setIsCompactMode);
  const setIsFullScreenMode = usePOSStore((state) => state.setIsFullScreenMode);
  const toggleLayout = usePOSStore((state) => state.toggleLayout);

  // Fetch POS profile data
  const { customDisplayMode, updateCustomDisplayMode, enableCompactModeOption } = usePOSProfile();

  // Sync the local state with the custom_display_mode value
  useEffect(() => {
    if (customDisplayMode === "Compact Mode") {
      setIsCompactMode(true);
    } else {
      setIsCompactMode(false);
    }
  }, [customDisplayMode, setIsCompactMode]);

  // Handle full-screen mode toggle
  const handleFullScreenModeToggle = () => {
    setIsFullScreenMode(!isFullScreenMode);
  };

  // Handle compact mode toggle
  const handleCompactModeToggle = async () => {
    const newMode = isCompactMode ? "Full Mode" : "Compact Mode";
    await updateCustomDisplayMode(newMode);
    setIsCompactMode(!isCompactMode);
  };

  // Handle layout toggle
  const handleLayoutToggle = () => {
    toggleLayout();
  };

  // Handle logout
  const handleLogout = async () => {
    setErrorMessage("");
    const isValid = await verifyUserPassword(password);

    if (isValid) {
      await logoutUser();
      navigate("/login", { replace: true }); // Redirect to login page
    } else {
      setErrorMessage("Incorrect password. Please try again.");
    }
  };

  return (
    <React.Fragment>
      {/* Hidden inputs to trick password managers */}
      <div style={{ display: "none", visibility: "hidden" }}>
        <input type="text" name="fakeusernameremembered" />
        <input type="password" name="fakepasswordremembered" />
      </div>

      {/* Popover Menu */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="p-3 rounded-full transition-all hover:bg-gray-200"
            aria-label="Options Menu"
          >
            <MoreVertical className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-72 p-2 space-y-1 shadow-lg bg-white rounded-lg"
        >
          <OptionMenuItem 
            label="Open Form View" 
            shortcut="Ctrl+F"
            icon={<FileText className="h-5 w-5 text-gray-600" />}
            onClick={() => {}}
          />
          <OptionMenuItem 
            label="Toggle Recent Orders" 
            shortcut="Ctrl+O"
            icon={<Clock className="h-5 w-5 text-gray-600" />}
            onClick={() => {}}
          />
          <OptionMenuItem 
            label="Save as Draft" 
            shortcut="Ctrl+S"
            icon={<Save className="h-5 w-5 text-gray-600" />}
            onClick={() => {}}
          />
          <div className="border-t my-2"></div>
          <OptionMenuItem 
            label="Display Settings" 
            icon={<Settings className="h-5 w-5 text-gray-600" />}
            onClick={() => setIsDialogOpen(true)}
            className="font-medium"
          />
          <div className="border-t my-2"></div>
          <OptionMenuItem 
            label="Close the POS" 
            shortcut="⇧+Ctrl+C"
            icon={<XCircle className="h-5 w-5 text-red-600" />}
            onClick={() => setIsLogoutDialogOpen(true)}
            className="text-red-600 font-medium"
          />
        </PopoverContent>
      </Popover>

      {/* Display Settings Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Display Settings</DialogTitle>
            <DialogDescription>
              Customize how your POS interface looks and behaves
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            {/* Layout Toggle */}
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700">Screen Layout</h3>
              <div className="flex space-x-4">
                <div 
                  className={`flex-1 p-4 border rounded-lg cursor-pointer transition-all ${
                    !isVerticalLayout 
                      ? "border-blue-600 bg-blue-50 shadow-md" 
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => {
                    if (isVerticalLayout) handleLayoutToggle();
                  }}
                >
                  <div className="flex justify-center mb-3">
                    <Monitor className={`h-8 w-8 ${!isVerticalLayout ? "text-blue-600" : "text-gray-400"}`} />
                  </div>
                  <h4 className="text-center font-medium">Horizontal</h4>
                  <p className="text-xs text-center text-gray-500 mt-1">
                    Cart beside item list
                  </p>
                </div>
                <div 
                  className={`flex-1 p-4 border rounded-lg cursor-pointer transition-all ${
                    isVerticalLayout 
                      ? "border-blue-600 bg-blue-50 shadow-md" 
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={() => {
                    if (!isVerticalLayout) handleLayoutToggle();
                  }}
                >
                  <div className="flex justify-center mb-3">
                    <Smartphone className={`h-8 w-8 ${isVerticalLayout ? "text-blue-600" : "text-gray-400"}`} />
                  </div>
                  <h4 className="text-center font-medium">Vertical</h4>
                  <p className="text-xs text-center text-gray-500 mt-1">
                    Cart below item list
                  </p>
                </div>
              </div>
            </div>

            {/* Display Mode Toggle - Conditionally Rendered */}
            {enableCompactModeOption && (  // Only render if enableCompactModeOption is true
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700">Display Mode</h3>
                <div className="flex space-x-4">
                  <div 
                    className={`flex-1 p-4 border rounded-lg cursor-pointer transition-all ${
                      !isCompactMode 
                        ? "border-blue-600 bg-blue-50 shadow-md" 
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => {
                      if (isCompactMode) handleCompactModeToggle();
                    }}
                  >
                    <div className="flex justify-center mb-3">
                      <LayoutGrid className={`h-8 w-8 ${!isCompactMode ? "text-blue-600" : "text-gray-400"}`} />
                    </div>
                    <h4 className="text-center font-medium">Full Mode</h4>
                    <p className="text-xs text-center text-gray-500 mt-1">
                      Detailed items with images
                    </p>
                  </div>
                  <div 
                    className={`flex-1 p-4 border rounded-lg cursor-pointer transition-all ${
                      isCompactMode 
                        ? "border-blue-600 bg-blue-50 shadow-md" 
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    onClick={() => {
                      if (!isCompactMode) handleCompactModeToggle();
                    }}
                  >
                    <div className="flex justify-center mb-3">
                      <List className={`h-8 w-8 ${isCompactMode ? "text-blue-600" : "text-gray-400"}`} />
                    </div>
                    <h4 className="text-center font-medium">Compact Mode</h4>
                    <p className="text-xs text-center text-gray-500 mt-1">
                      Simplified items without images
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Full Screen Mode Toggle */}
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Full Screen Mode</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Maximize the POS interface
                  </p>
                </div>
                <div>
                  <button
                    onClick={handleFullScreenModeToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isFullScreenMode ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        isFullScreenMode ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setIsDialogOpen(false)}>
              Apply Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl text-red-600">
              <LogOut className="h-5 w-5 mr-2" /> Confirm Logout
            </DialogTitle>
            <DialogDescription>
              You are about to close the POS system. Please confirm with your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => e.preventDefault()} autoComplete="off">
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="logoutPassword" className="text-sm font-medium">
                  Password
                </label>
                <input
                  id="logoutPassword"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="new-password"
                  name="logoutPassword"
                  data-form-type="other"
                />
              </div>

              {errorMessage && (
                <div className="p-2 bg-red-50 text-red-600 rounded-md text-sm">
                  {errorMessage}
                </div>
              )}
              <div className="flex justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsLogoutDialogOpen(false);
                    setPassword("");
                    setErrorMessage("");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleLogout} 
                  className="bg-red-500 hover:bg-red-600 text-white"
                  disabled={!password}
                >
                  Logout
                </Button>
              </div>
              </div>
          </form>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}