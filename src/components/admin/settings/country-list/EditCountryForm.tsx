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
import { CountrySchema } from "@/definitions/zod-definitions";
import { useMutation } from "@tanstack/react-query";
import { PrivateQueryKeys, updateCountry } from "@/lib/react-query/config";
import { client } from "@/stores/admin";
import type { country } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";

const EditCountryForm = ({ country }: { country: country }) => {
  const mutation = useMutation(
    {
      mutationKey: PrivateQueryKeys.countries,
      mutationFn: async (values: z.infer<typeof CountrySchema>) => {
        return await updateCountry(values);
      },
      onMutate: async (newCountry) => {
        await client.cancelQueries({ queryKey: PrivateQueryKeys.countries });

        const previousCountries = client.getQueryData<
          z.infer<typeof CountrySchema>[]
        >(PrivateQueryKeys.countries)!;

        const newCountryList = cloneDeep(previousCountries);
        const index = newCountryList.findIndex(
          (country: z.infer<typeof CountrySchema>) =>
            country.id === newCountry.id,
        );
        newCountryList[index] = newCountry;

        client.setQueryData(PrivateQueryKeys.countries, newCountryList);
        return { previousCountries, newCountryList };
      },
      onSuccess: (data) => {
        if (data.message) alert(data?.message);
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

  const form = useForm({
    resolver: zodResolver(CountrySchema),
    defaultValues: {
      name: country.name.trim(),
      code: country.code.trim(),
      id: country.id,
      isActive: country.isActive,
    },
  });

  const onSubmit = (values: z.infer<typeof CountrySchema>) => {
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

export default EditCountryForm;
