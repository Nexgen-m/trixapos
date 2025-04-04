import React, { useState, useEffect, useRef } from "react";
import { ItemList } from "../components/ItemList";
import { ItemSearch } from "../components/ItemSearch";
import { CustomerSelector } from "../components/CustomerSelector";
import { usePOSStore } from "@/hooks/Stores/usePOSStore";
import { VerticalPOSScreen } from "./VerticalPOSScreen";
import { usePOSProfile } from "@/hooks/fetchers/usePOSProfile";
import screenfull from "screenfull";
import { Modal, Button, InputRef, message } from "antd";
import { useCashmatic } from "@/hooks/fetchers/useCashmatic";

export function POSScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const { isVerticalLayout, isFullScreenMode, setIsFullScreenMode } = usePOSStore();
  const { FullScreenMode } = usePOSProfile();
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const fullscreenButtonRef = useRef<HTMLButtonElement>(null);
  const escPressedRef = useRef(false);

  // 1. Fullscreen prompt on load
  useEffect(() => {
    if (FullScreenMode && screenfull.isEnabled && !screenfull.isFullscreen) {
      setShowFullscreenPrompt(true);
    }
  }, [FullScreenMode]);

  // 2. Block browser tab/window close
  useEffect(() => {
    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      if (screenfull.isFullscreen) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () => window.removeEventListener("beforeunload", beforeUnloadHandler);
  }, []);

  // 3. Handle ESC, F11, Ctrl+W, etc. + Fullscreen change protection
  useEffect(() => {
    if (!screenfull.isEnabled || !FullScreenMode) return;

    const handleFullscreenChange = () => {
      if (!screenfull.isFullscreen) {
        setShowFullscreenPrompt(true);
        screenfull.request().catch((err) => {
          console.error("Failed to re-enter fullscreen:", err);
        });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const forbiddenKeys = ["Escape", "F11"];
      const isCtrlW = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "w";

      if (forbiddenKeys.includes(e.key) || isCtrlW) {
        e.preventDefault();
        e.stopPropagation();
        if (!escPressedRef.current) {
          escPressedRef.current = true;
          setShowFullscreenPrompt(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
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
  }, [FullScreenMode]);

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

  // Focus button when alert shows
  useEffect(() => {
    if (showFullscreenPrompt && fullscreenButtonRef.current) {
      fullscreenButtonRef.current.focus();
    }
  }, [showFullscreenPrompt]);

  const { cashmaticActions } = useCashmatic();
  useEffect(() => {
    usePOSStore.getState().checkCanProvideCash(cashmaticActions);
  }, []);

  if (isVerticalLayout) {
    return <VerticalPOSScreen />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Fullscreen Entry Alert */}
      {showFullscreenPrompt && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <p className="text-lg mb-4">POS system requires fullscreen mode to operate.</p>
            <Button
              type="primary"
              size="large"
              onClick={enterFullscreen}
              ref={fullscreenButtonRef}
              style={{ width: "100%", height: "50px" }}
            >
              ENTER FULLSCREEN MODE
            </Button>
          </div>
        </div>
      )}

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
