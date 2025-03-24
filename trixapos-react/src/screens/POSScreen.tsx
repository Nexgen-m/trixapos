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



import React, { useState, useEffect } from "react";
import { ItemList } from "../components/ItemList";
import { ItemSearch } from "../components/ItemSearch";
import { CustomerSelector } from "../components/CustomerSelector";
import { usePOSStore } from "@/hooks/Stores/usePOSStore";
import { VerticalPOSScreen } from "./VerticalPOSScreen"; // Import Vertical Screen
import { usePOSProfile } from "@/hooks/fetchers/usePOSProfile"; // Import usePOSProfile hook
import screenfull from "screenfull"; // Import screenfull.js
import { Modal, Button } from "antd"; // Import Modal and Button components

export function POSScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const { isVerticalLayout } = usePOSStore(); // Get layout setting
  const { FullScreenMode } = usePOSProfile(); // Get fullscreen mode setting
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false); // State for showing the prompt

  // Show the fullscreen prompt when the component mounts
  useEffect(() => {
    if (FullScreenMode) {
      setShowFullscreenPrompt(true);
    }
  }, [FullScreenMode]);

  // Function to enter fullscreen mode
  const enterFullscreen = () => {
    if (screenfull.isEnabled) {
      screenfull.request();
      setShowFullscreenPrompt(false); // Hide the prompt after entering fullscreen
    }
  };

  // Dynamically switch between layouts
  if (isVerticalLayout) {
    return <VerticalPOSScreen />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Fullscreen Prompt */}
      {showFullscreenPrompt && (
        <Modal
          title="Enter Fullscreen Mode"
          visible={true}
          onOk={enterFullscreen}
          onCancel={() => {}} // Prevent closing the modal
          closable={false} // Disable closing the modal via the close icon or clicking outside
          footer={[
            <Button
              key="enter-fullscreen"
              type="primary"
              onClick={enterFullscreen}
            >
              Enter Fullscreen
            </Button>,
          ]}
        >
          <p>For the best experience, please enable fullscreen mode.</p>
        </Modal>
      )}

      {/* Search Bar and Customer Selector */}
      <div className="flex gap-6 p-4 bg-white border-b border-gray-200">
        <div className="flex-1">
          <ItemSearch search={searchTerm} onSearch={setSearchTerm} onClear={() => setSearchTerm("")} />
        </div>
        <div className="w-80">
          <CustomerSelector />
        </div>
      </div>

      {/* Items Grid */}
      <div className="flex-1 overflow-hidden">
        <ItemList searchTerm={searchTerm} />
      </div>
    </div>
  );
}

