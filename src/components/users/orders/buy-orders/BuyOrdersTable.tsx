import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBuyOrders } from "@/lib/react-query/hooks";
import { format } from "date-fns";

const BuyOrdersTable = () => {
  const { data, isLoading, isError } = useBuyOrders();

  if (data)
    return (
      <Table className="w-full max-w-2xl mx-auto rounded-md border">
        <TableHeader className="bg-primary/60">
          <TableRow className="">
            <TableHead className="text-black font-medium w-[150px]">
              Submit Date
            </TableHead>
            <TableHead className="text-black font-medium text-center w-[200px]">
              Products in Order
            </TableHead>
            <TableHead className="text-black font-medium text-center">
              Status
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="w-[150px]">
                {format(order.createdAt, "yyyy-MM-dd HH:mm")}
              </TableCell>
              <TableCell className="text-center w-[200px]">
                {order.items.length}
              </TableCell>
              <TableCell className="text-center">{order.orderStatus}</TableCell>
              <TableCell className="text-center">
                <a
                  href={`/orders/${order.id}`}
                  className="text-primary font-bold"
                >
                  View
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );

  return null;
};

export default BuyOrdersTable;
