import { PFOrderStatus } from "@/definitions/statuses";
import AdminPFOrderStatusContainer from "./AdminPFOrderStatusContainer";
import ScrollContainer from "react-indiana-drag-scroll";
const AdminPFOrderContainer = () => {
  const orderStatuses = Object.values(PFOrderStatus);

  return (
    <ScrollContainer className="flex gap-4 py-4 overflow-x-auto h-[calc(100vh-7rem-4rem)] px-4">
      {orderStatuses.map((orderStatus) => (
        <AdminPFOrderStatusContainer
          key={orderStatus}
          orderStatus={orderStatus}
        />
      ))}
    </ScrollContainer>
  );
};

export default AdminPFOrderContainer;
