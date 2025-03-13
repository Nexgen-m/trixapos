import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  MoreVertical,
  Monitor,
  Smartphone,
  LayoutGrid,
  List
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

// ✅ Reusable Checkbox Toggle Component
interface ToggleOptionProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  icon: React.ReactNode;
}

const ToggleOption: React.FC<ToggleOptionProps> = ({
  label,
  checked,
  onChange,
  icon
}) => (
  <label className="flex items-center space-x-3 cursor-pointer">
    <input type="checkbox" checked={checked} onChange={onChange} className="peer hidden" />
    <div className="h-5 w-5 flex items-center justify-center border-2 border-gray-300 rounded peer-checked:border-blue-600 peer-checked:bg-blue-600 transition">
      {icon}
    </div>
    <span className="text-sm font-medium text-gray-900">{label}</span>
  </label>
);

export function OptionsMenu() {
  const { verifyUserPassword, logoutUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [password, setPassword] = useState(""); // ✅ Password has its own state
  const [errorMessage, setErrorMessage] = useState("");
  const [isCompactMode, setIsCompactMode] = useState(false);
  const [isHorizontalLayout, setIsHorizontalLayout] = useState(false);
  const navigate = useNavigate();

  // ✅ Load settings from local storage
  React.useEffect(() => {
    setIsCompactMode(localStorage.getItem("compactMode") === "true");
    setIsHorizontalLayout(localStorage.getItem("horizontalLayout") === "true");
  }, []);

  // ✅ Save settings to local storage
  React.useEffect(() => {
    localStorage.setItem("compactMode", isCompactMode.toString());
    localStorage.setItem("horizontalLayout", isHorizontalLayout.toString());
  }, [isCompactMode, isHorizontalLayout]);

  // ✅ Logout Function
  const handleLogout = async () => {
    setErrorMessage("");
    const isValid = await verifyUserPassword(password);

    if (isValid) {
      await logoutUser();
      navigate("/login", { replace: true }); // ✅ Redirects user to login
    } else {
      setErrorMessage("Incorrect password. Please try again.");
    }
  };

  return (
    <>
      {/* Hidden inputs to trick password managers */}
      <div style={{ display: 'none', visibility: 'hidden' }}>
        <input type="text" name="fakeusernameremembered" />
        <input type="password" name="fakepasswordremembered" />
      </div>

      {/* Popover Menu */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="p-3 rounded-full transition-all hover:bg-gray-300">
            <MoreVertical className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-2 space-y-2 shadow-lg bg-white rounded-lg">
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg text-base">
            Open Form View <span className="text-gray-500">Ctrl+F</span>
          </button>
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg text-base">
            Toggle Recent Orders <span className="text-gray-500">Ctrl+O</span>
          </button>
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg text-base">
            Save as Draft <span className="text-gray-500">Ctrl+S</span>
          </button>
          <button
            onClick={() => setIsLogoutDialogOpen(true)}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg text-base text-red-600 font-semibold"
          >
            Close the POS <span className="text-gray-500">⇧+Ctrl+C</span>
          </button>
          <div className="border-t my-2"></div>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg text-base font-medium"
          >
            Display Settings <Settings className="h-5 w-5 text-gray-600" />
          </button>
        </PopoverContent>
      </Popover>

      {/* Display Settings Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Display Settings</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            {/* Layout Toggle */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Layout</h3>
              <ToggleOption
                label={isHorizontalLayout ? "Horizontal Layout" : "Vertical Layout"}
                checked={isHorizontalLayout}
                onChange={() => setIsHorizontalLayout(!isHorizontalLayout)}
                icon={
                  isHorizontalLayout ? (
                    <Monitor className="h-4 w-4 text-white" />
                  ) : (
                    <Smartphone className="h-4 w-4 text-white" />
                  )
                }
              />
            </div>

            {/* Compact Mode Toggle */}
            <div className="space-y-2 border-t pt-4">
              <h3 className="text-sm font-medium text-gray-500">Display Mode</h3>
              <ToggleOption
                label={isCompactMode ? "Compact Mode" : "Full Mode"}
                checked={isCompactMode}
                onChange={() => setIsCompactMode(!isCompactMode)}
                icon={
                  isCompactMode ? (
                    <List className="h-4 w-4 text-white" />
                  ) : (
                    <LayoutGrid className="h-4 w-4 text-white" />
                  )
                }
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => e.preventDefault()} autoComplete="off">
            <div className="py-4 space-y-4">
              <p>Please enter your password to confirm logout.</p>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                autoComplete="new-password" 
                name="logoutPassword"
                data-form-type="other"
              />

              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleLogout} className="bg-red-500 text-white">Logout</Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}