import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { usePasswordStatus } from "../../../hooks/usePasswordStatus"; // adjust path as needed
import { useState } from "react";
import { toast } from "sonner"; // optional, if you're using toast

const createSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const updateSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required."),
    password: z.string().min(6, "New password must be at least 6 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export function PasswordForm() {
  const status = usePasswordStatus();
  const schema = status === "exists" ? updateSchema : createSchema;

  type CreatePasswordFormValues = z.infer<typeof createSchema>;
  type UpdatePasswordFormValues = z.infer<typeof updateSchema>;
  type PasswordFormValues = CreatePasswordFormValues | UpdatePasswordFormValues;

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(schema),
  });

  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(data: PasswordFormValues) {
    setSubmitting(true);
    try {
      if (status === "not-exists") {
        await window.electronAPI.createPassword(data.password);
        toast.success("Password created successfully");
      } else {
        // TypeScript now knows that within this 'else' block,
        // 'data' can potentially have 'oldPassword'
        const success = await window.electronAPI.changePassword(
          (data as UpdatePasswordFormValues).oldPassword, // Type assertion
          data.password
        );

        if (success) {
          toast.success("Password updated successfully");
        } else {
          toast.error("Current password is incorrect");
        }
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "loading") return null;

  return (
    <div className="flex justify-center min-h-screen bg-background px-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col m-8 space-y-8 w-full max-w-xl"
        >
          <h2 className="text-xl font-bold text-center text-foreground">
            {status === "not-exists" ? "Create a Password" : "Update Password"}
          </h2>

          {status === "exists" && (
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem className="space-y-2 text-left">
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter current password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-2 text-left">
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Use at least 6 characters.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-2 text-left">
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Repeat new password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4">
            <Button type="submit" disabled={submitting}>
              {status === "not-exists" ? "Create Password" : "Update Password"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
