"use client";

import { useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import Google from "./brand-icons/google";
import Apple from "./brand-icons/apple";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { useState } from "react";
import type { OAuthStrategy } from "@clerk/types";

const signInSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export default function SignInTab() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [showPassword, setShowPassword] = useState(false);
  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });
  async function onSubmit(values: z.infer<typeof signInSchema>) {
    if (!isLoaded) return;

    try {
      await signIn.create({
        identifier: values.identifier,
        password: values.password,
      });
      await setActive({ session: signIn.createdSessionId });
    } catch (err) {
      console.error("Error signing in:", err);
    }
  }

  function signInWith(strategy: OAuthStrategy) {
    if (!isLoaded) return;
    return signIn
      .authenticateWithRedirect({
        strategy,
        redirectUrl: "/api/oauth/callback",
        redirectUrlComplete: "/",
      })
      .catch((err: any) => {
        console.log(err.errors);
        console.error(err, null, 2);
      });
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signInWith("oauth_google")}
          >
            <Google fill="white" className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signInWith("oauth_apple")}
          >
            <Apple fill="white" className="mr-2 h-4 w-4" />
            Apple
          </Button>
        </div>
        <div className="relative mb-4">
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
      <Form {...signInForm}>
        <form
          onSubmit={signInForm.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            control={signInForm.control}
            name="identifier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email or username</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                      placeholder="yourname@domain.org"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-col">
            <FormField
              control={signInForm.control}
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
                        className="pl-10"
                        {...field}
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
            <Button className="self-end" variant="link">
              Forgot password?
            </Button>
          </div>
          <Button className="w-full">Sign In</Button>
        </form>
      </Form>
    </>
  );
}
