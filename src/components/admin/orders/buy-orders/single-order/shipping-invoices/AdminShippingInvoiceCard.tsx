import type { ShippingInvoiceWithUser } from "@/lib/react-query/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { OrderType } from "@/lib/react-query/config";

const AdminShippingInvoiceCard = ({
  invoice,
  orderType,
}: {
  invoice: ShippingInvoiceWithUser;
  orderType: OrderType;
}) => {
  return (
    <a href={`/account/admin/payments/shipping-invoices/${invoice.id}`}>
      <Card className="hover:scale-105 transition-all duration-30 cursor-pointer">
        <CardHeader>
          <CardTitle>Invoice No. {invoice.invoiceNumber}</CardTitle>
          <CardDescription>
            발급일: {format(new Date(invoice.createdAt), "yyyy-MM-dd")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="border p-2">
            <div className="font-semibold">제품 수령인:</div>
            <div>
              {orderType === "BuyOrder"
                ? invoice.buyOrder?.address?.receiverName
                : orderType === "PFOrder"
                ? invoice.pfOrder?.address?.receiverName
                : invoice.shippingRequest?.address?.receiverName}
            </div>
            <div>
              {orderType === "BuyOrder"
                ? invoice.buyOrder?.address?.email
                : orderType === "PFOrder"
                ? invoice.pfOrder?.address?.email
                : invoice.shippingRequest?.address?.email}
            </div>
          </div>
          <div className="border p-2">
            <div className="font-semibold">계정 정보:</div>
            <div>{invoice.user.fullName}</div>
            <div>{invoice.user.email}</div>
          </div>
        </CardContent>
        <CardFooter className="flex">
          <div
            className={cn(
              "mr-auto",
              invoice.paid ? "text-green-500" : "text-red-500"
            )}
          >
            {invoice.paid ? "결제됨" : "미결제"}
          </div>
          <div className="ml-auto mr-0">
            {invoice.totalPrice.toLocaleString()} 원
          </div>
        </CardFooter>
      </Card>
    </a>
  );
};

export default AdminShippingInvoiceCard;
