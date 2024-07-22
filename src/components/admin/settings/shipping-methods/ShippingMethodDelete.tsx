import type { country } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useMutation } from "@tanstack/react-query";
import {
  PrivateQueryKeys,
  deleteShippingMethod,
} from "@/lib/react-query/config";

import type { z } from "zod";
import { client } from "@/stores/admin";
import { cloneDeep } from "lodash-es";
import { Button } from "@/components/ui/button";
import type { ShippingMethodSchema } from "@/definitions/zod-definitions";

const DeleteCountry = ({
  open,
  close,
  country,
}: {
  open: boolean;
  close: () => void;
  country: country;
}) => {
  const mutation = useMutation(
    {
      mutationKey: PrivateQueryKeys.countries,
      mutationFn: async (values: z.infer<typeof ShippingMethodSchema>) => {
        return await deleteShippingMethod(values);
      },
      onMutate: async (newCountry) => {
        await client.cancelQueries({ queryKey: PrivateQueryKeys.countries });

        const previousShippingMethods = client.getQueryData<
          z.infer<typeof ShippingMethodSchema>[]
        >(PrivateQueryKeys.countries)!;

        const newShippingMethods = cloneDeep(previousShippingMethods).filter(
          (country) => country.id !== newCountry.id,
        );

        client.setQueryData(PrivateQueryKeys.countries, newShippingMethods);
        return { previousShippingMethods, newShippingMethods };
      },

      onSuccess: (data) => {
        if (data.message) alert(data?.message);
        close();
      },
      onError: (err, newShippingMethods, context) => {
        console.log("error", err);
        client.setQueryData(
          PrivateQueryKeys.countries,
          context!.previousShippingMethods,
        );
      },
      onSettled: () => {
        client.invalidateQueries({ queryKey: PrivateQueryKeys.countries });
      },
    },
    client,
  );
  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>배송방법 삭제</DialogTitle>
          <DialogDescription>
            주문, 계정 등에 이미 사용된 배송방법은 삭제할수 없습니다
          </DialogDescription>
        </DialogHeader>
        <div>
          <Button
            className="flex mr-0 ml-auto w-36"
            variant="destructive"
            disabled={mutation.isPending}
            onClick={() => {
              mutation.mutate(country);
            }}
          >
            삭제
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCountry;
