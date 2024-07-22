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
import { PrivateQueryKeys, addCountry } from "@/lib/react-query/config";
import { client } from "@/stores/admin";
import type { country } from "@prisma/client";

const AddCountryForm = () => {
  const mutation = useMutation(
    {
      mutationKey: PrivateQueryKeys.countries,
      mutationFn: async (values: z.infer<typeof CountrySchema>) => {
        return await addCountry(values);
      },
      onMutate: async (newCountry) => {
        await client.cancelQueries({ queryKey: PrivateQueryKeys.countries });

        const previousCountries = client.getQueryData<country[]>(
          PrivateQueryKeys.countries,
        )!;

        if (previousCountries) {
        }
        const newCountries = [...previousCountries, newCountry];
        client.setQueryData(
          PrivateQueryKeys.countries,
          newCountries.sort((a, b) => a.name.localeCompare(b.name)),
        );
        return { previousCountries, newCountries };
      },
      onSuccess: () => {
        form.reset({ name: "", code: "" });
      },
      onError: (err, newCountries, context) => {
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
      name: "",
      code: "",
      isActive: true,
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
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>국가코드</FormLabel>
              <FormControl>
                <Input {...field} placeholder="국가코드를 입력해주세요." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="mt-6 mr-0 ml-auto flex">
          Add Country
        </Button>
      </form>
    </Form>
  );
};

export default AddCountryForm;
