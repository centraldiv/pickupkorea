import {
  useSingleAdminBuyOrder,
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
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductInvoiceSchema } from "@/definitions/zod-definitions";
import type { z } from "zod";
import { getWebsiteQuantities } from "@/lib/utils";
import {
  PrivateQueryKeys,
  issueProductInvoice,
} from "@/lib/react-query/config";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/stores/admin";
import { cloneDeep } from "lodash-es";
import { BuyOrderStatus } from "@/definitions/statuses";

const AdminSingleBuyOrderProductInvoicing = ({
  orderId,
}: {
  orderId: string;
}) => {
  const { data } = useSingleAdminBuyOrder(orderId);
  const [open, setOpen] = useState(false);
  const [costs, setCosts] = useState<
    { name: string; price: number; quantity: number }[]
  >(
    data?.items.map((item) => ({
      name: item.productName ?? "",
      price: item.price ?? 0,
      quantity: item.quantity ?? 0,
    })) || [],
  );
  const [secondaryCosts, setSecondaryCosts] = useState<
    { name: string; price: number; quantity: number }[]
  >([]);

  useEffect(() => {
    if (!data || !data.items || !data.items.length) return;

    if (data) {
      setCosts(
        data.items.map((item) => ({
          name: item.productName ?? "",
          price: item.price ?? 0,
          quantity: item.quantity ?? 0,
        })),
      );
    }
  }, [data]);

  const form = useForm<z.infer<typeof ProductInvoiceSchema>>({
    resolver: zodResolver(ProductInvoiceSchema),
    defaultValues: {
      name: "",
      price: 0,
      quantity: 1,
    },
  });

  const onSubmit = (values: z.infer<typeof ProductInvoiceSchema>) => {
    setSecondaryCosts((prev) => [...prev, values]);
    form.reset();
  };

  const invoiceMutation = useMutation(
    {
      mutationKey: [...PrivateQueryKeys.adminBuyOrders, orderId],
      mutationFn: async ({
        invoiceList,
        totalPrice,
        orderId,
        userId,
      }: {
        invoiceList: { name: string; price: number; quantity: number }[];
        totalPrice: number;
        orderId: string;
        userId: string;
      }) => {
        return await issueProductInvoice({
          invoiceList,
          totalPrice,
          orderId,
          userId,
        });
      },
      onMutate: async ({
        invoiceList,
        totalPrice,
        orderId,
        userId,
      }: {
        invoiceList: { name: string; price: number; quantity: number }[];
        totalPrice: number;
        orderId: string;
        userId: string;
      }) => {
        await client.cancelQueries({
          queryKey: [...PrivateQueryKeys.adminBuyOrders, orderId],
        });

        const previousOrderData =
          client.getQueryData<AdminBuyOrderWithItemsAndAddress>([
            ...PrivateQueryKeys.adminBuyOrders,
            orderId,
          ])!;

        const newOrderData = cloneDeep(previousOrderData);

        newOrderData.orderStatus = BuyOrderStatus.PRODUCT_INVOICED;

        client.setQueryData(
          [...PrivateQueryKeys.adminBuyOrders, orderId],
          newOrderData,
        );
        return { previousOrderData, newOrderData };
      },
      onError: (error, newOrderData, context) => {
        client.setQueryData(
          [...PrivateQueryKeys.adminBuyOrders, orderId],
          context!.previousOrderData,
        );
      },
      onSuccess: () => {
        alert("청구서 발행 완료");
        setOpen(false);
      },
      onSettled: () => {
        client.invalidateQueries({
          queryKey: [...PrivateQueryKeys.adminBuyOrders, orderId],
        });
      },
    },
    client,
  );

  const issueInvoice = async () => {
    if (!data) return;

    if (data.productInvoiceId) {
      return alert(
        "이미 청구된 주문입니다. 기존 청구서를 지우고 다시 청구해주세요.",
      );
    }

    const total = new Big(
      costs.reduce((acc, curr) => {
        const accum = new Big(acc);
        const price = new Big(curr.price);
        const quantity = new Big(curr.quantity);

        return accum.add(price.times(quantity)).toNumber();
      }, 0),
    )
      .add(
        secondaryCosts.reduce((acc, curr) => {
          const accum = new Big(acc);
          const price = new Big(curr.price);
          const quantity = new Big(curr.quantity);

          return accum.add(price.times(quantity)).toNumber();
        }, 0),
      )
      .toNumber();

    const invoiceList = [...costs, ...secondaryCosts];

    invoiceMutation.mutate({
      invoiceList,
      totalPrice: total,
      orderId,
      userId: data.userId,
    });
  };

  if (!data) return null;

  const { items } = data;

  if (!items || items.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary/80 text-black">제품 청구</Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-full mx-auto h-[70dvh] flex flex-col">
        <DialogHeader className="">
          <DialogTitle>Product Invoicing</DialogTitle>
          <DialogDescription>
            제품 및 서비스 요금을 청구하세요
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1">
          {costs.map((cost) => (
            <div
              key={cost.name}
              className="grid grid-cols-[1fr_1fr_50px_1fr] border-b py-1"
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
            </div>
          ))}
          {secondaryCosts.map((cost) => (
            <div
              key={cost.name}
              className="grid grid-cols-[1fr_1fr_50px_1fr] border-b py-1"
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
            </div>
          ))}
        </div>
        <div className="flex">
          <div className="flex-1 overflow-x-scroll">
            {getWebsiteQuantities(data.items.map((item) => item.href))}
          </div>
          <div className="mr-0 ml-auto">
            총 금액:{" "}
            {new Big(
              costs.reduce((acc, curr) => {
                const accum = new Big(acc);
                const price = new Big(curr.price);
                const quantity = new Big(curr.quantity);

                return accum.add(price.times(quantity)).toNumber();
              }, 0),
            )
              .add(
                secondaryCosts.reduce((acc, curr) => {
                  const accum = new Big(acc);
                  const price = new Big(curr.price);
                  const quantity = new Big(curr.quantity);

                  return accum.add(price.times(quantity)).toNumber();
                }, 0),
              )
              .toNumber()
              .toLocaleString()}{" "}
            원
          </div>
        </div>

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

export default AdminSingleBuyOrderProductInvoicing;
