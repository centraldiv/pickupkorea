import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  ShippingRequestItemSchema,
  ShippingRequestSchema,
} from "@/definitions/zod-definitions";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type { z } from "zod";
import type { availableShippingMethods, country } from "@prisma/client";
import ShippingRequestSteps from "./ShippingRequestSteps";

const ShippingRequestForm = ({
  countries,
  shippingMethods,
  shippableItems,
}: {
  countries: country[];
  shippingMethods: availableShippingMethods[];
  shippableItems: z.infer<typeof ShippingRequestItemSchema>[];
}) => {
  const formDefault = {
    shipRightAway: false,
    userMemo: "",
    items: shippableItems,
  };

  const [nextStep, setNextStep] = useState(false);

  const form = useForm<z.infer<typeof ShippingRequestSchema>>({
    resolver: zodResolver(ShippingRequestSchema),
    mode: "onBlur",
    defaultValues: formDefault,
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = (values: z.infer<typeof ShippingRequestSchema>) => {
    if (
      values.items.some(
        (item) =>
          item.toShipQuantity <= item.availableQuantity &&
          item.toShipQuantity > 0
      )
    ) {
      if (!nextStep) {
        setNextStep(true);
        return;
      }
    } else {
      alert("There is nothing to ship.");
    }
  };

  if (shippableItems.length === 0) {
    return (
      <section className="max-w-7xl mx-auto w-full py-16 text-center font-semibold text-lg">
        No items to ship
      </section>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      {nextStep ? (
        <ShippingRequestSteps
          form={form}
          countries={countries}
          shippingMethods={shippingMethods}
        />
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn(
              "py-16 grid gap-8",
              fields.length === 1 && "grid-cols-1",
              fields.length === 2 && "sm:grid-cols-2",
              fields.length >= 3 && "lg:grid-cols-3 sm:grid-cols-2"
            )}
          >
            {fields.map((field, i) => (
              <div
                key={field.id}
                className="grid grid-rows-[auto_1fr] p-2 rounded-lg border shadow relative"
              >
                <span className="absolute -top-4 -left-4 bg-primary aspect-square text-white rounded-full size-8 flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-black text-white rounded-md px-2"></span>
                <FormField
                  control={form.control}
                  name={`items.${i}.href`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="underline">
                        <a href={field.value} target="_blank">
                          Link to Product
                        </a>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          placeholder="https://www.example.com/link-to-product"
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <fieldset className="grid grid-cols-2 gap-4 mt-2">
                  <FormField
                    control={form.control}
                    name={`items.${i}.option`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Option</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Color, Size, Etc"
                            disabled
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${i}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity Ordered</FormLabel>
                        <FormControl>
                          <Input type="number" step="1" {...field} disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </fieldset>
                <FormField
                  control={form.control}
                  name={`items.${i}.memo`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Memo</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          placeholder="Any special note for this item?"
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <fieldset className="grid grid-cols-2 gap-2 py-2">
                  <FormField
                    control={form.control}
                    name={`items.${i}.unboxingPhotoRequested`}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 py-2">
                        <FormControl>
                          <Checkbox checked={field.value} disabled />
                        </FormControl>
                        <FormLabel className="!mt-0">
                          Request unboxed photo
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${i}.unboxingVideoRequested`}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 py-2">
                        <FormControl>
                          <Checkbox checked={field.value} disabled />
                        </FormControl>
                        <FormLabel className="!mt-0">
                          Request unboxed video
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </fieldset>
                <FormField
                  control={form.control}
                  name={`items.${i}.isInclusion`}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 py-2">
                      <FormControl>
                        <Checkbox checked={field.value} disabled />
                      </FormControl>
                      <FormLabel className="!mt-0">
                        Only send inclusion (no packaging of product)
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <fieldset className="grid grid-cols-2 gap-2 py-2">
                  <FormField
                    control={form.control}
                    name={`items.${i}.availableQuantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="text-center"
                            {...field}
                            disabled
                            step="1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${i}.toShipQuantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>To Ship</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="text-center"
                            {...field}
                            step="1"
                          />
                        </FormControl>
                        <div className="min-h-6">
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </fieldset>
              </div>
            ))}

            <div className="col-span-full flex justify-center">
              <Button type="submit" className="mx-auto w-full max-w-sm">
                Next Step
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default ShippingRequestForm;
