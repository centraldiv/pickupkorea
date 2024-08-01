import { Checkbox } from "@/components/ui/checkbox";
import { useSingleShippingRequestOrder } from "@/lib/react-query/hooks";
import { cn } from "@/lib/utils";

const SingleShippingRequestOrderItems = ({
  requestId,
}: {
  requestId: string;
}) => {
  const { data } = useSingleShippingRequestOrder(requestId);

  if (!data) return null;
  return (
    <div className="space-y-4 px-4 py-6">
      {!data.toShipItems.length && (
        <p className="text-center py-12 font-medium text-lg text-red-500">
          No items in order
        </p>
      )}
      {data.toShipItems.map((toShipItem, i) => (
        <div
          key={toShipItem.id}
          className="w-full border border-black rounded shadow relative"
        >
          <span className="absolute -top-4 -left-4 size-8 rounded-full bg-black text-white flex items-center justify-center">
            {i + 1}
          </span>
          <span className="absolute -top-3 right-0 rounded-full bg-black text-white flex items-center justify-center px-4 text-sm">
            {toShipItem?.item?.buyOrderId && (
              <a
                href={`/account/orders/buy-orders/${toShipItem.item.buyOrderId}`}
              >
                {toShipItem?.item?.buyOrder.productInvoice?.invoiceNumber ??
                  "N/A"}
              </a>
            )}
            {toShipItem.item.pfOrderId && (
              <a
                href={`/account/orders/pf-orders/${toShipItem.item.pfOrderId}`}
              >
                {data.user.pfCode}
              </a>
            )}
          </span>
          <div className="grid grid-cols-[50px_1fr]">
            <div className="bg-primary font-medium flex items-center justify-center">
              Link
            </div>
            <div className="overflow-x-scroll scrollbar-hide px-2 text-nowrap py-2">
              <a href={toShipItem.item.href} target="_blank">
                {toShipItem.item.href}
              </a>
            </div>
          </div>
          <dl className="grid grid-cols-4 text-center divide-x border-y">
            <div className="grid">
              <dt className="font-medium bg-slate-100">Option</dt>
              <dd>{toShipItem.item.option ? toShipItem.item.option : "N/A"}</dd>
            </div>
            <div>
              <dt className="font-medium bg-slate-100">Price</dt>
              <dd>
                {toShipItem.item.price
                  ? toShipItem.item.price.toLocaleString()
                  : "?"}
              </dd>
            </div>
            <div>
              <dt className="font-medium bg-slate-100">Received</dt>
              <dd>{toShipItem.item.receivedQuantity ?? "X"}</dd>
            </div>
            <div>
              <dt className="font-medium bg-slate-100">To Ship</dt>
              <dd>{toShipItem.toShipQuantity ?? "X"}</dd>
            </div>
          </dl>
          {toShipItem.item.memo && (
            <div className="grid border-b">
              <div className="bg-slate-100 text-center py-1">Memo</div>
              <div className="px-2 text-slate-500">{toShipItem.item.memo}</div>
            </div>
          )}

          <div className="flex items-center gap-2 justify-center py-1 divide-x text-sm">
            <div className="flex items-center gap-2 px-2">
              <Checkbox checked={toShipItem.item.isInclusion} disabled />
              <label htmlFor={`${toShipItem.id}-inclusion`}>
                Inclusion Only
              </label>
            </div>
            <div className="flex items-center gap-2 px-2">
              <Checkbox
                checked={toShipItem.item.unboxingPhotoRequested}
                disabled
              />
              <label htmlFor={`${toShipItem.id}-unboxing-photo`}>
                Unboxing Photo Requested
              </label>
            </div>
            <div className="flex items-center gap-2 px-2">
              <Checkbox
                checked={toShipItem.item.unboxingVideoRequested}
                disabled
              />
              <label htmlFor={`${toShipItem.id}-unboxing-video`}>
                Unboxing Video Requested
              </label>
            </div>
          </div>
          {toShipItem.item.unboxingPhotoUrl ||
          toShipItem.item.unboxingVideoUrl ? (
            <div className="grid grid-cols-2 gap-2 py-2">
              {toShipItem.item.unboxingVideoRequested && (
                <div
                  className={cn(
                    "grid",
                    !toShipItem.item.unboxingPhotoRequested && "col-span-2"
                  )}
                >
                  <div className="bg-secondary w-full text-center">
                    Unboxing Video
                  </div>
                  <div className="px-2 py-1">
                    {toShipItem.item.unboxingVideoUrl ? (
                      <a
                        href={toShipItem.item.unboxingVideoUrl}
                        target="_blank"
                      >
                        {toShipItem.item.unboxingVideoUrl}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </div>
                </div>
              )}
              {toShipItem.item.unboxingPhotoRequested && (
                <div
                  className={cn(
                    "grid",
                    !toShipItem.item.unboxingVideoRequested && "col-span-2"
                  )}
                >
                  <div className="bg-secondary text-center">Unboxing Photo</div>
                  <div className="px-2 py-1 text-cente">
                    {toShipItem.item.unboxingPhotoUrl ? (
                      <a
                        href={toShipItem.item.unboxingPhotoUrl}
                        target="_blank"
                      >
                        {toShipItem.item.unboxingPhotoUrl}
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

export default SingleShippingRequestOrderItems;
