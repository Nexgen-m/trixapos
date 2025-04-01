import React, { useState, useEffect, useRef } from "react";
import { ItemList } from "../components/ItemList";
import { ItemSearch } from "../components/ItemSearch";
import { CustomerSelector } from "../components/CustomerSelector";
import { usePOSStore } from "@/hooks/Stores/usePOSStore";
import { VerticalPOSScreen } from "./VerticalPOSScreen";
import { usePOSProfile } from "@/hooks/fetchers/usePOSProfile";
import screenfull from "screenfull";
import { Modal, Button, Input, InputRef, message } from "antd";
import { useAuth } from "@/lib/auth";
import { useCashmatic } from "@/hooks/fetchers/useCashmatic";

export function POSScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    isVerticalLayout,
    isFullScreenMode,
    setIsFullScreenMode,
  } = usePOSStore();

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

  // 1. Fullscreen prompt on load
  useEffect(() => {
    if (FullScreenMode && screenfull.isEnabled && !screenfull.isFullscreen) {
      setShowFullscreenPrompt(true);
    }
  }, [FullScreenMode]);

  // 2. Block browser tab/window close
  useEffect(() => {
    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      if (!verifiedExit && screenfull.isFullscreen) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () => window.removeEventListener("beforeunload", beforeUnloadHandler);
  }, [verifiedExit]);
  
  useEffect(() => {
    const shouldEnterFullscreen = localStorage.getItem("fullScreenMode") === "true";
  
    if (shouldEnterFullscreen && screenfull.isEnabled && !screenfull.isFullscreen) {
      screenfull.request()
        .then(() => setIsFullScreenMode(true))
        .catch(err => console.error("Auto-fullscreen failed:", err));
    }
  }, []);
  
  useEffect(() => {
    const storedFullscreen = localStorage.getItem("fullScreenMode");
    console.log("Auto fullscreen?", storedFullscreen);
  
    if (storedFullscreen === "true" && screenfull.isEnabled && !screenfull.isFullscreen) {
      screenfull.request().then(() => {
        console.log("Auto fullscreen success");
        setIsFullScreenMode(true);
      }).catch((err) => {
        console.error("Failed to auto-enter fullscreen:", err);
      });
    }
  }, []);
  


  // 3. Handle ESC, F11, Ctrl+W, etc. + Fullscreen change protection
  useEffect(() => {
    if (!screenfull.isEnabled || !FullScreenMode) return;

    const handleFullscreenChange = () => {
      if (!screenfull.isFullscreen && !verifiedExit) {
        screenfull.request().catch((err) => {
          console.error("Failed to re-enter fullscreen:", err);
          // if (!screenfull.isFullscreen) {
          //   setShowFullscreenPrompt(true);
          // }
        });
        if (!showExitAuth) setShowExitAuth(true);
      } else if (verifiedExit && !screenfull.isFullscreen) {
        setVerifiedExit(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const forbiddenKeys = ['Escape', 'F11'];
      const isCtrlW = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w';

      if ((forbiddenKeys.includes(e.key) || isCtrlW) && !verifiedExit) {
        e.preventDefault();
        e.stopPropagation();

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

    screenfull.on("change", handleFullscreenChange);
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      screenfull.off("change", handleFullscreenChange);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [FullScreenMode, verifiedExit, showExitAuth]);

  const enterFullscreen = async () => {
    try {
      if (screenfull.isEnabled) {
        await screenfull.request();
        setIsFullScreenMode(true);
        localStorage.setItem("isFullScreenMode", "true");
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
        localStorage.setItem("isFullScreenMode", "false");
        setShowExitAuth(false);
        setPasswordInput("");
        message.success("Exited fullscreen mode");
      } else {
        message.error("Incorrect password");
        setPasswordInput("");
        passwordInputRef.current?.input?.focus();
      }
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
      screenfull.request().catch((err) => {
        console.error("Failed to re-enter fullscreen:", err);
        if (!screenfull.isFullscreen) {
          setShowFullscreenPrompt(true);
        }
      });
    }
  };

  // Focus inputs when modals show
  useEffect(() => {
    if (showFullscreenPrompt && fullscreenButtonRef.current) {
      fullscreenButtonRef.current.focus();
    }
    if (showExitAuth && passwordInputRef.current) {
      passwordInputRef.current?.input?.focus();
    }
  }, [showFullscreenPrompt, showExitAuth]);


  const { cashmaticActions } = useCashmatic();
  useEffect(() => {
    usePOSStore.getState().checkCanProvideCash(cashmaticActions);
  }, []);


  if (isVerticalLayout) {
    return <VerticalPOSScreen />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Fullscreen Entry Modal - Only show if not already in fullscreen */}
      {!screenfull.isFullscreen && (
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
      )}

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
