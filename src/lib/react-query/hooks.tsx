import { client } from "@/stores/admin";
import { useQuery } from "@tanstack/react-query";
import {
  PrivateQueryKeys,
  PublicQueryKeys,
  fetchBuyOrder,
  fetchBuyOrders,
  fetchCountries,
  fetchPFOrder,
  fetchPFOrders,
} from "./config";
import type {
  address,
  buyOrder,
  country,
  item,
  pfOrder,
  productInvoice,
} from "@prisma/client";

export type BuyOrderWithItemsAndAddress = buyOrder & {
  items: item[];
  address: address;
  productInvoice?: productInvoice;
  _count: {
    items: number;
  };
};
export type PFOrderWithItemsAndAddress = pfOrder & {
  items: item[];
  address: address;
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
    client
  );
};

export const useBuyOrders = () => {
  return useQuery<BuyOrderWithItemsAndAddress[]>(
    {
      queryKey: PrivateQueryKeys.buyOrders,
      queryFn: fetchBuyOrders,
    },
    client
  );
};

export const useSingleBuyOrder = (orderId: string) => {
  return useQuery<BuyOrderWithItemsAndAddress>(
    {
      queryKey: [...PrivateQueryKeys.buyOrders, orderId],
      queryFn: async () => await fetchBuyOrder(orderId),
    },
    client
  );
};

export const usePFOrders = () => {
  return useQuery<PFOrderWithItemsAndAddress[]>(
    {
      queryKey: PrivateQueryKeys.pfOrders,
      queryFn: fetchPFOrders,
    },
    client
  );
};

export const useSinglePFOrder = (orderId: string) => {
  return useQuery<PFOrderWithItemsAndAddress>(
    {
      queryKey: [...PrivateQueryKeys.pfOrders, orderId],
      queryFn: async () => await fetchPFOrder(orderId),
    },
    client
  );
};
