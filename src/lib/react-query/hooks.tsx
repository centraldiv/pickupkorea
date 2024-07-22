import { client } from "@/stores/admin";
import { useQuery } from "@tanstack/react-query";
import {
  PrivateQueryKeys,
  PublicQueryKeys,
  fetchAdminBuyOrder,
  fetchAdminBuyOrderProductInvoices,
  fetchAdminBuyOrders,
  fetchAdminPFOrder,
  fetchAdminPFOrders,
  fetchBuyOrder,
  fetchBuyOrders,
  fetchPFOrder,
  fetchPFOrders,
  fetchPrivateCountries,
  fetchPrivateShippingMethods,
  fetchPublicCountries,
  fetchPublicShippingMethods,
} from "./config";
import type {
  address,
  availableShippingMethods,
  buyOrder,
  country,
  item,
  pfOrder,
  productInvoice,
  user,
} from "@prisma/client";
import type { BuyOrderStatus, PFOrderStatus } from "@/definitions/statuses";

export type ProductInvoiceWithUser = productInvoice & {
  user: user;
};

export type AddressWithCountry = address & {
  country: country;
};

export type OrderAddressWithCountry = AddressWithCountry & {
  orderId: string;
};

export type BuyOrderWithItemsAndAddress = buyOrder & {
  items: item[];
  address: AddressWithCountry;
  productInvoice?: productInvoice;
  shippingMethod: availableShippingMethods;
  _count: {
    items: number;
  };
  user: user;
};

export type PFOrderWithItemsAndAddress = pfOrder & {
  items: item[];
  address: AddressWithCountry;
  shippingMethod: availableShippingMethods;
  _count: {
    items: number;
  };
  user: user;
};

export type AdminBuyOrderWithItemsAndAddress = buyOrder & {
  items: item[];
  address: OrderAddressWithCountry;
  productInvoice?: productInvoice;
  shippingMethod: availableShippingMethods;
  user: user;
};

export const usePublicCountries = () => {
  return useQuery<country[]>(
    {
      queryKey: PublicQueryKeys.countries,
      queryFn: fetchPublicCountries,
    },
    client,
  );
};
export const usePrivateCountries = () => {
  return useQuery<country[]>(
    {
      queryKey: PrivateQueryKeys.countries,
      queryFn: fetchPrivateCountries,
    },
    client,
  );
};

export const usePublicShippingMethods = () => {
  return useQuery<availableShippingMethods[]>(
    {
      queryKey: PublicQueryKeys.shippingMethods,
      queryFn: fetchPublicShippingMethods,
    },
    client,
  );
};
export const usePrivateShippingMethods = () => {
  return useQuery<availableShippingMethods[]>(
    {
      queryKey: PrivateQueryKeys.shippingMethods,
      queryFn: fetchPrivateShippingMethods,
    },
    client,
  );
};

export const useBuyOrders = () => {
  return useQuery<BuyOrderWithItemsAndAddress[]>(
    {
      queryKey: PrivateQueryKeys.buyOrders,
      queryFn: fetchBuyOrders,
    },
    client,
  );
};

export const useSingleBuyOrder = (orderId: string) => {
  return useQuery<BuyOrderWithItemsAndAddress>(
    {
      queryKey: [...PrivateQueryKeys.buyOrders, orderId],
      queryFn: async () => await fetchBuyOrder(orderId),
    },
    client,
  );
};

export const usePFOrders = () => {
  return useQuery<PFOrderWithItemsAndAddress[]>(
    {
      queryKey: PrivateQueryKeys.pfOrders,
      queryFn: fetchPFOrders,
    },
    client,
  );
};

export const useSinglePFOrder = (orderId: string) => {
  return useQuery<PFOrderWithItemsAndAddress>(
    {
      queryKey: [...PrivateQueryKeys.pfOrders, orderId],
      queryFn: async () => await fetchPFOrder(orderId),
    },
    client,
  );
};

export const useAdminBuyOrders = (orderStatus: BuyOrderStatus) => {
  return useQuery<BuyOrderWithItemsAndAddress[]>(
    {
      queryKey: [...PrivateQueryKeys.adminBuyOrders, orderStatus],
      queryFn: async () => await fetchAdminBuyOrders(orderStatus),
    },
    client,
  );
};

export const useSingleAdminBuyOrder = (orderId: string) => {
  return useQuery<AdminBuyOrderWithItemsAndAddress>(
    {
      queryKey: [...PrivateQueryKeys.adminBuyOrders, orderId],
      queryFn: async () => await fetchAdminBuyOrder(orderId),
      enabled: !!orderId,
    },
    client,
  );
};

export const useAdminPFOrders = (orderStatus: PFOrderStatus) => {
  return useQuery<PFOrderWithItemsAndAddress[]>(
    {
      queryKey: [...PrivateQueryKeys.adminPFOrders, orderStatus],
      queryFn: async () => await fetchAdminPFOrders(orderStatus),
    },
    client,
  );
};

export const useSingleAdminPFOrder = (orderId: string) => {
  return useQuery<PFOrderWithItemsAndAddress>(
    {
      queryKey: [...PrivateQueryKeys.adminPFOrders, orderId],
      queryFn: async () => await fetchAdminPFOrder(orderId),
      enabled: !!orderId,
    },
    client,
  );
};

export const useSingleAdminBuyOrderProductInvoices = (orderId: string) => {
  return useQuery<ProductInvoiceWithUser[]>(
    {
      queryKey: [
        ...PrivateQueryKeys.adminBuyOrders,
        orderId,
        "product-invoices",
      ],
      queryFn: async () => await fetchAdminBuyOrderProductInvoices(orderId),
      enabled: !!orderId,
    },
    client,
  );
};
