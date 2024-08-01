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
  deleteAdminProductInvoice,
  markAdminProductInvoicePaid,
} from "@/lib/react-query/config";
import type { ProductInvoiceWithUser } from "@/lib/react-query/hooks";
import { client } from "@/stores/admin";
import { useMutation } from "@tanstack/react-query";
import { cloneDeep } from "lodash-es";

const ProductInvoicesTableDropdown = ({
  invoiceId,
  buyOrderId,
  paid,
}: {
  invoiceId: string;
  buyOrderId?: string;
  paid: boolean;
}) => {
  const deleteMutation = useMutation(
    {
      mutationKey: PrivateQueryKeys.adminProductInvoices,
      mutationFn: async ({ invoiceId }: { invoiceId: string }) => {
        return await deleteAdminProductInvoice(invoiceId);
      },
      onMutate: async ({ invoiceId }: { invoiceId: string }) => {
        await client.cancelQueries({
          queryKey: PrivateQueryKeys.adminProductInvoices,
        });

        const previousInvoices = client.getQueryData<ProductInvoiceWithUser[]>(
          PrivateQueryKeys.adminProductInvoices
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
          queryKey: PrivateQueryKeys.adminProductInvoices,
        });
      },
    },
    client
  );

  const paidMutation = useMutation(
    {
      mutationKey: PrivateQueryKeys.adminProductInvoices,
      mutationFn: async ({
        invoiceId,
        paid,
      }: {
        invoiceId: string;
        paid: boolean;
      }) => {
        return await markAdminProductInvoicePaid({
          invoiceId,
          paid: !paid,
        });
      },
      onMutate: async ({
        invoiceId,
        paid,
      }: {
        invoiceId: string;
        paid: boolean;
      }) => {
        await client.cancelQueries({
          queryKey: PrivateQueryKeys.adminProductInvoices,
        });

        const previousInvoice = client.getQueryData<ProductInvoiceWithUser[]>(
          PrivateQueryKeys.adminProductInvoices
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
          queryKey: PrivateQueryKeys.adminProductInvoices,
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
          {buyOrderId && (
            <DropdownMenuItem>
              <button
                type="button"
                onClick={() => paidMutation.mutate({ invoiceId, paid })}
              >
                Mark {!paid ? "Paid" : "Unpaid"}
              </button>
            </DropdownMenuItem>
          )}
          {buyOrderId && (
            <DropdownMenuItem>
              <a href={`/account/admin/buy-orders/${buyOrderId}`}>주문보기</a>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>
            <a href={`/account/admin/payments/product-invoices/${invoiceId}`}>
              내용보기
            </a>
          </DropdownMenuItem>
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

export default ProductInvoicesTableDropdown;
