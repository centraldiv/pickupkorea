import { Skeleton } from "@/components/ui/skeleton";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { usePrivateShippingMethods } from "@/lib/react-query/hooks";
import ShippingMethodDropdown from "./ShippingMethodDropdown";

const ShippingMethodList = () => {
  const {
    data: shippingMethods,
    isLoading,
    isError,
  } = usePrivateShippingMethods();

  if (isError) return <div>Error</div>;
  if (isLoading)
    return <Skeleton className="h-[400px] w-full mx-auto max-w-xl" />;

  if (!shippingMethods) return <div>No data</div>;

  return (
    <Table className="w-full max-w-xl mx-auto rounded-md border">
      <TableHeader className="bg-primary/60">
        <TableRow className="">
          <TableHead className="w-[50px] text-black font-medium ">
            No.
          </TableHead>
          <TableHead className="w-[200px] text-black font-medium text-center">
            Country
          </TableHead>
          <TableHead className="min-w-[150px] text-black font-medium text-center ">
            Country Code
          </TableHead>
          <TableHead className="w-[50px] text-black font-medium text-center"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shippingMethods.map((shippingMethod, index) => (
          <TableRow key={shippingMethod.id}>
            <TableCell className="font-medium ">{index + 1}</TableCell>
            <TableCell className="text-center  w-[200px]">
              {shippingMethod.name}
            </TableCell>
            <TableCell className="text-center w-[150px]">
              {shippingMethod.isActive ? "활성" : "비활성"}
            </TableCell>
            <TableCell className="text-center w-[50px]">
              <ShippingMethodDropdown shippingMethod={shippingMethod} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ShippingMethodList;
