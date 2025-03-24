# trixapos/api/sales_invoice.py

import frappe, json

@frappe.whitelist()
def create_sales_invoice(data):
    """
    This endpoint creates a Sales Invoice in draft (unsubmitted) state.
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
    The Sales Invoice is created with docstatus = 0 (draft) and is not submitted.
    Returns a JSON object with a "success" flag and the Sales Invoice's name (which is used as the invoice ID).
    """
    try:
        # Parse the incoming JSON payload.
        invoice_data = json.loads(data)
        
        # Create a new Sales Invoice document in draft state.
        sales_invoice = frappe.get_doc({
            "doctype": "Sales Invoice",
            "customer": invoice_data.get("customer", "Guest Customer"),
            "posting_date": frappe.utils.nowdate(),
            # "due_date": invoice_data.get("timestamp"),
            "due_date": frappe.utils.add_days(frappe.utils.nowdate(), 30),  # Default due date to 30 days from now
            # "set_warehouse": "Goods In Transit - NSD",
            "company": "Nxgen solutions (Demo)", # Default value for now
            "items": [
                {
                    "item_code": item.get("item_code"),
                    "income_account": "4110 - Sales - NSD",
                    "cost_center": "Main - NSD",
                    "qty": item.get("qty"),
                    "rate": item.get("amount") if item.get("amount") else 0,
                    "base_rate": item.get("amount") if item.get("amount") else 0,
                    "amount": item.get("amount") if item.get("amount") else 0,
                    "base_amount": item.get("amount") if item.get("amount") else 0,
                    "discount_percentage": item.get("discount", 0)
                }
                for item in invoice_data.get("items", [])
            ],
            "base_net_total": invoice_data.get("total"),
            "base_grand_total": invoice_data.get("total"),
            "grand_total": invoice_data.get("total"),
            # "custom_note": invoice_data.get("note", ""),
            "status": invoice_data.get("status", "Paid") #create paid invoice for now only
            # Do not call submit() so that the document remains a draft.
        })
        sales_invoice.insert(ignore_permissions=True)
        frappe.db.commit()
        return {"success": True, "name": sales_invoice.name}
    except Exception as e:
        frappe.log_error(title="create_sales_invoice Error", message=str(e))
        return {"success": False, "error": str(e)}

@frappe.whitelist()
def cancel_invoice(data):
    """
    This endpoint cancels a Sales Invoice.
    It expects a JSON string payload with the key:
      - invoice_id: (string) The Sales Invoice's name (ID).
    For submitted invoices (docstatus = 1), it uses the built‑in cancellation method.
    For draft invoices, it updates the Sales Invoice's status to "Cancelled".
    Returns a JSON object with a "success" flag.
    """
    try:
        # Parse the incoming JSON payload.
        payload = json.loads(data)
        invoice_id = payload.get("invoice_id")
        if not invoice_id:
            return {"success": False, "error": "Invoice ID is missing."}
        
        # Fetch the Sales Invoice document from ERPNext.
        sales_invoice = frappe.get_doc("Sales Invoice", invoice_id)
        
        # If the invoice is submitted (docstatus = 1), cancel it.
        if sales_invoice.docstatus == 1:
            sales_invoice.cancel()
        else:
            # For draft invoices, update the Sales Invoice's status to "Cancelled".
            # (Alternatively, you might delete them if that fits your business logic.)
            sales_invoice.db_set("status", "Cancelled")
        
        frappe.db.commit()
        return {"success": True}
    except Exception as e:
        frappe.log_error(title="cancel_invoice Error", message=str(e))
        return {"success": False, "error": str(e)}


@frappe.whitelist()
def get_all_sales_invoices():
    """
    This endpoint retrieves all Sales Invoices.
    Returns a JSON object with a "success" flag and a list of Sales Invoices.
    """
    try:
        # Fetch all Sales Invoice documents from ERPNext.
        sales_invoices = frappe.get_all("Sales Invoice", fields=["title", "customer", "posting_date", "due_date", "grand_total", "status"])
        return {"success": True, "sales_invoices": sales_invoices}
    except Exception as e:
        frappe.log_error(title="get_all_sales_invoices Error", message=str(e))
        return {"success": False, "error": str(e)}
