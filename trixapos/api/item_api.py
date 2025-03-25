import frappe
from frappe.utils import flt

@frappe.whitelist()
def get_items(page=1, page_size=50, search_term=None, category=None, customer=None):
    """Fetch active items with customer-specific price list and stock, with search & pagination"""
    try:
        page = int(page)
        page_size = int(page_size)
        offset = (page - 1) * page_size

        # ✅ Filters for Active Items
        filters = {"disabled": 0}
        
        if search_term:
            filters["item_name"] = ["like", f"%{search_term}%"]

        if category:
            # Fetch Subcategories for Parent Category
            subcategories = frappe.get_all(
                "Item Group",
                filters={"parent_item_group": category},
                pluck="name"
            )
            subcategories.append(category)  # Include selected category itself
            filters["item_group"] = ["in", subcategories]  # ✅ Fetch items in parent & subcategories

        total_items = frappe.db.count("Item", filters=filters)

        # ✅ Fetch All Items in Bulk
        items = frappe.get_all(
            "Item",
            fields=["name", "item_name", "item_code", "image", "description", "is_stock_item", "item_group"],
            filters=filters,
            start=offset,
            page_length=page_size,
            order_by="item_name asc"
        )

        if not items:
            return {"items": [], "total_items": 0, "current_page": page, "next_page": None}

        # ✅ Determine Customer-Specific Price List
        price_list_info = get_customer_price_list(customer)
        price_list = price_list_info["price_list"]
        is_standard_price_list = price_list_info["is_standard"]

        # ✅ Bulk Fetch Prices & Stock in a Single Query
        item_codes = [item["item_code"] for item in items]

        # 🔥 Get Prices for All Items in a Single Query
        item_prices = frappe.db.get_all(
            "Item Price",
            filters={"item_code": ["in", item_codes], "price_list": price_list, "selling": 1},
            fields=["item_code", "price_list_rate"]
        )
        price_map = {p["item_code"]: flt(p["price_list_rate"]) for p in item_prices}

        # 🔥 Get Stock Levels for All Items in a Single Query
        stock_map = get_stock_levels(item_codes)

        # ✅ Assign Prices & Stock to Items
        for item in items:
            item["price_list_rate"] = price_map.get(item["item_code"], 0)
            item["stock_qty"] = stock_map.get(item["item_code"], 0)
            item["using_standard_price"] = is_standard_price_list

        has_next = offset + len(items) < total_items
        next_page = page + 1 if has_next else None

        return {
            "items": items,
            "total_items": total_items,
            "current_page": page,
            "next_page": next_page,
            "price_list_used": price_list,
            "using_standard_price": is_standard_price_list
        }

    except Exception as e:
        error_message = f"Error fetching items: {str(e)}"
        frappe.log_error(error_message, "Item API Error")
        return {"error": error_message, "items": [], "total_items": 0, "current_page": page, "next_page": None}

def get_customer_price_list(customer):
    """Get the Price List associated with the customer from Customer Doctype first, then global settings."""
    standard_price_list = "Standard Selling"
    
    if not customer:
        return {"price_list": standard_price_list, "is_standard": True}

    # ✅ First Check Customer Doctype for Default Price List
    price_list = frappe.db.get_value("Customer", customer, "default_price_list")

    # ✅ If Not Found, Use Standard Selling
    if not price_list:
        return {"price_list": standard_price_list, "is_standard": True}
    
    return {
        "price_list": price_list,
        "is_standard": price_list == standard_price_list
    }

def get_stock_levels(item_codes):
    """Get stock levels for multiple items using an efficient SQL query"""
    if not item_codes:
        return {}

    stock_query = """
        SELECT item_code, COALESCE(SUM(actual_qty), 0) as stock_qty
        FROM tabBin
        WHERE item_code IN %(item_codes)s
        GROUP BY item_code
    """
    stock_data = frappe.db.sql(stock_query, {"item_codes": item_codes}, as_dict=True)

    # 🔥 Fix: Ensure all items have stock_qty, even if 0
    stock_map = {s["item_code"]: s["stock_qty"] for s in stock_data}
    for code in item_codes:
        if code not in stock_map:
            stock_map[code] = 0

    return stock_map