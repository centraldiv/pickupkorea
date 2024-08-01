import { Label } from "@/components/ui/label";
import {
  BuyOrderStatus,
  ItemStatus,
  PFOrderStatus,
  ShippingRequestStatus,
} from "@/definitions/statuses";
import {
  useSingleAdminOrder,
  type AdminBuyOrderWithItemsAndAddress,
  type ShippingRequestWithInvoices,
} from "@/lib/react-query/hooks";
import { useMutation } from "@tanstack/react-query";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { client } from "@/stores/admin";
import {
  getPrivateQueryKeys,
  updateAdminOrderStatus,
  type OrderType,
} from "@/lib/react-query/config";
import { cloneDeep } from "lodash-es";

const AdminSingleOrderStatus = ({
  orderId,
  orderType,
}: {
  orderId: string;
  orderType: OrderType;
}) => {
  const { data } = useSingleAdminOrder({ orderId, orderType });

  const mutation = useMutation(
    {
      mutationKey: getPrivateQueryKeys({
        keys: [orderId],
        orderType,
        admin: true,
      }),
      mutationFn: async ({
        value,
        orderId,
      }: {
        value: BuyOrderStatus | PFOrderStatus | ShippingRequestStatus;
        orderId: string;
      }) => {
        return await updateAdminOrderStatus({
          orderId,
          orderType,
          orderStatus: value,
        });
      },
      onMutate: async ({
        value,
        orderId,
      }: {
        value: BuyOrderStatus | PFOrderStatus | ShippingRequestStatus;
        orderId: string;
      }) => {
        await client.cancelQueries({
          queryKey: getPrivateQueryKeys({
            orderType,
            keys: [orderId],
            admin: true,
          }),
        });

        const previousOrderState = client.getQueryData<
          AdminBuyOrderWithItemsAndAddress | ShippingRequestWithInvoices
        >(
          getPrivateQueryKeys({
            orderType,
            keys: [orderId],
            admin: true,
          })
        )!;

        const newOrderState = cloneDeep(previousOrderState);

        if (
          (orderType === "BuyOrder" || orderType === "PFOrder") &&
          "orderStatus" in newOrderState &&
          "orderStatus" in previousOrderState
        ) {
          newOrderState.orderStatus = value;
          if (orderType === "BuyOrder") {
            if (
              previousOrderState.orderStatus ===
                BuyOrderStatus.PRODUCT_INVOICED &&
              value === BuyOrderStatus.AWAITING_PURCHASE
            ) {
              newOrderState.items.forEach((item) => {
                if (item.productStatus === ItemStatus.PRODUCT_INVOICED) {
                  item.productStatus = ItemStatus.AWAITING_PURCHASE;
                }
              });
            }
            if (
              previousOrderState.orderStatus ===
                BuyOrderStatus.AWAITING_PURCHASE &&
              value === BuyOrderStatus.AWAITING_ARRIVAL
            ) {
              newOrderState.purchaseDate = new Date();
              newOrderState.items.forEach((item) => {
                if (item.productStatus === ItemStatus.AWAITING_PURCHASE) {
                  item.productStatus = ItemStatus.AWAITING_ARRIVAL;
                }
              });
            }
          }

          if (orderType === "PFOrder") {
            if (
              previousOrderState.orderStatus === PFOrderStatus.PENDING &&
              value === PFOrderStatus.AWAITING_ARRIVAL
            ) {
              newOrderState.items.forEach((item) => {
                item.productStatus = ItemStatus.AWAITING_ARRIVAL;
              });
            }
          }
        }

        if (
          orderType === "ShippingRequest" &&
          "requestStatus" in newOrderState
        ) {
          newOrderState.requestStatus = value;
        }

        client.setQueryData(
          getPrivateQueryKeys({
            admin: true,
            keys: [orderId],
            orderType,
          }),
          newOrderState
        );
        return { previousOrderState, newOrderState };
      },
      onSuccess: (data) => {
        if (data.message) alert(data?.message);
      },
      onError: (err, newOrderState, context) => {
        alert("주문 상태 변경에 실패했습니다.");
        client.setQueryData(
          getPrivateQueryKeys({
            admin: true,
            keys: [orderId],
            orderType,
          }),
          context!.previousOrderState
        );
      },
    },
    client
  );

  if (orderType !== "ShippingRequest")
    return (
      <>
        <Label className=" font-medium">주문 상태:</Label>
        <Select
          value={data && "orderStatus" in data ? data?.orderStatus : ""}
          onValueChange={(value: BuyOrderStatus | PFOrderStatus) => {
            mutation.mutate({ value, orderId });
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="주문 상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>주문 상태</SelectLabel>
              {orderType === "BuyOrder" &&
                Object.values(BuyOrderStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              {orderType === "PFOrder" &&
                Object.values(PFOrderStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </>
    );

  if (orderType === "ShippingRequest")
    return (
      <>
        <Label className=" font-medium">주문 상태:</Label>
        <Select
          value={data && "requestStatus" in data ? data?.requestStatus : ""}
          onValueChange={(value: ShippingRequestStatus) => {
            mutation.mutate({ value, orderId });
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="주문 상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>주문 상태</SelectLabel>
              {Object.values(ShippingRequestStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </>
    );
};

export default AdminSingleOrderStatus;
