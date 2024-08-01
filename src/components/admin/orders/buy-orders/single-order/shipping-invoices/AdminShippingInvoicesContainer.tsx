import { Skeleton } from "@/components/ui/skeleton";
import { useSingleAdminShippingInvoices } from "@/lib/react-query/hooks";
import AdminShippingInvoiceCard from "./AdminShippingInvoiceCard";
import type { OrderType } from "@/lib/react-query/config";

const AdminShippingInvoicesContainer = ({
  orderId,
  orderType,
}: {
  orderId: string;
  orderType: OrderType;
}) => {
  const { data, isLoading, isError } = useSingleAdminShippingInvoices({
    orderId,
    orderType,
  });

  if (isLoading)
    return (
      <>
        <aside className="mx-auto max-w-7xl w-full grid grid-cols-3 py-4 gap-4 mt-6 shadow">
          <Skeleton className="w-full h-[500px]" />
          <Skeleton className="w-full h-[500px]" />
          <Skeleton className="w-full h-[500px]" />
        </aside>
      </>
    );
  if (isError)
    return (
      <section className="mx-auto max-w-7xl w-full flex justify-center items-center">
        오류
      </section>
    );

  if (data)
    return (
      <section className="mx-auto max-w-7xl w-full justify-center items-center grid grid-cols-3 gap-4 py-12 px-4">
        {data.map((invoice) => (
          <AdminShippingInvoiceCard
            key={invoice.id}
            invoice={invoice}
            orderType={orderType}
          />
        ))}
        {!data.length && (
          <div className="w-full h-[500px] flex justify-center items-center col-span-3">
            <p className="text-gray-500">청구서가 존재하지 않습니다.</p>
          </div>
        )}
      </section>
    );
};

export default AdminShippingInvoicesContainer;
