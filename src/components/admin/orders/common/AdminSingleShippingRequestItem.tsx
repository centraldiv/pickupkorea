import Big from "big.js";
import {
  useSingleAdminOrder,
  type AdminBuyOrderWithItemsAndAddress,
  type ShippingRequestWithInvoices,
  type toShipItemWithUser,
} from "@/lib/react-query/hooks";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/stores/admin";
import {
  getPrivateQueryKeys,
  updateAdminOrderItemFields,
  type OrderType,
} from "@/lib/react-query/config";
import { cloneDeep } from "lodash-es";
import type { item, toShipItem } from "@prisma/client";

import { useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { MemoSchema, UnboxSchema } from "@/definitions/zod-definitions";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const AdminSingleShippingRequestItem = ({
  index,
  orderId,
  orderType,
}: {
  index: number;
  orderId: string;
  orderType: OrderType;
}) => {
  const { data } = useSingleAdminOrder({ orderId, orderType });
  if (!data) return null;
  if (!("toShipItems" in data)) return null;

  const currentData = data?.toShipItems[index];
  console.log(currentData);
  const unboxMutation = useMutation(
    {
      mutationKey: getPrivateQueryKeys({
        orderType,
        admin: true,
        keys: [orderId],
      }),
      mutationFn: async ({
        orderId,
        itemId,
        field,
        value,
        orderType,
      }: {
        orderId: string;
        itemId: string;
        field: "unboxingVideoUrl" | "unboxingPhotoUrl";
        value: string;
        orderType: OrderType;
      }) => {
        return await updateAdminOrderItemFields({
          orderId,
          itemId,
          field,
          value,
          orderType,
        });
      },
      onMutate: async ({
        orderId,
        itemId,
        field,
        value,
      }: {
        orderId: string;
        itemId: string;
        field: "unboxingVideoUrl" | "unboxingPhotoUrl";
        value: string;
      }) => {
        await client.cancelQueries({
          queryKey: getPrivateQueryKeys({
            orderType,
            admin: true,
            keys: [orderId],
          }),
        });

        const previousOrderData =
          client.getQueryData<ShippingRequestWithInvoices>(
            getPrivateQueryKeys({
              orderType,
              admin: true,
              keys: [orderId],
            })
          );

        const newOrderData = cloneDeep(previousOrderData);

        if (!newOrderData) return;

        const toShipItem = newOrderData?.toShipItems.find(
          (item) => item.id === itemId
        );

        if (!toShipItem) return;

        (toShipItem as any).item[field] = value;

        client.setQueryData(
          getPrivateQueryKeys({
            orderType,
            admin: true,
            keys: [orderId],
          }),
          newOrderData
        );

        unboxForm.setValue(field, value);

        return { previousOrderData, newOrderData };
      },
      onSuccess: (data: { success?: boolean }) => {
        if (!data.success) {
          alert("오류가 발생했습니다");
          window.location.reload();
        }
      },
      onError: (error, variables, context) => {
        alert("오류가 발생했습니다");
        window.location.reload();
      },
    },
    client
  );
  const memoMutation = useMutation(
    {
      mutationKey: getPrivateQueryKeys({
        orderType,
        admin: true,
        keys: [orderId],
      }),
      mutationFn: async ({
        orderId,
        itemId,
        field,
        value,
        orderType,
      }: {
        orderId: string;
        itemId: string;
        field: "userMemo" | "staffMemo";
        value: any;
        orderType: OrderType;
      }) => {
        return await updateAdminOrderItemFields({
          orderId,
          itemId,
          field,
          value,
          orderType,
        });
      },
      onMutate: async ({
        orderId,
        itemId,
        field,
        value,
      }: {
        orderId: string;
        itemId: string;
        field: "userMemo" | "staffMemo";
        value: any;
      }) => {
        await client.cancelQueries({
          queryKey: getPrivateQueryKeys({
            orderType,
            admin: true,
            keys: [orderId],
          }),
        });

        const previousOrderData =
          client.getQueryData<ShippingRequestWithInvoices>(
            getPrivateQueryKeys({
              orderType,
              admin: true,
              keys: [orderId],
            })
          );

        const newOrderData = cloneDeep(previousOrderData);

        if (!newOrderData) return;

        const toShipItem = newOrderData?.toShipItems.find(
          (item) => item.id === itemId
        );

        if (!toShipItem) return;

        (toShipItem as any).item[field] = value;

        client.setQueryData(
          getPrivateQueryKeys({
            orderType,
            admin: true,
            keys: [orderId],
          }),
          newOrderData
        );

        memoForm.setValue(field, value);

        return { previousOrderData, newOrderData };
      },
      onSuccess: (data: { success?: boolean }) => {
        if (!data.success) {
          alert("오류가 발생했습니다");
          window.location.reload();
        }
      },
      onError: (error, variables, context) => {
        alert("오류가 발생했습니다");
        window.location.reload();
      },
    },
    client
  );

  const shippingQuantityMutation = useMutation(
    {
      mutationKey: getPrivateQueryKeys({
        orderType,
        admin: true,
        keys: [orderId],
      }),
      mutationFn: async ({
        orderId,
        itemId,
        field,
        value,
        orderType,
        previousValue,
      }: {
        orderId: string;
        itemId: string;
        field: "toShipQuantity";
        value: number;
        orderType: OrderType;
        previousValue: any;
      }) => {
        return await updateAdminOrderItemFields({
          orderId,
          itemId,
          field,
          value,
          orderType,
          previousValue,
        });
      },
      onMutate: async ({
        orderId,
        itemId,
        field,
        value,
        previousValue,
      }: {
        orderId: string;
        itemId: string;
        field: "toShipQuantity";
        value: number;
        orderType: OrderType;
        previousValue: any;
      }) => {
        await client.cancelQueries({
          queryKey: getPrivateQueryKeys({
            orderType,
            admin: true,
            keys: [orderId],
          }),
        });

        const previousOrderData =
          client.getQueryData<ShippingRequestWithInvoices>(
            getPrivateQueryKeys({
              orderType,
              admin: true,
              keys: [orderId],
            })
          );

        const newOrderData = cloneDeep(previousOrderData);

        if (!newOrderData) return;

        const toShipItems = newOrderData?.toShipItems;

        const toShipItem = toShipItems.find((item) => item.id === itemId);

        if (!toShipItem) return;

        toShipItem.toShipQuantity = value;

        return { previousOrderData, newOrderData };
      },
      onError: (error, variables, context) => {
        alert("오류가 발생했습니다");
        window.location.reload();
      },
      onSuccess: (data: { success?: boolean }) => {
        if (!data.success) {
          alert("오류가 발생했습니다");
          window.location.reload();
        }
      },
    },
    client
  );

  const form = useForm<toShipItemWithUser>({
    defaultValues: {
      ...currentData,
    },
  });

  const memoForm = useForm<z.infer<typeof MemoSchema>>({
    resolver: zodResolver(MemoSchema),
    defaultValues: {
      userMemo: currentData?.item.memo ?? "",
      staffMemo: currentData?.item.staffMemo ?? "",
    },
  });
  const unboxForm = useForm<z.infer<typeof UnboxSchema>>({
    resolver: zodResolver(UnboxSchema),
    defaultValues: {
      unboxingVideoUrl: currentData?.item.unboxingVideoUrl ?? "",
      unboxingPhotoUrl: currentData?.item.unboxingPhotoUrl ?? "",
    },
  });

  const memoHandleOnBlurSave = ({
    field,
    value,
  }: {
    field: "userMemo" | "staffMemo";
    value: any;
  }) => {
    if (!orderId || !currentData?.id) return;

    memoMutation.mutate({
      orderId,
      itemId: currentData?.item.id,
      field,
      value,
      orderType,
    });
  };

  const unboxHandleOnBlurSave = ({
    field,
    value,
  }: {
    field: "unboxingVideoUrl" | "unboxingPhotoUrl";
    value: any;
  }) => {
    if (!orderId || !currentData?.id) return;

    unboxMutation.mutate({
      orderId,
      itemId: currentData?.item.id,
      field,
      value,
      orderType,
    });
  };

  useEffect(() => {
    if (!currentData) return;

    form.setValue("toShipQuantity", currentData?.toShipQuantity);
    form.setValue("availableQuantity", currentData?.availableQuantity);
  }, [
    currentData?.toShipQuantity,
    currentData?.availableQuantity,
    currentData,
  ]);

  //   const handleQuantityChange = (
  //     field: "receivedQuantity" | "shippedQuantity" | "creditedQuantity"
  //   ) => {
  //     const quantity = form.getValues("quantity");
  //     const receivedQuantity = form.getValues("receivedQuantity");

  //     if (!orderId || !currentData?.id) return;

  //     if (field === "receivedQuantity") {
  //       if (!quantity) {
  //         return alert("요청 수량을 먼저 입력해주세요");
  //       }
  //       mutation.mutate({
  //         orderId,
  //         itemId: currentData?.id,
  //         field,
  //         value: quantity,
  //         orderType,
  //       });
  //       mutation.mutate({
  //         orderId,
  //         itemId: currentData?.id,
  //         field: "productStatus",
  //         value: ItemStatus.RECEIVED,
  //         orderType,
  //       });
  //     }

  //     if (field === "shippedQuantity") {
  //       if (!receivedQuantity) {
  //         return alert("배송할 수량을 먼저 입력해주세요");
  //       }
  //       mutation.mutate({
  //         orderId,
  //         itemId: currentData?.id,
  //         field,
  //         value: receivedQuantity,
  //         orderType,
  //       });

  //       mutation.mutate({
  //         orderId,
  //         itemId: currentData?.id,
  //         field: "productStatus",
  //         value:
  //           receivedQuantity === quantity
  //             ? ItemStatus.SHIPPED
  //             : ItemStatus.PARTIALLY_SHIPPED,
  //         orderType,
  //       });
  //     }

  //     if (field === "creditedQuantity") {
  //       mutation.mutate({
  //         orderId,
  //         itemId: currentData?.id,
  //         field,
  //         value: quantity,
  //         orderType,
  //       });
  //       mutation.mutate({
  //         orderId,
  //         itemId: currentData?.id,
  //         field: "productStatus",
  //         value: ItemStatus.CREDITED,
  //         orderType,
  //       });
  //     }
  //   };

  return (
    <Form {...form}>
      <form className="shadow-md p-2 border-2 rounded-md relative border-black">
        <span className="absolute -top-3 -left-3 size-6 bg-black text-white rounded-full flex items-center justify-center text-xs">
          {index + 1}
        </span>
        <span className="absolute -top-3 -right-3 px-2 py-1 bg-black text-white rounded-full flex items-center justify-center text-xs">
          {currentData.item.buyOrderId && (
            <a
              href={`/account/admin/buy-orders/${currentData.item.buyOrderId}`}
              target="_blank"
            >
              {currentData.item?.buyOrder?.productInvoice?.invoiceNumber}
            </a>
          )}
          {currentData.item.pfOrderId && (
            <a
              href={`/account/admin/pf-orders/${currentData.item.pfOrderId}`}
              target="_blank"
            >
              {currentData.user?.pfCode}
            </a>
          )}
        </span>
        <fieldset className="grid grid-cols-3 gap-2 place-items-center">
          <div className="flex items-center gap-2">
            <FormLabel className="!mt-0">사진 요청</FormLabel>
            <Checkbox
              className="size-5 border-2"
              checked={currentData.item.unboxingPhotoRequested}
              disabled
            />
          </div>
          <div className="flex items-center gap-2">
            <FormLabel className="!mt-0">영상 요청</FormLabel>
            <Checkbox
              className="size-5 border-2"
              checked={currentData.item.unboxingVideoRequested}
              disabled
            />
          </div>
          <div className="flex items-center gap-2">
            <FormLabel className="!mt-0">제품 포장 없이 보내기</FormLabel>
            <Checkbox
              className="size-5 border-2"
              checked={currentData.item.isInclusion}
              disabled
            />
          </div>
        </fieldset>
        <fieldset>
          <FormLabel className="!font-bold">
            <a
              href={currentData.item.href}
              target="_blank"
              className="underline"
            >
              Link
            </a>
          </FormLabel>
          <Input type="text" disabled value={currentData.item.href} />
        </fieldset>
        <fieldset>
          <FormLabel className="!font-bold">제품명</FormLabel>
          <Input
            type="text"
            disabled
            value={currentData.item.productName as string}
          />
        </fieldset>
        <fieldset className="grid grid-cols-2 gap-4 text-center py-2">
          <FormField
            control={form.control}
            name="availableQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="!font-bold">신청 당시 수량</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="1"
                    disabled
                    {...field}
                    value={field.value ?? ""}
                    className="text-center"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="toShipQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="!font-bold">배송 요청 수량</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="1"
                    {...field}
                    value={field.value ?? ""}
                    className="text-center"
                    onBlur={() => {
                      if (field.value < 0) {
                        return alert("수량은 0 이상이어야 합니다");
                      }

                      if (field.value > currentData?.availableQuantity) {
                        return alert(
                          "신청 당시 수량보다 많은 수량은 요청할 수 없습니다"
                        );
                      }

                      shippingQuantityMutation.mutate({
                        orderId,
                        itemId: currentData?.id,
                        field: "toShipQuantity",
                        value: +field.value,
                        orderType,
                        previousValue: currentData?.toShipQuantity,
                      });
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </fieldset>
        <Form {...unboxForm}>
          <fieldset className="grid grid-cols-2 gap-4">
            {currentData.item.unboxingVideoRequested && (
              <FormField
                control={unboxForm.control}
                name="unboxingVideoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="!font-bold">영상 링크</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...field}
                        value={field.value ?? ""}
                        onBlur={() =>
                          unboxHandleOnBlurSave({
                            field: field.name,
                            value: field.value,
                          })
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            {currentData.item.unboxingPhotoRequested && (
              <FormField
                control={unboxForm.control}
                name="unboxingPhotoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="!font-bold">사진 링크</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        {...field}
                        value={field.value ?? ""}
                        onBlur={() =>
                          unboxHandleOnBlurSave({
                            field: field.name,
                            value: field.value,
                          })
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </fieldset>
        </Form>
        <Form {...memoForm}>
          <fieldset className="grid grid-cols-2 gap-4">
            <FormField
              control={memoForm.control}
              name="userMemo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="!font-bold">고객 메모</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      className="resize-none overflow-y-scroll"
                      {...field}
                      value={field.value ?? ""}
                      onBlur={() =>
                        memoHandleOnBlurSave({
                          field: field.name,
                          value: field.value,
                        })
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={memoForm.control}
              name="staffMemo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="!font-bold">관리자 메모</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="고객에게 안보입니다"
                      className="resize-none overflow-y-scroll"
                      {...field}
                      value={field.value ?? ""}
                      onBlur={() =>
                        memoHandleOnBlurSave({
                          field: field.name,
                          value: field.value,
                        })
                      }
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </fieldset>
        </Form>
        {/* 
        
        <FormField
          control={form.control}
          name="productName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="!font-bold">제품명</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  {...field}
                  value={field.value ?? ""}
                  onBlur={() =>
                    handleOnBlurSave({
                      field: field.name,
                      value: field.value,
                    })
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />
        <fieldset className="grid grid-cols-2 gap-4 mt-4">
          <FormField
            control={form.control}
            name="option"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="!font-bold">옵션</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    value={field.value ?? ""}
                    onBlur={() =>
                      handleOnBlurSave({
                        field: field.name,
                        value: field.value,
                      })
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="productStatus"
            render={({ field }) => (
              <FormItem className="relative">
                <Button
                  type="button"
                  onClick={() => handleQuantityChange("receivedQuantity")}
                  variant="outline"
                  className="text-xs !py-0.5 !px-0.5 !h-fit absolute right-0"
                  disabled={mutation.isPending}
                >
                  전체 크레딧
                </Button>
                <FormLabel className="!font-bold">상태</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleOnBlurSave({
                      field: field.name,
                      value: value,
                    });
                  }}
                  defaultValue={currentData?.productStatus}
                  value={currentData?.productStatus}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(ItemStatus).map((status) => (
                      <SelectItem value={status} key={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>
        <fieldset className="grid grid-cols-5 gap-4 mt-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="!font-bold">가격</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="text-center"
                    {...field}
                    value={field.value ?? ""}
                    onBlur={() =>
                      handleOnBlurSave({
                        field: field.name,
                        value: Number(field.value),
                      })
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="!font-bold">요청 수량</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="text-center"
                    {...field}
                    value={field.value ?? ""}
                    onBlur={() =>
                      handleOnBlurSave({
                        field: field.name,
                        value: Number(field.value),
                      })
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="receivedQuantity"
            render={({ field }) => (
              <FormItem className="relative">
                <Button
                  type="button"
                  onClick={() => handleQuantityChange(field.name)}
                  variant="outline"
                  className="text-xs !py-0.5 !px-0.5 !h-fit absolute right-0"
                >
                  전체 수령
                </Button>
                <FormLabel className="!font-bold">수령한 수량</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="text-center"
                    {...field}
                    value={field.value ?? ""}
                    onBlur={() =>
                      handleOnBlurSave({
                        field: field.name,
                        value: Number(field.value),
                      })
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="shippedQuantity"
            render={({ field }) => (
              <FormItem className="relative">
                <Button
                  type="button"
                  variant="outline"
                  className="text-xs !py-0.5 !px-0.5 !h-fit absolute right-0"
                  onClick={() => handleQuantityChange(field.name)}
                  disabled={mutation.isPending}
                >
                  전체 배송
                </Button>
                <FormLabel className="!font-bold">배송된 수량</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="text-center"
                    {...field}
                    value={field.value ?? ""}
                    onBlur={() =>
                      handleOnBlurSave({
                        field: field.name,
                        value: Number(field.value),
                      })
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="creditedQuantity"
            render={({ field }) => (
              <FormItem className="relative">
                <Button
                  type="button"
                  variant="outline"
                  className="text-xs !py-0.5 !px-0.5 !h-fit absolute right-0"
                  onClick={() => handleQuantityChange(field.name)}
                  disabled={mutation.isPending}
                >
                  전체 환불
                </Button>
                <FormLabel className="!font-bold">환불 수량</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="text-center"
                    {...field}
                    value={field.value ?? ""}
                    onBlur={() =>
                      handleOnBlurSave({
                        field: field.name,
                        value: Number(field.value),
                      })
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </fieldset>
        <fieldset className="grid grid-cols-3"></fieldset>
       */}
      </form>
    </Form>
  );
};

export default AdminSingleShippingRequestItem;
