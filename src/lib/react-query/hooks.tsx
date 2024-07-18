import { client } from "@/stores/admin";
import { useQuery } from "@tanstack/react-query";
import {
  PrivateQueryKeys,
  PublicQueryKeys,
  fetchBuyOrder,
  fetchBuyOrders,
  fetchCountries,
} from "./config";
import type {
  address,
  buyOrder,
  country,
  item,
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
