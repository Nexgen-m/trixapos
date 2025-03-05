import { useFrappeGetCall } from "frappe-react-sdk";

export function usePOSProfile() {
  const { data, error, isLoading } = useFrappeGetCall(
    "trixapos.api.pos_profile.get_pos_profile"
  );

  return {
    posProfile: data?.message?.pos_profile || null,
    isLoading,
    error,
    fetch,
  };
}
