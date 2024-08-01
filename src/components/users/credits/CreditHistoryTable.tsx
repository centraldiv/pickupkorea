import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { creditHistory } from "@prisma/client";
import { format } from "date-fns";

const CreditHistoryTable = ({
  creditHistory,
}: {
  creditHistory: creditHistory[];
}) => {
  return (
    <Table className="border w-full">
      <TableHeader className="bg-primary/60">
        <TableRow className="">
          <TableHead className="text-black font-medium min-w-[150px]">
            Date
          </TableHead>
          <TableHead className="text-black font-medium text-center min-w-[200px]">
            Reason
          </TableHead>
          <TableHead className="text-black font-medium text-center min-w-[150px]">
            Amount
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {creditHistory.map((credit) => (
          <TableRow key={credit.id}>
            <TableCell className="">
              {format(credit.createdAt, "yyyy-MM-dd HH:mm")}
            </TableCell>
            <TableCell className="text-center">{credit.content}</TableCell>
            <TableCell className="text-center">{credit.creditAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CreditHistoryTable;
