import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useShippingRequestOrders } from "@/lib/react-query/hooks";
import { format } from "date-fns";

const ShippingRequestsTable = () => {
  const { data, isLoading, isError } = useShippingRequestOrders();

  if (data)
    return (
      <Table className="border w-full">
        <TableHeader className="bg-primary/60">
          <TableRow className="">
            <TableHead className="text-black font-medium min-w-[150px]">
              Submit Date
            </TableHead>
            <TableHead className="text-black font-medium text-center min-w-[170px]">
              No. of Products
            </TableHead>
            <TableHead className="text-black font-medium text-center min-w-[170px]">
              Total Shipping Quantity
            </TableHead>
            <TableHead className="text-black font-medium text-center min-w-[200px]">
              Status
            </TableHead>
            <TableHead className="min-w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="">
                {format(order.createdAt, "yyyy-MM-dd HH:mm")}
              </TableCell>
              <TableCell className="text-center ">
                {order._count.toShipItems}
              </TableCell>
              <TableCell className="text-center ">
                {order.toShipItems.reduce(
                  (acc, item) => acc + item.toShipQuantity,
                  0
                )}
              </TableCell>
              <TableCell className="text-center">
                {order.requestStatus}
              </TableCell>
              <TableCell className="text-center">
                <a
                  href={`/account/orders/shipping-requests/${order.id}`}
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

export default ShippingRequestsTable;
