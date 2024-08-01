import ScrollContainer from "react-indiana-drag-scroll";
import AdminShippingRequestStatusContainer from "./AdminShippingRequestStatusContainer";
import { ShippingRequestStatusArray } from "@/definitions/statuses";

const AdminShippingRequestContainer = () => {
  return (
    <ScrollContainer className="flex gap-4 py-4 overflow-x-auto h-[calc(100vh-7rem-4rem)] px-4 justify-center">
      {ShippingRequestStatusArray.map((requestStatus) => (
        <AdminShippingRequestStatusContainer
          key={requestStatus}
          requestStatus={requestStatus}
        />
      ))}
    </ScrollContainer>
  );
};

export default AdminShippingRequestContainer;
