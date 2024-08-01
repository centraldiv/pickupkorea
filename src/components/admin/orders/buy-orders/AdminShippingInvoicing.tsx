import {
  useSingleAdminOrder,
  type AdminBuyOrderWithItemsAndAddress,
} from "@/lib/react-query/hooks";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Big from "big.js";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InvoiceSchema } from "@/definitions/zod-definitions";
import type { z } from "zod";

import {
  getPrivateQueryKeys,
  issueShippingInvoice,
  type OrderType,
} from "@/lib/react-query/config";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/stores/admin";
import { cloneDeep } from "lodash-es";
import { BuyOrderStatus, ItemStatus } from "@/definitions/statuses";

const AdminShippingInvoicing = ({
  orderId,
  orderType,
  shipRightAway,
}: {
  orderId: string;
  orderType: OrderType;
  shipRightAway?: boolean;
}) => {
  const { data } = useSingleAdminOrder({ orderId, orderType });
  const [open, setOpen] = useState(false);

  const [costs, setCosts] = useState<
    { name: string; price: number; quantity: number }[]
  >([]);

  const form = useForm<z.infer<typeof InvoiceSchema>>({
    resolver: zodResolver(InvoiceSchema),
    defaultValues: {
      name: "",
      price: 0,
      quantity: 1,
    },
  });

  const onSubmit = (values: z.infer<typeof InvoiceSchema>) => {
    setCosts((prev) => [...prev, values]);
    form.reset();
  };

  const invoiceMutation = useMutation(
    {
      mutationKey: getPrivateQueryKeys({
        admin: true,
        orderType,
        keys: [orderId, "shipping-invoices"],
      }),
      mutationFn: async ({
        invoiceList,
        totalPrice,
        orderId,
        userId,
        orderType,
        shipRightAway,
      }: {
        invoiceList: { name: string; price: number; quantity: number }[];
        totalPrice: number;
        orderId: string;
        userId: string;
        orderType: OrderType;
        shipRightAway?: boolean;
      }) => {
        return await issueShippingInvoice({
          orderType,
          invoiceList,
          totalPrice,
          orderId,
          userId,
          shipRightAway,
        });
      },
      onMutate: async ({
        invoiceList,
        totalPrice,
        orderId,
        userId,
        orderType,
        shipRightAway,
      }: {
        invoiceList: { name: string; price: number; quantity: number }[];
        totalPrice: number;
        orderId: string;
        userId: string;
        orderType: OrderType;
        shipRightAway?: boolean;
      }) => {
        await client.cancelQueries({
          queryKey: getPrivateQueryKeys({
            admin: true,
            orderType,
            keys: [orderId],
          }),
        });
        if (orderType !== "ShippingRequest") {
          const previousOrderData =
            client.getQueryData<AdminBuyOrderWithItemsAndAddress>(
              getPrivateQueryKeys({
                admin: true,
                orderType,
                keys: [orderId],
              })
            )!;

          const newOrderData = cloneDeep(previousOrderData);

          newOrderData.orderStatus = BuyOrderStatus.SHIPPING_INVOICED;

          if (shipRightAway) {
            newOrderData.items.forEach((item) => {
              if (item.productStatus === ItemStatus.RECEIVED) {
                item.productStatus = ItemStatus.SHIPPING_INVOICED;
              }
            });
          }

          client.setQueryData(
            getPrivateQueryKeys({
              admin: true,
              orderType,
              keys: [orderId],
            }),
            newOrderData
          );
          return { previousOrderData, newOrderData };
        }
      },
      onError: (error, newOrderData, context) => {
        console.log(error);
        alert("청구서 발행 실패");
        client.setQueryData(
          getPrivateQueryKeys({
            admin: true,
            orderType,
            keys: [orderId],
          }),
          context!.previousOrderData
        );
      },
      onSuccess: (data) => {
        if (data.success) {
          alert("청구서 발행 완료");
          setOpen(false);
        } else {
          alert("청구서 발행 실패");
        }
      },
      onSettled: () => {
        client.invalidateQueries({
          queryKey: getPrivateQueryKeys({
            admin: true,
            orderType,
            keys: [orderId],
          }),
        });
      },
    },
    client
  );

  const inclusionNumber = useMemo(() => {
    if (!data) return 0;
    if (orderType !== "ShippingRequest") {
      const inclusionItems = data.items.filter((item) => item.isInclusion);
      const totalQuantity = inclusionItems.reduce((acc, curr) => {
        const accum = new Big(acc);
        const quantity = new Big(curr.quantity);

        return accum.add(quantity).toNumber();
      }, 0);

      return totalQuantity;
    }

    if (orderType === "ShippingRequest" && "toShipItems" in data) {
      const toShipItems = data.toShipItems;
      const inclusionItems = toShipItems.filter(
        (toShipItem) => toShipItem.item.isInclusion
      );

      const totalQuantity = inclusionItems.reduce((acc, curr) => {
        const accum = new Big(acc);
        const quantity = new Big(curr.item.quantity);

        return accum.add(quantity).toNumber();
      }, 0);

      return totalQuantity;
    }
  }, [data, orderType]);

  const issueInvoice = async () => {
    if (!data) return;
    if (costs.length === 0) {
      alert("청구 항목을 먼저 추가해주세요");
      return;
    }

    const total = new Big(
      costs.reduce((acc, curr) => {
        const accum = new Big(acc);
        const price = new Big(curr.price);
        const quantity = new Big(curr.quantity);

        return accum.add(price.times(quantity)).toNumber();
      }, 0)
    );

    const invoiceList = [...costs];

    invoiceMutation.mutate({
      invoiceList,
      totalPrice: total.toNumber(),
      orderId,
      userId: data.userId,
      orderType,
      shipRightAway,
    });
  };

  if (!data) return null;
  const { items } = data;

  if (orderType !== "ShippingRequest" && !items) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary/80 text-black">배송 청구</Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-full mx-auto h-[70dvh] flex flex-col">
        <DialogHeader className="">
          <DialogTitle>Shipping Invoicing</DialogTitle>
          <DialogDescription>배송 요금을 청구하세요</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1">
          {costs.map((cost, index) => (
            <div
              key={cost.name}
              className="grid grid-cols-[1fr_1fr_50px_1fr_20px] border-b py-1"
            >
              <div className="text-left">{cost.name}</div>
              <div className="text-center">
                {cost.price.toLocaleString()} 원
              </div>
              <div className="text-center">{cost.quantity}</div>
              <div className="text-right">
                {new Big(cost.price)
                  .times(cost.quantity)
                  .toNumber()
                  .toLocaleString()}{" "}
                원
              </div>
              <button
                type="button"
                className="text-red-500"
                onClick={() =>
                  setCosts((prev) => prev.filter((_, i) => i !== index))
                }
              >
                X
              </button>
            </div>
          ))}
        </div>
        {orderType !== "ShippingRequest" && (
          <div className="flex">
            <div className="flex-1 overflow-x-scroll grid grid-cols-3 gap-2">
              <div>
                Video:{" "}
                {
                  data?.items.filter((item) => item.unboxingVideoRequested)
                    .length
                }
              </div>
              <div>
                Photo:{" "}
                {
                  data?.items.filter((item) => item.unboxingPhotoRequested)
                    .length
                }
              </div>
              <div>Inclusion: {inclusionNumber}</div>
            </div>
            <div className="mr-0 ml-auto">
              총 금액:{" "}
              {new Big(
                costs.reduce((acc, curr) => {
                  const accum = new Big(acc);
                  const price = new Big(curr.price);
                  const quantity = new Big(curr.quantity);

                  return accum.add(price.times(quantity)).toNumber();
                }, 0)
              )
                .toNumber()
                .toLocaleString()}{" "}
              원
            </div>
          </div>
        )}
        {orderType === "ShippingRequest" && "toShipItems" in data && (
          <div className="flex">
            <div className="flex-1 overflow-x-scroll grid grid-cols-3 gap-2">
              <div>
                Video:{" "}
                {
                  data?.toShipItems.filter(
                    (toShipItem) => toShipItem.item.unboxingVideoRequested
                  ).length
                }
              </div>
              <div>
                Photo:{" "}
                {
                  data?.toShipItems.filter(
                    (toShipItem) => toShipItem.item.unboxingPhotoRequested
                  ).length
                }
              </div>
              <div>Inclusion: {inclusionNumber}</div>
            </div>
            <div className="mr-0 ml-auto">
              총 금액:{" "}
              {new Big(
                costs.reduce((acc, curr) => {
                  const accum = new Big(acc);
                  const price = new Big(curr.price);
                  const quantity = new Big(curr.quantity);

                  return accum.add(price.times(quantity)).toNumber();
                }, 0)
              )
                .toNumber()
                .toLocaleString()}{" "}
              원
            </div>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-4 gap-2"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />{" "}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>가격 및 할인금액</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />{" "}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>수량</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="mb-0 mt-auto"
              variant={"secondary"}
            >
              추가
            </Button>
          </form>
        </Form>
        <Button
          onClick={issueInvoice}
          type="button"
          disabled={invoiceMutation.isPending}
        >
          청구
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default AdminShippingInvoicing;
