import type { availableShippingMethods } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import EditShippingMethodForm from "./EditShippingMethodForm";

const EditShippingMethod = ({
  open,
  close,
  shippingMethod,
}: {
  open: boolean;
  close: () => void;
  shippingMethod: availableShippingMethods;
}) => {
  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Shipping Method</DialogTitle>
          <DialogDescription>
            중복된 배송방법 이름은 추가할 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <div>
          <EditShippingMethodForm shippingMethod={shippingMethod} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditShippingMethod;
