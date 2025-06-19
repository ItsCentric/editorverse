"use client";

import { Button } from "~/components/ui/button";
import Google from "~/components/brand-icons/google";
import { Eye, EyeOff, LoaderCircle, Lock, User } from "lucide-react";
import { Input } from "~/components/ui/input";
import { useEffect, useState } from "react";
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
} from "~/components/ui/form";
import { authClient } from "~/lib/auth-client";
import { useMutation } from "@tanstack/react-query";

const signInSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function SignInTab() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    mutate: signIn,
    isPending,
    error,
    isError,
  } = useMutation({
    mutationFn: async (data: z.infer<typeof signInSchema>) => {
      const { success: isEmail } = z
        .string()
        .email()
        .safeParse(data.identifier);
      if (isEmail) {
        const { error } = await authClient.signIn.email({
          email: data.identifier,
          password: data.password,
        });
        if (error) throw new Error(error.message);
      } else {
        const { error } = await authClient.signIn.username({
          username: data.identifier,
          password: data.password,
        });
        if (error) throw new Error(error.message);
      }
    },
  });
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  useEffect(() => {
    console.log("mutation error:", error);
  }, [error]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => signIn(data))}
        className="space-y-2"
      >
        <div className="mb-4 space-y-4">
          <div className="flex items-center">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={async () =>
                await authClient.signIn.social({ provider: "google" })
              }
            >
              <Google fill="white" className="mr-2 size-4" />
              <p>Sign in with Google</p>
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background text-muted-foreground px-2">
                Or continue with
              </span>
            </div>
          </div>
        </div>
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email or username</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    placeholder="verycooleditor"
                    className="pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="myawesomepassword"
                    {...field}
                    className="pl-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-1/2 right-2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isError && <p className="text-destructive text-sm">{error.message}</p>}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <LoaderCircle className="size-4 animate-spin" />}
          <p>Sign in</p>
        </Button>
      </form>
    </Form>
  );
}
