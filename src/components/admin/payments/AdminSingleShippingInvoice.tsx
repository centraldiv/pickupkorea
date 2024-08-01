import { Skeleton } from "@/components/ui/skeleton";
import { useAdminSingleShippingInvoice } from "@/lib/react-query/hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Big from "big.js";
import { bigReduce } from "@/lib/utils";

const AdminSingleShippingInvoice = ({ invoiceId }: { invoiceId: string }) => {
  const { data, isLoading, isError } = useAdminSingleShippingInvoice(invoiceId);
  const invoiceList = data?.invoiceList as unknown as {
    name: string;
    price: number;
    quantity: number;
  }[];
  if (isLoading)
    return (
      <section className="space-y-2 py-16">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </section>
    );
  if (isError)
    return (
      <section className="space-y-2 py-16">
        <p className="text-center text-xl font-bold text-red-500">Error</p>
      </section>
    );

  if (data)
    return (
      <>
        <h2 className="text-center font-bold text-lg mt-6">
          {data.paid ? "결제 완료" : "결제 대기"}
        </h2>
        <Table className="mt-16">
          <TableHeader className="bg-secondary">
            <TableRow>
              <TableHead className="w-[100px]">No.</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoiceList?.map(
              (
                line: { name: string; price: number; quantity: number },
                index
              ) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{line.name}</TableCell>
                  <TableCell className="text-right">
                    {line.price.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">{line.quantity}</TableCell>
                  <TableCell className="text-right">
                    {new Big(line.price)
                      .mul(line.quantity)
                      .toNumber()
                      .toLocaleString()}
                  </TableCell>
                </TableRow>
              )
            )}
            <TableRow>
              <TableCell colSpan={4} className="text-right">
                Total
              </TableCell>
              <TableCell className="text-right">
                {bigReduce(invoiceList).toLocaleString()} 원
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </>
    );
};

export default AdminSingleShippingInvoice;
