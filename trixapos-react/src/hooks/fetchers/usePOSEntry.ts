//✅ This hook fetches the active POS session and checks if it's open.

import { useFrappeGetCall } from "frappe-react-sdk";

export function usePOSEntry() {
  const { data, error, isLoading } = useFrappeGetCall(
    "trixapos.api.pos_opening_entry.get_active_session"
  );

  console.log("🔹 Active POS Session:", data || "No session found");

  return {
    hasSession: Boolean(data?.message?.session_open),
    isLoading,
    error,
  };
}
