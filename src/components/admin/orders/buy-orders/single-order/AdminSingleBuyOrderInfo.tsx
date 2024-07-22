import { Input } from "@/components/ui/input";

import { useSingleAdminBuyOrder } from "@/lib/react-query/hooks";

import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import AdminSingleBuyOrderStatus from "./AdminSingleBuyOrderStatus";
import AdminSingleBuyOrderShippingMethod from "./AdminSingleBuyOrderShippingMethod";

const AdminSingleBuyOrderInfo = ({ orderId }: { orderId: string }) => {
  const { data } = useSingleAdminBuyOrder(orderId);

  if (!data) return null;

  if (data.shipRightAway)
    return (
      <div className="shadow border px-4 rounded-md py-2 relative">
        <h2 className="text-center text-lg font-medium">주문 정보</h2>
        <span className="absolute top-0 right-0 bg-blue-500 text-white px-2 py-1">
          바로 배송
        </span>
        <div className="space-y-2">
          <AdminSingleBuyOrderStatus orderId={orderId} />
          <Label className=" font-medium">주문일시:</Label>
          <Input
            value={
              data.purchaseDate
                ? format(data.purchaseDate, "yyyy-MM-dd HH:mm")
                : "미주문"
            }
            disabled
            className="disabled:!opacity-100"
          />
          <Label className=" font-medium">마지막 수령일시:</Label>
          <Input
            value={
              data.arrivalDate
                ? format(data.arrivalDate, "yyyy-MM-dd HH:mm")
                : "-"
            }
            disabled
            className="disabled:!opacity-100"
          />
          <Label className=" font-medium">Invoice 번호</Label>
          <Input
            value={
              data?.productInvoice?.invoiceNumber
                ? data?.productInvoice?.invoiceNumber
                : "-"
            }
            disabled
            className="disabled:!opacity-100"
          />
          <AdminSingleBuyOrderShippingMethod orderId={orderId} />
          <Label className=" font-medium">주문자:</Label>
          <Input
            value={data.user.fullName}
            disabled
            className="disabled:!opacity-100"
          />
          <Label className=" font-medium">주문자 Email:</Label>
          <Input
            value={data.user.email}
            disabled
            className="disabled:!opacity-100"
          />
          <Label className=" font-medium">주문자 PF Code:</Label>
          <Input
            value={data.user.pfCode ?? ""}
            disabled
            className="disabled:!opacity-100"
          />
        </div>
      </div>
    );
};

export default AdminSingleBuyOrderInfo;
