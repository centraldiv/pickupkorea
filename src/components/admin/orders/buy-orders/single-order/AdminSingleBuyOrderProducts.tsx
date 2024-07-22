import { useSingleAdminBuyOrder } from "@/lib/react-query/hooks";
import AdminSingleBuyOrderItem from "./AdminSingleBuyOrderItem";

const AdminSingleBuyOrderProducts = ({ orderId }: { orderId: string }) => {
  const { data } = useSingleAdminBuyOrder(orderId);

  if (!data) return null;
  return (
    <section className="mx-auto max-w-7xl w-full flex flex-col py-6 gap-4 border px-4">
      {data.items.map((item, i) => (
        <AdminSingleBuyOrderItem key={item.id} index={i} orderId={orderId} />
      ))}
    </section>
  );
};

export default AdminSingleBuyOrderProducts;
