import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddCountryForm from "./AddCountryForm";

const AddCountry = () => {
  return (
    <aside className="flex justify-end mb-6 max-w-xl mx-auto w-full">
      <Dialog>
        <DialogTrigger asChild>
          <Button className="">국가 추가</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>국가 추가</DialogTitle>
            <DialogDescription>
              중복된 국가 코드나 이름은 추가할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <div>
            <AddCountryForm />
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
};

export default AddCountry;
