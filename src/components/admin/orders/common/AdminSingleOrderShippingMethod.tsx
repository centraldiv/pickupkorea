import { Label } from "@/components/ui/label";
import {
  usePublicShippingMethods,
  useSingleAdminBuyOrder,
  useSingleAdminOrder,
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
  getPrivateQueryKeys,
  updateAdminOrderShippingMethod,
  type OrderType,
} from "@/lib/react-query/config";
import { cloneDeep } from "lodash-es";

const AdminSingleOrderShippingMethod = ({
  orderId,
  orderType,
}: {
  orderId: string;
  orderType: OrderType;
}) => {
  const { data } = useSingleAdminOrder({ orderId, orderType });
  const { data: shippingMethods } = usePublicShippingMethods();
  const [shippingMethod, setShippingMethod] = useState<string>(
    data?.shippingMethod?.name as string
  );

  const mutation = useMutation(
    {
      mutationKey: getPrivateQueryKeys({
        admin: true,
        orderType,
        keys: [orderId],
      }),
      mutationFn: async ({
        shippingMethodName,
        orderId,
        orderType,
      }: {
        shippingMethodName: string;
        orderId: string;
        orderType: OrderType;
      }) => {
        return await updateAdminOrderShippingMethod({
          name: shippingMethodName,
          orderId,
          orderType,
        });
      },
      onMutate: async ({
        shippingMethodName,
        orderId,
        orderType,
      }: {
        shippingMethodName: string;
        orderId: string;
        orderType: OrderType;
      }) => {
        await client.cancelQueries({
          queryKey: getPrivateQueryKeys({
            admin: true,
            orderType,
            keys: [orderId],
          }),
        });

        const previousOrderState =
          client.getQueryData<AdminBuyOrderWithItemsAndAddress>(
            getPrivateQueryKeys({
              admin: true,
              orderType,
              keys: [orderId],
            })
          )!;

        const newOrderState = cloneDeep(previousOrderState);

        newOrderState.shippingMethod = {
          name: shippingMethodName,
          id: Math.random().toString(),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        client.setQueryData(
          getPrivateQueryKeys({
            admin: true,
            orderType,
            keys: [orderId],
          }),
          newOrderState
        );
        return { previousOrderState, newOrderState };
      },
      onSuccess: (data) => {
        if (data.message) alert(data?.message);
      },
      onError: (err, newOrderState, context) => {
        alert("배송 방법 변경에 실패했습니다.");
        client.setQueryData(
          getPrivateQueryKeys({
            admin: true,
            orderType,
            keys: [orderId],
          }),
          context!.previousOrderState
        );
      },
      onSettled: () => {
        client.invalidateQueries({
          queryKey: getPrivateQueryKeys({
            admin: true,
            orderType,
            keys: [orderId],
          }),
        });
      },
    },
    client
  );
  return (
    <>
      <Label className=" font-medium">배송 방법:</Label>
      <Select
        value={shippingMethod}
        onValueChange={(value: string) => {
          setShippingMethod(value);
          mutation.mutate({ shippingMethodName: value, orderId, orderType });
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

export default AdminSingleOrderShippingMethod;
