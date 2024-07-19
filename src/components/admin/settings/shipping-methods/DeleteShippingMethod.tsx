import type { availableShippingMethods } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useMutation } from "@tanstack/react-query";
import {
  PublicQueryKeys,
  deleteCountry,
  deleteShippingMethod,
} from "@/lib/react-query/config";
import type {
  CountrySchema,
  ShippingMethodSchema,
} from "@/definitions/zod-definitions";
import type { z } from "zod";
import { client } from "@/stores/admin";
import { cloneDeep } from "lodash-es";
import { Button } from "@/components/ui/button";

const DeleteShippingMethod = ({
  open,
  close,
  shippingMethod,
}: {
  open: boolean;
  close: () => void;
  shippingMethod: availableShippingMethods;
}) => {
  const mutation = useMutation(
    {
      mutationKey: PublicQueryKeys.shippingMethods,
      mutationFn: async (values: z.infer<typeof ShippingMethodSchema>) => {
        return await deleteShippingMethod(values);
      },
      onMutate: async (newMethod) => {
        await client.cancelQueries({
          queryKey: PublicQueryKeys.shippingMethods,
        });

        const previousMethods = client.getQueryData<
          z.infer<typeof ShippingMethodSchema>[]
        >(PublicQueryKeys.shippingMethods)!;

        const newMethodList = cloneDeep(previousMethods).filter(
          (method) => method.id !== newMethod.id,
        );

        client.setQueryData(PublicQueryKeys.shippingMethods, newMethodList);
        return { previousMethods, newMethodList };
      },

      onSuccess: (data) => {
        if (data.message) alert(data?.message);
        close();
      },
      onError: (err, newMethodList, context) => {
        console.log("error", err);
        client.setQueryData(
          PublicQueryKeys.shippingMethods,
          context!.previousMethods,
        );
      },
      onSettled: () => {
        client.invalidateQueries({
          queryKey: PublicQueryKeys.shippingMethods,
        });
      },
    },
    client,
  );
  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Shipping Method</DialogTitle>
          <DialogDescription>
            주문, 계정 등에 이미 사용된 배송 방법을 삭제할수 없습니다.
            비활성화를 선택해주세요.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Button
            className="flex mr-0 ml-auto w-36"
            variant="destructive"
            onClick={() => {
              mutation.mutate(shippingMethod);
            }}
          >
            삭제
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteShippingMethod;
