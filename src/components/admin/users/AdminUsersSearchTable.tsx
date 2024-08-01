import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useAdminSearchUsers } from "@/lib/react-query/hooks";
import { format } from "date-fns";
import { useDebounceValue } from "usehooks-ts";

const AdminUsersSearchTable = () => {
  const [debouncedValue, setValue] = useDebounceValue("", 1000);
  const { data, isLoading, isError } = useAdminSearchUsers(debouncedValue);

  return (
    <>
      <aside className="w-full flex justify-end py-2 gap-2 items-center mt-6">
        <Input
          placeholder="이름, 이메일, PFCode로 검색"
          onChange={(e) => setValue(e.target.value)}
        />
      </aside>
      {isLoading && <Skeleton className="w-full h-[500px]" />}
      {data && (
        <Table className="border w-full mb-16">
          <TableHeader className="bg-primary/60">
            <TableRow className="">
              <TableHead className="text-black font-medium min-w-[100px]">
                생성일
              </TableHead>
              <TableHead className="text-black font-medium text-center min-w-[170px]">
                이름
              </TableHead>
              <TableHead className="text-black font-medium text-center min-w-[200px]">
                Email
              </TableHead>
              <TableHead className="text-black font-medium text-center min-w-[200px]">
                Kakao ID
              </TableHead>
              <TableHead className="text-black font-medium text-center min-w-[150px]">
                PFCode
              </TableHead>
              <TableHead className="text-black font-medium text-center min-w-[150px]">
                크레딧
              </TableHead>
              <TableHead className="min-w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="">
                  {format(order.createdAt, "yyyy-MM-dd")}
                </TableCell>
                <TableCell className="text-center ">{order.fullName}</TableCell>
                <TableCell className="text-center ">{order.email}</TableCell>
                <TableCell className="text-center">
                  {order.kakaoId || "-"}
                </TableCell>
                <TableCell className="text-center">
                  {order?.pfCode || "-"}
                </TableCell>
                <TableCell className="text-center">
                  {order.creditAmount.toLocaleString()} 원
                </TableCell>
                <TableCell className="text-center">
                  <a
                    className="text-primary underline"
                    href={`/account/admin/users/${order.id}`}
                  >
                    자세히
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
};

export default AdminUsersSearchTable;
