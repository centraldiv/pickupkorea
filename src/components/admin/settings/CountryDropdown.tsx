import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import EditCountry from "./EditCountry";
import type { country } from "@prisma/client";
import DeleteCountry from "./DeleteCountry";

const CountryDropdown = ({ country }: { country: country }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>...</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            수정
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDeleteOpen(true)}>
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditCountry
        open={isEditOpen}
        close={() => setIsEditOpen(false)}
        country={country}
      />
      <DeleteCountry
        open={isDeleteOpen}
        close={() => setIsDeleteOpen(false)}
        country={country}
      />
    </>
  );
};

export default CountryDropdown;
