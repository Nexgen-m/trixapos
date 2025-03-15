# import frappe
# from frappe import _

# @frappe.whitelist()
# def get_pos_profile():
#     """
#     Fetch the POS Profile assigned to the logged-in user.
#     """
#     try:
#         user = frappe.session.user
#         frappe.logger().info(f"🔹 Current Logged-in User: {user}")
#         # Fetch assigned POS Profile
#         pos_profiles = frappe.get_all("POS Profile", 
#                                       filters={"user": user}, 
#                                       fields=["name", 
#                                               "disabled",  # Add the disabled field
#                                               "allow_user_to_edit_additional_discount", 
#                                               "max_discount_percentage_allowed",
#                                               "allow_discount_change",
#                                               "allow_rate_change"])
        
#         if not pos_profiles:
#             frappe.logger().warning("❌ No POS Profile found for this user.")
#             return {"success": False, "error": "No POS Profile assigned to this user."}
        
#         profile_data = pos_profiles[0]
        
#         # Check if profile is disabled
#         if profile_data.get("disabled", 0) == 1:
#             frappe.logger().warning(f"❌ POS Profile {profile_data['name']} is disabled.")
#             return {"success": False, "error": "Your assigned POS Profile is disabled. Please contact your administrator."}
        
#         frappe.logger().info(f"✅ POS Profile Found: {profile_data['name']}")
#         frappe.logger().info(f"🔹 Max Discount Allowed: {profile_data.get('max_discount_percentage_allowed', 'Not Found')}")
#         frappe.logger().info(f"🔹 Allow Discount Change: {profile_data.get('allow_discount_change', False)}")
#         frappe.logger().info(f"🔹 Allow Price Change: {profile_data.get('allow_rate_change', False)}")
        
#         response = {
#             "success": True,
#             "pos_profile": {
#                 "name": profile_data["name"],
#                 "disabled": profile_data.get("disabled", 0),
#                 "allow_additional_discount": profile_data.get("allow_user_to_edit_additional_discount", False),
#                 "max_discount_percentage_allowed": profile_data.get("max_discount_percentage_allowed", 0),
#                 "allow_discount_change": profile_data.get("allow_discount_change", False),
#                 "allow_rate_change": profile_data.get("allow_rate_change", False),
#             },
#         }
        
#         frappe.logger().info(f"🔹 API Response: {response}")
#         return response
#     except Exception as e:
#         frappe.log_error(f"❌ Error fetching POS Profile: {str(e)}", "POS Profile API Error")
#         return {"success": False, "error": str(e)}


import frappe
from frappe import _

# Constants for field names
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
                                      fields=["name", 
                                              "disabled", 
                                              "allow_user_to_edit_additional_discount", 
                                              "max_discount_percentage_allowed",
                                              "allow_discount_change",
                                              "allow_rate_change",
                                              CUSTOM_ENABLE_COMPACT_MODE_OPTION,
                                              CUSTOM_DISPLAY_MODE])

        if not pos_profiles:
            frappe.logger().warning(f"❌ No POS Profile found for user: {user}.")
            return {"success": False, "error": f"No POS Profile assigned to user: {user}."}

        profile_data = pos_profiles[0]

        # Check if profile is disabled
        if profile_data.get("disabled", 0) == 1:
            frappe.logger().warning(f"❌ POS Profile {profile_data['name']} is disabled.")
            return {"success": False, "error": "Your assigned POS Profile is disabled. Please contact your administrator."}

        frappe.logger().info(f"✅ POS Profile Found: {profile_data['name']}")

        response = {
            "success": True,
            "pos_profile": {
                "name": profile_data["name"],
                "disabled": profile_data.get("disabled", 0),
                "allow_additional_discount": profile_data.get("allow_user_to_edit_additional_discount", False),
                "max_discount_percentage_allowed": profile_data.get("max_discount_percentage_allowed", 0),
                "allow_discount_change": profile_data.get("allow_discount_change", False),
                "allow_rate_change": profile_data.get("allow_rate_change", False),
                CUSTOM_ENABLE_COMPACT_MODE_OPTION: profile_data.get(CUSTOM_ENABLE_COMPACT_MODE_OPTION, False),
                CUSTOM_DISPLAY_MODE: profile_data.get(CUSTOM_DISPLAY_MODE, "Full Mode"),
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