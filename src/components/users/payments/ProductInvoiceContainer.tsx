import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { bigReduce } from "@/lib/utils";
import Big from "big.js";

const ProductInvoiceContainer = ({
  items,
}: {
  items: {
    name: string;
    price: number;
    quantity: number;
  }[];
}) => {
  return (
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
        {items?.map(
          (line: { name: string; price: number; quantity: number }, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell className="min-w-[200px]">{line.name}</TableCell>
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
            {" "}
            Total{" "}
          </TableCell>
          <TableCell className="text-right">
            {bigReduce(items).toLocaleString()} 원
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default ProductInvoiceContainer;
