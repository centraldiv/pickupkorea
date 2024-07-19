import { client } from "@/stores/admin";
import { useQuery } from "@tanstack/react-query";
import {
  PrivateQueryKeys,
  PublicQueryKeys,
  fetchAdminBuyOrder,
  fetchAdminBuyOrders,
  fetchBuyOrder,
  fetchBuyOrders,
  fetchCountries,
  fetchPFOrder,
  fetchPFOrders,
  fetchShippingMethods,
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
import type { BuyOrderStatus } from "@/definitions/statuses";

export type AddressWithCountry = address & {
  country: country;
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
  _count: {
    items: number;
  };
};

export const useCountries = () => {
  return useQuery<country[]>(
    {
      queryKey: PublicQueryKeys.countries,
      queryFn: fetchCountries,
    },
    client,
  );
};

export const useShippingMethods = () => {
  return useQuery<availableShippingMethods[]>(
    {
      queryKey: PublicQueryKeys.shippingMethods,
      queryFn: fetchShippingMethods,
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
  return useQuery<BuyOrderWithItemsAndAddress>(
    {
      queryKey: [...PrivateQueryKeys.adminBuyOrders, orderId],
      queryFn: async () => await fetchAdminBuyOrder(orderId),
      enabled: !!orderId,
    },
    client,
  );
};
