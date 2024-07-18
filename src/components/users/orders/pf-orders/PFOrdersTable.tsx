import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { usePFOrders } from "@/lib/react-query/hooks";
import { format } from "date-fns";

const PFOrdersTable = () => {
  const { data, isLoading, isError } = usePFOrders();

  if (data)
    return (
      <Table className="border w-full">
        <TableHeader className="bg-primary/60">
          <TableRow className="">
            <TableHead className="text-black font-medium min-w-[150px]">
              Submit Date
            </TableHead>

            <TableHead className="ㅛtext-black font-medium text-center min-w-[170px]">
              Products in Order
            </TableHead>
            <TableHead className="text-black font-medium text-center min-w-[200px]">
              Status
            </TableHead>
            <TableHead className="text-black font-medium text-center min-w-[150px]">
              Ship Immediately
            </TableHead>
            <TableHead className="min-w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="">
                {format(order.createdAt, "yyyy-MM-dd HH:mm")}
              </TableCell>
              <TableCell className="text-center ">
                {order._count.items}
              </TableCell>
              <TableCell className="text-center ">
                {order.orderStatus}
              </TableCell>
              <TableCell className="text-center">
                {order.shipRightAway ? "Yes" : "No"}
              </TableCell>
              <TableCell className="text-center">
                <a
                  href={`/account/orders/pf-orders/${order.id}`}
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

export default PFOrdersTable;
