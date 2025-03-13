//✅ This screen ensures users must enter an opening balance before accessing POS.
import { useState } from "react";
import { useFrappePostCall } from "frappe-react-sdk";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function POSOpening() {
  const [openingCash, setOpeningCash] = useState(0);
  const { call } = useFrappePostCall("trixapos.api.pos_opening_entry.open_pos_session");
  const navigate = useNavigate();

  const handleOpenSession = async () => {
    if (openingCash <= 0) {
      toast.error("❌ Opening cash must be greater than 0.");
      return;
    }

    const response = await call({ opening_cash: openingCash });

    if (response.success) {
      toast.success("✅ POS Session Opened!");
      navigate("/pos");
    } else {
      toast.error("❌ Error opening session.");
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <h2 className="text-xl font-semibold">Open POS Session</h2>
      <input
        type="number"
        value={openingCash}
        onChange={(e) => setOpeningCash(Number(e.target.value))}
        className="border p-2 rounded-md"
        placeholder="Enter Opening Cash"
      />
      <button
        onClick={handleOpenSession}
        className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-md mt-4"
      >
        Open Session
      </button>
    </div>
  );
}
