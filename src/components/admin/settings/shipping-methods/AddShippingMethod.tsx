import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddShippingMethodForm from "./AddShippingMethodForm";

const AddShippingMethod = () => {
  return (
    <aside className="flex justify-end mb-6 max-w-xl mx-auto w-full">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="">배송방법 추가</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>배송방법 추가</DialogTitle>
            <DialogDescription>
              중복된 배송방법 이름은 추가할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <div>
            <AddShippingMethodForm />
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
};

export default AddShippingMethod;
