import type { BuyOrderStatus, PFOrderStatus } from "@/definitions/statuses";
import type {
  CountrySchema,
  OrderAddressSchema,
  ShippingMethodSchema,
} from "@/definitions/zod-definitions";

import type { z } from "zod";

export const PublicQueryKeys = {
  countries: ["countries"],
  shippingMethods: ["shipping-methods"],
};

export const PrivateQueryKeys = {
  countries: ["private", "countries"],
  shippingMethods: ["private", "shipping-methods"],
  buyOrders: ["private", "buy-orders"],
  pfOrders: ["private", "pf-orders"],
  adminBuyOrders: ["private", "admin-buy-orders"],
  adminPFOrders: ["private", "admin-pf-orders"],
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

export const updateAdminBuyOrderAddress = async (
  values: z.infer<typeof OrderAddressSchema>
) => {
  if (!values.id || !values.orderId) {
    throw new Error("Order ID and Address ID are required");
  }
  const response = await fetch(
    `/api/private/orders/admin-buy-orders/order/address`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    }
  );
  return response.json();
};

export const updateAdminBuyOrderStatus = async (
  orderStatus: BuyOrderStatus,
  orderId: string
) => {
  const response = await fetch(
    `/api/private/orders/admin-buy-orders/order/order-status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderStatus, orderId }),
    }
  );
  return response.json();
};
export const updateAdminBuyOrderShippingMethod = async ({
  name,
  orderId,
}: {
  name: string;
  orderId: string;
}) => {
  const response = await fetch(
    `/api/private/orders/admin-buy-orders/order/shipping-method`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, orderId }),
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

export const updateAdminBuyOrderItemFields = async ({
  orderId,
  itemId,
  field,
  value,
}: {
  orderId: string;
  itemId: string;
  field: string;
  value: any;
}) => {
  const response = await fetch(
    `/api/private/orders/admin-buy-orders/order/item-fields`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId, itemId, field, value }),
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

//admin product invoice for buy orders and mutations

export const fetchAdminBuyOrderProductInvoices = async (orderId: string) => {
  const response = await fetch(
    `/api/private/orders/admin-buy-orders/order/product-invoices?orderId=${orderId}`,
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
    `/api/private/orders/admin-buy-orders/order/issue-product-invoice`,
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
  orderType: "buyOrder" | "pfOrder";
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

export const fetchAdminShippingInvoices = async ({
  orderId,
  orderType,
}: {
  orderId: string;
  orderType: "buyOrder" | "pfOrder";
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
