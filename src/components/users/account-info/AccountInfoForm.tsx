import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChangePasswordSchema,
  KakaoSchema,
} from "@/definitions/zod-definitions";
import type { UserWithCounts } from "@/lib/react-query/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const AccountInfoForm = ({ accountInfo }: { accountInfo: UserWithCounts }) => {
  const form = useForm<z.infer<typeof ChangePasswordSchema>>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      id: accountInfo.id,
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const kakaoForm = useForm<z.infer<typeof KakaoSchema>>({
    resolver: zodResolver(KakaoSchema),
    defaultValues: {
      kakaoId: accountInfo?.kakaoId ?? "",
    },
  });

  const onSubmit = async (data: z.infer<typeof ChangePasswordSchema>) => {
    try {
      const response = await fetch(
        "/api/private/users/account-info/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const json = await response.json();
      alert(json?.message);
    } catch (error) {
      console.error(error);
      alert("Failed to reset password");
    }
  };

  const kakaoSubmit = async (data: z.infer<typeof KakaoSchema>) => {
    try {
      const response = await fetch("/api/private/users/account-info/kakao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await response.json();
      alert(json?.message);
    } catch (error) {
      console.error(error);
      alert("Failed to update Kakao ID");
    }
  };

  return (
    <>
      <section>
        <Label>Username</Label>
        <Input value={accountInfo.username} disabled />
        <Label>Email</Label>
        <Input value={accountInfo.email} disabled />
        <Label>Full Name</Label>
        <Input value={accountInfo.fullName} disabled />
        <Label>PF Code</Label>
        <Input value={accountInfo.pfCode as string} disabled />
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
      <h2 className="text-2xl font-semibold text-center my-6">
        Password Reset
      </h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="border shadow-md p-4 rounded-md"
        >
          <FormField
            control={form.control}
            name="oldPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Old Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <fieldset className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </fieldset>
          <Button className="w-full mt-6" variant={"secondary"}>
            Reset Password
          </Button>
        </form>
      </Form>
    </>
  );
};

export default AccountInfoForm;
