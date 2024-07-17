import { useBuyOrders } from "@/lib/react-query/hooks";
import BuyOrdersTable from "./BuyOrdersTable";

const BuyOrderContainer = () => {
  const { data, isLoading, isError } = useBuyOrders();

  if (isLoading) return <div className="">Loading...</div>;

  if (isError) return <div className="">Error</div>;

  if (data && !data.length) {
    return <div className="">No buy orders</div>;
  }

  if (data && data.length) {
    return (
      <section className="flex flex-col gap-4">
        <div className="grid grid-cols-2">
          <a href="/orders/new" className="btn btn-primary">
            Submit New Order
          </a>
        </div>
        <BuyOrdersTable />
      </section>
    );
  }
};

export default BuyOrderContainer;
