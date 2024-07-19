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
import { PublicQueryKeys, addShippingMethod } from "@/lib/react-query/config";
import { client } from "@/stores/admin";
import type { availableShippingMethods } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";

const AddShippingMethodForm = () => {
  const mutation = useMutation(
    {
      mutationKey: PublicQueryKeys.shippingMethods,
      mutationFn: async (values: z.infer<typeof ShippingMethodSchema>) => {
        return await addShippingMethod(values);
      },
      onMutate: async (newShippingMethod) => {
        await client.cancelQueries({
          queryKey: PublicQueryKeys.shippingMethods,
        });

        const previousShippingMethods = client.getQueryData<
          availableShippingMethods[]
        >(PublicQueryKeys.shippingMethods)!;

        if (previousShippingMethods) {
        }
        const newShippingMethods = [
          ...previousShippingMethods,
          newShippingMethod,
        ];
        client.setQueryData(
          PublicQueryKeys.shippingMethods,
          newShippingMethods.sort((a, b) => a.name.localeCompare(b.name)),
        );
        return { previousShippingMethods, newShippingMethods };
      },
      onSuccess: () => {
        alert("배송방법이 추가되었습니다.");
        form.reset({ name: "", isActive: true });
      },
      onError: (err, newCountries, context) => {
        client.setQueryData(
          PublicQueryKeys.shippingMethods,
          context!.previousShippingMethods,
        );
      },
      onSettled: () => {
        client.invalidateQueries({ queryKey: PublicQueryKeys.shippingMethods });
      },
    },
    client,
  );

  const form = useForm({
    resolver: zodResolver(ShippingMethodSchema),
    defaultValues: {
      name: "",
      isActive: true,
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
              <FormLabel>배송방법명</FormLabel>
              <FormControl>
                <Input {...field} placeholder="배송방법명을 입력해주세요." />
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

        <Button type="submit" className="mt-6 mr-0 ml-auto flex">
          배송방법 추가
        </Button>
      </form>
    </Form>
  );
};

export default AddShippingMethodForm;
