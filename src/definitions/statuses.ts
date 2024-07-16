export enum ItemStatus {
  PENDING = "Pending Review",
  PRODUCT_INVOICED = "Product Invoice Issued",
  AWAITING_PURCHASE = "Awaiting Purchase",
  AWAITING_ARRIVAL = "Awaiting Arrival",
  PARTIAL_RECEIVED = "Partially Received",
  RECEIVED = "Received",
  PREPARING_SHIPPING = "Preparing Shipping",
  SHIPPING_INVOICED = "Shipping Invoice Issued",
  PARTIALLY_SHIPPED = "Partially Shipped",
  SHIPPED = "Shipped",
  REMOVED = "Removed",
  CREDITED = "Credited",
}

export enum BuyOrderStatus {
  PENDING = "Pending Review",
  PRODUCT_INVOICED = "Product Invoice Issued",
  AWAITING_PURCHASE = "Awaiting Purchase",
  AWAITING_ARRIVAL = "Awaiting Arrival",
  PARTIAL_RECEIVED = "Partially Received",
  AWAITING_SHIPPING = "Awaiting Shipping Request",
  PREPARING_SHIPPING = "Preparing Shipping",
  SHIPPING_INVOICED = "Shipping Invoice Issued",
  PARTIALLY_SHIPPED = "Partially Shipped",
  SHIPPED = "Shipped",
}

export enum PFOrderStatus {
  PENDING = "Pending Review",
  AWAITING_ARRIVAL = "Awaiting Arrival",
  PARTIAL_RECEIVED = "Partially Received",
  RECEIVED = "Received",
  AWAITING_SHIPPING = "Awaiting Shipping Request",
  PREPARING_SHIPPING = "Preparing Shipping",
  SHIPPING_INVOICED = "Shipping Invoice Issued",
  PARTIALLY_SHIPPED = "Partially Shipped",
  SHIPPED = "Shipped",
}
