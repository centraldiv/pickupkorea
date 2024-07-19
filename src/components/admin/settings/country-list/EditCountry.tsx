import type { country } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import EditCountryForm from "./EditCountryForm";

const EditCountry = ({
  open,
  close,
  country,
}: {
  open: boolean;
  close: () => void;
  country: country;
}) => {
  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Country</DialogTitle>
          <DialogDescription>
            중복된 국가 코드나 이름은 추가할 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <div>
          <EditCountryForm country={country} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditCountry;
