import frappe
from frappe.utils import flt, today

@frappe.whitelist(allow_guest=True)
def get_items():
    """Fetch all active items, including stock and price details"""
    try:
        # Fetch all active items
        items = frappe.get_all(
            "Item",
            fields=["name", "item_name", "item_code", "image", "description", "is_stock_item"],
            filters={"disabled": 0},  # Exclude disabled items only
            limit_page_length=50
        )

        # Fetch price and stock details for each item
        for item in items:
            # Fetch price from `Item Price`
            item_price = frappe.db.get_value(
                "Item Price", 
                {"item_code": item["item_code"], "selling": 1}, 
                "price_list_rate"
            )
            item["price_list_rate"] = flt(item_price) if item_price else 0  # Default to 0 if no price found

            # Get stock quantity from `Bin`
            if item["is_stock_item"]:
                item["stock_qty"] = get_stock_qty(item["item_code"])
            else:
                item["stock_qty"] = 0  # Default stock for non-stock items

        return items

    except Exception as e:
        frappe.log_error(f"Error fetching items: {str(e)}", "Nexapos API Error")
        return {"error": str(e)}

def get_stock_qty(item_code):
    """Get available stock for an item from `Bin`"""
    bin_data = frappe.get_all(
        "Bin", 
        filters={"item_code": item_code}, 
        fields=["actual_qty", "warehouse"],
        order_by="actual_qty desc"
    )
    
    # Return total stock quantity
    return sum(bin["actual_qty"] for bin in bin_data) if bin_data else 0
