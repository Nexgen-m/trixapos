import frappe

@frappe.whitelist(allow_guest=True)
def get_customers(limit=50, search_term=None):
    """Fetch customer details with price list information, optional search filter and sorting"""
    filters = {}

    if search_term:
        filters["customer_name"] = ["like", f"%{search_term}%"]

    try:
        customers = frappe.get_all(
            "Customer",
            filters=filters,
            fields=["name", "customer_name", "territory", "customer_group", "default_price_list"],
            limit_page_length=limit,
            order_by="customer_name asc"
        )

        return {"customers": customers}

    except Exception as e:
        frappe.log_error(f"Error fetching customers: {str(e)}", "Customer API Error")
        return {"error": str(e)}