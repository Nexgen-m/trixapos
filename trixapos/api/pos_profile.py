import frappe

@frappe.whitelist()
def get_pos_profile():
    """
    Fetch the POS Profile linked to the logged-in user
    """
    try:
        user = frappe.session.user
        pos_profile = frappe.get_value("POS Profile", {"user": user}, "name")

        if not pos_profile:
            return {"success": False, "error": "No POS Profile assigned to this user."}

        profile_data = frappe.get_doc("POS Profile", pos_profile)

        return {
            "success": True,
            "pos_profile": {
                "name": profile_data.name,
                "warehouse": profile_data.warehouse,
                "customer_group": profile_data.customer_group,
                "price_list": profile_data.selling_price_list,
                "cost_center": profile_data.cost_center,
                "taxes_and_charges": profile_data.taxes_and_charges,
                "allow_discount": profile_data.allow_user_to_edit_discount,
                "allow_price_change": profile_data.allow_user_to_edit_rate,
            },
        }

    except Exception as e:
        frappe.log_error(f"Error fetching POS Profile: {str(e)}", "POS Profile API Error")
        return {"success": False, "error": str(e)}
