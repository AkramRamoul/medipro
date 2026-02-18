import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import api from "../axios";

const schema = z.object({
  password: z.string().min(1, { message: "Password is required." }),
});

type FormValues = z.infer<typeof schema>;

export function EnterPasswordScreen() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const navigate = useNavigate();

  const { setAuthed } = useAuth();

  async function onSubmit(data: FormValues) {
    const result = await api.post("/users/check-password", { password: data.password });
    if (result) {
      localStorage.setItem("isAuthed", "true");
      setAuthed(true);
      navigate("/");
    } else {
      form.setError("password", { message: "Mot de passe incorrect" });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col space-y-6 w-full max-w-sm p-6 rounded-2xl shadow-lg border"
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="text-left space-y-2">
                <FormLabel>Entrez le mot de passe</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Ouvrir
          </Button>
        </form>
      </Form>
    </div>
  );
}
