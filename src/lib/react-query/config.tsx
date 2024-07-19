import type { BuyOrderStatus } from "@/definitions/statuses";
import type {
  CountrySchema,
  ShippingMethodSchema,
} from "@/definitions/zod-definitions";
import type { z } from "zod";

export const PublicQueryKeys = {
  countries: ["countries"],
  shippingMethods: ["shipping-methods"],
};

export const PrivateQueryKeys = {
  buyOrders: ["buy-orders"],
  pfOrders: ["pf-orders"],
  adminBuyOrders: ["admin-buy-orders"],
  adminPfOrders: ["admin-pf-orders"],
};

//shipping method fetchers and mutations
export const fetchShippingMethods = async () => {
  const response = await fetch("/api/public/settings/shipping-methods", {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.json();
};

export const addShippingMethod = async (
  values: z.infer<typeof ShippingMethodSchema>,
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
  values: z.infer<typeof ShippingMethodSchema>,
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
  values: z.infer<typeof ShippingMethodSchema>,
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
export const fetchCountries = async () => {
  const response = await fetch("/api/public/settings/country-list", {
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
    },
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
    },
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
    },
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
    },
  );
  return response.json();
};
