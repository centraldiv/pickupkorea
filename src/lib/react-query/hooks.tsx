import { client } from "@/stores/admin";
import { useQuery } from "@tanstack/react-query";
import {
  PrivateQueryKeys,
  PublicQueryKeys,
  fetchAdminBuyOrder,
  fetchAdminBuyOrders,
  fetchAdminPFOrder,
  fetchAdminPFOrders,
  fetchAdminProductInvoicesForOrder,
  fetchAdminProductInvoicesForPayments,
  fetchAdminSearchUsers,
  fetchAdminShippingInvoicesForOrder,
  fetchAdminShippingInvoicesForPayments,
  fetchAdminShippingRequests,
  fetchAdminSingleProductInvoice,
  fetchAdminSingleShippingInvoice,
  fetchAdminUserAccountInfo,
  fetchAdminUsers,
  fetchBuyOrder,
  fetchBuyOrders,
  fetchDefaultAddress,
  fetchPFOrder,
  fetchPFOrders,
  fetchPrivateCountries,
  fetchPrivateShippingMethods,
  fetchPublicCountries,
  fetchPublicShippingMethods,
  fetchShippingRequestOrder,
  fetchShippingRequestOrders,
  fetchSingleAdminShippingRequest,
  getPrivateQueryKeys,
  type OrderType,
} from "./config";
import type {
  address,
  availableShippingMethods,
  buyOrder,
  country,
  creditHistory,
  defaultAddress,
  item,
  pfOrder,
  productInvoice,
  shippingInvoice,
  shippingRequest,
  toShipItem,
  user,
} from "@prisma/client";
import type {
  BuyOrderStatus,
  PFOrderStatus,
  ShippingRequestStatus,
} from "@/definitions/statuses";

export type AddressWithCountry = address & {
  country: country;
};

export type OrderAddressWithCountry = AddressWithCountry & {
  orderId: string;
};

export type DefaultAddressWithShippingMethod = defaultAddress & {
  shippingMethod: availableShippingMethods;
  country: country;
};

export type BuyOrderWithItemsAndAddress = buyOrder & {
  items: item[];
  address: AddressWithCountry;
  productInvoice?: productInvoice;
  shippingInvoice?: shippingInvoice;
  shippingMethod: availableShippingMethods;
  shippingRequest?: ShippingRequestWithInvoices[];
  _count: {
    items: number;
  };
  user: user;
};
export type toShipItemWithUser = toShipItem & {
  user: user;
  item: ItemWithBuyOrder;
};

export type ItemWithBuyOrder = item & {
  buyOrder: BuyOrderWithItemsAndAddress;
};
export type ShippingRequestWithInvoices = shippingRequest & {
  _count: {
    toShipItems: number;
  };
  shippingInvoice: shippingInvoice;
  buyOrders: BuyOrderWithItemsAndAddress[];
  pfOrders: PFOrderWithItemsAndAddress[];
  user: user;
  address: AddressWithCountry;
  shippingMethod: availableShippingMethods;
  items: ItemWithBuyOrder[];
  toShipItems: toShipItemWithUser[];
};

export type PFOrderWithItemsAndAddress = pfOrder & {
  items: item[];
  address: AddressWithCountry;
  shippingMethod: availableShippingMethods;
  shippingRequest?: ShippingRequestWithInvoices[];
  shippingInvoice?: shippingInvoice;
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
  shippingRequest?: ShippingRequestWithInvoices[];
  user: user;
};

export type ShippingInvoiceWithUser = shippingInvoice & {
  user: user;
  buyOrder?: BuyOrderWithItemsAndAddress;
  pfOrder?: PFOrderWithItemsAndAddress;
  shippingRequest?: ShippingRequestWithInvoices;
};

export type ProductInvoiceWithUser = productInvoice & {
  user: user;
  buyOrder?: BuyOrderWithItemsAndAddress;
};

export type UserWithCounts = user & {
  defaultAddress: {
    id: string;
  };
  _count: {
    items: number;
    productInvoices: number;
    buyOrders: number;
    pfOrder: number;
    shippingInvoice: number;
    shippingRequest: number;
  };
};

export type CompleteUser = user & {
  creditHistory: creditHistory[];
  country: country;
  defaultAddress: defaultAddress;
  buyOrders: BuyOrderWithItemsAndAddress[];
  pfOrder: PFOrderWithItemsAndAddress[];
  shippingRequest: ShippingRequestWithInvoices[];
  productInvoices: ProductInvoiceWithUser[];
  shippingInvoice: ShippingInvoiceWithUser[];
};

export type UserWithCredits = user & {
  creditHistory: creditHistory[];
  country: country;
};

export const usePublicCountries = () => {
  return useQuery<country[]>(
    {
      queryKey: PublicQueryKeys.countries,
      queryFn: fetchPublicCountries,
    },
    client
  );
};
export const usePrivateCountries = () => {
  return useQuery<country[]>(
    {
      queryKey: PrivateQueryKeys.countries,
      queryFn: fetchPrivateCountries,
    },
    client
  );
};

export const usePublicShippingMethods = () => {
  return useQuery<availableShippingMethods[]>(
    {
      queryKey: PublicQueryKeys.shippingMethods,
      queryFn: fetchPublicShippingMethods,
    },
    client
  );
};
export const usePrivateShippingMethods = () => {
  return useQuery<availableShippingMethods[]>(
    {
      queryKey: PrivateQueryKeys.shippingMethods,
      queryFn: fetchPrivateShippingMethods,
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

export const useShippingRequestOrders = () => {
  return useQuery<ShippingRequestWithInvoices[]>(
    {
      queryKey: PrivateQueryKeys.shippingRequests,
      queryFn: fetchShippingRequestOrders,
    },
    client
  );
};

export const useSingleShippingRequestOrder = (orderId: string) => {
  return useQuery<ShippingRequestWithInvoices>(
    {
      queryKey: [...PrivateQueryKeys.shippingRequests, orderId],
      queryFn: async () => await fetchShippingRequestOrder(orderId),
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

export const useAdminBuyOrders = (orderStatus: BuyOrderStatus) => {
  return useQuery<BuyOrderWithItemsAndAddress[]>(
    {
      queryKey: [...PrivateQueryKeys.adminBuyOrders, orderStatus],
      queryFn: async () => await fetchAdminBuyOrders(orderStatus),
    },
    client
  );
};

export const useSingleAdminBuyOrder = (orderId: string) => {
  return useQuery<AdminBuyOrderWithItemsAndAddress>(
    {
      queryKey: getPrivateQueryKeys({
        admin: true,
        orderType: "BuyOrder",
        keys: [orderId],
      }),
      queryFn: async () => await fetchAdminBuyOrder(orderId),
      enabled: !!orderId,
    },
    client
  );
};

export const useSingleAdminOrder = ({
  orderType,
  orderId,
}: {
  orderType: OrderType;
  orderId: string;
}) => {
  switch (orderType) {
    case "BuyOrder":
      return useSingleAdminBuyOrder(orderId);
    case "PFOrder":
      return useSingleAdminPFOrder(orderId);
    case "ShippingRequest":
      return useSingleAdminShippingRequest(orderId);
  }
};

export const useSingleAdminShippingRequest = (requestId: string) => {
  return useQuery<ShippingRequestWithInvoices>(
    {
      queryKey: [...PrivateQueryKeys.adminShippingRequests, requestId],
      queryFn: async () => await fetchSingleAdminShippingRequest(requestId),
    },
    client
  );
};

export const useAdminPFOrders = (orderStatus: PFOrderStatus) => {
  return useQuery<PFOrderWithItemsAndAddress[]>(
    {
      queryKey: [...PrivateQueryKeys.adminPFOrders, orderStatus],
      queryFn: async () => await fetchAdminPFOrders(orderStatus),
    },
    client
  );
};

export const useSingleAdminPFOrder = (orderId: string) => {
  return useQuery<PFOrderWithItemsAndAddress>(
    {
      queryKey: [...PrivateQueryKeys.adminPFOrders, orderId],
      queryFn: async () => await fetchAdminPFOrder(orderId),
      enabled: !!orderId,
    },
    client
  );
};

export const useSingleAdminProductInvoices = ({
  orderId,
  orderType,
}: {
  orderId: string;
  orderType: OrderType;
}) => {
  return useQuery<ProductInvoiceWithUser[]>(
    {
      queryKey: getPrivateQueryKeys({
        admin: true,
        orderType,
        keys: [orderId, "product-invoices"],
      }),
      queryFn: async () =>
        await fetchAdminProductInvoicesForOrder({ orderId, orderType }),
      enabled: !!orderId,
    },
    client
  );
};
export const useSingleAdminShippingInvoices = ({
  orderId,
  orderType,
}: {
  orderId: string;
  orderType: OrderType;
}) => {
  return useQuery<ShippingInvoiceWithUser[]>(
    {
      queryKey: getPrivateQueryKeys({
        admin: true,
        orderType,
        keys: [orderId, "shipping-invoices"],
      }),
      queryFn: async () =>
        await fetchAdminShippingInvoicesForOrder({ orderId, orderType }),
      enabled: !!orderId,
    },
    client
  );
};

export const useAdminProductInvoices = ({
  paid,
  take = 1000,
  skip = 0,
}: {
  paid: string;
  take?: number;
  skip?: number;
}) => {
  return useQuery<ProductInvoiceWithUser[]>(
    {
      queryKey: PrivateQueryKeys.adminProductInvoices,
      queryFn: async () =>
        await fetchAdminProductInvoicesForPayments({ paid, take, skip }),
    },
    client
  );
};

export const useAdminSingleProductInvoice = (invoiceId: string) => {
  return useQuery<ProductInvoiceWithUser>(
    {
      queryKey: [...PrivateQueryKeys.adminProductInvoices, invoiceId],
      queryFn: async () => await fetchAdminSingleProductInvoice(invoiceId),
    },
    client
  );
};

export const useAdminShippingInvoices = ({
  paid,
  take = 1000,
  skip = 0,
}: {
  paid: string;
  take?: number;
  skip?: number;
}) => {
  return useQuery<ShippingInvoiceWithUser[]>(
    {
      queryKey: PrivateQueryKeys.adminShippingInvoices,
      queryFn: async () =>
        await fetchAdminShippingInvoicesForPayments({ paid, take, skip }),
    },
    client
  );
};

export const useAdminSingleShippingInvoice = (invoiceId: string) => {
  return useQuery<ShippingInvoiceWithUser>(
    {
      queryKey: [...PrivateQueryKeys.adminShippingInvoices, invoiceId],
      queryFn: async () => await fetchAdminSingleShippingInvoice(invoiceId),
    },
    client
  );
};

export const useAdminShippingRequests = (status: ShippingRequestStatus) => {
  return useQuery<ShippingRequestWithInvoices[]>(
    {
      queryKey: [...PrivateQueryKeys.adminShippingRequests, status],
      queryFn: async () => await fetchAdminShippingRequests(status),
    },
    client
  );
};

export const useDefaultAddress = () => {
  return useQuery<DefaultAddressWithShippingMethod>(
    {
      queryKey: PrivateQueryKeys.defaultAddress,
      queryFn: async () => await fetchDefaultAddress(),
    },
    client
  );
};

export const useAdminUsers = ({
  take = 1000,
  skip = 0,
}: {
  take?: number;
  skip?: number;
}) => {
  return useQuery<UserWithCredits[]>(
    {
      queryKey: [...PrivateQueryKeys.adminUsers, take, skip],
      queryFn: async () => await fetchAdminUsers({ take, skip }),
    },
    client
  );
};

export const useAdminSearchUsers = (searchTerm: string) => {
  return useQuery<UserWithCredits[]>(
    {
      queryKey: [...PrivateQueryKeys.adminUsers, "search", searchTerm],
      queryFn: async () => await fetchAdminSearchUsers(searchTerm),
      enabled: !!searchTerm,
    },
    client
  );
};

export const useAdminUserAccountInfo = (userId: string) => {
  return useQuery<CompleteUser>(
    {
      queryKey: [...PrivateQueryKeys.adminUsers, "account-info", userId],
      queryFn: async () => await fetchAdminUserAccountInfo(userId),
    },
    client
  );
};
