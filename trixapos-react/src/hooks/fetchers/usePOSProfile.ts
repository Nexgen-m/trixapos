import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";

export function usePOSProfile() {
  const { data, error, isLoading } = useFrappeGetCall(
    "trixapos.api.pos_profile.get_pos_profile"
  );

  const { call: updateDisplayMode, loading: isUpdating } = useFrappePostCall(
    "trixapos.api.pos_profile.update_custom_display_mode"
  );

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
  const enableCompactModeOption = Boolean(posProfile?.custom_enable_compact_mode_option);
  const customDisplayMode = enableCompactModeOption ? posProfile?.custom_display_mode || "Full Mode" : "Full Mode";  // Default to "Full Mode" if compact mode option is disabled
  const showSubcategories = Boolean(posProfile?.custom_show_subcategories);  // Add this field
  const AddNewCustomer = Boolean(posProfile?.custom_enable_use_add_new_customer);  // Add this field
  // Function to update the custom_display_mode
  const updateCustomDisplayMode = async (displayMode: string) => {
    if (!posProfile?.name) {
      console.error("❌ POS Profile name is missing.");
      return { success: false, error: "POS Profile name is missing." };
    }

    const response = await updateDisplayMode({
      pos_profile_name: posProfile.name,
      display_mode: displayMode,
    });

    if (response.message?.success) {
      console.log("✅ Updated custom_display_mode successfully.");
    } else {
      console.error("❌ Failed to update custom_display_mode:", response.message?.error);
    }

    return response;
  };

  return {
    posProfile,
    canEditAdditionalDiscount,
    maxDiscountAllowed,
    canEditItemDiscount,
    canEditItemPrice,
    enableCompactModeOption,
    customDisplayMode,  // Return the current display mode
    updateCustomDisplayMode,  // Return the update function
    custom_enable_recent_orders: Boolean(posProfile?.custom_enable_recent_orders),
    custom_enable_form_view: Boolean(posProfile?.custom_enable_form_view),
    custom_enable_save_as_draft: Boolean(posProfile?.custom_enable_save_as_draft),
    custom_enable_display_settings: Boolean(posProfile?.custom_enable_display_settings),
    custom_enable_close_pos: Boolean(posProfile?.custom_enable_close_pos),
    showSubcategories,  // Return the showSubcategories flag
    AddNewCustomer,
    payments: posProfile?.payments || [],
    defaultPaymentMethod: posProfile?.default_payment_method || "cash", // ✅ Get the default method
    isLoading,
    isUpdating,
    error: error || apiError, // Combine external and API errors
  };
}