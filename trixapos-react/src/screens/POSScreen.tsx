// import React, { useState, useEffect } from "react";
// import { ItemList } from "../components/ItemList";
// import { ItemSearch } from "../components/ItemSearch";
// import { CustomerSelector } from "../components/CustomerSelector";
// import { usePOSStore } from "@/hooks/Stores/usePOSStore";
// import { VerticalPOSScreen } from "./VerticalPOSScreen"; // Import Vertical Screen

// export function POSScreen() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const { isVerticalLayout } = usePOSStore(); // Get layout setting

//   // Dynamically switch between layouts
//   if (isVerticalLayout) {
//     return <VerticalPOSScreen />;
//   }

//   return (
//     <div className="h-full flex flex-col">
//       {/* Search Bar and Customer Selector */}
//       <div className="flex gap-6 p-4 bg-white border-b border-gray-200">
//         <div className="flex-1">
//           <ItemSearch search={searchTerm} onSearch={setSearchTerm} onClear={() => setSearchTerm("")} />
//         </div>
//         <div className="w-80">
//           <CustomerSelector />
//         </div>
//       </div>

//       {/* Items Grid */}
//       <div className="flex-1 overflow-hidden">
//         <ItemList searchTerm={searchTerm}/>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect, useRef } from "react";
import { ItemList } from "../components/ItemList";
import { ItemSearch } from "../components/ItemSearch";
import { CustomerSelector } from "../components/CustomerSelector";
import { usePOSStore } from "@/hooks/Stores/usePOSStore";
import { VerticalPOSScreen } from "./VerticalPOSScreen";
import { usePOSProfile } from "@/hooks/fetchers/usePOSProfile";
import screenfull from "screenfull";
import { Modal, Button, Input,InputRef, message } from "antd";
import { useAuth } from "@/lib/auth";

export function POSScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const { isVerticalLayout, isFullScreenMode, setIsFullScreenMode } = usePOSStore();
  const { FullScreenMode } = usePOSProfile();
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const [showExitAuth, setShowExitAuth] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const fullscreenButtonRef = useRef<HTMLButtonElement>(null);
  const passwordInputRef = useRef<InputRef>(null);
  const { verifyUserPassword, currentUser } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const escPressedRef = useRef(false);
  const [verifiedExit, setVerifiedExit] = useState(false);

  // Handle fullscreen initialization
  useEffect(() => {
    if (FullScreenMode && screenfull.isEnabled && !screenfull.isFullscreen) {
      setShowFullscreenPrompt(true);
    }
  }, [FullScreenMode]);

  // Handle fullscreen changes and exit attempts
  useEffect(() => {
    if (!screenfull.isEnabled || !FullScreenMode) return;

    const handleFullscreenChange = () => {
      if (!screenfull.isFullscreen && !verifiedExit) {
        // Immediately re-enter fullscreen if exited without permission
        screenfull.request().catch(console.error);
        if (!showExitAuth) {
          setShowExitAuth(true);
        }
      } else if (verifiedExit && !screenfull.isFullscreen) {
        // Reset verification state if user exited properly
        setVerifiedExit(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !verifiedExit) {
        e.preventDefault();
        if (!escPressedRef.current) {
          escPressedRef.current = true;
          setShowExitAuth(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        escPressedRef.current = false;
      }
    };

    screenfull.on('change', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      screenfull.off('change', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [FullScreenMode, showExitAuth, verifiedExit]);

  const enterFullscreen = async () => {
    try {
      if (screenfull.isEnabled) {
        await screenfull.request();
        setIsFullScreenMode(true);
        setShowFullscreenPrompt(false);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
      message.error("Failed to enter fullscreen mode");
    }
  };

  const verifyExitPassword = async () => {
    if (!currentUser || !passwordInput) return;

    setIsVerifying(true);
    try {
      const isValid = await verifyUserPassword(passwordInput);
      if (isValid) {
        setVerifiedExit(true);
        await screenfull.exit();
        setIsFullScreenMode(false);
        setShowExitAuth(false);
        setPasswordInput("");
        message.success("Exited fullscreen mode");
      } else {
        message.error("Incorrect password");
        setPasswordInput("");
        passwordInputRef.current?.input?.focus();      }
    } catch (error) {
      message.error("Error verifying password");
      console.error("Password verification error:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancelExit = () => {
    setPasswordInput("");
    setShowExitAuth(false);
    if (screenfull.isEnabled && !screenfull.isFullscreen) {
      screenfull.request().catch(console.error);
    }
  };

  // Focus management for modals
  useEffect(() => {
    if (showFullscreenPrompt && fullscreenButtonRef.current) {
      fullscreenButtonRef.current.focus();
    }
    if (showExitAuth && passwordInputRef.current) {
      passwordInputRef.current?.input?.focus();    }
  }, [showFullscreenPrompt, showExitAuth]);

  if (isVerticalLayout) {
    return <VerticalPOSScreen />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Fullscreen Entry Modal */}
      <Modal
        title="Fullscreen Required"
        open={showFullscreenPrompt}
        onOk={enterFullscreen}
        closable={false}
        centered
        maskClosable={false}
        footer={[
          <Button
            key="enter-fullscreen"
            type="primary"
            size="large"
            onClick={enterFullscreen}
            ref={fullscreenButtonRef}
            style={{ width: '100%', height: '50px' }}
          >
            ENTER FULLSCREEN MODE
          </Button>
        ]}
      >
        <div className="text-center py-4">
          <p className="text-lg mb-4">POS system requires fullscreen mode to operate.</p>
        </div>
      </Modal>

      {/* Exit Authentication Modal */}
      <Modal
        title="Exit Fullscreen"
        open={showExitAuth}
        onOk={verifyExitPassword}
        onCancel={handleCancelExit}
        closable={false}
        centered
        maskClosable={false}
        confirmLoading={isVerifying}
        footer={[
          <Button key="cancel" onClick={handleCancelExit}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={verifyExitPassword}
            loading={isVerifying}
            disabled={!passwordInput}
          >
            Verify
          </Button>
        ]}
      >
        <div className="py-4">
          <p className="mb-4">Enter your password to exit fullscreen mode:</p>
          <Input.Password
            ref={passwordInputRef}
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onPressEnter={verifyExitPassword}
            placeholder="Enter your account password"
            disabled={isVerifying}
          />
        </div>
      </Modal>

      {/* POS Interface */}
      <div className="flex gap-6 p-4 bg-white border-b border-gray-200">
        <div className="flex-1">
          <ItemSearch 
            search={searchTerm} 
            onSearch={setSearchTerm} 
            onClear={() => setSearchTerm("")} 
          />
        </div>
        <div className="w-80">
          <CustomerSelector />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ItemList searchTerm={searchTerm} />
      </div>
    </div>
  );
}