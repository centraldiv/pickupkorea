import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import type { UseFormReturn } from "react-hook-form";
import { ShippingRequestSchema } from "@/definitions/zod-definitions";
import { z } from "zod";
import type { availableShippingMethods, country } from "@prisma/client";
import { useDefaultAddress } from "@/lib/react-query/hooks";

const addressDefault = {
  receiverName: "",
  phone: "",
  email: "",
  street: "",
  city: "",
  state: "",
  zipcode: "",
  country: "",
};

const ShippingRequestSteps = ({
  form,
  countries,
  shippingMethods,
}: {
  form: UseFormReturn<z.infer<typeof ShippingRequestSchema>>;
  countries: country[];
  shippingMethods: availableShippingMethods[];
}) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: defaultAddress, isLoading } = useDefaultAddress();

  const onSubmitAddressOrder = (
    values: z.infer<typeof ShippingRequestSchema>
  ) => {
    if (!values.shippingMethodId) {
      alert("Please select a shipping method");
      return;
    }
    setStep(2);
  };

  const onSubmitFinalStep = async (
    values: z.infer<typeof ShippingRequestSchema>
  ) => {
    try {
      if (
        !values.items.some(
          (item) =>
            item.toShipQuantity <= item.availableQuantity &&
            item.toShipQuantity > 0
        )
      ) {
        alert("There is nothing to ship.");
        return;
      }
      setIsSubmitting(true);

      const response = await fetch(
        "/api/private/users/orders/shipping-request/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...values,
            items: values.items.filter(
              (item) =>
                item.toShipQuantity <= item.availableQuantity &&
                item.toShipQuantity > 0
            ),
          }),
        }
      );
      const {
        message,
        shippingRequestId,
      }: { message: string; shippingRequestId?: string } =
        await response.json();
      if (!response.ok) {
        return alert(message);
      }

      window.location.href = `/account/submit-order/shipping-request/success?requestId=${shippingRequestId}`;
    } catch (error) {
      console.error(error);
      alert("Error: Failed to submit shipping request");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <section className="max-w-7xl mx-auto w-full px-4">
      {step === 1 && (
        <>
          <h1 className="text-2xl font-medium mt-12 text-center">
            Shipping Address
          </h1>
          <aside className="max-w-md w-full mx-auto mt-12">
            <Button
              className="w-full"
              type="button"
              disabled={isLoading}
              onClick={() => {
                if (!defaultAddress) {
                  return alert("You haven't saved a default address yet!");
                }
                form.setValue("address", {
                  receiverName: defaultAddress?.receiverName,
                  phone: defaultAddress?.phone,
                  email: defaultAddress?.email,
                  street: defaultAddress?.street,
                  city: defaultAddress?.city,
                  state: defaultAddress?.state,
                  zipcode: defaultAddress?.zipcode,
                  country: defaultAddress?.country.id,
                });
                form.setValue(
                  "shippingMethodId",
                  defaultAddress?.shippingMethodId as string
                );

                console.log(form.getValues());
              }}
            >
              {isLoading ? "Loading..." : "Load Default"}
            </Button>
          </aside>
          <Form {...form}>
            <form
              className="max-w-md mx-auto w-full py-12"
              onSubmit={form.handleSubmit(onSubmitAddressOrder)}
            >
              <FormField
                control={form.control}
                name="address.receiverName"
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
                name="address.email"
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
                name="address.phone"
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
                name="address.street"
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
                name="address.city"
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
                name="address.state"
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
                name="address.zipcode"
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
                name="address.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {shippingMethods.map((shippingMethod) => (
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

              <Button className="mt-6 w-full" type="submit">
                Final Step
              </Button>
              <Button
                className="mt-6 w-full"
                onClick={() => setStep(0)}
                variant={"outline"}
              >
                Back
              </Button>
            </form>
          </Form>
        </>
      )}
      {step === 2 && (
        <>
          <h1 className="text-2xl font-medium mt-12 text-center">Final Step</h1>
          <article className="max-w-lg mx-auto w-full py-12 grid gap-6">
            <p>
              This final step is an optional step, you can skip it if you don't
              want to add any additional information about the order. Below, you
              can leave us a note about the order! Any specifics we might need
              to know, or any other information you'd like to share about this
              order such as being careful with a particular item needs to be
              mentioned below!
            </p>
            <p>
              If this order contains any event promos such as Video Call Events
              with your favorite artists, please leave us your event details
              below!
            </p>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmitFinalStep)}
                className="max-w-lg mx-auto w-full py-12"
              >
                <FormField
                  control={form.control}
                  name="userMemo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Memo</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={15}
                          className="resize-none overflow-scroll scrollbar-hide shadow"
                          {...field}
                          placeholder="Leave us a note about the order!"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  className="mt-6 w-full"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Order"}
                </Button>
                <Button
                  className="mt-6 w-full"
                  onClick={() => setStep(1)}
                  variant={"outline"}
                >
                  Back
                </Button>
              </form>
            </Form>
          </article>
        </>
      )}
    </section>
  );
};

export default ShippingRequestSteps;
