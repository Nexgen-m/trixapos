import frappe
from frappe import _

@frappe.whitelist()
def get_logged_user():
    """Returns the currently logged-in user."""
    if frappe.session.user:
        return {
            "user": frappe.session.user,
            "full_name": frappe.utils.get_fullname(frappe.session.user),
            "roles": frappe.get_roles(frappe.session.user)
        }
    return {"user": "Guest"}


