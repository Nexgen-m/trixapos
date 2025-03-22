# trixapos/api/sales_order.py

import frappe, json

@frappe.whitelist()
def create_draft_sales_order(data):
    """
    This endpoint creates a Sales Order in draft (unsubmitted) state.
    It expects a JSON string payload with the following keys:
      - customer: (string) The customer name.
      - total: (number) The total amount.
      - note: (string, optional) A custom note.
      - items: (list) A list of items; each item should be a dict containing:
          - item_code: (string)
          - qty: (number)
          - rate: (number, optional) -- defaults to 0 if not provided.
          - discount: (number, optional) -- percentage discount, defaults to 0.
      - timestamp: (number) Provided for reference (not used in ERPNext).
    The Sales Order is created with docstatus = 0 (draft) and is not submitted.
    Returns a JSON object with a "success" flag and the Sales Order's name (which is used as the order ID).
    """
    try:
        # Parse the incoming JSON payload.
        order_data = json.loads(data)
        
        # Create a new Sales Order document in draft state.
        sales_order = frappe.get_doc({
            "doctype": "Sales Order",
            "customer": order_data.get("customer", "Guest Customer"),
            "transaction_date": frappe.utils.nowdate(),
            # "delivery_date": order_data.get("timestamp"),
            "delivery_date": frappe.utils.nowdate(),
            "set_warehouse": "Goods In Transit - NSD",
            "items": [
                {
                    "item_code": item.get("item_code"),
                    "qty": item.get("qty"),
                    "rate": item.get("rate") if item.get("rate") else 0,
                    "discount_percentage": item.get("discount", 0)
                }
                for item in order_data.get("items", [])
            ],
            "total": order_data.get("total"),
            "custom_note": order_data.get("note", "")
            # Do not call submit() so that the document remains a draft.
        })
        sales_order.insert(ignore_permissions=True)
        frappe.db.commit()
        return {"success": True, "name": sales_order.name}
    except Exception as e:
        frappe.log_error(title="create_draft_sales_order Error", message=str(e))
        return {"success": False, "error": str(e)}

@frappe.whitelist()
def cancel_order(data):
    """
    This endpoint cancels a Sales Order.
    It expects a JSON string payload with the key:
      - order_id: (string) The Sales Order's name (ID).
    For submitted orders (docstatus = 1), it uses the built‑in cancellation method.
    For draft orders, it updates the Sales Order's status to "Cancelled".
    Returns a JSON object with a "success" flag.
    """
    try:
        # Parse the incoming JSON payload.
        payload = json.loads(data)
        order_id = payload.get("order_id")
        if not order_id:
            return {"success": False, "error": "Order ID is missing."}
        
        # Fetch the Sales Order document from ERPNext.
        sales_order = frappe.get_doc("Sales Order", order_id)
        
        # If the order is submitted (docstatus = 1), cancel it.
        if sales_order.docstatus == 1:
            sales_order.cancel()
        else:
            # For draft orders, update the Sales Order's status to "Cancelled".
            # (Alternatively, you might delete them if that fits your business logic.)
            sales_order.db_set("status", "Cancelled")
        
        frappe.db.commit()
        return {"success": True}
    except Exception as e:
        frappe.log_error(title="cancel_order Error", message=str(e))
        return {"success": False, "error": str(e)}
