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
import { Eye, EyeOff } from "lucide-react";
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
  const schema = status.status === "exists" ? updateSchema : createSchema;

  type CreatePasswordFormValues = z.infer<typeof createSchema>;
  type UpdatePasswordFormValues = z.infer<typeof updateSchema>;
  type PasswordFormValues = CreatePasswordFormValues | UpdatePasswordFormValues;

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(schema),
  });

  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showConsfirmPassword, setShowConfirmPassword] = useState(false);

  async function onSubmit(data: PasswordFormValues) {
    setSubmitting(true);
    try {
      if (status.status === "not-exists") {
        await window.electronAPI.createPassword(data.password);
        toast.success("Password created successfully");
        form.reset({
          password: "",
          confirmPassword: "",
        });
        await status.refetch();
      } else {
        const success = await window.electronAPI.changePassword(
          (data as UpdatePasswordFormValues).oldPassword,
          data.password
        );

        if (success.success) {
          toast.success("Password updated successfully");
          form.reset({
            oldPassword: "",
            password: "",
            confirmPassword: "",
          });
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

  if (status.status === "loading") return null;

  return (
    <div className="flex justify-center min-h-screen bg-background px-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col m-8 space-y-8 w-full max-w-xl"
        >
          <h2 className="text-xl font-bold text-center text-foreground">
            {status.status === "not-exists"
              ? "Create a Password"
              : "Update Password"}
          </h2>

          {status.status === "exists" && (
            <FormField
              control={form.control}
              name="oldPassword"
              render={({ field }) => (
                <FormItem className="space-y-2 text-left">
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showOldPassword ? "text" : "password"}
                        placeholder="Enter current password"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowOldPassword((prev) => !prev)}
                        tabIndex={-1}
                      >
                        {showOldPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
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
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    {...field}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
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
                  <div className="relative">
                    <Input
                      type={showConsfirmPassword ? "text" : "password"}
                      placeholder="Repeat new password"
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      tabIndex={-1}
                    >
                      {showConsfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4">
            <Button type="submit" disabled={submitting}>
              {status.status === "not-exists"
                ? "Create Password"
                : "Update Password"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
