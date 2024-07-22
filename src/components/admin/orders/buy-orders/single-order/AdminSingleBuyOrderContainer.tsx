import { Skeleton } from "@/components/ui/skeleton";
import { useSingleAdminBuyOrder } from "@/lib/react-query/hooks";
import AdminSingleBuyOrderAddress from "./AdminSingleBuyOrderAddress";
import AdminSingleBuyOrderInfo from "./AdminSingleBuyOrderInfo";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import AdminBuyOrderStaffMemo from "./AdminSingleBuyOrderStaffMemo";
import AdminSingleBuyOrderProducts from "./AdminSingleBuyOrderProducts";
import AdminSingleBuyOrderProductInvoicing from "./AdminSingleBuyOrderProductInvoicing";
import { Button } from "@/components/ui/button";

const AdminSingleBuyOrderContainer = ({ orderId }: { orderId: string }) => {
  const { data, isLoading, isError } = useSingleAdminBuyOrder(orderId);

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

  if (data?.shipRightAway)
    return (
      <>
        <aside className="mx-auto max-w-7xl w-full flex mt-6 gap-4">
          <AdminSingleBuyOrderProductInvoicing orderId={orderId} />
        </aside>
        <aside className="mx-auto max-w-7xl w-full flex mt-6 gap-4">
          <Button asChild variant={"outline"}>
            <a href={`/account/admin/buy-orders/${orderId}/product-invoices`}>
              제품 청구서 보기
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
          <AdminBuyOrderStaffMemo orderId={orderId} />
        </aside>
        <section className="mx-auto max-w-7xl w-full grid grid-cols-2 py-6 gap-4">
          <AdminSingleBuyOrderAddress orderId={orderId} />
          <AdminSingleBuyOrderInfo orderId={orderId} />
        </section>
        <AdminSingleBuyOrderProducts orderId={orderId} />
      </>
    );
};

export default AdminSingleBuyOrderContainer;
