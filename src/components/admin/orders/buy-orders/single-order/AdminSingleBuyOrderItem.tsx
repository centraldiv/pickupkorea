import Big from "big.js";
import {
  useSingleAdminBuyOrder,
  type AdminBuyOrderWithItemsAndAddress,
} from "@/lib/react-query/hooks";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/stores/admin";
import {
  PrivateQueryKeys,
  updateAdminBuyOrderItemFields,
} from "@/lib/react-query/config";
import { cloneDeep } from "lodash-es";
import type { item } from "@prisma/client";
import { ItemStatus } from "@/definitions/statuses";
import { Checkbox } from "@/components/ui/checkbox";

const AdminSingleBuyOrderItem = ({
  index,
  orderId,
}: {
  index: number;
  orderId: string;
}) => {
  const { data } = useSingleAdminBuyOrder(orderId);

  const currentData = data?.items[index];

  const mutation = useMutation(
    {
      mutationKey: [...PrivateQueryKeys.adminBuyOrders, orderId],
      mutationFn: async ({
        orderId,
        itemId,
        field,
        value,
      }: {
        orderId: string;
        itemId: string;
        field: keyof item;
        value: any;
      }) => {
        return await updateAdminBuyOrderItemFields({
          orderId,
          itemId,
          field,
          value,
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
        field: keyof item;
        value: any;
      }) => {
        await client.cancelQueries({
          queryKey: [...PrivateQueryKeys.adminBuyOrders, orderId],
        });

        const previousOrderData =
          client.getQueryData<AdminBuyOrderWithItemsAndAddress>([
            ...PrivateQueryKeys.adminBuyOrders,
            orderId,
          ]);

        const newOrderData = cloneDeep(previousOrderData);

        const item = newOrderData?.items.find((item) => item.id === itemId);

        if (!item) return;

        (item as any)[field] = value;
        client.setQueryData(
          [...PrivateQueryKeys.adminBuyOrders, orderId],
          newOrderData,
        );

        form.setValue(field, value);

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
    client,
  );

  const form = useForm({
    defaultValues: {
      ...currentData,
    },
  });

  const handleOnBlurSave = ({
    field,
    value,
  }: {
    field: keyof item;
    value: any;
  }) => {
    if (!orderId || !currentData?.id) return;

    mutation.mutate({
      orderId,
      itemId: currentData?.id,
      field,
      value,
    });
  };

  const handleCredit = () => {
    if (!orderId || !currentData?.id) return;
    const quantity = form.getValues("quantity");
    const price = form.getValues("price");

    if (!price) return alert("가격을 먼저 입력해주세요");
    if (!quantity) return alert("요청 수량을 먼저 입력해주세요");

    const creditAmount = Big(price).mul(quantity).toNumber();

    mutation.mutate({
      orderId,
      itemId: currentData?.id,
      field: "creditedQuantity",
      value: quantity,
    });
  };

  const handleQuantityChange = (
    field: "receivedQuantity" | "shippedQuantity" | "creditedQuantity",
  ) => {
    const quantity = form.getValues("quantity");
    const receivedQuantity = form.getValues("receivedQuantity");

    if (!orderId || !currentData?.id) return;

    if (field === "receivedQuantity") {
      if (!quantity) {
        return alert("요청 수량을 먼저 입력해주세요");
      }
      mutation.mutate({
        orderId,
        itemId: currentData?.id,
        field,
        value: quantity,
      });
      mutation.mutate({
        orderId,
        itemId: currentData?.id,
        field: "productStatus",
        value: ItemStatus.RECEIVED,
      });
    }

    if (field === "shippedQuantity") {
      if (!receivedQuantity) {
        return alert("배송할 수량을 먼저 입력해주세요");
      }
      mutation.mutate({
        orderId,
        itemId: currentData?.id,
        field,
        value: receivedQuantity,
      });

      mutation.mutate({
        orderId,
        itemId: currentData?.id,
        field: "productStatus",
        value:
          receivedQuantity === quantity
            ? ItemStatus.SHIPPED
            : ItemStatus.PARTIALLY_SHIPPED,
      });
    }

    if (field === "creditedQuantity") {
      mutation.mutate({
        orderId,
        itemId: currentData?.id,
        field,
        value: quantity,
      });
      mutation.mutate({
        orderId,
        itemId: currentData?.id,
        field: "productStatus",
        value: ItemStatus.CREDITED,
      });
    }
  };

  return (
    <Form {...form}>
      <form className="shadow-md p-2 border-2 rounded-md relative border-black">
        <span className="absolute -top-3 -left-3 size-6 bg-black text-white rounded-full flex items-center justify-center text-xs">
          {index + 1}
        </span>
        <fieldset className="grid grid-cols-3 gap-2 place-items-center">
          <FormField
            control={form.control}
            name={`unboxingPhotoRequested`}
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 py-2">
                <FormControl>
                  <Checkbox
                    className="size-5 border-2"
                    checked={field.value}
                    onCheckedChange={(value) => {
                      field.onChange(value);
                      handleOnBlurSave({
                        field: field.name,
                        value: value,
                      });
                    }}
                  />
                </FormControl>
                <FormLabel className="!mt-0">사진 요청</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`unboxingVideoRequested`}
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 py-2">
                <FormControl>
                  <Checkbox
                    className="size-5 border-2"
                    checked={field.value}
                    onCheckedChange={(value) => {
                      field.onChange(value);
                      handleOnBlurSave({
                        field: field.name,
                        value: value,
                      });
                    }}
                  />
                </FormControl>
                <FormLabel className="!mt-0">영상 요청</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`isInclusion`}
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 py-2">
                <FormControl>
                  <Checkbox
                    className="size-5 border-2"
                    checked={field.value}
                    onCheckedChange={(value) => {
                      field.onChange(value);
                      handleOnBlurSave({
                        field: field.name,
                        value: value,
                      });
                    }}
                  />
                </FormControl>
                <FormLabel className="!mt-0">제품 포장 없이 보내기</FormLabel>
              </FormItem>
            )}
          />
        </fieldset>
        <FormField
          control={form.control}
          name="href"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="!font-bold">
                <a href={field.value} target="_blank" className="underline">
                  Link
                </a>
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="필수칸 입니다"
                  {...field}
                  onBlur={() =>
                    handleOnBlurSave({ field: field.name, value: field.value })
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />
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
                  defaultValue={field.value}
                  value={field.value}
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
        <fieldset className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="memo"
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
        </fieldset>
      </form>
    </Form>
  );
};

export default AdminSingleBuyOrderItem;
