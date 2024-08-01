import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useSingleBuyOrder } from "@/lib/react-query/hooks";
import { cn } from "@/lib/utils";

const SingleBuyOrderItems = ({ orderId }: { orderId: string }) => {
  const { data } = useSingleBuyOrder(orderId);

  if (!data) return null;

  return (
    <div className="space-y-4 px-4 py-6">
      {!data.items.length && (
        <p className="text-center py-12 font-medium text-lg text-red-500">
          No items in order
        </p>
      )}
      {data.items.map((item, i) => (
        <div
          key={item.id}
          className="w-full border border-black rounded shadow relative"
        >
          <span className="absolute -top-4 -left-4 size-8 rounded-full bg-black text-white flex items-center justify-center">
            {i + 1}
          </span>
          <span className="absolute -top-3 right-0 rounded-full bg-black text-white flex items-center justify-center px-4 text-sm">
            {item.productStatus}
          </span>
          <div className="grid grid-cols-[50px_1fr]">
            <div className="bg-primary font-medium flex items-center justify-center">
              Link
            </div>
            <div className="overflow-x-scroll scrollbar-hide px-2 text-nowrap py-2">
              <a href={item.href} target="_blank">
                {item.href}
              </a>
            </div>
          </div>
          <dl className="grid grid-cols-5 text-center divide-x border-y">
            <div className="grid">
              <dt className="font-medium bg-slate-100">Option</dt>
              <dd>{item.option ? item.option : "N/A"}</dd>
            </div>
            <div>
              <dt className="font-medium bg-slate-100">Price</dt>
              <dd>{item.price ? item.price.toLocaleString() : "?"}</dd>
            </div>
            <div>
              <dt className="font-medium bg-slate-100">Quantity</dt>
              <dd>{item.quantity ?? "X"}</dd>
            </div>
            <div>
              <dt className="font-medium bg-slate-100">Received</dt>
              <dd>{item.receivedQuantity ?? "X"}</dd>
            </div>
            <div>
              <dt className="font-medium bg-slate-100">Shipped</dt>
              <dd>{item.shippedQuantity ?? "X"}</dd>
            </div>
          </dl>
          {item.memo && (
            <div className="grid border-b">
              <div className="bg-slate-100 text-center py-1">Memo</div>
              <div className="px-2 text-slate-500">{item.memo}</div>
            </div>
          )}

          <div className="flex items-center gap-2 justify-center py-1 divide-x text-sm">
            <div className="flex items-center gap-2 px-2">
              <Checkbox checked={item.isInclusion} disabled />
              <label htmlFor={`${item.id}-inclusion`}>Inclusion Only</label>
            </div>
            <div className="flex items-center gap-2 px-2">
              <Checkbox checked={item.unboxingPhotoRequested} disabled />
              <label htmlFor={`${item.id}-unboxing-photo`}>
                Unboxing Photo Requested
              </label>
            </div>
            <div className="flex items-center gap-2 px-2">
              <Checkbox checked={item.unboxingVideoRequested} disabled />
              <label htmlFor={`${item.id}-unboxing-video`}>
                Unboxing Video Requested
              </label>
            </div>
          </div>
          {item.unboxingPhotoUrl || item.unboxingVideoUrl ? (
            <div className="grid grid-cols-2 gap-2 py-2">
              {item.unboxingVideoRequested && (
                <div
                  className={cn(
                    "grid",
                    !item.unboxingPhotoRequested && "col-span-2"
                  )}
                >
                  <div className="bg-secondary w-full text-center">
                    Unboxing Video
                  </div>
                  <div className="px-2 py-1">
                    {item.unboxingVideoUrl ? (
                      <a href={item.unboxingVideoUrl} target="_blank">
                        {item.unboxingVideoUrl}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </div>
                </div>
              )}
              {item.unboxingPhotoRequested && (
                <div
                  className={cn(
                    "grid",
                    !item.unboxingVideoRequested && "col-span-2"
                  )}
                >
                  <div className="bg-secondary text-center">Unboxing Photo</div>
                  <div className="px-2 py-1 text-cente">
                    {item.unboxingPhotoUrl ? (
                      <a href={item.unboxingPhotoUrl} target="_blank">
                        {item.unboxingPhotoUrl}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default SingleBuyOrderItems;
