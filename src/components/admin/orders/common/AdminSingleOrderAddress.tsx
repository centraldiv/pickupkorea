import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { OrderAddressSchema } from "@/definitions/zod-definitions";
import {
  usePublicCountries,
  useSingleAdminOrder,
} from "@/lib/react-query/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/stores/admin";
import {
  getPrivateQueryKeys,
  updateAdminOrderAddress,
  type OrderType,
} from "@/lib/react-query/config";

const AdminSingleOrderAddress = ({
  orderId,
  orderType,
}: {
  orderId: string;
  orderType: OrderType;
}) => {
  const { data } = useSingleAdminOrder({ orderId, orderType });
  const { data: countries } = usePublicCountries();

  if (!data || !data.address) return null;

  const form = useForm<z.infer<typeof OrderAddressSchema>>({
    resolver: zodResolver(OrderAddressSchema),
    defaultValues: {
      id: data.address.id,
      receiverName: data.address.receiverName,
      phone: data.address.phone,
      email: data.address.email,
      street: data.address.street,
      city: data.address.city,
      state: data.address.state,
      zipcode: data.address.zipcode,
      country: data.address.country.name,
      orderId: orderId,
    },
  });

  const mutation = useMutation(
    {
      mutationKey: getPrivateQueryKeys({
        admin: true,
        orderType,
        keys: [orderId],
      }),
      mutationFn: async (values: z.infer<typeof OrderAddressSchema>) => {
        return await updateAdminOrderAddress({
          orderType,
          values,
        });
      },
      onMutate: async () => {
        await client.cancelQueries({
          queryKey: getPrivateQueryKeys({
            admin: true,
            orderType,
            keys: [orderId],
          }),
        });
      },
      onSuccess: (data) => {
        if (data.message) {
          alert(data?.message);
        }
      },
      onError: (error) => {
        alert("오류로 수령 주소지 수정에 실패했습니다.");
        return window.location.reload();
      },
    },
    client
  );
  const onSubmit = (values: z.infer<typeof OrderAddressSchema>) => {
    mutation.mutate(values);
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="shadow border px-4 rounded-md py-2"
      >
        <h1 className="text-center text-lg font-medium">수령 주소지</h1>
        <FormField
          control={form.control}
          name="receiverName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Receiver Name</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Receiver Phone</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Receiver Email</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State / Province</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="zipcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zipcode</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {countries &&
                    Array.isArray(countries) &&
                    countries.map((country) => (
                      <SelectItem value={country.name} key={country.id}>
                        {country.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="mt-6 w-full"
          variant={"secondary"}
          disabled={mutation.isPending || !countries || !data}
        >
          저장
        </Button>
      </form>
    </Form>
  );
};

export default AdminSingleOrderAddress;
