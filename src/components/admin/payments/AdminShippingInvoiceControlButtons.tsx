import { Button } from "@/components/ui/button";
import {
  PrivateQueryKeys,
  deleteAdminShippingInvoice,
  markAdminShippingInvoicePaid,
} from "@/lib/react-query/config";
import {
  useAdminSingleShippingInvoice,
  type ShippingInvoiceWithUser,
} from "@/lib/react-query/hooks";
import { client } from "@/stores/admin";
import { useMutation } from "@tanstack/react-query";
import { cloneDeep } from "lodash-es";

const AdminShippingInvoiceControlButtons = ({
  invoiceId,
}: {
  invoiceId: string;
}) => {
  const { data, isLoading, isError } = useAdminSingleShippingInvoice(invoiceId);

  const deleteMutation = useMutation(
    {
      mutationKey: [...PrivateQueryKeys.adminShippingInvoices, invoiceId],
      mutationFn: async ({ invoiceId }: { invoiceId: string }) => {
        return await deleteAdminShippingInvoice(invoiceId);
      },

      onSuccess: async (data: { success: boolean; message: string }) => {
        if (data?.success) {
          alert("삭제되었습니다");
          return (window.location.href =
            "/account/admin/payments/shipping-invoices");
        } else alert(data?.message);
      },
      onError: () => {
        alert("삭제에 실패했습니다");
        window.location.reload();
      },
      onSettled: () => {
        client.invalidateQueries({
          queryKey: [...PrivateQueryKeys.adminShippingInvoices, invoiceId],
        });
      },
    },
    client
  );

  const paidMutation = useMutation(
    {
      mutationKey: [...PrivateQueryKeys.adminShippingInvoices, invoiceId],
      mutationFn: async ({
        invoiceId,
        paid,
        buyOrderId,
        pfOrderId,
        shippingRequestId,
      }: {
        invoiceId: string;
        paid: boolean;
        buyOrderId?: string;
        pfOrderId?: string;
        shippingRequestId?: string;
      }) => {
        return await markAdminShippingInvoicePaid({
          invoiceId,
          paid: !paid,
          buyOrderId: buyOrderId,
          pfOrderId: pfOrderId,
          shippingRequestId: shippingRequestId,
        });
      },
      onMutate: async ({
        invoiceId,
        paid,
        buyOrderId,
        pfOrderId,
        shippingRequestId,
      }: {
        invoiceId: string;
        paid: boolean;
        buyOrderId?: string;
        pfOrderId?: string;
        shippingRequestId?: string;
      }) => {
        await client.cancelQueries({
          queryKey: [...PrivateQueryKeys.adminShippingInvoices, invoiceId],
        });

        const previousInvoice = client.getQueryData<ShippingInvoiceWithUser>([
          ...PrivateQueryKeys.adminShippingInvoices,
          invoiceId,
        ]);

        const newInvoice = cloneDeep(previousInvoice);

        if (newInvoice) {
          newInvoice.paid = !paid;
        }

        client.setQueryData(
          [...PrivateQueryKeys.adminShippingInvoices, invoiceId],
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
          queryKey: [...PrivateQueryKeys.adminShippingInvoices, invoiceId],
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
          paidMutation.mutate({
            invoiceId,
            paid: data?.paid as boolean,
            buyOrderId: data?.buyOrderId ?? undefined,
            pfOrderId: data?.pfOrderId ?? undefined,
            shippingRequestId: data?.shippingRequest?.id ?? undefined,
          })
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

export default AdminShippingInvoiceControlButtons;
