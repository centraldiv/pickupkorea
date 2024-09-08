import { Input } from "@/components/ui/input";
import { useSingleAdminOrder } from "@/lib/react-query/hooks";
import { differenceInDays, format } from "date-fns";
import { Label } from "@/components/ui/label";
import AdminSingleBuyOrderShippingMethod from "./AdminSingleOrderShippingMethod";
import type { OrderType } from "@/lib/react-query/config";
import AdminSingleOrderStatus from "./AdminSingleOrderStatus";

const AdminSingleOrderInfo = ({
  orderId,
  orderType,
}: {
  orderId: string;
  orderType: OrderType;
}) => {
  const { data } = useSingleAdminOrder({ orderId, orderType });
  if (!data) return null;

  const isBuyOrder = orderType === "BuyOrder" && "purchaseDate" in data;

  if (
    orderType !== "ShippingRequest" &&
    "shipRightAway" in data &&
    data.shipRightAway
  )
    return (
      <div className="shadow border px-4 rounded-md py-2 relative">
        <h2 className="text-center text-lg font-medium">주문 정보</h2>
        <span className="absolute top-0 right-0 bg-blue-500 text-white px-2 py-1">
          바로 배송
        </span>
        <div className="space-y-2">
          <AdminSingleOrderStatus orderId={orderId} orderType={orderType} />
          {isBuyOrder && (
            <>
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
            </>
          )}
          <Label className=" font-medium">수령완료 일시:</Label>
          <Input
            value={
              data.arrivalDate
                ? format(data.arrivalDate, "yyyy-MM-dd HH:mm")
                : "-"
            }
            disabled
            className="disabled:!opacity-100"
          />
          <Label className=" font-medium">수령완료 일수:</Label>
          <Input
            value={
              data.arrivalDate
                ? `${differenceInDays(data.arrivalDate, new Date())}일`
                : "-"
            }
            disabled
            className="disabled:!opacity-100"
          />
          {isBuyOrder && (
            <>
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
            </>
          )}
          <AdminSingleBuyOrderShippingMethod
            orderId={orderId}
            orderType={orderType}
          />
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
  if (
    orderType !== "ShippingRequest" &&
    "shipRightAway" in data &&
    data.shipRightAway === false
  )
    return (
      <div className="shadow border px-4 rounded-md py-2 relative col-span-2">
        <h2 className="text-center text-lg font-medium">창고 주문 정보</h2>
        <div className="space-y-2">
          <AdminSingleOrderStatus orderId={orderId} orderType={orderType} />
          {isBuyOrder && (
            <>
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
            </>
          )}
          <Label className=" font-medium">수령완료 일시:</Label>
          <Input
            value={
              data.arrivalDate
                ? format(data.arrivalDate, "yyyy-MM-dd HH:mm")
                : "-"
            }
            disabled
            className="disabled:!opacity-100"
          />
          <Label className=" font-medium">수령완료 일수:</Label>
          <Input
            value={
              data.arrivalDate
                ? `${differenceInDays(data.arrivalDate, new Date())}일`
                : "-"
            }
            disabled
            className="disabled:!opacity-100"
          />
          {isBuyOrder && (
            <>
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
            </>
          )}
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

  if (orderType === "ShippingRequest")
    return (
      <div className="shadow border px-4 rounded-md py-2 relative">
        <h2 className="text-center text-lg font-medium">창고 주문 정보</h2>
        <div className="space-y-2">
          <AdminSingleOrderStatus orderId={orderId} orderType={orderType} />
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
            value={data.user?.pfCode ?? ""}
            disabled
            className="disabled:!opacity-100"
          />
          <div>
            <div>포함 주문번호</div>
            <div className="flex items-center gap-2">
              {data &&
                "buyOrders" in data &&
                data.buyOrders.map((order) => (
                  <div key={order.id}>
                    <a
                      href={`/account/admin/buy-orders/${order.id}`}
                      target="_blank"
                    >
                      {order.productInvoice?.invoiceNumber}
                    </a>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
};

export default AdminSingleOrderInfo;
