import { Skeleton } from "@/components/ui/skeleton";
import type { ShippingRequestStatus } from "@/definitions/statuses";
import { useAdminShippingRequests } from "@/lib/react-query/hooks";

import ScrollContainer from "react-indiana-drag-scroll";
import AdminShippingRequestItemCard from "./AdminShippingRequestItemCard";

const AdminShippingRequestStatusContainer = ({
  requestStatus,
}: {
  requestStatus: ShippingRequestStatus;
}) => {
  const {
    data: requests,
    isLoading,
    isError,
  } = useAdminShippingRequests(requestStatus);
  return (
    <ScrollContainer className="min-w-[400px] max-w-[400px] max-h-full overflow-y-auto border shadow rounded-md">
      <div className="px-4 py-2 bg-primary text-center font-medium sticky top-0 z-10">
        <span>{requestStatus} </span>
        <span className="text-sm absolute right-2 top-2 bg-black text-white size-6 rounded-full flex items-center justify-center">
          {isLoading && "..."}
          {requests && requests?.length}
        </span>
      </div>
      <div className="p-2 flex flex-col gap-2">
        {isLoading && <Skeleton className="h-full" />}
        {isError && <div>Error</div>}
        {requests &&
          Array.isArray(requests) &&
          requests.map((request) => (
            <AdminShippingRequestItemCard key={request.id} request={request} />
          ))}
      </div>
    </ScrollContainer>
  );
};

export default AdminShippingRequestStatusContainer;
