import { cloneDeep } from "lodash-es";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import type { z } from "zod";
import { ShippingMethodSchema } from "@/definitions/zod-definitions";
import { useMutation } from "@tanstack/react-query";
import {
  PrivateQueryKeys,
  updateShippingMethod,
} from "@/lib/react-query/config";
import { client } from "@/stores/admin";
import type { availableShippingMethods } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";

const EditShippingMethodForm = ({
  shippingMethod,
}: {
  shippingMethod: availableShippingMethods;
}) => {
  const mutation = useMutation(
    {
      mutationKey: PrivateQueryKeys.shippingMethods,
      mutationFn: async (values: z.infer<typeof ShippingMethodSchema>) => {
        return await updateShippingMethod(values);
      },
      onMutate: async (newMethod) => {
        await client.cancelQueries({
          queryKey: PrivateQueryKeys.shippingMethods,
        });

        const previousMethods = client.getQueryData<
          z.infer<typeof ShippingMethodSchema>[]
        >(PrivateQueryKeys.shippingMethods)!;

        const newMethodList = cloneDeep(previousMethods);
        const index = newMethodList.findIndex(
          (method: z.infer<typeof ShippingMethodSchema>) =>
            method.id === newMethod.id,
        );
        newMethodList[index] = newMethod;

        client.setQueryData(PrivateQueryKeys.shippingMethods, newMethodList);
        return { previousMethods, newMethodList };
      },
      onSuccess: (data) => {
        if (data.message) alert(data?.message);
      },
      onError: (err, newMethodList, context) => {
        console.log("error", err);
        client.setQueryData(
          PrivateQueryKeys.shippingMethods,
          context!.previousMethods,
        );
      },
      onSettled: () => {
        client.invalidateQueries({
          queryKey: PrivateQueryKeys.shippingMethods,
        });
      },
    },
    client,
  );

  const form = useForm({
    resolver: zodResolver(ShippingMethodSchema),
    defaultValues: {
      name: shippingMethod.name.trim(),
      id: shippingMethod.id,
      isActive: shippingMethod.isActive,
    },
  });

  const onSubmit = (values: z.infer<typeof ShippingMethodSchema>) => {
    mutation.mutate(values);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>국가명</FormLabel>
              <FormControl>
                <Input {...field} placeholder="영문 국가명을 입력해주세요." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center my-6 gap-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="!mt-0 text-base">활성</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="mt-6 mr-0 ml-auto flex w-36"
          disabled={mutation.isPending}
        >
          수정
        </Button>
      </form>
    </Form>
  );
};

export default EditShippingMethodForm;
