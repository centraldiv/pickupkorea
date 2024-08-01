import { Skeleton } from "@/components/ui/skeleton";
import { useSingleShippingRequestOrder } from "@/lib/react-query/hooks";
import { format } from "date-fns";
import SingleShippingRequestOrderItems from "./SingleShippingRequestOrderItems";

const SingleShippingRequestOrderContainer = ({
  requestId,
}: {
  requestId: string;
}) => {
  const { data, isLoading, isError } = useSingleShippingRequestOrder(requestId);

  if (isLoading)
    return (
      <section className="flex flex-col gap-4 max-w-7xl mx-auto w-full py-6 min-h-screen">
        <h1 className="text-2xl font-bold text-center">Order Overview</h1>
        <Skeleton className="h-20" />
        <Skeleton className="h-10" />
        <Skeleton className="h-20" />
        <Skeleton className="h-60" />
      </section>
    );

  if (isError)
    return (
      <section className="flex flex-col gap-4 max-w-7xl mx-auto w-full py-6 min-h-screen">
        <h1 className="text-2xl font-bold text-center">Order Overview</h1>
        <p className="text-center">
          An error occurred while fetching the order details. Please try again
          later.
        </p>
      </section>
    );

  if (!data) {
    return <div className="">No shipping request orders</div>;
  }

  if (data) {
    return (
      <section className="flex flex-col gap-4 max-w-7xl mx-auto w-full py-6 min-h-screen px-4">
        <h1 className="text-2xl font-bold text-center">Order Overview</h1>
        <div className="text-center">Order Unique ID: {data.id}</div>
        <div className="grid [@media(max-width:400px)]:grid-cols-1 md:grid-cols-4 grid-cols-2 text-center divide-x-2 rounded-md shadow">
          <dl className="">
            <dt className="py-2 font-medium bg-primary overflow-x-scroll max-w-full">
              Submit Date
            </dt>
            <dd className="text-sm bg-slate-100 py-2">
              {format(new Date(data.createdAt), "yyyy-MM-dd HH:mm")}
            </dd>
          </dl>
          <dl className="">
            <dt className="py-2 font-medium bg-primary overflow-x-scroll max-w-full">
              Order Status
            </dt>
            <dd className="text-sm bg-slate-100 py-2">{data.requestStatus}</dd>
          </dl>
          <dl className="">
            <dt className="py-2 font-medium bg-primary overflow-x-scroll max-w-full">
              No. Of Products
            </dt>
            <dd className="text-sm bg-slate-100 py-2">
              {data.toShipItems.length}
            </dd>
          </dl>
          <dl className="">
            <dt className="py-2 font-medium bg-primary overflow-x-scroll max-w-full">
              Total Ship Quantity
            </dt>
            <dd className="text-sm bg-slate-100 py-2">
              {data.toShipItems.reduce(
                (acc, item) => acc + item.toShipQuantity,
                0
              )}
            </dd>
          </dl>
        </div>
        <div className="grid grid-cols-1 text-center divide-x-2 rounded-md shadow">
          <dl className="">
            <dt className="py-2 font-medium bg-primary">Shipping Invoice</dt>
            <dd className="text-sm bg-slate-100 py-2">
              {data.shippingInvoice?.invoiceNumber ? (
                <a
                  href={`/account/payments/shipping-invoices/${data.shippingInvoice.id}`}
                >
                  {data.shippingInvoice.invoiceNumber}
                </a>
              ) : (
                "N/A"
              )}
            </dd>
          </dl>
        </div>
        {data.userMemo && (
          <div className="grid rounded-md ">
            <div className="font-medium text-center bg-slate-100 py-1">
              Order Memo
            </div>
            <div className="bg-slate-50 p-2">{data.userMemo}</div>
          </div>
        )}

        <SingleShippingRequestOrderItems requestId={requestId} />
      </section>
    );
  }
};

export default SingleShippingRequestOrderContainer;
