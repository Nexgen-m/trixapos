import frappe
from frappe.utils import flt

@frappe.whitelist(allow_guest=True)
def get_items(page=1, page_size=50, search_term=None, category=None):
    """Fetch active items with price, stock, search, and pagination"""
    try:
        # Pagination Logic
        page = int(page)
        page_size = int(page_size)
        offset = (page - 1) * page_size

        # Filters: Only active items
        filters = {"disabled": 0}
        if search_term:
            filters["item_name"] = ["like", f"%{search_term}%"]
        if category:
            filters["item_group"] = category

        # ✅ Get total item count first (for correct pagination)
        total_items = frappe.db.count("Item", filters=filters)

        # Fetch Items with Pagination
        items = frappe.get_all(
            "Item",
            fields=["name", "item_name", "item_code", "image", "description", "is_stock_item"],
            filters=filters,
            start=offset,
            page_length=page_size,
            order_by="item_name asc"
        )

        # Add price & stock details to each item
        for item in items:
            # Fetch Price from Item Price
            item_price = frappe.db.get_value(
                "Item Price",
                {"item_code": item["item_code"], "selling": 1},
                "price_list_rate"
            )
            item["price_list_rate"] = flt(item_price) if item_price else 0

            # Fetch Stock Quantity
            item["stock_qty"] = get_stock_qty(item["item_code"]) if item["is_stock_item"] else 0

        # ✅ Determine if there is a next page
        has_next = offset + len(items) < total_items
        next_page = page + 1 if has_next else None

        # ✅ Return structured response
        return {
            "items": items,
            "total_items": total_items,
            "current_page": page,
            "next_page": next_page
        }

    except Exception as e:
        frappe.log_error(f"Error fetching items: {str(e)}", "Item API Error")
        return frappe._dict({"error": str(e)})

def get_stock_qty(item_code):
    """Get available stock for an item from Bin"""
    bin_data = frappe.get_all(
        "Bin",
        filters={"item_code": item_code},
        fields=["actual_qty", "warehouse"]
    )
    return sum(bin["actual_qty"] for bin in bin_data) if bin_data else 0
