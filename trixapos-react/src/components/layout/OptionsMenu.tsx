import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import {
  Settings,
  MoreVertical,
  Monitor,
  Smartphone,
  LayoutGrid,
  List,
  LogOut,
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
import { Input } from "@/components/ui/input";
import { CustomerDialog } from "@/components/CustomerDialog";
import { useAuth } from "@/lib/auth";
import { usePOSStore } from "../../hooks/Stores/usePOSStore";
import { usePOSProfile } from "../../hooks/fetchers/usePOSProfile";
import screenfull from "screenfull";
import { toast } from "sonner";

export function OptionsMenu() {
  const { verifyUserPassword, logoutUser } = useAuth();
  const navigate = useNavigate();
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  
  // Password states
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<null | 'fullscreen' | 'logout'>(null);

  // POS store states
  const {
    isCompactMode,
    isVerticalLayout,
    isFullScreenMode,
    setIsCompactMode,
    setIsFullScreenMode,
    toggleLayout,
  } = usePOSStore();

  // Temporary states for dialog
  const [tempIsVerticalLayout, setTempIsVerticalLayout] = useState(isVerticalLayout);
  const [tempIsCompactMode, setTempIsCompactMode] = useState(isCompactMode);
  const [tempIsFullScreenMode, setTempIsFullScreenMode] = useState(isFullScreenMode);

  // POS profile settings
  const {
    custom_enable_recent_orders,
    custom_show_form_view,
    custom_enable_save_as_draft,
    custom_enable_display_settings,
    custom_enable_close_pos,
    AddNewCustomer,
    UserAccessFullScreenMode,
    updateCustomDisplayMode,
    enableCompactModeOption,
  } = usePOSProfile();

  // 1. Dialog state initialization
useEffect(() => {
  if (isDialogOpen) {
    setTempIsVerticalLayout(isVerticalLayout);
    setTempIsCompactMode(isCompactMode);
    setTempIsFullScreenMode(isFullScreenMode);
  }
}, [isDialogOpen, isVerticalLayout, isCompactMode, isFullScreenMode]);

// 2. Initial load + fullscreen synchronization (combined)
useEffect(() => {
  if (!screenfull.isEnabled) return;

  const handleFullscreenChange = () => {
    const isFs = screenfull.isFullscreen;
    
    // Debug before update
    console.log('Handling fullscreen change:', isFs);
    
    // Force update all state sources
    setIsFullScreenMode(isFs); // Updates the global store
    localStorage.setItem('fullScreenMode', String(isFs));
    
    // Force update the temp state (regardless of dialog)
    setTempIsFullScreenMode(isFs);
    
    // Debug after update
    console.log('State updated to:', {
      store: isFullScreenMode,
      actual: isFs,
      temp: tempIsFullScreenMode
    });
  };

  // Set up listener with capture
  screenfull.on('change', handleFullscreenChange);
  
  // Also listen for resize events (F11 often triggers these)
  window.addEventListener('resize', handleFullscreenChange);

  // Initial sync check
  if (screenfull.isFullscreen !== isFullScreenMode) {
    handleFullscreenChange();
  }

  return () => {
    screenfull.off('change', handleFullscreenChange);
    window.removeEventListener('resize', handleFullscreenChange);
  };
}, [isFullScreenMode, setIsFullScreenMode]); // Removed isDialogOpen dependency

  // Verify password and execute pending action
  const verifyPassword = async () => {
    setErrorMessage("");
    try {
      const isValid = await verifyUserPassword(password);
      if (isValid) {
        setIsPasswordDialogOpen(false);
        setPassword("");
  
        if (pendingAction === 'fullscreen') {
          // localStorage.setItem('fullScreenMode', 'false');
          const newMode = false;
          setTempIsFullScreenMode(newMode);
  
          if (screenfull.isEnabled && screenfull.isFullscreen) {
            await screenfull.exit();
            setIsFullScreenMode(false);
            localStorage.setItem('fullScreenMode', 'false'); // ✅ Save to localStorage
          }
        } else if (pendingAction === 'logout') {
          if (screenfull.isEnabled && screenfull.isFullscreen) {
            await screenfull.exit();
          }
          await logoutUser();
          navigate("/login", { replace: true });
        }
      } else {
        setErrorMessage("Incorrect password. Please try again.");
      }
    } catch (error) {
      setErrorMessage("Error verifying password");
      console.error("Password verification error:", error);
    }
  };
  

  const handleFullScreenModeToggle = async () => {
    // Use current actual state rather than temp state
    const wantsFullscreen = !screenfull.isFullscreen;
    
    try {
      if (wantsFullscreen) {
        await screenfull.request();
      } else {
        // Only require password when exiting through UI
        setPendingAction('fullscreen');
        setIsPasswordDialogOpen(true);
      }
    } catch (err) {
      console.error("Fullscreen toggle failed:", err);
      toast.error(`Failed to ${wantsFullscreen ? 'enter' : 'exit'} fullscreen`);
    }
  };
  // Debugging effect
// Debug fullscreen changes (catches ALL changes including F11)
useEffect(() => {
  if (!screenfull.isEnabled) return;

  const logFullscreenState = () => {
    console.log("Fullscreen state changed:", {
      timestamp: new Date().toISOString(),
      source: "system",
      storeState: isFullScreenMode,
      actualState: screenfull.isFullscreen,
      tempState: tempIsFullScreenMode,
      localStorage: localStorage.getItem('fullScreenMode')
    });
  };

  // Log initial state
  logFullscreenState();
  
  // Set up listeners
  screenfull.on('change', logFullscreenState);
  window.addEventListener('resize', logFullscreenState); // F11 often triggers resize

  return () => {
    screenfull.off('change', logFullscreenState);
    window.removeEventListener('resize', logFullscreenState);
  };
}, [isFullScreenMode, tempIsFullScreenMode]);

  // Handle logout
  const handleLogout = () => {
    setPendingAction('logout');
    setIsPasswordDialogOpen(true);
  };

  // Apply display settings changes
  const handleApplyChanges = async () => {
    try {
      // Update layout if changed
      if (tempIsVerticalLayout !== isVerticalLayout) {
        toggleLayout();
      }

      // Update compact mode
      setIsCompactMode(tempIsCompactMode);

      // Handle fullscreen changes
      const fullscreenChanged = tempIsFullScreenMode !== isFullScreenMode;
      setIsFullScreenMode(tempIsFullScreenMode);

      // Update backend settings
      await updateCustomDisplayMode(
        tempIsVerticalLayout ? "Vertical Mode" : "Horizontal Mode"
      );
      await updateCustomDisplayMode(
        tempIsCompactMode ? "Compact Mode" : "Full Mode"
      );

      // Handle fullscreen changes
      if (fullscreenChanged && screenfull.isEnabled) {
        try {
          if (tempIsFullScreenMode && !screenfull.isFullscreen) {
            await screenfull.request();
          } else if (!tempIsFullScreenMode && screenfull.isFullscreen) {
            await screenfull.exit();
          }
        } catch (err) {
          console.error("Fullscreen error:", err);
          toast.error("Failed to update fullscreen mode");
          // Revert state if fullscreen change failed
          setIsFullScreenMode(!tempIsFullScreenMode);
        }
      }

      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error applying changes:", error);
      toast.error("Failed to apply changes");
    }
  };

  // Reset dialog changes
  const handleCloseDialog = () => {
    setTempIsVerticalLayout(isVerticalLayout);
    setTempIsCompactMode(isCompactMode);
    setTempIsFullScreenMode(isFullScreenMode);
    setIsDialogOpen(false);
  };

  // Set layout (vertical/horizontal)
  const setLayout = useCallback((vertical: boolean) => {
    setTempIsVerticalLayout(vertical);
    if (vertical) setTempIsCompactMode(false);
  }, []);

  // Toggle compact mode
  const handleCompactModeToggle = useCallback(() => {
    setTempIsCompactMode((prev) => !prev);
  }, []);
  

  return (
    <>
      {/* Hidden inputs for password managers */}
      <div style={{ display: "none", visibility: "hidden" }}>
        <input type="text" name="fakeusernameremembered" />
        <input type="password" name="fakepasswordremembered" />
      </div>

      {/* Options Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="p-4 rounded-full transition-all">
            <MoreVertical className="h-8 w-8" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-2 space-y-1 shadow-lg bg-white rounded-lg">
          {custom_enable_recent_orders && (
            <button
              className="w-full flex items-center p-3 hover:bg-gray-100 rounded-lg text-base"
              onClick={() => navigate("/trixapos/OrderScreen")}
            >
              <Clock className="h-5 w-5 text-gray-600" />
              <span className="ml-2">Toggle Recent Orders</span>
            </button>
          )}
          
          {custom_show_form_view && (
            <button className="w-full flex items-center p-3 hover:bg-gray-100 rounded-lg text-base">
              <FileText className="h-5 w-5 text-gray-600" />
              <span className="ml-2">Open Form View</span>
            </button>
          )}
          
          {custom_enable_save_as_draft && (
            <button className="w-full flex items-center p-3 hover:bg-gray-100 rounded-lg text-base">
              <Save className="h-5 w-5 text-gray-600" />
              <span className="ml-2">Save as Draft</span>
            </button>
          )}
          
          {AddNewCustomer && (
            <button
              className="w-full flex items-center p-3 hover:bg-gray-100 rounded-lg text-base"
              onClick={() => setIsCustomerDialogOpen(true)}
            >
              <UserPlus className="h-5 w-5 text-gray-600" />
              <span className="ml-2">Add New Customer</span>
            </button>
          )}
          
          {custom_enable_display_settings && (
            <>
              <div className="border-t my-2"></div>
              <button
                onClick={() => setIsDialogOpen(true)}
                className="w-full flex items-center p-3 hover:bg-gray-100 rounded-lg text-base font-medium"
              >
                <Settings className="h-5 w-5 text-gray-600" />
                <span className="ml-2">Display Settings</span>
              </button>
            </>
          )}
          
          {custom_enable_close_pos && (
            <>
              <div className="border-t my-2"></div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center p-3 hover:bg-gray-100 rounded-lg text-base text-red-600 font-medium"
              >
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="ml-2">Close the POS</span>
              </button>
            </>
          )}
        </PopoverContent>
      </Popover>

      {/* Display Settings Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Display Settings</DialogTitle>
            <DialogDescription>
              Customize how your POS interface looks and behaves
            </DialogDescription>
          </DialogHeader>

{/* Screen Layout Selection */}
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">Screen Layout</h3>
            <div className="flex space-x-4">
              <button
                className={`flex-1 p-4 border rounded-lg transition ${
                  !tempIsVerticalLayout
                    ? "border-blue-600 bg-blue-50 shadow-md"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onClick={() => setLayout(false)}
              >
                <div className="flex justify-center mb-3">
                  <Monitor
                    className={`h-8 w-8 ${
                      !tempIsVerticalLayout ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                </div>
                <h4 className="text-center font-medium">Horizontal</h4>
                <p className="text-xs text-center text-gray-500 mt-1">
                  Cart beside item list
                </p>
              </button>

              <button
                className={`flex-1 p-4 border rounded-lg transition ${
                  tempIsVerticalLayout
                    ? "border-blue-600 bg-blue-50 shadow-md"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onClick={() => setLayout(true)}
              >
                <div className="flex justify-center mb-3">
                  <Smartphone
                    className={`h-8 w-8 ${
                      tempIsVerticalLayout ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                </div>
                <h4 className="text-center font-medium">Vertical</h4>
                <p className="text-xs text-center text-gray-500 mt-1">
                  Cart below item list
                </p>
              </button>
            </div>
          </div>

          {/* Display Mode Toggle (Hidden in Vertical Layout) */}
          {!tempIsVerticalLayout && enableCompactModeOption && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700">Display Mode</h3>
              <div className="flex space-x-4">
                <button
                  className={`flex-1 p-4 border rounded-lg transition ${
                    !tempIsCompactMode
                      ? "border-blue-600 bg-blue-50 shadow-md"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={handleCompactModeToggle}
                >
                  <div className="flex justify-center mb-3">
                    <LayoutGrid
                      className={`h-8 w-8 ${
                        !tempIsCompactMode ? "text-blue-600" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <h4 className="text-center font-medium">Full Mode</h4>
                  <p className="text-xs text-center text-gray-500 mt-1">
                    Detailed items with images
                  </p>
                </button>

                <button
                  className={`flex-1 p-4 border rounded-lg transition ${
                    tempIsCompactMode
                      ? "border-blue-600 bg-blue-50 shadow-md"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onClick={handleCompactModeToggle}
                >
                  <div className="flex justify-center mb-3">
                    <List
                      className={`h-8 w-8 ${
                        tempIsCompactMode ? "text-blue-600" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <h4 className="text-center font-medium">Compact Mode</h4>
                  <p className="text-xs text-center text-gray-500 mt-1">
                    Simplified items without images
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Full Screen Mode Toggle */}
          {UserAccessFullScreenMode && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">
                    Full Screen Mode
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Maximize the POS interface
                  </p>
                </div>
                <button
                  onClick={handleFullScreenModeToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    tempIsFullScreenMode ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      tempIsFullScreenMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Apply Changes Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleApplyChanges}>Apply Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Verification Dialog */}
      <Dialog 
        open={isPasswordDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsPasswordDialogOpen(false);
            setPassword("");
            setErrorMessage("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {pendingAction === 'fullscreen' ? 'Exit Fullscreen Mode' : 'Confirm Logout'}
            </DialogTitle>
            <DialogDescription>
              {pendingAction === 'fullscreen' 
                ? 'Please enter your password to disable fullscreen mode' 
                : 'Please enter your password to confirm this action'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                onKeyDown={(e) => e.key === "Enter" && verifyPassword()}
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
                  setIsPasswordDialogOpen(false);
                  setPassword("");
                  setErrorMessage("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={verifyPassword}
                disabled={!password}
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customer Dialog */}
      <CustomerDialog
        isOpen={isCustomerDialogOpen}
        onClose={() => setIsCustomerDialogOpen(false)}
      />
    </>
  );
}