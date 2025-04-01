import frappe
from frappe import _

# # Constants for field names
CUSTOM_ENABLE_COMPACT_MODE_OPTION = "custom_enable_compact_mode_option"
CUSTOM_DISPLAY_MODE = "custom_display_mode"

@frappe.whitelist()
def get_pos_profile():
    """
    Fetch the POS Profile assigned to the logged-in user.

    Returns:
        dict: A dictionary containing:
            - success (bool): Whether the operation was successful.
            - pos_profile (dict): The POS Profile data if successful.
            - error (str): Error message if unsuccessful.
    """
    try:
        user = frappe.session.user
        frappe.logger().info(f"🔹 Current Logged-in User: {user}")

        # Fetch assigned POS Profile
        pos_profiles = frappe.get_all("POS Profile", 
                                      filters={"user": user}, 
                                      fields=[
                                          "name", 
                                          "disabled", 
                                          "custom_allow_user_to_edit_order_discount", 
                                          "max_discount_percentage_allowed",
                                          "allow_discount_change",
                                          "allow_rate_change",
                                          "custom_enable_compact_mode_option",
                                          "custom_display_mode",
                                          "custom_enable_recent_orders",
                                          "custom_show_form_view",
                                          "custom_enable_save_as_draft",
                                          "custom_enable_display_settings",
                                          "custom_enable_close_pos",
                                          "custom_show_subcategories",  # Add this field
                                          "custom_enable_use_add_new_customer",
                                          "custom_enable_fullscreen_mode",
                                          "custom_enable_user_choose_full_screen_mode",
                                          "custom_allow_item_discount",
                                      ])

        if not pos_profiles:
            frappe.logger().warning(f"❌ No POS Profile found for user: {user}.")
            return {"success": False, "error": f"No POS Profile assigned to user: {user}."}

        profile_data = pos_profiles[0]

        # Check if profile is disabled
        if profile_data.get("disabled", 0) == 1:
            frappe.logger().warning(f"❌ POS Profile {profile_data['name']} is disabled.")
            return {"success": False, "error": "Your assigned POS Profile is disabled. Please contact your administrator."}

        # Fetch payment methods linked to the POS Profile
        payment_methods = frappe.get_all("POS Payment Method",
                                         filters={"parent": profile_data["name"]},
                                         fields=["mode_of_payment", "default"])

        # Process payments into structured response
        processed_payments = [{
            "id": method["mode_of_payment"].lower().replace(" ", "_"),
            "name": method["mode_of_payment"],
            "default": method["default"]
        } for method in payment_methods]

        # Get the default payment method
        default_payment = next((p["id"] for p in processed_payments if p["default"]), "cash")


        frappe.logger().info(f"✅ POS Profile Found: {profile_data['name']}")

        response = {
            "success": True,
            "pos_profile": {
                "name": profile_data["name"],
                "disabled": profile_data.get("disabled", 0),
                "custom_allow_user_to_edit_order_discount": profile_data.get("custom_allow_user_to_edit_order_discount", False),
                "max_discount_percentage_allowed": profile_data.get("max_discount_percentage_allowed", 0),
                "allow_discount_change": profile_data.get("allow_discount_change", False),
                "allow_rate_change": profile_data.get("allow_rate_change", False),
                "custom_enable_compact_mode_option": profile_data.get("custom_enable_compact_mode_option", False),
                "custom_display_mode": profile_data.get("custom_display_mode", "Full Mode"),
                "custom_enable_recent_orders": profile_data.get("custom_enable_recent_orders", False),
                "custom_show_form_view": profile_data.get("custom_show_form_view", False),
                "custom_enable_save_as_draft": profile_data.get("custom_enable_save_as_draft", False),
                "custom_enable_display_settings": profile_data.get("custom_enable_display_settings", False),
                "custom_enable_close_pos": profile_data.get("custom_enable_close_pos", False),
                "custom_show_subcategories": profile_data.get("custom_show_subcategories", False),  # Add this field
                "custom_show_subcategories": profile_data.get("custom_show_subcategories", False),  # Add this field
                "custom_enable_use_add_new_customer": profile_data.get("custom_enable_use_add_new_customer", False),  # Add this field
                "custom_enable_fullscreen_mode": profile_data.get("custom_enable_fullscreen_mode", False),  # Add this field
                "custom_enable_user_choose_full_screen_mode": profile_data.get("custom_enable_user_choose_full_screen_mode", False),  # Add this field
                "payments": processed_payments,
                "default_payment_method": default_payment,
                "custom_allow_item_discount": profile_data.get("custom_allow_item_discount", 0),
                
            },
        }

        return response
    except Exception as e:
        frappe.log_error(f"❌ Error fetching POS Profile: {str(e)}", "POS Profile API Error")
        return {"success": False, "error": str(e)}
    
@frappe.whitelist()
def update_custom_display_mode(pos_profile_name: str, display_mode: str):
    """
    Update the custom_display_mode field in the POS Profile.

    Args:
        pos_profile_name (str): The name of the POS Profile.
        display_mode (str): The display mode to set. Must be "Full Mode" or "Compact Mode".

    Returns:
        dict: A dictionary containing:
            - success (bool): Whether the operation was successful.
            - error (str): Error message if unsuccessful.
    """
    try:
        if not pos_profile_name or not display_mode:
            frappe.logger().error("❌ POS Profile name or display mode is missing.")
            return {"success": False, "error": "POS Profile name or display mode is missing."}

        # Validate display_mode
        if display_mode not in ["Full Mode", "Compact Mode"]:
            frappe.logger().error(f"❌ Invalid display mode: {display_mode}")
            return {"success": False, "error": "Invalid display mode. Must be 'Full Mode' or 'Compact Mode'."}

        # Update the custom_display_mode field
        frappe.db.set_value("POS Profile", pos_profile_name, CUSTOM_DISPLAY_MODE, display_mode)
        frappe.logger().info(f"✅ Updated custom_display_mode to {display_mode} for POS Profile {pos_profile_name}.")

        return {"success": True}
    except Exception as e:
        frappe.log_error(f"❌ Error updating custom_display_mode: {str(e)}", "Update POS Profile Error")
        return {"success": False, "error": str(e)}