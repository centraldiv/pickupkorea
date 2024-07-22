import { Label } from "@/components/ui/label";
import {
  usePublicShippingMethods,
  useSingleAdminBuyOrder,
  type AdminBuyOrderWithItemsAndAddress,
} from "@/lib/react-query/hooks";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
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
  updateAdminBuyOrderShippingMethod,
} from "@/lib/react-query/config";
import { cloneDeep } from "lodash-es";

const AdminSingleBuyOrderShippingMethod = ({
  orderId,
}: {
  orderId: string;
}) => {
  const { data } = useSingleAdminBuyOrder(orderId);
  const { data: shippingMethods } = usePublicShippingMethods();
  const [shippingMethod, setShippingMethod] = useState<string>(
    data?.shippingMethod?.name as string,
  );

  const mutation = useMutation(
    {
      mutationKey: [...PrivateQueryKeys.adminBuyOrders, orderId],
      mutationFn: async ({
        shippingMethodName,
        orderId,
      }: {
        shippingMethodName: string;
        orderId: string;
      }) => {
        return await updateAdminBuyOrderShippingMethod({
          name: shippingMethodName,
          orderId,
        });
      },
      onMutate: async ({
        shippingMethodName,
        orderId,
      }: {
        shippingMethodName: string;
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

        newOrderState.shippingMethod = {
          name: shippingMethodName,
          id: Math.random().toString(),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        client.setQueryData(
          [...PrivateQueryKeys.adminBuyOrders, orderId],
          newOrderState,
        );
        return { previousOrderState, newOrderState };
      },
      onSuccess: (data) => {
        if (data.message) alert(data?.message);
      },
      onError: (err, newOrderState, context) => {
        alert("배송 방법 변경에 실패했습니다.");
        client.setQueryData(
          [...PrivateQueryKeys.adminBuyOrders, orderId],
          context!.previousOrderState,
        );
      },
      onSettled: () => {
        client.invalidateQueries({
          queryKey: [...PrivateQueryKeys.adminBuyOrders, orderId],
        });
      },
    },
    client,
  );
  return (
    <>
      <Label className=" font-medium">배송 방법:</Label>
      <Select
        value={shippingMethod}
        onValueChange={(value: string) => {
          setShippingMethod(value);
          mutation.mutate({ shippingMethodName: value, orderId });
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="주문 상태" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>배송 방법</SelectLabel>
            {shippingMethods?.map((method) => (
              <SelectItem key={method.id} value={method.name}>
                {method.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  );
};

export default AdminSingleBuyOrderShippingMethod;
