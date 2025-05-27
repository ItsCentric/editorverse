"use client";

import * as SignUp from "@clerk/elements/sign-up";
import * as Clerk from "@clerk/elements/common";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import Google from "~/components/brand-icons/google";
import Apple from "~/components/brand-icons/apple";
import {
  AtSign,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  Lock,
  Mail,
} from "lucide-react";
import { Input } from "~/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

export default function SignUpTab() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SignUp.Root routing="virtual">
      <Clerk.Loading>
        {(isGlobalLoading) => (
          <>
            <SignUp.Step name="start">
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
                <Clerk.Field name="emailAddress" className="space-y-2">
                  <Clerk.Label asChild>
                    <Label>Email</Label>
                  </Clerk.Label>
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Clerk.Input type="email" required asChild>
                      <Input
                        placeholder="yourname@domain.org"
                        className="pl-10"
                      />
                    </Clerk.Input>
                  </div>
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
                <Clerk.Field name="confirmPassword" className="space-y-2">
                  <Clerk.Label asChild>
                    <Label>Confirm Password</Label>
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
                <SignUp.Captcha />
                <SignUp.Action submit asChild>
                  <Button disabled={isGlobalLoading} className="w-full">
                    {isGlobalLoading ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      "Sign up"
                    )}
                  </Button>
                </SignUp.Action>
              </div>
              <Clerk.GlobalError />
            </SignUp.Step>
            <SignUp.Step name="continue">
              <Clerk.Field name="username" className="mb-4 space-y-2">
                <Clerk.Label asChild>
                  <Label>Username</Label>
                </Clerk.Label>
                <div className="relative">
                  <AtSign className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <Clerk.Input required asChild>
                    <Input placeholder="thebesteditor" className="pl-10" />
                  </Clerk.Input>
                </div>
                <Clerk.FieldError className="text-destructive block text-sm" />
              </Clerk.Field>
              <SignUp.Action submit asChild>
                <Button disabled={isGlobalLoading} className="w-full">
                  {isGlobalLoading ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    "Sign up"
                  )}
                </Button>
              </SignUp.Action>
            </SignUp.Step>
            <SignUp.Step name="verifications">
              <div className="flex flex-col items-center gap-4">
                <div className="text-primary bg-primary/20 rounded-full p-3">
                  <KeyRound className="size-6" />
                </div>
                <div className="text-center">
                  <p className="font-heading mb-1 text-lg font-semibold">
                    Verify your email address
                  </p>
                  <p className="text-muted-foreground text-sm font-medium text-balance">
                    We sent a verification code to
                    <br />
                    your email address.
                  </p>
                </div>
                <Clerk.Field name="code" className="space-y-2">
                  <Clerk.Input
                    type="otp"
                    className="flex justify-center has-[:disabled]:opacity-50"
                    autoSubmit
                    render={({ value, status }) => {
                      return (
                        <div
                          data-status={status}
                          className={cn(
                            "relative flex size-10 items-center justify-center border border-y border-r text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
                            {
                              "ring-ring ring-offset-background z-10 ring-2":
                                status === "cursor" || status === "selected",
                            },
                          )}
                        >
                          {value}
                          {status === "cursor" && (
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                              <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
                            </div>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Clerk.FieldError className="text-destructive block text-sm" />
                </Clerk.Field>
                <Button className="w-full max-w-xs" disabled={isGlobalLoading}>
                  Verify & Continue Sign Up
                </Button>
                <p className="text-muted-foreground -mt-2 text-center text-sm">
                  Didn’t receive the code?{" "}
                  <SignUp.Action
                    resend
                    asChild
                    fallback={({ resendableAfter }) => (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="text-primary saturate-[80%]">
                            Resend Code
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            You may resend a verification code in{" "}
                            {resendableAfter} seconds
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  >
                    <Button variant="link" className="p-0">
                      Resend Code
                    </Button>
                  </SignUp.Action>
                </p>
              </div>
            </SignUp.Step>
          </>
        )}
      </Clerk.Loading>
    </SignUp.Root>
  );
}
