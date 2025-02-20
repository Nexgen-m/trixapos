import frappe
from frappe import whitelist

@whitelist(allow_guest=True)  # Set to False if only for authenticated users
def get_customers(limit=50, search_term=None):
    """Fetch limited customer data with optional search filter and sort alphabetically"""
    filters = {}

    # Apply search filter if provided
    if search_term:
        filters["customer_name"] = ["like", f"%{search_term}%"]

    try:
        # Fetch customer data with alphabetical ordering
        customers = frappe.get_all(
            "Customer",
            filters=filters,
            fields=["name", "customer_name", "territory", "customer_group"],
            limit_page_length=limit,
            order_by="customer_name asc"  # ✅ Sort alphabetically
        )
        return {"customers": customers}

    except Exception as e:
        frappe.log_error(f"Error fetching customers: {str(e)}", "Custom API Error")
        return {"error": str(e)}
