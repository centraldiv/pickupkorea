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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UseFormReturn } from "react-hook-form";
import { ClientPFOrderSchema } from "@/definitions/zod-definitions";
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

const PFOrderSteps = ({
  form,
  countries,
  shippingMethods,
}: {
  form: UseFormReturn<z.infer<typeof ClientPFOrderSchema>>;
  countries: country[];
  shippingMethods: availableShippingMethods[];
}) => {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: defaultAddress, isLoading } = useDefaultAddress();

  const onSubmitAddressOrder = (
    values: z.infer<typeof ClientPFOrderSchema>
  ) => {
    if (!values.shippingMethodId) {
      alert("Please select a shipping method");
      return;
    }
    setStep(2);
  };

  const onSubmitFinalStep = async (
    values: z.infer<typeof ClientPFOrderSchema>
  ) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(
        "/api/private/users/orders/pf-order/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );
      const { message, orderId }: { message: string; orderId?: string } =
        await response.json();
      if (!response.ok) {
        return alert(message);
      }
      localStorage.removeItem("pfOrderForm");

      window.location.href = `/account/submit-order/pf-order/success?orderId=${orderId}`;
    } catch (error) {
      console.error(error);
      alert("Error: Failed to submit package forwarding order");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <section className="max-w-7xl mx-auto w-full px-4">
      {step === 0 && (
        <>
          <h1 className="text-2xl font-medium mt-12 text-center">
            Please choose one of the following
          </h1>
          <div className="grid md:grid-cols-2 gap-4 py-12">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Standalone Order</CardTitle>
                <CardDescription className="h-12">
                  This order will be prepared for shipping immediately when
                  everything arrives.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-pretty md:h-32 lg:h-24">
                  Once everything in this order arrives at our office, we will
                  carefully prepare the package for international shipping and
                  dispatch. A shipping invoice will be issued to you as soon as
                  it is ready, and once paid, we will dispatch the package.
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => {
                    setStep(1);
                    form.setValue("address", addressDefault);
                    form.setValue("shipRightAway", true);
                  }}
                >
                  Pick this option
                </Button>
              </CardFooter>
            </Card>
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Mix and Match Order</CardTitle>
                <CardDescription className="h-12">
                  You can choose to add more orders and have us prepare a
                  shipping package when you're ready.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-pretty md:h-32 lg:h-24">
                  This order will not be shipped till you give us the go ahead
                  to ship it. You can add more orders to this one and we will
                  prepare a package for you whenever you're ready.
                </p>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => setStep(2)}>
                  Pick this option
                </Button>
              </CardFooter>
            </Card>
          </div>
        </>
      )}
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
                <Button className="mt-6 w-full" type="submit">
                  Submit Order
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
          </article>
        </>
      )}
    </section>
  );
};

export default PFOrderSteps;
