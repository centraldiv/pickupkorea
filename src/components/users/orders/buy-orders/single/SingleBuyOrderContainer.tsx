import { Skeleton } from "@/components/ui/skeleton";
import { useSingleBuyOrder } from "@/lib/react-query/hooks";
import { getWebsiteNames } from "@/lib/utils";
import { format } from "date-fns";
import SingleBuyOrderItems from "./SingleBuyOrderItems";

const SingleBuyOrderContainer = ({ orderId }: { orderId: string }) => {
  const { data, isLoading, isError } = useSingleBuyOrder(orderId);

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
    return <div className="">No buy orders</div>;
  }

  if (data) {
    return (
      <section className="flex flex-col gap-4 max-w-7xl mx-auto w-full py-6 min-h-screen px-4">
        <h1 className="text-2xl font-bold text-center">Order Overview</h1>
        <div className="text-center">Order Unique ID: {data.id}</div>
        <div className="grid grid-cols-3 text-center divide-x-2 rounded-md shadow">
          <dl className="">
            <dt className="py-2 font-medium bg-primary">Submit Date</dt>
            <dd className="text-sm bg-slate-100 py-2">
              {format(new Date(data.createdAt), "yyyy-MM-dd HH:mm")}
            </dd>
          </dl>
          <dl className="">
            <dt className="py-2 font-medium bg-primary">Order Status</dt>
            <dd className="text-sm bg-slate-100 py-2">{data.orderStatus}</dd>
          </dl>
          <dl className="">
            <dt className="py-2 font-medium bg-primary">No. Of Products</dt>
            <dd className="text-sm bg-slate-100 py-2">{data.items.length}</dd>
          </dl>
        </div>
        <div className="border rounded py-2 px-4 shadow">
          Website List: {getWebsiteNames(data.items.map((item) => item.href))}
        </div>
        {data.userMemo && (
          <div className="grid rounded-md ">
            <div className="font-medium text-center bg-slate-100 py-1">
              Order Memo
            </div>
            <div className="bg-slate-50 p-2">{data.userMemo}</div>
          </div>
        )}

        <SingleBuyOrderItems orderId={orderId} />
      </section>
    );
  }
};

export default SingleBuyOrderContainer;
