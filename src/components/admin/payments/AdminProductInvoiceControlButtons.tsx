import { Button } from "@/components/ui/button";
import {
  PrivateQueryKeys,
  deleteAdminProductInvoice,
  markAdminProductInvoicePaid,
} from "@/lib/react-query/config";
import {
  useAdminSingleProductInvoice,
  type ProductInvoiceWithUser,
} from "@/lib/react-query/hooks";
import { client } from "@/stores/admin";
import { useMutation } from "@tanstack/react-query";
import { cloneDeep } from "lodash-es";

const AdminProductInvoiceControlButtons = ({
  invoiceId,
}: {
  invoiceId: string;
}) => {
  const { data, isLoading, isError } = useAdminSingleProductInvoice(invoiceId);
  const deleteMutation = useMutation(
    {
      mutationKey: [...PrivateQueryKeys.adminProductInvoices, invoiceId],
      mutationFn: async ({ invoiceId }: { invoiceId: string }) => {
        return await deleteAdminProductInvoice(invoiceId);
      },

      onSuccess: async (data: { success: boolean; message: string }) => {
        if (data?.success) {
          alert("삭제되었습니다");
          return (window.location.href =
            "/account/admin/payments/product-invoices");
        } else alert(data?.message);
      },
      onError: () => {
        alert("삭제에 실패했습니다");
        window.location.reload();
      },
      onSettled: () => {
        client.invalidateQueries({
          queryKey: [...PrivateQueryKeys.adminProductInvoices, invoiceId],
        });
      },
    },
    client
  );

  const paidMutation = useMutation(
    {
      mutationKey: [...PrivateQueryKeys.adminProductInvoices, invoiceId],
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
          queryKey: [...PrivateQueryKeys.adminProductInvoices, invoiceId],
        });

        const previousInvoice = client.getQueryData<ProductInvoiceWithUser>([
          ...PrivateQueryKeys.adminProductInvoices,
          invoiceId,
        ]);

        const newInvoice = cloneDeep(previousInvoice);

        if (newInvoice) {
          newInvoice.paid = !paid;
        }

        client.setQueryData(
          [...PrivateQueryKeys.adminProductInvoices, invoiceId],
          newInvoice
        );

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
          queryKey: [...PrivateQueryKeys.adminProductInvoices, invoiceId],
        });
      },
    },
    client
  );
  return (
    <div className="flex gap-4 justify-end">
      <Button
        className=""
        onClick={() =>
          paidMutation.mutate({ invoiceId, paid: data?.paid as boolean })
        }
        disabled={isLoading || paidMutation.isPending}
      >
        결제 상태 변경
      </Button>
      <Button
        variant="destructive"
        className=""
        onClick={() => deleteMutation.mutate({ invoiceId })}
        disabled={isLoading || deleteMutation.isPending}
      >
        삭제
      </Button>
    </div>
  );
};

export default AdminProductInvoiceControlButtons;
