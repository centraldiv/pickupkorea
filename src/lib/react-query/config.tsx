import type {
  BuyOrderStatus,
  PFOrderStatus,
  ShippingRequestStatus,
} from "@/definitions/statuses";
import type {
  CountrySchema,
  OrderAddressSchema,
  ShippingMethodSchema,
} from "@/definitions/zod-definitions";

import type { z } from "zod";

export type OrderType = "BuyOrder" | "PFOrder" | "ShippingRequest";
export type InvoiceType = "ProductInvoice" | "ShippingInvoice";

export const PublicQueryKeys = {
  countries: ["countries"],
  shippingMethods: ["shipping-methods"],
};

export const PrivateQueryKeys: Record<string, string[]> = {
  adminUsers: ["private", "admin-users"],
  defaultAddress: ["private", "default-address"],
  countries: ["private", "countries"],
  shippingMethods: ["private", "shipping-methods"],
  buyOrders: ["private", "buy-orders"],
  pfOrders: ["private", "pf-orders"],
  shippingRequests: ["private", "shipping-requests"],
  adminBuyOrders: ["private", "admin-buy-orders"],
  adminPFOrders: ["private", "admin-pf-orders"],
  adminProductInvoices: ["private", "admin-product-invoices"],
  adminShippingInvoices: ["private", "admin-shipping-invoices"],
  adminShippingRequests: ["private", "admin-shipping-requests"],
};

export const getPrivateQueryKeys = ({
  admin,
  orderType,
  keys,
}: {
  admin: boolean;
  orderType: OrderType;
  keys?: any;
}) => {
  if (orderType !== "ShippingRequest") {
    if (admin) {
      return [...PrivateQueryKeys[`admin${orderType}s`], ...(keys || [])];
    }
    return [...PrivateQueryKeys[`${orderType}s`], ...(keys || [])];
  }
  return [...PrivateQueryKeys.adminShippingRequests, ...(keys || [])];
};

//shipping method fetchers and mutations
export const fetchPublicShippingMethods = async () => {
  const response = await fetch("/api/public/settings/shipping-methods", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};
export const fetchPrivateShippingMethods = async () => {
  const response = await fetch("/api/private/settings/shipping-methods", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

export const addShippingMethod = async (
  values: z.infer<typeof ShippingMethodSchema>
) => {
  const response = await fetch("/api/private/settings/shipping-methods", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
  return response.json();
};

export const updateShippingMethod = async (
  values: z.infer<typeof ShippingMethodSchema>
) => {
  const response = await fetch("/api/private/settings/shipping-methods", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
  return response.json();
};

export const deleteShippingMethod = async (
  values: z.infer<typeof ShippingMethodSchema>
) => {
  const response = await fetch("/api/private/settings/shipping-methods", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
  return response.json();
};

//country fetchers and mutations
export const fetchPublicCountries = async () => {
  const response = await fetch("/api/public/settings/country-list", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};
export const fetchPrivateCountries = async () => {
  const response = await fetch("/api/private/settings/country-list", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

export const addCountry = async (values: z.infer<typeof CountrySchema>) => {
  const response = await fetch("/api/private/settings/country-list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
  return response.json();
};

export const updateCountry = async (values: z.infer<typeof CountrySchema>) => {
  const response = await fetch("/api/private/settings/country-list", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
  return response.json();
};

export const deleteCountry = async (values: z.infer<typeof CountrySchema>) => {
  const response = await fetch("/api/private/settings/country-list", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
  return response.json();
};

//buy order fetchers and mutations
export const fetchBuyOrders = async () => {
  const response = await fetch("/api/private/orders/buy-orders", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

export const fetchBuyOrder = async (orderId: string) => {
  const response = await fetch(
    `/api/private/orders/buy-orders/order?orderId=${orderId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
};

//pf order fetchers and mutations
export const fetchPFOrders = async () => {
  const response = await fetch("/api/private/orders/pf-orders", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

export const fetchPFOrder = async (orderId: string) => {
  const response = await fetch(
    `/api/private/orders/pf-orders/order?orderId=${orderId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
};

//admin buy order fetchers and mutations
export const fetchAdminBuyOrders = async (orderStatus: BuyOrderStatus) => {
  const response = await fetch(
    `/api/private/orders/admin-buy-orders?orderStatus=${orderStatus}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
};

export const fetchAdminBuyOrder = async (orderId: string) => {
  const response = await fetch(
    `/api/private/orders/admin-buy-orders/order?orderId=${orderId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
};

export const updateAdminOrderAddress = async ({
  values,
  orderType,
}: {
  values: z.infer<typeof OrderAddressSchema>;
  orderType: OrderType;
}) => {
  if (!values.id || !values.orderId) {
    throw new Error("Order ID and Address ID are required");
  }
  const response = await fetch(
    `/api/private/orders/admin-orders/order/address`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address: values, orderType }),
    }
  );
  return response.json();
};

export const updateAdminOrderStatus = async ({
  orderStatus,
  orderId,
  orderType,
}: {
  orderStatus: BuyOrderStatus | PFOrderStatus | ShippingRequestStatus;
  orderId: string;
  orderType: OrderType;
}) => {
  const response = await fetch(
    `/api/private/orders/admin-orders/order/order-status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderStatus, orderId, orderType }),
    }
  );
  return response.json();
};
export const updateAdminOrderShippingMethod = async ({
  name,
  orderId,
  orderType,
}: {
  name: string;
  orderId: string;
  orderType: OrderType;
}) => {
  const response = await fetch(
    `/api/private/orders/admin-orders/order/shipping-method`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, orderId, orderType }),
    }
  );
  return response.json();
};

export const updateAdminBuyOrderStaffMemo = async (
  orderId: string,
  staffMemo: string
) => {
  const response = await fetch(
    `/api/private/orders/admin-buy-orders/order/staff-memo`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId, staffMemo }),
    }
  );
  return response.json();
};

export const updateAdminStaffMemo = async ({
  orderId,
  staffMemo,
  orderType,
}: {
  orderId: string;
  staffMemo: string;
  orderType: OrderType;
}) => {
  const response = await fetch(
    `/api/private/orders/admin-orders/order/staff-memo`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId, staffMemo, orderType }),
    }
  );
  return response.json();
};

export const updateAdminOrderItemFields = async ({
  orderId,
  itemId,
  field,
  value,
  orderType,
  previousValue,
}: {
  orderId: string;
  itemId: string;
  field: string;
  value: any;
  orderType: OrderType;
  previousValue?: any;
}) => {
  const response = await fetch(
    `/api/private/orders/admin-orders/order/item-fields`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        itemId,
        field,
        value,
        orderType,
        previousValue,
      }),
    }
  );
  return response.json();
};

//admin pf order fetchers and mutations
export const fetchAdminPFOrders = async (orderStatus: PFOrderStatus) => {
  const response = await fetch(
    `/api/private/orders/admin-pf-orders?orderStatus=${orderStatus}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
};

export const fetchAdminPFOrder = async (orderId: string) => {
  const response = await fetch(
    `/api/private/orders/admin-pf-orders/order?orderId=${orderId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
};

export const issueProductInvoice = async ({
  orderId,
  invoiceList,
  totalPrice,
  userId,
}: {
  orderId: string;
  invoiceList: { name: string; quantity: number; price: number }[];
  totalPrice: number;
  userId: string;
}) => {
  const response = await fetch(
    `/api/private/orders/admin-product-invoices/issue`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId, invoiceList, totalPrice, userId }),
    }
  );
  return response.json();
};

export const issueShippingInvoice = async ({
  orderId,
  invoiceList,
  totalPrice,
  userId,
  orderType,
  shipRightAway,
}: {
  orderId: string;
  invoiceList: { name: string; quantity: number; price: number }[];
  totalPrice: number;
  userId: string;
  orderType: OrderType;
  shipRightAway?: boolean;
}) => {
  const response = await fetch(
    `/api/private/orders/admin-shipping-invoices/issue`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        invoiceList,
        totalPrice,
        userId,
        orderType,
        shipRightAway,
      }),
    }
  );
  return response.json();
};

export const fetchAdminShippingInvoicesForOrder = async ({
  orderId,
  orderType,
}: {
  orderId: string;
  orderType: OrderType;
}) => {
  const response = await fetch(
    `/api/private/orders/admin-shipping-invoices?orderId=${orderId}&orderType=${orderType}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
};

export const fetchAdminProductInvoicesForOrder = async ({
  orderId,
  orderType,
}: {
  orderId: string;
  orderType: OrderType;
}) => {
  const response = await fetch(
    `/api/private/orders/admin-product-invoices?orderId=${orderId}&orderType=${orderType}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
};

export const fetchAdminProductInvoicesForPayments = async ({
  paid,
  take = 1000,
  skip = 0,
}: {
  paid: string;
  take: number;
  skip: number;
}) => {
  const response = await fetch(
    `/api/private/orders/admin-product-invoices/payments?paid=${paid}&take=${take}&skip=${skip}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
};
export const fetchAdminShippingInvoicesForPayments = async ({
  paid,
  take = 1000,
  skip = 0,
}: {
  paid: string;
  take: number;
  skip: number;
}) => {
  const response = await fetch(
    `/api/private/orders/admin-shipping-invoices/payments?paid=${paid}&take=${take}&skip=${skip}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
};

export const deleteAdminProductInvoice = async (invoiceId: string) => {
  const response = await fetch(
    `/api/private/orders/admin-product-invoices/single`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ invoiceId }),
    }
  );
  return response.json();
};
export const deleteAdminShippingInvoice = async (invoiceId: string) => {
  const response = await fetch(
    `/api/private/orders/admin-shipping-invoices/single`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ invoiceId }),
    }
  );
  return response.json();
};

export const markAdminProductInvoicePaid = async ({
  invoiceId,
  paid,
  pfOrderId,
  buyOrderId,
}: {
  invoiceId: string;
  paid: boolean;
  pfOrderId?: string;
  buyOrderId?: string;
}) => {
  const response = await fetch(
    `/api/private/orders/admin-product-invoices/single/toggle-paid`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ invoiceId, paid, pfOrderId, buyOrderId }),
    }
  );
  return response.json();
};
export const markAdminShippingInvoicePaid = async ({
  invoiceId,
  paid,
  pfOrderId,
  buyOrderId,
  shippingRequestId,
}: {
  invoiceId: string;
  paid: boolean;
  pfOrderId?: string;
  buyOrderId?: string;
  shippingRequestId?: string;
}) => {
  const response = await fetch(
    `/api/private/orders/admin-shipping-invoices/single/toggle-paid`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        invoiceId,
        paid,
        pfOrderId,
        buyOrderId,
        shippingRequestId,
      }),
    }
  );
  return response.json();
};

export const fetchAdminSingleProductInvoice = async (invoiceId: string) => {
  const response = await fetch(
    `/api/private/orders/admin-product-invoices/single?invoiceId=${invoiceId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
};
export const fetchAdminSingleShippingInvoice = async (invoiceId: string) => {
  const response = await fetch(
    `/api/private/orders/admin-shipping-invoices/single?invoiceId=${invoiceId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
};

export const fetchAdminShippingRequests = async (
  requestStatus: ShippingRequestStatus
) => {
  const response = await fetch(
    `/api/private/orders/admin-shipping-requests?requestStatus=${requestStatus}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
};

export const fetchSingleAdminShippingRequest = async (requestId: string) => {
  const response = await fetch(
    `/api/private/orders/admin-shipping-requests/single?requestId=${requestId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
};

export const fetchShippingRequestOrders = async () => {
  const response = await fetch("/api/private/orders/shipping-requests", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

export const fetchShippingRequestOrder = async (orderId: string) => {
  const response = await fetch(
    `/api/private/orders/shipping-requests/order?orderId=${orderId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
};

export const fetchDefaultAddress = async () => {
  const response = await fetch("/api/private/users/default-address", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

export const fetchAdminUsers = async ({
  take = 1000,
  skip = 0,
}: {
  take: number;
  skip: number;
}) => {
  const response = await fetch(
    `/api/private/users/admin-users?take=${take.toString()}&skip=${skip.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
};

export const fetchAdminSearchUsers = async (searchTerm: string) => {
  const response = await fetch(
    `/api/private/users/admin-users/search-user?searchTerm=${searchTerm}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
};

export const fetchAdminUserAccountInfo = async (userId: string) => {
  const response = await fetch(
    `/api/private/users/admin-users/account-info?userId=${userId}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.json();
};
