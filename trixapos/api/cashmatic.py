import frappe
from frappe import _

@frappe.whitelist()
def get_cashmatic_denominations():   #didn't use it yet
    """
    Fetches all denominations and their counts from the Cashmatic Denominations doctype.

    Returns:
        dict: A dictionary with denominations as keys and their counts as values.
    """
    try:
        # Fetch all records from the Cashmatic Denominations doctype
        denominations = frappe.get_all(
            "Cashmatic Denominations",
            fields=["denomination", "quantity"]
        )

        # Organize the data into a dictionary
        result = [{"denomination": d["denomination"], "quantity": d["quantity"]} for d in denominations]

        return result
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Error fetching Cashmatic Denominations"))
        frappe.throw(_("An error occurred while fetching denominations. Please check the logs."))

import frappe, json

@frappe.whitelist()
def set_cashmatic_denominations(data):
    """
    Sets the denominations and their counts in the Cashmatic Denominations doctype.

    Args:
        denominations (dict): A dictionary containing a key "data" which is a list of dictionaries with denomination and quantity.
    """
    try:
        # Map specific denominations to desired values
        denomination_map = {
            # 2: 0.02,
            # 5: 0.05,
            # 10: 0.1,
            # 20: 0.2,
            # 50: 0.5,
            100: 1,
            500: 5,
            1000: 10,
            2000: 20,
            5000: 50
        }

        denominations = json.loads(data)


        # Update or insert records
        for denomination in denominations:
            value = denomination.get("value")
            if value in denomination_map:
                mapped_value = denomination_map[value]
                existing_doc = frappe.get_all(
                    "Cashmatic Denominations",
                    filters={"denomination": mapped_value},
                    fields=["name"]
                )
                if existing_doc:
                    # Update existing record
                    frappe.db.set_value(
                        "Cashmatic Denominations",
                        existing_doc[0]["name"],
                        "quantity",
                        denomination.get("level", 0)
                    )
                else:
                    # Insert new record
                    doc = frappe.get_doc({
                        "doctype": "Cashmatic Denominations",
                        "denomination": mapped_value,
                        "quantity": denomination.get("level", 0)
                    })
                    doc.insert()

        frappe.db.commit()
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), _("Error setting Cashmatic Denominations"))
        frappe.throw(_("An error occurred while setting denominations. Please check the logs."))