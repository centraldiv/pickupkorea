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
: POST , requires country data with name and code. Returns 200 if success, 400 if duplicate name or code or if data is entirely invalid.

/api/private/settings/country-list
: PATCH , requires country data with name and code. Returns 200 if success, 400 if duplicate name or code or if data is entirely invalid.

# Todo

1. Email verification / reset pw
2. Package forwarding code
