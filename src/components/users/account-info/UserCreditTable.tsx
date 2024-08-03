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

const UserCreditTable = ({
  creditHistory,
}: {
  creditHistory: creditHistory[];
}) => {
  return (
    <section className="max-w-7xl overflow-scroll max-h-[600px] w-full mx-auto my-12 scrollbar-hide">
      <Table className="border w-full mb-16 mx-auto">
        <TableHeader className="bg-primary/60">
          <TableRow className="">
            <TableHead className="text-black font-medium min-w-[150px]">
              생성일
            </TableHead>
            <TableHead className="text-black font-medium text-left min-w-[200px]">
              금액
            </TableHead>
            <TableHead className="text-black font-medium text-left min-w-[170px]">
              사유
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {creditHistory.map((credit) => (
            <TableRow key={credit.id}>
              <TableCell className="">
                {format(credit.createdAt, "yyyy-MM-dd")}
              </TableCell>
              <TableCell className="text-left">
                {credit.creditAmount.toLocaleString()} 원
              </TableCell>
              <TableCell className="text-left overflow-x-scroll scrollbar-hide">
                {credit.content}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
};

export default UserCreditTable;
