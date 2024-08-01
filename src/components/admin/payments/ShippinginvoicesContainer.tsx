import { useAdminShippingInvoices } from "@/lib/react-query/hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import ShippingInvoicesTableDropdown from "./ShippingInvoicesTableDropdown";

const ShippingInvoicesContainer = ({ paidStatus }: { paidStatus: string }) => {
  const { data, isLoading, isError } = useAdminShippingInvoices({
    paid: paidStatus,
  });

  //   if (isError) return <div>Error</div>;

  //   if (!data) return null;
  if (isLoading)
    return (
      <section className="py-12">
        <div className="space-y-4">
          <Skeleton className="w-full h-[50px]" />
          <Skeleton className="w-full h-[500px]" />
        </div>
      </section>
    );

  if (data)
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="min-w-[200px]">Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className=""></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>{invoice.invoiceNumber}</TableCell>
              <TableCell>{invoice.paid ? "Paid" : "Unpaid"}</TableCell>
              <TableCell>{invoice.user.fullName}</TableCell>
              <TableCell>{invoice.user.email}</TableCell>
              <TableCell className="text-right">
                {invoice.totalPrice.toLocaleString()} 원
              </TableCell>
              <TableCell className="text-right">
                <ShippingInvoicesTableDropdown
                  paid={invoice.paid}
                  invoiceId={invoice.id}
                  buyOrderId={invoice?.buyOrder?.id}
                  pfOrderId={invoice?.pfOrder?.id}
                  requestId={invoice?.shippingRequest?.id}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
};

export default ShippingInvoicesContainer;
