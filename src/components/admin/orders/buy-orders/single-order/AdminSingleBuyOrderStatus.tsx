import { Label } from "@/components/ui/label";
import { BuyOrderStatus } from "@/definitions/statuses";
import {
  useSingleAdminBuyOrder,
  type AdminBuyOrderWithItemsAndAddress,
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
  PrivateQueryKeys,
  updateAdminBuyOrderStatus,
} from "@/lib/react-query/config";
import { cloneDeep } from "lodash-es";

const AdminSingleBuyOrderStatus = ({ orderId }: { orderId: string }) => {
  const { data } = useSingleAdminBuyOrder(orderId);

  const mutation = useMutation(
    {
      mutationKey: [...PrivateQueryKeys.adminBuyOrders, orderId],
      mutationFn: async ({
        value,
        orderId,
      }: {
        value: BuyOrderStatus;
        orderId: string;
      }) => {
        return await updateAdminBuyOrderStatus(value, orderId);
      },
      onMutate: async ({
        value,
        orderId,
      }: {
        value: BuyOrderStatus;
        orderId: string;
      }) => {
        await client.cancelQueries({
          queryKey: [...PrivateQueryKeys.adminBuyOrders, orderId],
        });

        const previousOrderState =
          client.getQueryData<AdminBuyOrderWithItemsAndAddress>([
            ...PrivateQueryKeys.adminBuyOrders,
            orderId,
          ])!;

        const newOrderState = cloneDeep(previousOrderState);

        newOrderState.orderStatus = value;

        client.setQueryData(
          [...PrivateQueryKeys.adminBuyOrders, orderId],
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
          [...PrivateQueryKeys.adminBuyOrders, orderId],
          context!.previousOrderState
        );
      },
    },
    client
  );
  return (
    <>
      <Label className=" font-medium">주문 상태:</Label>
      <Select
        value={data?.orderStatus}
        onValueChange={(value: BuyOrderStatus) => {
          mutation.mutate({ value, orderId });
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="주문 상태" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>주문 상태</SelectLabel>
            {Object.values(BuyOrderStatus).map((status) => (
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

export default AdminSingleBuyOrderStatus;
