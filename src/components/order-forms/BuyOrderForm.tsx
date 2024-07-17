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
import { ClientBuyOrderSchema } from "@/definitions/zod-definitions";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import type { z } from "zod";
import BuyOrderSteps from "./BuyOrderSteps";
import type { country } from "@prisma/client";

const formDefault = {
  shipRightAway: false,
  userMemo: "",
  items: [
    {
      href: "",
      quantity: 1,
      option: "",
      memo: "",
      unboxingPhotoRequested: false,
      unboxingVideoRequested: false,
      isInclusion: false,
    },
  ],
};
const BuyOrderForm = ({ countries }: { countries: country[] }) => {
  const [nextStep, setNextStep] = useState(false);

  const form = useForm<z.infer<typeof ClientBuyOrderSchema>>({
    resolver: zodResolver(ClientBuyOrderSchema),
    mode: "onBlur",
    defaultValues: formDefault,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const handleOnBlur = () => {
    localStorage.setItem("buyOrderForm", JSON.stringify(form.getValues()));
  };

  const handleDelete = (index: number) => {
    remove(index);
    localStorage.setItem("buyOrderForm", JSON.stringify(form.getValues()));
  };

  useEffect(() => {
    const buyItems = localStorage.getItem("buyOrderForm");
    if (buyItems) {
      const parsed = JSON.parse(buyItems);
      if (!parsed.items.length) {
        return form.reset(formDefault);
      }
      form.reset(parsed);
    }
  }, []);

  const onSubmit = (values: z.infer<typeof ClientBuyOrderSchema>) => {
    if (!nextStep) {
      setNextStep(true);
      return;
    }
  };
  return (
    <div className="max-w-7xl mx-auto w-full">
      {nextStep ? (
        <BuyOrderSteps form={form} countries={countries} />
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
            <div className="my-6 col-span-full">
              <Button
                onClick={() =>
                  append({
                    href: "",
                    quantity: 1,
                    option: "",
                    memo: "",
                    unboxingPhotoRequested: false,
                    unboxingVideoRequested: false,
                    isInclusion: false,
                  })
                }
              >
                Add Item
              </Button>
            </div>
            {fields.map((field, i) => (
              <div
                key={field.id}
                className="grid grid-rows-[auto_1fr] p-2 rounded-lg border shadow relative"
              >
                <span className="absolute -top-4 -left-4 bg-primary aspect-square text-white rounded-full size-8 flex items-center justify-center">
                  {i + 1}
                </span>
                <button
                  className="absolute -top-4 -right-4 bg-red-600 aspect-square text-white rounded-full size-8 flex items-center justify-center"
                  type="button"
                  onClick={() => handleDelete(i)}
                >
                  <XIcon className="size-4" />
                </button>
                <FormField
                  control={form.control}
                  name={`items.${i}.href`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link to Product</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          {...field}
                          onBlur={handleOnBlur}
                          placeholder="https://www.example.com/link-to-product"
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
                            onBlur={handleOnBlur}
                            placeholder="Color, Size, Etc"
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
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="1"
                            {...field}
                            onBlur={handleOnBlur}
                          />
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
                          onBlur={handleOnBlur}
                          placeholder="Any special note for this item?"
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
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
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
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
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
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">
                        Only send inclusion (no packaging of product)
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            ))}
            <div className="my-6 col-span-full">
              <Button
                onClick={() =>
                  append({
                    href: "",
                    quantity: 1,
                    option: "",
                    memo: "",
                    unboxingPhotoRequested: false,
                    unboxingVideoRequested: false,
                    isInclusion: false,
                  })
                }
              >
                Add Item
              </Button>
            </div>
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

export default BuyOrderForm;
