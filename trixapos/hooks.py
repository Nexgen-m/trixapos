app_name = "trixapos"
app_title = "Trixapos"
app_publisher = "Devteam"
app_description = "Trixapos"
app_email = "devteam@nxgensolutions.com"
app_license = "mit"

fixtures = [
    {
        "doctype": "Custom Field",
        "filters": [["dt", "=", "POS Profile"]]
    },
    {
        "doctype": "Property Setter",
        "filters": [["doc_type", "=", "POS Profile"]]
    },
    {
        "doctype": "Client Script",
        "filters": [["dt", "=", "POS Profile"]]
    }
]


# hooks.py

# Whitelisted methods for API access
whitelisted_methods = [
    "trixapos.api.pos_profile.get_pos_profile",
    "trixapos.api.items_api.get_items",
    "trixapos.api.auth.get_logged_user",
    "trixapos.api.pos_profile.get_pos_profile",
    "trixapos.api.customer_api.create_customer",  # Add this line
    "trixapos.api.sales_order.get_draft_sales_orders",
    "trixapos.api.sales_order.create_draft_sales_orders",
    "trixapos.api.sales_order.cancel_order"
]

# Override whitelisted methods (if needed)
override_whitelisted_methods = {
    "trixapos.api.auth.verify_password": "trixapos.api.auth.verify_password"
}

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "trixapos",
# 		"logo": "/assets/trixapos/logo.png",
# 		"title": "Trixapos",
# 		"route": "/trixapos",
# 		"has_permission": "trixapos.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/trixapos/css/trixapos.css"
# app_include_js = "/assets/trixapos/js/trixapos.js"

# include js, css files in header of web template
# web_include_css = "/assets/trixapos/css/trixapos.css"
# web_include_js = "/assets/trixapos/js/trixapos.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "trixapos/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "trixapos/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "trixapos.utils.jinja_methods",
# 	"filters": "trixapos.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "trixapos.install.before_install"
# after_install = "trixapos.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "trixapos.uninstall.before_uninstall"
# after_uninstall = "trixapos.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "trixapos.utils.before_app_install"
# after_app_install = "trixapos.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "trixapos.utils.before_app_uninstall"
# after_app_uninstall = "trixapos.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "trixapos.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"trixapos.tasks.all"
# 	],
# 	"daily": [
# 		"trixapos.tasks.daily"
# 	],
# 	"hourly": [
# 		"trixapos.tasks.hourly"
# 	],
# 	"weekly": [
# 		"trixapos.tasks.weekly"
# 	],
# 	"monthly": [
# 		"trixapos.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "trixapos.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "trixapos.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "trixapos.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["trixapos.utils.before_request"]
# after_request = ["trixapos.utils.after_request"]

# Job Events
# ----------
# before_job = ["trixapos.utils.before_job"]
# after_job = ["trixapos.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"trixapos.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }


website_route_rules = [{'from_route': '/trixapos/<path:app_path>', 'to_route': 'trixapos'},]