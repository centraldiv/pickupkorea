import { client } from "@/stores/admin";
import { useQuery } from "@tanstack/react-query";
import {
  PrivateQueryKeys,
  PublicQueryKeys,
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
