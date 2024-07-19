import { Skeleton } from "@/components/ui/skeleton";
import type { BuyOrderStatus } from "@/definitions/statuses";
import { useAdminBuyOrders } from "@/lib/react-query/hooks";
import AdminBuyOrderItemContainer from "./AdminBuyOrderItemContainer";

const AdminBuyOrderStatusContainer = ({
  orderStatus,
}: {
  orderStatus: BuyOrderStatus;
}) => {
  const { data: orders, isLoading, isError } = useAdminBuyOrders(orderStatus);
  return (
    <div className="min-w-[400px] max-h-full overflow-y-auto border shadow rounded-md">
      <div className="px-4 py-2 bg-primary text-center font-medium sticky top-0 z-10">
        <span>{orderStatus} </span>
        <span className="text-sm absolute right-2 top-2 bg-black text-white size-6 rounded-full flex items-center justify-center">
          {isLoading && "..."}
          {orders && orders?.length}
        </span>
      </div>
      <div className="p-2 flex flex-col gap-2">
        {isLoading && <Skeleton className="h-full" />}
        {isError && <div>Error</div>}
        {orders &&
          Array.isArray(orders) &&
          orders.map((order) => (
            <AdminBuyOrderItemContainer key={order.id} order={order} />
          ))}
      </div>
    </div>
  );
};

export default AdminBuyOrderStatusContainer;
