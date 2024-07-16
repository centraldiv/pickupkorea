# Api Routes

/api/auth/login
: POST , requires login data with login and password. login must either be email or username.

/api/auth/signup
: POST , requires signup data with username, email, password, confirmPassword, kakaoId?, country.

/api/auth/logout
: POST , empty body, deletes the current session.

/api/users/orders/buy-order/submit
: POST , requires buy order data with items, it is parsed client and server. If success, returns 200 and proceeds to /account/submit-order/buy-order/success.

# Todo

1. Email verification / reset pw
2. Package forwarding code
