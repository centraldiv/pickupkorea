import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useAdminUsers } from "@/lib/react-query/hooks";
import { format } from "date-fns";
import { useState } from "react";

const AdminUsersTable = () => {
  const [take, setTake] = useState(1000);
  const [skip, setSkip] = useState(0);

  const { data, isLoading, isError } = useAdminUsers({ take, skip });

  if (isLoading) return <Skeleton className="w-full h-[600px]" />;

  if (data)
    return (
      <>
        <aside className="w-full flex justify-end py-2 gap-2 items-center">
          <Button asChild className="mr-auto ml-0" variant="outline">
            <a href="/account/admin/search-user">검색</a>
          </Button>
          {skip > 0 && (
            <Button onClick={() => setSkip((prev) => prev - 1000)}>이전</Button>
          )}
          <Button onClick={() => setSkip((prev) => prev + 1000)}>더보기</Button>
        </aside>
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
                <TableCell className="text-center ">
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
      </>
    );

  return null;
};

export default AdminUsersTable;
