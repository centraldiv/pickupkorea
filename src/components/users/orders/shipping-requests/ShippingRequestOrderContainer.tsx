import { useShippingRequestOrders } from "@/lib/react-query/hooks";
import ShippingRequestsTable from "./ShippingRequestsTable";

const ShippingRequestOrderContainer = () => {
  const { data, isLoading, isError } = useShippingRequestOrders();

  if (isLoading) return <div className="text-center py-12">Loading...</div>;

  if (isError) return <div className="text-center py-12">Error</div>;

  if (data && !data.length) {
    return <div className="text-center py-12">No Shipping Requests</div>;
  }

  if (data && data.length) {
    return (
      <section className="flex flex-col gap-4 max-w-5xl mx-auto w-full py-6 relative overflow-x-auto px-4">
        <div className="flex">
          <a
            href="/account/submit-order/shipping-request"
            className="bg-secondary w-fit px-4 py-2 rounded-md hover:opacity-80 transition-colors duration-300 ml-auto mr-0"
          >
            Submit New Shipping Request
          </a>
        </div>
        <ShippingRequestsTable />
      </section>
    );
  }
};

export default ShippingRequestOrderContainer;
