import { usePFOrders } from "@/lib/react-query/hooks";
import PFOrdersTable from "./PFOrdersTable";

const PFOrderContainer = () => {
  const { data, isLoading, isError } = usePFOrders();

  if (isLoading) return <div className="">Loading...</div>;

  if (isError) return <div className="">Error</div>;

  if (data && !data.length) {
    return <div className="">No forwarding orders</div>;
  }

  if (data && data.length) {
    return (
      <section className="flex flex-col gap-4 max-w-5xl mx-auto w-full py-6 relative overflow-x-auto px-4">
        <div className="flex">
          <a
            href="/account/submit-order/pf-order"
            className="bg-secondary w-fit px-4 py-2 rounded-md hover:opacity-80 transition-colors duration-300 ml-auto mr-0"
          >
            Submit New Order
          </a>
        </div>
        <PFOrdersTable />
      </section>
    );
  }
};

export default PFOrderContainer;
