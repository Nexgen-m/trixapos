import frappe
from frappe.utils import flt

@frappe.whitelist(allow_guest=True)
def get_items(page=1, page_size=50, search_term=None, category=None, customer=None):
    """Fetch active items with price (based on customer price list), stock, search, and pagination"""
    try:
        page = int(page)
        page_size = int(page_size)
        offset = (page - 1) * page_size

        filters = {"disabled": 0}
        if search_term:
            filters["item_name"] = ["like", f"%{search_term}%"]
        if category:
            filters["item_group"] = category

        total_items = frappe.db.count("Item", filters=filters)

        items = frappe.get_all(
            "Item",
            fields=["name", "item_name", "item_code", "image", "description", "is_stock_item", "item_group"],
            filters=filters,
            start=offset,
            page_length=page_size,
            order_by="item_name asc"
        )

        # ✅ Determine Customer Price List dynamically
        price_list = get_customer_price_list(customer) if customer else "Standard Selling"

        # Add price & stock details dynamically
        for item in items:
            item_price = frappe.db.get_value(
                "Item Price",
                {"item_code": item["item_code"], "price_list": price_list, "selling": 1},
                "price_list_rate"
            )
            item["price_list_rate"] = flt(item_price) if item_price else 0
            item["stock_qty"] = get_stock_qty(item["item_code"]) if item["is_stock_item"] else 0

        has_next = offset + len(items) < total_items
        next_page = page + 1 if has_next else None

        return {
            "items": items,
            "total_items": total_items,
            "current_page": page,
            "next_page": next_page
        }

    except Exception as e:
        frappe.log_error(f"Error fetching items: {str(e)}", "Item API Error")
        return {"error": str(e)}

def get_customer_price_list(customer):
    """Get the Price List associated with the customer from Pricing Rules or Default Settings"""
    if not customer:
        return "Standard Selling"

    price_list = frappe.db.get_value("Pricing Rule", {"customer": customer}, "price_list")
    
    if not price_list:
        price_list = frappe.db.get_single_value("Selling Settings", "default_price_list")

    return price_list or "Standard Selling"

def get_stock_qty(item_code):
    """Get available stock for an item from Bin"""
    bin_data = frappe.get_all(
        "Bin",
        filters={"item_code": item_code},
        fields=["actual_qty", "warehouse"]
    )
    return sum(bin["actual_qty"] for bin in bin_data) if bin_data else 0
