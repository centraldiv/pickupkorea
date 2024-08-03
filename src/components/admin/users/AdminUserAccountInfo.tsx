import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AdminCreditSchema,
  AdminKakaoSchema,
} from "@/definitions/zod-definitions";
import {
  PrivateQueryKeys,
  adminAddCreditToUser,
} from "@/lib/react-query/config";
import {
  useAdminUserAccountInfo,
  type CompleteUser,
} from "@/lib/react-query/hooks";
import { client } from "@/stores/admin";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { cloneDeep } from "lodash-es";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";

const AdminUserAccountInfo = ({ userId }: { userId: string }) => {
  const { data, isLoading } = useAdminUserAccountInfo(userId);

  const kakaoForm = useForm<z.infer<typeof AdminKakaoSchema>>({
    resolver: zodResolver(AdminKakaoSchema),
    defaultValues: {
      kakaoId: data?.kakaoId ?? "",
      userId: userId,
    },
  });
  const creditForm = useForm<z.infer<typeof AdminCreditSchema>>({
    resolver: zodResolver(AdminCreditSchema),
    defaultValues: {
      userId: userId,
      creditAmount: 0,
      content: "",
    },
  });

  const creditMutation = useMutation(
    {
      mutationKey: [...PrivateQueryKeys.adminUsers, "account-info", userId],
      mutationFn: async (values: z.infer<typeof AdminCreditSchema>) =>
        await adminAddCreditToUser(values),
      onMutate: async (values: z.infer<typeof AdminCreditSchema>) => {
        await client.cancelQueries({
          queryKey: [...PrivateQueryKeys.adminUsers, "account-info", userId],
        });

        const previousUserInfo = client.getQueryData<CompleteUser>([
          ...PrivateQueryKeys.adminUsers,
          "account-info",
          userId,
        ]);

        if (!previousUserInfo) {
          return;
        }

        const newUserInfo = cloneDeep(previousUserInfo);

        newUserInfo.creditAmount += values.creditAmount;
        newUserInfo.creditHistory.unshift({
          creditAmount: values.creditAmount,
          content: values.content,
          id: Math.random().toString(),
          userId: userId,
          createdAt: new Date(),
        });

        return { previousUserInfo, newUserInfo };
      },
      onSuccess: async (data: { message: string; success?: boolean }) => {
        if (data?.success) {
          alert(data?.message);
          creditForm.setValue("creditAmount", 0);
          creditForm.setValue("content", "");
        } else {
          alert(data?.message ?? "Failed to add credit");
        }
      },
      onError: () => {
        alert("Failed to add credit");
      },
      onSettled: () => {
        client.invalidateQueries({
          queryKey: [...PrivateQueryKeys.adminUsers, "account-info", userId],
        });
      },
    },
    client
  );

  const kakaoSubmit = async (values: z.infer<typeof AdminKakaoSchema>) => {
    try {
      const response = await fetch(
        "/api/private/users/admin-users/account-info/kakao",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        }
      );

      const json = await response.json();

      if (!json) {
        return alert("Failed to update Kakao ID");
      }

      alert(json?.message);
    } catch (error) {
      console.error(error);
      alert("Failed to update Kakao ID");
    }
  };

  const creditSubmit = async (values: z.infer<typeof AdminCreditSchema>) => {
    creditMutation.mutate(values);
  };

  useEffect(() => {
    kakaoForm.setValue("kakaoId", data?.kakaoId ?? "");
  }, [data?.kakaoId]);

  if (isLoading) return <Skeleton className="h-[20rem]" />;

  return (
    <>
      <h2 className="text-center border-2 max-w-md mx-auto my-6 py-2 px-4 rounded-lg">
        크레딧: {data?.creditAmount.toLocaleString()}원
      </h2>
      <section className="p-4 my-6 border rounded">
        <Form {...creditForm}>
          <form onSubmit={creditForm.handleSubmit(creditSubmit)}>
            <FormField
              control={creditForm.control}
              name="creditAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>크레딧 금액 (마이너스 입력시 차감)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={creditForm.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>사유</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="사유를 입력해주세요"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="mt-6 w-full"
              variant="secondary"
              disabled={creditMutation.isPending}
            >
              Add Credit
            </Button>
          </form>
        </Form>
      </section>
      <section></section>
      <section className="p-4 my-6 border rounded">
        <Label>Username</Label>
        <Input value={data?.username} disabled />
        <Label>Email</Label>
        <Input value={data?.email} disabled />
        <Label>Full Name</Label>
        <Input value={data?.fullName} disabled />
        <Label>PF Code</Label>
        <Input value={data?.pfCode as string} disabled />
        <Form {...kakaoForm}>
          <form onSubmit={kakaoForm.handleSubmit(kakaoSubmit)}>
            <FormField
              control={kakaoForm.control}
              name="kakaoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kakao ID</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="mt-6 w-full">Save Kakao ID</Button>
          </form>
        </Form>
      </section>
      <h3 className="mt-12 mb-6 text-center text-xl font-semibold">
        크레딧 내역
      </h3>
      <section className="max-w-7xl overflow-scroll max-h-[600px] w-full mx-auto">
        <Table className="border w-full mb-16 mx-auto">
          <TableHeader className="bg-primary/60">
            <TableRow className="">
              <TableHead className="text-black font-medium min-w-[150px]">
                생성일
              </TableHead>
              <TableHead className="text-black font-medium text-left min-w-[200px]">
                금액
              </TableHead>
              <TableHead className="text-black font-medium text-left min-w-[170px]">
                사유
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.creditHistory.map((credit) => (
              <TableRow key={credit.id}>
                <TableCell className="">
                  {format(credit.createdAt, "yyyy-MM-dd")}
                </TableCell>
                <TableCell className="text-left">
                  {credit.creditAmount.toLocaleString()} 원
                </TableCell>
                <TableCell className="text-left flex-1 overflow-x-scroll scrollbar-hide">
                  {credit.content}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </>
  );
};

export default AdminUserAccountInfo;
