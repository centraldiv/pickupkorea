# Api Routes

/api/auth/login
: POST , requires login data with login and password. login must either be email or username.

/api/auth/signup
: POST , requires signup data with username, email, password, confirmPassword, kakaoId?, country.

/api/auth/logout
: POST , empty body, deletes the current session.

/api/private/users/orders/buy-order/submit
: POST , requires buy order data with items, it is parsed client and server. If success, returns 200 and proceeds to /account/submit-order/buy-order/success.

/api/private/users/orders/pf-order/submit
: POST , requires pf order data with items, it is parsed client and server. If success, returns 200 and proceeds to /account/submit-order/pf-order/success.

/api/public/settings/country-list
: GET , returns a list of available countries.

/api/private/settings/country-list
: POST , requires country data with name and code. Returns 200 if success, 400 if duplicate name or code or if data is entirely invalid. ADMIN ONLY

/api/private/settings/country-list
: PATCH , requires country data with name and code. Returns 200 if success, 400 if duplicate name or code or if data is entirely invalid. ADMIN ONLY

/api/private/settings/country-list
: DELETE , requires country data with id. Returns 200 if success, 400 if data is entirely invalid. ADMIN ONLY

/api/public/settings/shipping-methods
: GET , returns a list of available shipping methods.

/api/private/settings/shipping-methods
: POST , requires shipping method data with name and isActive. Returns 200 if success, 400 if duplicate name or if data is entirely invalid. ADMIN ONLY

/api/private/settings/shipping-methods
: PATCH , requires shipping method data with name and isActive. Returns 200 if success, 400 if duplicate name or if data is entirely invalid. ADMIN ONLY

/api/private/settings/shipping-methods
: DELETE , requires shipping method data with id. Returns 200 if success, 400 if data is entirely invalid. ADMIN ONLY

/api/private/orders/buy-orders
: GET , returns a list of buy orders for user.

/api/private/orders/buy-orders/order
: GET , returns single buy order for user.

/api/private/orders/pf-orders
: GET , returns a list of pf orders for user.

/api/private/orders/pf-orders/order
: GET , returns single pf order for user.

/api/private/orders/admin-buy-orders?orderStatus=
: GET , returns a list of buy orders for admin. Query params: orderStatus

/api/private/orders/admin-buy-orders/order
: GET , returns single buy order for admin.

/api/private/orders/admin-buy-orders/order/order-status
: PATCH , requires orderId and orderStatus (new) to update order status.

/api/private/orders/admin-buy-orders/order/shipping-method
: PATCH , requires orderId and shippingMethodName as name to update order shipping method.

/api/private/orders/admin-buy-orders/order/staff-memo
: PATCH , requires orderId and staffMemo to update order staff memo.

/api/private/orders/admin-buy-orders/order/issue-product-invoice
: PATCH , requires orderId, invoiceList, totalPrice, userId to update order invoice. invoiceList is an array of objects with quantity, price, and name.

/api/private/orders/admin-pf-orders?orderStatus=
: GET , returns a list of pf orders for admin. Query params: orderStatus

/api/private/orders/admin-pf-orders/order
: GET , returns single pf order for admin.

/api/private/orders/admin-shipping-invoices/issue
: POST , requires orderId, invoiceList, totalPrice, userId and orderType (buyOrder or pfOrder) to issue new shipping invoice. invoiceList is an array of objects with quantity, price, and name.

/api/private/orders/admin-shipping-invoices
: GET , returns a list of shipping invoices for admin. Query params: orderId and orderType (buyOrder or pfOrder)

/api/private/orders/admin-orders/order/staff-memo
: PATCH , requires orderId, memo, orderType to update order staff memo.

/api/private/orders/admin-orders/order/address
: PATCH , requires address fields and orderType to update order address and country.

/api/private/orders/admin-orders/order/item-fields
: PATCH , requires orderId, itemId, the name of the field as field and the value as value.

# Todo

1. Email verification / reset pw
2. Package forwarding code
