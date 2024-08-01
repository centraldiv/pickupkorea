import type { OrderType } from "@/lib/react-query/config";
import { useSingleAdminOrder } from "@/lib/react-query/hooks";
import AdminSingleOrderItem from "./AdminSingleOrderItem";
import AdminSingleShippingRequestItem from "./AdminSingleShippingRequestItem";

const AdminSingleOrderProducts = ({
  orderId,
  orderType,
}: {
  orderId: string;
  orderType: OrderType;
}) => {
  const { data } = useSingleAdminOrder({ orderId, orderType });

  if (!data) return null;

  return (
    <section className="mx-auto max-w-7xl w-full flex flex-col py-6 gap-4 border px-4">
      {orderType !== "ShippingRequest" &&
        data.items.map((item, i) => (
          <AdminSingleOrderItem
            key={item.id}
            index={i}
            orderId={orderId}
            orderType={orderType}
          />
        ))}
      {orderType === "ShippingRequest" &&
        "toShipItems" in data &&
        data.toShipItems.map((item, i) => (
          <AdminSingleShippingRequestItem
            key={item.id}
            index={i}
            orderId={orderId}
            orderType={orderType}
          />
        ))}
    </section>
  );
};

export default AdminSingleOrderProducts;
