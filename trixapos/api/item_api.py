# # import frappe
# # from frappe.utils import flt

# # @frappe.whitelist()
# # def get_items(page=1, page_size=50, search_term=None, category=None, customer=None):
# #     """Fetch active items with customer-specific price list and stock, with search & pagination"""
# #     try:
# #         page = int(page)
# #         page_size = int(page_size)
# #         offset = (page - 1) * page_size

# #         # ✅ Filters for Active Items
# #         filters = {"disabled": 0}
        
# #         if search_term:
# #             filters["item_name"] = ["like", f"%{search_term}%"]
        

# #         if category:
# #             # Fetch Subcategories for Parent Category
# #             subcategories = frappe.get_all(
# #                 "Item Group",
# #                 filters={"parent_item_group": category},
# #                 pluck="name"
# #             )
# #             subcategories.append(category)  # Include selected category itself
# #             filters["item_group"] = ["in", subcategories]  # ✅ Fetch items in parent & subcategories

# #         total_items = frappe.db.count("Item", filters=filters)

# #         # ✅ Fetch All Items in Bulk
# #         items = frappe.get_all(
# #             "Item",
# #             fields=["name", "item_name", "item_code", "image", "description", "is_stock_item", "item_group"],
# #             filters=filters,
# #             start=offset,
# #             page_length=page_size,
# #             order_by="item_name asc"
# #         )

# #         if not items:
# #             return {"items": [], "total_items": 0, "current_page": page, "next_page": None}

# #         # ✅ Determine Customer-Specific Price List
# #         price_list_info = get_customer_price_list(customer)
# #         price_list = price_list_info["price_list"]
# #         is_standard_price_list = price_list_info["is_standard"]

# #         # ✅ Bulk Fetch Prices & Stock in a Single Query
# #         item_codes = [item["item_code"] for item in items]

# #         # 🔥 Get Prices for All Items in a Single Query
# #         item_prices = frappe.db.get_all(
# #             "Item Price",
# #             filters={"item_code": ["in", item_codes], "price_list": price_list, "selling": 1},
# #             fields=["item_code", "price_list_rate"]
# #         )
# #         price_map = {p["item_code"]: flt(p["price_list_rate"]) for p in item_prices}

# #         # 🔥 Get Stock Levels for All Items in a Single Query
# #         stock_map = get_stock_levels(item_codes)

# #         # ✅ Assign Prices & Stock to Items
# #         for item in items:
# #             item["price_list_rate"] = price_map.get(item["item_code"], 0)
# #             item["stock_qty"] = stock_map.get(item["item_code"], 0)
# #             item["using_standard_price"] = is_standard_price_list

# #         has_next = offset + len(items) < total_items
# #         next_page = page + 1 if has_next else None

# #         return {
# #             "items": items,
# #             "total_items": total_items,
# #             "current_page": page,
# #             "next_page": next_page,
# #             "price_list_used": price_list,
# #             "using_standard_price": is_standard_price_list
# #         }

# #     except Exception as e:
# #         error_message = f"Error fetching items: {str(e)}"
# #         frappe.log_error(error_message, "Item API Error")
# #         return {"error": error_message, "items": [], "total_items": 0, "current_page": page, "next_page": None}

# # def get_customer_price_list(customer):
# #     """Get the Price List associated with the customer from Customer Doctype first, then global settings."""
# #     standard_price_list = "Standard Selling"
    
# #     if not customer:
# #         return {"price_list": standard_price_list, "is_standard": True}

# #     # ✅ First Check Customer Doctype for Default Price List
# #     price_list = frappe.db.get_value("Customer", customer, "default_price_list")

# #     # ✅ If Not Found, Use Standard Selling
# #     if not price_list:
# #         return {"price_list": standard_price_list, "is_standard": True}
    
# #     return {
# #         "price_list": price_list,
# #         "is_standard": price_list == standard_price_list
# #     }

# # def get_stock_levels(item_codes):
# #     """Get stock levels for multiple items using an efficient SQL query"""
# #     if not item_codes:
# #         return {}

# #     stock_query = """
# #         SELECT item_code, COALESCE(SUM(actual_qty), 0) as stock_qty
# #         FROM tabBin
# #         WHERE item_code IN %(item_codes)s
# #         GROUP BY item_code
# #     """
# #     stock_data = frappe.db.sql(stock_query, {"item_codes": item_codes}, as_dict=True)

# #     # 🔥 Fix: Ensure all items have stock_qty, even if 0
# #     stock_map = {s["item_code"]: s["stock_qty"] for s in stock_data}
# #     for code in item_codes:
# #         if code not in stock_map:
# #             stock_map[code] = 0

# #     return stock_map


# import frappe
# from frappe.utils import flt

# @frappe.whitelist()
# def get_items(page=1, page_size=50, search_term=None, category=None, customer=None):
#     """Fetch active items with customer-specific price list and stock, with search & pagination"""
#     try:
#         page = int(page)
#         page_size = int(page_size)
#         offset = (page - 1) * page_size

#         # ✅ Filters for Active Items
#         filters = {"disabled": 0}
        
#         if search_term:
#             # ✅ Modified to search by barcode OR item name
#             filters = [
#                 ["Item", "disabled", "=", 0],
#                 [
#                     "OR", [
#                         ["Item", "item_name", "like", f"%{search_term}%"],
#                         # Add barcode search condition
#                         ["Item Barcode", "barcode", "=", search_term]
#                     ]
#                 ]
#             ]
            
#             # We'll use a join instead of simple filters when searching by barcode
#             is_barcode_search = True
#         else:
#             is_barcode_search = False

#         if category and not is_barcode_search:
#             # Fetch Subcategories for Parent Category
#             subcategories = frappe.get_all(
#                 "Item Group",
#                 filters={"parent_item_group": category},
#                 pluck="name"
#             )
#             subcategories.append(category)  # Include selected category itself
#             filters["item_group"] = ["in", subcategories]  # ✅ Fetch items in parent & subcategories
#         elif category and is_barcode_search:
#             # When doing barcode search with category filter
#             subcategories = frappe.get_all(
#                 "Item Group",
#                 filters={"parent_item_group": category},
#                 pluck="name"
#             )
#             subcategories.append(category)
#             filters.append(["Item", "item_group", "in", subcategories])

#         # ✅ Count total items with potentially complex filters
#         if is_barcode_search:
#             # For barcode search we need a different counting approach
#             count_query = """
#                 SELECT COUNT(DISTINCT i.name) as count
#                 FROM `tabItem` i
#                 LEFT JOIN `tabItem Barcode` ib ON ib.parent = i.name
#                 WHERE i.disabled = 0
#             """
            
#             conditions = []
#             values = {}
            
#             if search_term:
#                 conditions.append("(i.item_name LIKE %(search_term)s OR ib.barcode = %(exact_search_term)s)")
#                 values["search_term"] = f"%{search_term}%"
#                 values["exact_search_term"] = search_term
                
#             if category:
#                 conditions.append("i.item_group IN %(categories)s")
#                 values["categories"] = tuple(subcategories)
                
#             if conditions:
#                 count_query += " AND " + " AND ".join(conditions)
                
#             total_items = frappe.db.sql(count_query, values=values, as_dict=True)[0].get("count", 0)
            
#             # ✅ Fetch All Items in Bulk with JOIN for barcode search
#             query = """
#                 SELECT DISTINCT 
#                     i.name, i.item_name, i.item_code, i.image, 
#                     i.description, i.is_stock_item, i.item_group
#                 FROM `tabItem` i
#                 LEFT JOIN `tabItem Barcode` ib ON ib.parent = i.name
#                 WHERE i.disabled = 0
#             """
            
#             if conditions:
#                 query += " AND " + " AND ".join(conditions)
                
#             query += " ORDER BY i.item_name ASC LIMIT %(limit)s OFFSET %(offset)s"
#             values["limit"] = page_size
#             values["offset"] = offset
            
#             items = frappe.db.sql(query, values=values, as_dict=True)
#         else:
#             # Original approach for non-barcode searches
#             total_items = frappe.db.count("Item", filters=filters)
            
#             # ✅ Fetch All Items in Bulk
#             items = frappe.get_all(
#                 "Item",
#                 fields=["name", "item_name", "item_code", "image", "description", "is_stock_item", "item_group"],
#                 filters=filters,
#                 start=offset,
#                 page_length=page_size,
#                 order_by="item_name asc"
#             )

#         if not items:
#             return {"items": [], "total_items": 0, "current_page": page, "next_page": None}

#         # ✅ Determine Customer-Specific Price List
#         price_list_info = get_customer_price_list(customer)
#         price_list = price_list_info["price_list"]
#         is_standard_price_list = price_list_info["is_standard"]

#         # ✅ Bulk Fetch Prices & Stock in a Single Query
#         item_codes = [item["item_code"] for item in items]

#         # 🔥 Get Prices for All Items in a Single Query
#         item_prices = frappe.db.get_all(
#             "Item Price",
#             filters={"item_code": ["in", item_codes], "price_list": price_list, "selling": 1},
#             fields=["item_code", "price_list_rate"]
#         )
#         price_map = {p["item_code"]: flt(p["price_list_rate"]) for p in item_prices}

#         # 🔥 Get Stock Levels for All Items in a Single Query
#         stock_map = get_stock_levels(item_codes)

#         # ✅ Assign Prices & Stock to Items
#         for item in items:
#             item["price_list_rate"] = price_map.get(item["item_code"], 0)
#             item["stock_qty"] = stock_map.get(item["item_code"], 0)
#             item["using_standard_price"] = is_standard_price_list

#         has_next = offset + len(items) < total_items
#         next_page = page + 1 if has_next else None

#         return {
#             "items": items,
#             "total_items": total_items,
#             "current_page": page,
#             "next_page": next_page,
#             "price_list_used": price_list,
#             "using_standard_price": is_standard_price_list
#         }

#     except Exception as e:
#         error_message = f"Error fetching items: {str(e)}"
#         frappe.log_error(error_message, "Item API Error")
#         return {"error": error_message, "items": [], "total_items": 0, "current_page": page, "next_page": None}

# def get_customer_price_list(customer):
#     """Get the Price List associated with the customer from Customer Doctype first, then global settings."""
#     standard_price_list = "Standard Selling"
    
#     if not customer:
#         return {"price_list": standard_price_list, "is_standard": True}

#     # ✅ First Check Customer Doctype for Default Price List
#     price_list = frappe.db.get_value("Customer", customer, "default_price_list")

#     # ✅ If Not Found, Use Standard Selling
#     if not price_list:
#         return {"price_list": standard_price_list, "is_standard": True}
    
#     return {
#         "price_list": price_list,
#         "is_standard": price_list == standard_price_list
#     }

# def get_stock_levels(item_codes):
#     """Get stock levels for multiple items using an efficient SQL query"""
#     if not item_codes:
#         return {}

#     stock_query = """
#         SELECT item_code, COALESCE(SUM(actual_qty), 0) as stock_qty
#         FROM tabBin
#         WHERE item_code IN %(item_codes)s
#         GROUP BY item_code
#     """
#     stock_data = frappe.db.sql(stock_query, {"item_codes": item_codes}, as_dict=True)

#     # 🔥 Fix: Ensure all items have stock_qty, even if 0
#     stock_map = {s["item_code"]: s["stock_qty"] for s in stock_data}
#     for code in item_codes:
#         if code not in stock_map:
#             stock_map[code] = 0

#     return stock_map

#------------------------------------------------------------

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
            # ✅ Modified to search by barcode OR item name
            filters = [
                ["Item", "disabled", "=", 0],
                [
                    "OR", [
                        ["Item", "item_name", "like", f"%{search_term}%"],
                        # Add barcode search condition
                        ["Item Barcode", "barcode", "=", search_term]
                    ]
                ]
            ]
            
            # We'll use a join instead of simple filters when searching by barcode
            is_barcode_search = True
        else:
            is_barcode_search = False

        if category and not is_barcode_search:
            # Fetch Subcategories for Parent Category
            subcategories = frappe.get_all(
                "Item Group",
                filters={"parent_item_group": category},
                pluck="name"
            )
            subcategories.append(category)  # Include selected category itself
            filters["item_group"] = ["in", subcategories]  # ✅ Fetch items in parent & subcategories
        elif category and is_barcode_search:
            # When doing barcode search with category filter
            subcategories = frappe.get_all(
                "Item Group",
                filters={"parent_item_group": category},
                pluck="name"
            )
            subcategories.append(category)
            filters.append(["Item", "item_group", "in", subcategories])

        # ✅ Count total items with potentially complex filters
        if is_barcode_search:
            # For barcode search we need a different counting approach
            count_query = """
                SELECT COUNT(DISTINCT i.name) as count
                FROM `tabItem` i
                LEFT JOIN `tabItem Barcode` ib ON ib.parent = i.name
                WHERE i.disabled = 0
            """
            
            conditions = []
            values = {}
            
            if search_term:
                conditions.append("(i.item_name LIKE %(search_term)s OR ib.barcode = %(exact_search_term)s)")
                values["search_term"] = f"%{search_term}%"
                values["exact_search_term"] = search_term
                
            if category:
                conditions.append("i.item_group IN %(categories)s")
                values["categories"] = tuple(subcategories)
                
            if conditions:
                count_query += " AND " + " AND ".join(conditions)
                
            total_items = frappe.db.sql(count_query, values=values, as_dict=True)[0].get("count", 0)
            
            # ✅ Fetch All Items in Bulk with JOIN for barcode search
            query = """
                SELECT DISTINCT 
                    i.name, i.item_name, i.item_code, i.image, 
                    i.description, i.is_stock_item, i.item_group
                FROM `tabItem` i
                LEFT JOIN `tabItem Barcode` ib ON ib.parent = i.name
                WHERE i.disabled = 0
            """
            
            if conditions:
                query += " AND " + " AND ".join(conditions)
                
            query += " ORDER BY i.item_name ASC LIMIT %(limit)s OFFSET %(offset)s"
            values["limit"] = page_size
            values["offset"] = offset
            
            items = frappe.db.sql(query, values=values, as_dict=True)
        else:
            # Original approach for non-barcode searches
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

        # 🔍 Check if no items found for a search - add specific error message
        if search_term and not items and page == 1:
            return {
                "items": [],
                "total_items": 0,
                "current_page": page,
                "next_page": None,
                # "error": f"No items found for '{search_term}'",
                "error": f"No items found matching '{search_term}' (searched by barcode and name)",
                "not_found": True  # Flag to indicate items not found
            }
        

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