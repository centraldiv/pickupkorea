import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PrivateQueryKeys,
  deleteAdminShippingInvoice,
  markAdminShippingInvoicePaid,
} from "@/lib/react-query/config";
import type { ShippingInvoiceWithUser } from "@/lib/react-query/hooks";
import { client } from "@/stores/admin";
import { useMutation } from "@tanstack/react-query";
import { cloneDeep } from "lodash-es";

const ShippingInvoicesTableDropdown = ({
  invoiceId,
  buyOrderId,
  pfOrderId,
  paid,
  requestId,
}: {
  invoiceId: string;
  buyOrderId?: string;
  pfOrderId?: string;
  requestId?: string;
  paid: boolean;
}) => {
  const deleteMutation = useMutation(
    {
      mutationKey: PrivateQueryKeys.adminProductInvoices,
      mutationFn: async ({ invoiceId }: { invoiceId: string }) => {
        return await deleteAdminShippingInvoice(invoiceId);
      },
      onMutate: async ({ invoiceId }: { invoiceId: string }) => {
        await client.cancelQueries({
          queryKey: PrivateQueryKeys.adminShippingInvoices,
        });

        const previousInvoices = client.getQueryData<ShippingInvoiceWithUser[]>(
          PrivateQueryKeys.adminShippingInvoices
        );

        const newInvoices = cloneDeep(previousInvoices)?.filter(
          (invoice) => invoice.id !== invoiceId
        );

        return { previousInvoices, newInvoices };
      },
      onSuccess: async (data: { success: boolean; message: string }) => {
        if (data?.success) {
          return alert("삭제되었습니다");
        } else alert(data?.message);
      },
      onError: () => {
        alert("삭제에 실패했습니다");
        window.location.reload();
      },
      onSettled: () => {
        client.invalidateQueries({
          queryKey: PrivateQueryKeys.adminShippingInvoices,
        });
      },
    },
    client
  );

  const paidMutation = useMutation(
    {
      mutationKey: PrivateQueryKeys.adminShippingInvoices,
      mutationFn: async ({
        invoiceId,
        paid,
        pfOrderId,
        buyOrderId,
        shippingRequestId,
      }: {
        invoiceId: string;
        paid: boolean;
        pfOrderId?: string;
        buyOrderId?: string;
        shippingRequestId?: string;
      }) => {
        return await markAdminShippingInvoicePaid({
          invoiceId,
          paid: !paid,
          pfOrderId,
          buyOrderId,
          shippingRequestId,
        });
      },
      onMutate: async ({
        invoiceId,
        paid,
        pfOrderId,
        buyOrderId,
      }: {
        invoiceId: string;
        paid: boolean;
        pfOrderId?: string;
        buyOrderId?: string;
      }) => {
        await client.cancelQueries({
          queryKey: PrivateQueryKeys.adminShippingInvoices,
        });

        const previousInvoice = client.getQueryData<ShippingInvoiceWithUser[]>(
          PrivateQueryKeys.adminShippingInvoices
        );

        const newInvoice = cloneDeep(previousInvoice);

        const invoice = newInvoice?.find((invoice) => invoice.id === invoiceId);

        if (invoice) {
          invoice.paid = !paid;
        }

        return { previousInvoice, newInvoice };
      },
      onSuccess: async (data) => {
        if (data.success) {
          return alert("상태 변경에 성공했습니다");
        } else alert(data.message);
      },
      onError: () => {
        alert("상태 변경에 실패했습니다");
        window.location.reload();
      },
      onSettled: () => {
        client.invalidateQueries({
          queryKey: PrivateQueryKeys.adminShippingInvoices,
        });
      },
    },
    client
  );
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>...</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Options</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem>
            <button
              type="button"
              onClick={() =>
                paidMutation.mutate({
                  invoiceId,
                  paid,
                  pfOrderId,
                  buyOrderId,
                  shippingRequestId: requestId,
                })
              }
            >
              Mark {!paid ? "Paid" : "Unpaid"}
            </button>
          </DropdownMenuItem>
          {requestId && (
            <>
              <DropdownMenuItem>
                <a href={`/account/admin/shipping-requests/${requestId}`}>
                  주문보기
                </a>
              </DropdownMenuItem>

              <DropdownMenuItem>
                <a
                  href={`/account/admin/payments/shipping-invoices/${invoiceId}`}
                >
                  내용보기
                </a>
              </DropdownMenuItem>
            </>
          )}

          {!requestId && (
            <>
              <DropdownMenuItem>
                <a
                  href={`/account/admin/${
                    pfOrderId ? "pf-orders" : "buy-orders"
                  }/${pfOrderId ?? buyOrderId}`}
                >
                  주문보기
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <a
                  href={`/account/admin/payments/shipping-invoices/${invoiceId}`}
                >
                  내용보기
                </a>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuItem
            onClick={() => deleteMutation.mutate({ invoiceId })}
          >
            삭제하기
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ShippingInvoicesTableDropdown;
