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
import { KakaoSchema } from "@/definitions/zod-definitions";
import { useAdminUserAccountInfo } from "@/lib/react-query/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const AdminUserAccountInfo = ({ userId }: { userId: string }) => {
  const { data, isLoading } = useAdminUserAccountInfo(userId);

  const form = useForm<z.infer<typeof KakaoSchema>>({
    resolver: zodResolver(KakaoSchema),
    defaultValues: {
      kakaoId: data?.kakaoId ?? "",
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <section>
        <Label>Username</Label>
        <Input value={data?.username} disabled />
        <Label>Email</Label>
        <Input value={data?.email} disabled />
        <Label>Full Name</Label>
        <Input value={data?.fullName} disabled />
        <Label>PF Code</Label>
        <Input value={data?.pfCode as string} disabled />
        <Form {...form}>
          <form>
            <FormField
              control={form.control}
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
    </>
  );
};

export default AdminUserAccountInfo;
