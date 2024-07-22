import { Skeleton } from "@/components/ui/skeleton";
import { useSingleAdminBuyOrderProductInvoices } from "@/lib/react-query/hooks";
import AdminSingleBuyOrderProductInvoiceCard from "./AdminSingleBuyOrderProductInvoiceCard";

const AdminSingleBuyOrderContainer = ({ orderId }: { orderId: string }) => {
  const { data, isLoading, isError } =
    useSingleAdminBuyOrderProductInvoices(orderId);

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
          <AdminSingleBuyOrderProductInvoiceCard
            key={invoice.id}
            invoice={invoice}
          />
        ))}
      </section>
    );
};

export default AdminSingleBuyOrderContainer;
