import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DefaultAddressSchema } from "@/definitions/zod-definitions";
import {
  usePublicCountries,
  usePublicShippingMethods,
  type DefaultAddressWithShippingMethod,
} from "@/lib/react-query/hooks";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import type { z } from "zod";
import { useState } from "react";

const DefaultAddressForm = ({
  defaultAddress,
}: {
  defaultAddress: DefaultAddressWithShippingMethod;
}) => {
  const [loading, setLoading] = useState(false);
  const { data: countries } = usePublicCountries();
  const { data: shippingMethods } = usePublicShippingMethods();
  const form = useForm<z.infer<typeof DefaultAddressSchema>>({
    resolver: zodResolver(DefaultAddressSchema),
    defaultValues: {
      receiverName: defaultAddress.receiverName ?? "",
      email: defaultAddress.email ?? "",
      phone: defaultAddress.phone ?? "",
      street: defaultAddress.street ?? "",
      city: defaultAddress.city ?? "",
      state: defaultAddress.state ?? "",
      zipcode: defaultAddress.zipcode ?? "",
      country: defaultAddress.country?.id ?? "",
      shippingMethodId: defaultAddress.shippingMethod?.id ?? "",
    },
  });

  const onSubmit = async (data: z.infer<typeof DefaultAddressSchema>) => {
    if (!data.shippingMethodId) {
      return alert("Please select a shipping method");
    }
    if (!data.country) {
      return alert("Please select a country");
    }
    setLoading(true);

    try {
      const resposne = await fetch("/api/private/users/default-address", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await resposne.json();
      if (json.success) {
        alert("Address updated");
      } else {
        alert(json.message);
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Form {...form}>
      <form
        className="max-w-md mx-auto w-full py-12"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="receiverName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Receiver Name</FormLabel>
              <FormControl>
                <Input {...field} required />
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
                <Input {...field} type="email" required />
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
                <Input {...field} required />
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
                <Input {...field} required />
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
                <Input {...field} required />
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
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input {...field} required />
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
                <Input
                  {...field}
                  required
                  placeholder="No zipcode? Please use 00000"
                />
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
                  {countries?.map((country) => (
                    <SelectItem value={country.id} key={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <h2 className="text-2xl font-medium mt-12 text-center">
          Shipping Method
        </h2>
        <FormField
          control={form.control}
          name="shippingMethodId"
          render={({ field }) => (
            <FormItem className="mt-6">
              <FormLabel>
                Please select your preferred shipping courier
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value ?? ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {shippingMethods?.map((shippingMethod) => (
                    <SelectItem
                      value={shippingMethod.id}
                      key={shippingMethod.id}
                    >
                      {shippingMethod.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="mt-6 w-full" type="submit" disabled={loading}>
          {loading ? "Loading..." : "Save"}
        </Button>
      </form>
    </Form>
  );
};

export default DefaultAddressForm;
