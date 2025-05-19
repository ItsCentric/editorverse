"use client";

import { Button } from "~/components/ui/button";
import Google from "~/components/brand-icons/google";
import Apple from "~/components/brand-icons/apple";
import { Eye, EyeOff, LoaderCircle, Lock } from "lucide-react";
import { Input } from "~/components/ui/input";
import * as SignIn from "@clerk/elements/sign-in";
import * as Clerk from "@clerk/elements/common";
import { Label } from "~/components/ui/label";
import { useState } from "react";

export default function SignInTab() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SignIn.Root>
      <Clerk.Loading>
        {(isGlobalLoading) => (
          <>
            <SignIn.Step name="start">
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-2">
                  <Clerk.Connection name="google" asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={isGlobalLoading}
                    >
                      <Clerk.Loading scope="provider:google">
                        {(isLoading) =>
                          isLoading ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <>
                              <Google fill="white" className="mr-2 size-4" />
                              <p>Google</p>
                            </>
                          )
                        }
                      </Clerk.Loading>
                    </Button>
                  </Clerk.Connection>
                  <Clerk.Connection name="apple" asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={isGlobalLoading}
                    >
                      <Clerk.Loading scope="provider:apple">
                        {(isLoading: boolean) =>
                          isLoading ? (
                            <LoaderCircle className="size-4 animate-spin" />
                          ) : (
                            <>
                              <Apple fill="white" className="mr-2 size-4" />
                              <p>Apple</p>
                            </>
                          )
                        }
                      </Clerk.Loading>
                    </Button>
                  </Clerk.Connection>
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
              <div className="space-y-4">
                <Clerk.Field name="identifier" className="space-y-2">
                  <Clerk.Label asChild>
                    <Label>Email or username</Label>
                  </Clerk.Label>
                  <Clerk.Input required asChild>
                    <Input placeholder="yourname@domain.org" />
                  </Clerk.Input>
                  <Clerk.FieldError className="text-destructive block text-sm" />
                </Clerk.Field>
                <Clerk.Field name="password" className="space-y-2">
                  <Clerk.Label asChild>
                    <Label>Password</Label>
                  </Clerk.Label>
                  <div className="relative">
                    <Lock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Clerk.Input type="password" required asChild>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="myawesomepassword"
                        className="pl-10"
                      />
                    </Clerk.Input>
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
                  <Clerk.FieldError className="text-destructive block text-sm" />
                </Clerk.Field>
                <SignIn.Action submit asChild>
                  <Button disabled={isGlobalLoading} className="w-full">
                    {isGlobalLoading ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </SignIn.Action>
              </div>
              <Clerk.GlobalError />
            </SignIn.Step>
          </>
        )}
      </Clerk.Loading>
    </SignIn.Root>
  );
}
