import type {
  BuyOrderWithItemsAndAddress,
  PFOrderWithItemsAndAddress,
} from "@/lib/react-query/hooks";
import { getWebsiteNames } from "@/lib/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale/ko";

const AdminPFOrderItemContainer = ({
  order,
}: {
  order: PFOrderWithItemsAndAddress;
}) => {
  if (order.shipRightAway) {
    return (
      <a href={`/account/admin/pf-orders/${order.id}`}>
        <div key={order.id} className="relative border shadow rounded-md">
          <div className="w-full bg-blue-4000 flex items-center justify-center rounded-t py-0.5 font-semibold">
            바로 배송
          </div>
          <div className="text-center py-1 font-medium tracking-tighter">
            {order.user.email}
          </div>
          <div className="text-center py-1 font-medium tracking-tighter">
            {order.address.receiverName}
          </div>
          <div className="text-center py-1 font-medium tracking-tighter">
            {order.user.pfCode}
          </div>
          <div className="grid grid-cols-2 divide-x text-center border-y">
            <div className="grid divide-y">
              <div className="py-1">배송방법</div>
              <div className="py-1 text-sm">{order.shippingMethod.name}</div>
            </div>
            <div className="grid divide-y">
              <div className="py-1">주문량</div>
              <div className="py-1 text-sm">{order._count.items}</div>
            </div>
          </div>
          <div className="grid text-center border-b grid-cols-2">
            <div className="grid">
              <div className="w-full text-center bg-secondary">주문일시</div>
              <div className="text-sm py-1 font-medium text-muted-foreground">
                {format(order.createdAt, "yyyy-MM-dd HH:mm", {
                  locale: ko,
                })}
              </div>
            </div>
            <div className="grid">
              <div className="w-full text-center bg-secondary">수정일시</div>
              <div className="text-sm py-1 font-medium text-muted-foreground">
                {format(order.updatedAt, "yyyy-MM-dd HH:mm", {
                  locale: ko,
                })}
              </div>
            </div>
          </div>

          {order?.items && Array.isArray(order.items) && (
            <div className="p-1 text-xs break-keep text-center">
              {getWebsiteNames(order.items.map((item) => item.href))}
            </div>
          )}
        </div>
      </a>
    );
  }

  return (
    <a href={`/account/admin/pf-orders/${order.id}`}>
      <div key={order.id} className="relative border shadow rounded-md">
        <div className="w-full bg-pink-400 flex items-center justify-center rounded-t py-0.5 font-semibold text-white">
          창고
        </div>
        <div className="text-center py-1 font-medium tracking-tighter">
          {order.user.email}
        </div>
        <div className="text-center py-1 font-medium tracking-tighter">
          {order.user.fullName}
        </div>
        <div className="text-center py-1 font-medium tracking-tighter">
          {order.user.pfCode}
        </div>
        <div className="grid grid-cols-2 divide-x text-center border-y">
          <div className="grid divide-y">
            <div className="py-1">주문량</div>
            <div className="py-1 text-sm">{order._count.items}</div>
          </div>
          <div className="grid divide-y">
            <div className="py-1">수령량</div>
            <div className="py-1 text-sm">
              {order.items.reduce(
                (acc, item) => acc + item.receivedQuantity,
                0,
              )}
            </div>
          </div>
        </div>
        <div className="grid text-center border-b grid-cols-2">
          <div className="grid">
            <div className="w-full text-center bg-secondary">주문일시</div>
            <div className="text-sm py-1 font-medium text-muted-foreground">
              {format(order.createdAt, "yyyy-MM-dd HH:mm", {
                locale: ko,
              })}
            </div>
          </div>
          <div className="grid">
            <div className="w-full text-center bg-secondary">수정일시</div>
            <div className="text-sm py-1 font-medium text-muted-foreground">
              {format(order.updatedAt, "yyyy-MM-dd HH:mm", {
                locale: ko,
              })}
            </div>
          </div>
        </div>
        {order?.items && Array.isArray(order.items) && (
          <div className="p-1 text-xs break-keep text-center">
            {getWebsiteNames(order.items.map((item) => item.href))}
          </div>
        )}
      </div>
    </a>
  );
};

export default AdminPFOrderItemContainer;
