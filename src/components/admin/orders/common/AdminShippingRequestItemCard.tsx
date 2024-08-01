import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ShippingRequestWithInvoices } from "@/lib/react-query/hooks";
import { format } from "date-fns";

const AdminShippingRequestItemCard = ({
  request,
}: {
  request: ShippingRequestWithInvoices;
}) => {
  return (
    <a
      href={`/account/admin/shipping-requests/${request.id}`}
      className="group"
    >
      <Card className="shadow-md group-hover:border-primary transition-colors duration-300 group-hover:shadow-primary">
        <CardHeader>
          <CardTitle className="text-lg max-w-full ">
            {request.user.fullName}
          </CardTitle>
          <CardDescription className="font-semibold">
            {request.requestNumber}
          </CardDescription>
          <p className="py-1">{request.user.pfCode}</p>
        </CardHeader>
        <CardContent className="">
          <p className="py-1">
            {request.address.country.name} via {request.shippingMethod.name}
          </p>
          <div className="grid grid-cols-2 place-items-center border group-hover:border-primary transition-colors duration-300">
            <div>
              <div>Submit</div>
              <div className="text-sm text-gray-500 text-center">
                {format(request.createdAt, "yyyy-MM-dd HH:MM")}
              </div>
            </div>
            <div>
              <div>Products</div>
              <div className="text-sm text-gray-500 text-center">
                {request.toShipItems.reduce(
                  (acc, item) => acc + item.toShipQuantity,
                  0
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  );
};

export default AdminShippingRequestItemCard;
