// import { useFrappeGetCall } from "frappe-react-sdk";

// export function usePOSProfile() {
//   const { data, error, isLoading } = useFrappeGetCall(
//     "trixapos.api.pos_profile.get_pos_profile"
//   );

//   console.log("🔹 Full API Response:", data || "No data received"); // ✅ Prevent undefined logs

//   if (error) {
//     console.error("❌ Error Fetching POS Profile:", error);
//   }

//   const canEditAdditionalDiscount = Boolean(data?.message?.pos_profile?.allow_additional_discount);
//   const maxDiscountAllowed = data?.message?.pos_profile?.max_discount_percentage_allowed ?? 0;
//   const canEditItemDiscount = Boolean(data?.message?.pos_profile?.allow_discount_change); // ✅ New field
//   const canEditItemPrice = Boolean(data?.message?.pos_profile?.allow_rate_change); // ✅ New field

//   return {
//     posProfile: data?.message?.pos_profile || null,
//     canEditAdditionalDiscount,
//     maxDiscountAllowed,
//     canEditItemDiscount, // ✅ Return the new field
//     canEditItemPrice, // ✅ Return the new field
//     isLoading,
//     error,
//   };
// }

import { useFrappeGetCall } from "frappe-react-sdk";

export function usePOSProfile() {
  const { data, error, isLoading } = useFrappeGetCall(
    "trixapos.api.pos_profile.get_pos_profile"
  );

  console.log("🔹 Full API Response:", data || "No data received");
  
  if (error) {
    console.error("❌ Error Fetching POS Profile:", error);
  }

  // Determine if there's an error in the API response itself
  const apiError = !data?.message?.success ? data?.message?.error || "No POS profile found" : null;
  
  const posProfile = data?.message?.success ? data?.message?.pos_profile : null;
  
  const canEditAdditionalDiscount = Boolean(posProfile?.allow_additional_discount);
  const maxDiscountAllowed = posProfile?.max_discount_percentage_allowed ?? 0;
  const canEditItemDiscount = Boolean(posProfile?.allow_discount_change);
  const canEditItemPrice = Boolean(posProfile?.allow_rate_change);

  return {
    posProfile,
    canEditAdditionalDiscount,
    maxDiscountAllowed,
    canEditItemDiscount,
    canEditItemPrice,
    isLoading,
    error: error || apiError, // Combine external and API errors
  };
}