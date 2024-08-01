import { BuyOrderStatus } from "@/definitions/statuses";
import AdminBuyOrderStatusContainer from "./AdminBuyOrderStatusContainer";
import ScrollContainer from "react-indiana-drag-scroll";

const AdminBuyOrderContainer = () => {
  const orderStatuses = Object.values(BuyOrderStatus);

  return (
    <ScrollContainer className="flex gap-4 py-4 overflow-x-auto h-[calc(100vh-7rem-4rem)] px-4">
      {orderStatuses.map((orderStatus) => (
        <AdminBuyOrderStatusContainer
          key={orderStatus}
          orderStatus={orderStatus}
        />
      ))}
    </ScrollContainer>
  );
};

export default AdminBuyOrderContainer;
