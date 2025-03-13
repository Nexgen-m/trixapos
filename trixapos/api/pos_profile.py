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
#                                               "allow_user_to_edit_additional_discount", 
#                                               "max_discount_percentage_allowed",
#                                               "allow_discount_change",  # ✅ Fetch permission for discount edit
#                                               "allow_rate_change"])  # ✅ Fetch permission for price edit

#         if not pos_profiles:
#             frappe.logger().warning("❌ No POS Profile found for this user.")
#             return {"success": False, "error": "No POS Profile assigned to this user."}

#         profile_data = pos_profiles[0]  # ✅ Get the first assigned POS Profile

#         frappe.logger().info(f"✅ POS Profile Found: {profile_data['name']}")
#         frappe.logger().info(f"🔹 Max Discount Allowed: {profile_data.get('max_discount_percentage_allowed', 'Not Found')}")
#         frappe.logger().info(f"🔹 Allow Discount Change: {profile_data.get('allow_discount_change', False)}")
#         frappe.logger().info(f"🔹 Allow Price Change: {profile_data.get('allow_rate_change', False)}")

#         response = {
#             "success": True,
#             "pos_profile": {
#                 "name": profile_data["name"],
#                 "allow_additional_discount": profile_data.get("allow_user_to_edit_additional_discount", False),
#                 "max_discount_percentage_allowed": profile_data.get("max_discount_percentage_allowed", 0),
#                 "allow_discount_change": profile_data.get("allow_discount_change", False),  # ✅ Return value
#                 "allow_rate_change": profile_data.get("allow_rate_change", False),  # ✅ Return value
#             },
#         }

#         frappe.logger().info(f"🔹 API Response: {response}")  # ✅ Log full response

#         return response

#     except Exception as e:
#         frappe.log_error(f"❌ Error fetching POS Profile: {str(e)}", "POS Profile API Error")
#         return {"success": False, "error": str(e)}

import frappe
from frappe import _

@frappe.whitelist()
def get_pos_profile():
    """
    Fetch the POS Profile assigned to the logged-in user.
    """
    try:
        user = frappe.session.user
        frappe.logger().info(f"🔹 Current Logged-in User: {user}")
        # Fetch assigned POS Profile
        pos_profiles = frappe.get_all("POS Profile", 
                                      filters={"user": user}, 
                                      fields=["name", 
                                              "disabled",  # Add the disabled field
                                              "allow_user_to_edit_additional_discount", 
                                              "max_discount_percentage_allowed",
                                              "allow_discount_change",
                                              "allow_rate_change"])
        
        if not pos_profiles:
            frappe.logger().warning("❌ No POS Profile found for this user.")
            return {"success": False, "error": "No POS Profile assigned to this user."}
        
        profile_data = pos_profiles[0]
        
        # Check if profile is disabled
        if profile_data.get("disabled", 0) == 1:
            frappe.logger().warning(f"❌ POS Profile {profile_data['name']} is disabled.")
            return {"success": False, "error": "Your assigned POS Profile is disabled. Please contact your administrator."}
        
        frappe.logger().info(f"✅ POS Profile Found: {profile_data['name']}")
        frappe.logger().info(f"🔹 Max Discount Allowed: {profile_data.get('max_discount_percentage_allowed', 'Not Found')}")
        frappe.logger().info(f"🔹 Allow Discount Change: {profile_data.get('allow_discount_change', False)}")
        frappe.logger().info(f"🔹 Allow Price Change: {profile_data.get('allow_rate_change', False)}")
        
        response = {
            "success": True,
            "pos_profile": {
                "name": profile_data["name"],
                "disabled": profile_data.get("disabled", 0),
                "allow_additional_discount": profile_data.get("allow_user_to_edit_additional_discount", False),
                "max_discount_percentage_allowed": profile_data.get("max_discount_percentage_allowed", 0),
                "allow_discount_change": profile_data.get("allow_discount_change", False),
                "allow_rate_change": profile_data.get("allow_rate_change", False),
            },
        }
        
        frappe.logger().info(f"🔹 API Response: {response}")
        return response
    except Exception as e:
        frappe.log_error(f"❌ Error fetching POS Profile: {str(e)}", "POS Profile API Error")
        return {"success": False, "error": str(e)}