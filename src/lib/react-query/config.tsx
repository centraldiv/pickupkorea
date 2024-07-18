import type { CountrySchema } from "@/definitions/zod-definitions";
import type { z } from "zod";

export const PublicQueryKeys = {
  countries: ["countries"],
};

export const PrivateQueryKeys = {
  buyOrders: ["buy-orders"],
  pfOrders: ["pf-orders"],
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
