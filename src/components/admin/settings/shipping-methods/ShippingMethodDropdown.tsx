import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

import type { availableShippingMethods } from "@prisma/client";
import EditShippingMethod from "./EditShippingMethod";
import DeleteShippingMethod from "./DeleteShippingMethod";

const ShippingMethodDropdown = ({
  shippingMethod,
}: {
  shippingMethod: availableShippingMethods;
}) => {
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
      <EditShippingMethod
        open={isEditOpen}
        close={() => setIsEditOpen(false)}
        shippingMethod={shippingMethod}
      />
      <DeleteShippingMethod
        open={isDeleteOpen}
        close={() => setIsDeleteOpen(false)}
        shippingMethod={shippingMethod}
      />
    </>
  );
};

export default ShippingMethodDropdown;
