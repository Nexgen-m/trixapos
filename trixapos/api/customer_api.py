import frappe

@frappe.whitelist()
def get_customers(limit=50, search_term=None):
    """Fetch customer details with optional search filter and sorting"""
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

@frappe.whitelist()
def get_customer_meta():
    """Fetch Customer doctype meta"""
    try:
        meta = frappe.get_meta("Customer")
        return {
            "mandatoryFields": [field.fieldname for field in meta.fields if field.reqd],
            "customer_type_options": meta.get_field("customer_type").options.split("\n"),
            "customer_group_options": meta.get_field("customer_group").options.split("\n"),
        }
    except Exception as e:
        frappe.log_error(f"Error fetching Customer meta: {str(e)}", "Customer Meta API Error")
        return {"error": str(e)}
    
@frappe.whitelist()
def get_customer_groups():
    """Fetch all customer groups from the Customer Group doctype"""
    try:
        customer_groups = frappe.get_all(
            "Customer Group",
            fields=["name"],
            order_by="name asc"
        )
        return {"customer_groups": [group.name for group in customer_groups]}
    except Exception as e:
        frappe.log_error(f"Error fetching customer groups: {str(e)}", "Customer Group API Error")
        return {"error": str(e)}
    
@frappe.whitelist()
def create_customer(customer_name, customer_type, customer_group):
    """Create a new Customer record."""
    try:
        # Check if the customer already exists
        if frappe.db.exists("Customer", {"customer_name": customer_name}):
            return {"error": "Customer already exists."}

        # Create a new Customer document
        doc = frappe.get_doc({
            "doctype": "Customer",
            "customer_name": customer_name,
            "customer_type": customer_type,
            "customer_group": customer_group,
        })
        doc.insert(ignore_permissions=True)  # Insert the document, bypassing permission checks if necessary
        return {"message": "Customer created successfully", "name": doc.name}
    except Exception as e:
        frappe.log_error(f"Error creating customer: {str(e)}", "Customer Creation Error")
        return {"error": str(e)}