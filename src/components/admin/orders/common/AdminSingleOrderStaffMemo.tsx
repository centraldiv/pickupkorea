import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getPrivateQueryKeys,
  updateAdminStaffMemo,
  type OrderType,
} from "@/lib/react-query/config";
import {
  useSingleAdminOrder,
  type AdminBuyOrderWithItemsAndAddress,
} from "@/lib/react-query/hooks";
import { client } from "@/stores/admin";
import { useMutation } from "@tanstack/react-query";
import { cloneDeep } from "lodash-es";
import { useState } from "react";

const AdminSingleOrderStaffMemo = ({
  orderId,
  orderType,
}: {
  orderId: string;
  orderType: OrderType;
}) => {
  const { data } = useSingleAdminOrder({
    orderId,
    orderType,
  });
  const [staffMemo, setStaffMemo] = useState<string>(data?.staffMemo || "");

  const mutation = useMutation(
    {
      mutationKey: getPrivateQueryKeys({
        admin: true,
        orderType,
        keys: [orderId],
      }),
      mutationFn: async ({
        orderId,
        staffMemo,
        orderType,
      }: {
        orderId: string;
        staffMemo: string;
        orderType: OrderType;
      }) => {
        return await updateAdminStaffMemo({
          orderId,
          staffMemo,
          orderType,
        });
      },
      onMutate: async ({
        staffMemo,
        orderId,
        orderType,
      }: {
        staffMemo: string;
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

        newOrderState.staffMemo = staffMemo;

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
        alert("관리자 메모 수정에 실패했습니다.");
        client.setQueryData(
          getPrivateQueryKeys({
            admin: true,
            orderType,
            keys: [orderId],
          }),
          context!.previousOrderState
        );
      },
    },
    client
  );

  if (!data) return null;

  return (
    <div className="flex flex-col gap-4 px-4">
      <Label className="block text-center">관리자 메모</Label>
      <Textarea
        value={staffMemo}
        onChange={(e) => setStaffMemo(e.target.value)}
        onBlur={() => {
          mutation.mutate({ orderId, staffMemo, orderType });
        }}
        placeholder="관리자용 메모입니다. 고객에게 안보입니다."
        className="resize-none overflow-y-scroll h-fit"
        rows={8}
      />
    </div>
  );
};

export default AdminSingleOrderStaffMemo;
