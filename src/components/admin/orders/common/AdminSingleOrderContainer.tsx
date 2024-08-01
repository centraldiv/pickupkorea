import { Skeleton } from "@/components/ui/skeleton";
import { useSingleAdminOrder } from "@/lib/react-query/hooks";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import AdminShippingInvoicing from "../buy-orders/AdminShippingInvoicing";
import AdminSingleOrderStaffMemo from "./AdminSingleOrderStaffMemo";
import AdminSingleOrderAddress from "./AdminSingleOrderAddress";
import AdminSingleOrderInfo from "./AdminSingleOrderInfo";
import AdminSingleOrderProducts from "./AdminSingleOrderProducts";
import type { OrderType } from "@/lib/react-query/config";
import { parseOrderTypeURL } from "@/lib/utils";
import AdminSingleBuyOrderProductInvoicing from "../buy-orders/single-order/AdminSingleBuyOrderProductInvoicing";

const AdminSingleOrderContainer = ({
  orderId,
  orderType,
}: {
  orderId: string;
  orderType: OrderType;
}) => {
  const { data, isLoading, isError } = useSingleAdminOrder({
    orderId,
    orderType,
  });

  if (isLoading)
    return (
      <>
        <aside className="mx-auto max-w-7xl w-full grid grid-cols-2 py-4 gap-4 mt-6 shadow">
          <Skeleton className="w-full h-[200px]" />
          <Skeleton className="w-full h-[200px]" />
        </aside>
        <section className="mx-auto max-w-7xl w-full grid grid-cols-2 py-6 gap-4">
          <Skeleton className="w-full h-[500px]" />
          <Skeleton className="w-full h-[500px]" />
        </section>
      </>
    );
  if (isError)
    return (
      <section className="mx-auto max-w-7xl w-full flex justify-center items-center">
        오류
      </section>
    );
  if (!data)
    return (
      <section className="mx-auto max-w-7xl w-full flex justify-center items-center">
        오류
      </section>
    );

  if (
    orderType !== "ShippingRequest" &&
    "shipRightAway" in data! &&
    data?.shipRightAway
  )
    return (
      <>
        <aside className="mx-auto max-w-7xl w-full flex mt-6 gap-4">
          {orderType === "BuyOrder" && (
            <AdminSingleBuyOrderProductInvoicing orderId={orderId} />
          )}
          <AdminShippingInvoicing
            orderType={orderType}
            orderId={orderId}
            shipRightAway
          />
        </aside>
        <aside className="mx-auto max-w-7xl w-full flex mt-6 gap-4">
          {orderType === "BuyOrder" && (
            <Button asChild variant={"outline"}>
              <a href={`/account/admin/buy-orders/${orderId}/product-invoices`}>
                제품 청구서 보기
              </a>
            </Button>
          )}
          <Button asChild variant={"outline"}>
            <a
              href={`/account/admin/${parseOrderTypeURL(
                orderType
              )}/${orderId}/shipping-invoices`}
            >
              배송 청구서 보기
            </a>
          </Button>
        </aside>
        <aside className="mx-auto max-w-7xl w-full grid grid-cols-2 py-4 gap-4 border mt-6 ">
          <div className="flex flex-col gap-4 px-4">
            <Label className="block text-center">고객 메모</Label>
            <Textarea
              value={data?.userMemo || "메모 없음"}
              className="resize-none overflow-y-scroll h-fit disabled:!opacity-100"
              rows={8}
              disabled
            />
          </div>
          <AdminSingleOrderStaffMemo orderId={orderId} orderType={orderType} />
        </aside>
        <section className="mx-auto max-w-7xl w-full grid grid-cols-2 py-6 gap-4">
          <AdminSingleOrderAddress orderId={orderId} orderType={orderType} />
          <AdminSingleOrderInfo orderId={orderId} orderType={orderType} />
        </section>
        <AdminSingleOrderProducts orderId={orderId} orderType={orderType} />
      </>
    );
  if (
    orderType !== "ShippingRequest" &&
    "shipRightAway" in data! &&
    data?.shipRightAway === false
  )
    return (
      <>
        <aside className="mx-auto max-w-7xl w-full flex mt-6 gap-4">
          {orderType === "BuyOrder" && (
            <AdminSingleBuyOrderProductInvoicing orderId={orderId} />
          )}
        </aside>
        <aside className="mx-auto max-w-7xl w-full flex mt-6 gap-4">
          {orderType === "BuyOrder" && (
            <Button asChild variant={"outline"}>
              <a href={`/account/admin/buy-orders/${orderId}/product-invoices`}>
                제품 청구서 보기
              </a>
            </Button>
          )}
          {data?.shippingRequest && (
            <Button asChild variant={"outline"}>
              <a href={`/account/admin/shipping-requests?orderId=${orderId}`}>
                배송 청구서 보기
              </a>
            </Button>
          )}
        </aside>
        <aside className="mx-auto max-w-7xl w-full grid grid-cols-2 py-4 gap-4 border mt-6 ">
          <div className="flex flex-col gap-4 px-4">
            <Label className="block text-center">고객 메모</Label>
            <Textarea
              value={data?.userMemo || "메모 없음"}
              className="resize-none overflow-y-scroll h-fit disabled:!opacity-100"
              rows={8}
              disabled
            />
          </div>
          <AdminSingleOrderStaffMemo orderId={orderId} orderType={orderType} />
        </aside>
        <section className="mx-auto max-w-7xl w-full grid grid-cols-2 py-6 gap-4">
          <AdminSingleOrderAddress orderId={orderId} orderType={orderType} />
          <AdminSingleOrderInfo orderId={orderId} orderType={orderType} />
        </section>
        <AdminSingleOrderProducts orderId={orderId} orderType={orderType} />
      </>
    );

  if (orderType === "ShippingRequest")
    return (
      <>
        <aside className="mx-auto max-w-7xl w-full flex mt-6 gap-4">
          <AdminShippingInvoicing orderType={orderType} orderId={orderId} />
        </aside>
        <aside className="mx-auto max-w-7xl w-full flex mt-6 gap-4">
          <Button asChild variant={"outline"}>
            <a
              href={`/account/admin/${parseOrderTypeURL(
                orderType
              )}/${orderId}/shipping-invoices`}
            >
              배송 청구서 보기
            </a>
          </Button>
        </aside>
        <aside className="mx-auto max-w-7xl w-full grid grid-cols-2 py-4 gap-4 border mt-6 ">
          <div className="flex flex-col gap-4 px-4">
            <Label className="block text-center">고객 메모</Label>
            <Textarea
              value={data?.userMemo || "메모 없음"}
              className="resize-none overflow-y-scroll h-fit disabled:!opacity-100"
              rows={8}
              disabled
            />
          </div>
          <AdminSingleOrderStaffMemo orderId={orderId} orderType={orderType} />
        </aside>
        <section className="mx-auto max-w-7xl w-full grid grid-cols-2 py-6 gap-4">
          <AdminSingleOrderAddress orderId={orderId} orderType={orderType} />
          <AdminSingleOrderInfo orderId={orderId} orderType={orderType} />
        </section>
        <AdminSingleOrderProducts orderId={orderId} orderType={orderType} />
      </>
    );
};

export default AdminSingleOrderContainer;
