import { Skeleton } from "@/components/ui/skeleton";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import CountryDropdown from "./CountryDropdown";
import { usePrivateCountries } from "@/lib/react-query/hooks";

const CountryLists = () => {
  const { data: countries, isLoading, isError } = usePrivateCountries();

  if (isError) return <div>Error</div>;
  if (isLoading)
    return <Skeleton className="h-[400px] w-full mx-auto max-w-xl" />;

  if (!countries) return <div>No data</div>;

  return (
    <Table className="w-full max-w-xl mx-auto rounded-md border">
      <TableHeader className="bg-primary/60">
        <TableRow className="">
          <TableHead className="w-[50px] text-black font-medium ">
            No.
          </TableHead>
          <TableHead className="w-[200px] text-black font-medium text-center">
            국가
          </TableHead>
          <TableHead className="min-w-[150px] text-black font-medium text-center ">
            국가코드
          </TableHead>
          <TableHead className="min-w-[150px] text-black font-medium text-center ">
            상태
          </TableHead>
          <TableHead className="w-[50px] text-black font-medium text-center"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {countries.map((country, index) => (
          <TableRow key={country.id}>
            <TableCell className="font-medium ">{index + 1}</TableCell>
            <TableCell className="text-center  w-[200px]">
              {country.name}
            </TableCell>
            <TableCell className="text-center w-[150px]">
              {country.code}
            </TableCell>
            <TableCell className="text-center w-[150px]">
              {country.isActive ? "활성" : "비활성"}
            </TableCell>
            <TableCell className="text-center w-[50px]">
              <CountryDropdown country={country} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CountryLists;
