import type { country } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useMutation } from "@tanstack/react-query";
import { PrivateQueryKeys, deleteCountry } from "@/lib/react-query/config";
import type { CountrySchema } from "@/definitions/zod-definitions";
import type { z } from "zod";
import { client } from "@/stores/admin";
import { cloneDeep } from "lodash-es";
import { Button } from "@/components/ui/button";

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
      mutationFn: async (values: z.infer<typeof CountrySchema>) => {
        return await deleteCountry(values);
      },
      onMutate: async (newCountry) => {
        await client.cancelQueries({ queryKey: PrivateQueryKeys.countries });

        const previousCountries = client.getQueryData<
          z.infer<typeof CountrySchema>[]
        >(PrivateQueryKeys.countries)!;

        const newCountryList = cloneDeep(previousCountries).filter(
          (country) => country.id !== newCountry.id,
        );

        client.setQueryData(PrivateQueryKeys.countries, newCountryList);
        return { previousCountries, newCountryList };
      },

      onSuccess: (data) => {
        if (data.message) alert(data?.message);
        close();
      },
      onError: (err, newCountryList, context) => {
        console.log("error", err);
        client.setQueryData(
          PrivateQueryKeys.countries,
          context!.previousCountries,
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
          <DialogTitle>Delete Country</DialogTitle>
          <DialogDescription>
            주문, 계정 등에 이미 사용된 국가를 삭제할 경우 오류가 발생할 수
            있습니다.
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
