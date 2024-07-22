import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PrivateQueryKeys,
  updateAdminBuyOrderStaffMemo,
} from "@/lib/react-query/config";
import {
  useSingleAdminBuyOrder,
  type AdminBuyOrderWithItemsAndAddress,
} from "@/lib/react-query/hooks";
import { client } from "@/stores/admin";
import { useMutation } from "@tanstack/react-query";
import { cloneDeep } from "lodash-es";
import { useState } from "react";

const AdminSingleBuyOrderStaffMemo = ({ orderId }: { orderId: string }) => {
  const { data } = useSingleAdminBuyOrder(orderId);
  const [staffMemo, setStaffMemo] = useState<string>(data?.staffMemo || "");

  const mutation = useMutation(
    {
      mutationKey: [...PrivateQueryKeys.adminBuyOrders, orderId],
      mutationFn: async ({
        orderId,
        staffMemo,
      }: {
        orderId: string;
        staffMemo: string;
      }) => {
        return await updateAdminBuyOrderStaffMemo(orderId, staffMemo);
      },
      onMutate: async ({
        staffMemo,
        orderId,
      }: {
        staffMemo: string;
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

        newOrderState.staffMemo = staffMemo;

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
        alert("관리자 메모 수정에 실패했습니다.");
        client.setQueryData(
          [...PrivateQueryKeys.adminBuyOrders, orderId],
          context!.previousOrderState,
        );
      },
    },
    client,
  );

  if (!data) return null;

  return (
    <div className="flex flex-col gap-4 px-4">
      <Label className="block text-center">관리자 메모</Label>
      <Textarea
        value={staffMemo}
        onChange={(e) => setStaffMemo(e.target.value)}
        onBlur={() => {
          mutation.mutate({ orderId, staffMemo });
        }}
        placeholder="관리자용 메모입니다. 고객에게 안보입니다."
        className="resize-none overflow-y-scroll h-fit"
        rows={8}
      />
    </div>
  );
};

export default AdminSingleBuyOrderStaffMemo;
