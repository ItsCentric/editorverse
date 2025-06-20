"use client";

import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import Google from "~/components/brand-icons/google";
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
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "~/lib/auth-client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { Checkbox } from "~/components/ui/checkbox";
import Link from "next/link";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import { createQueryClient } from "~/trpc/query-client";
import { useTRPC } from "~/trpc/react";

const signUpSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    username: z.string().min(1, "Username is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Passwords do not match"),
    acceptTerms: z.boolean().refine((val) => val, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const verifyEmailSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export default function SignUpTab() {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"start" | "verify">("start");
  const [isChecking, setIsChecking] = useState(false);
  const trpc = useTRPC();
  const queryClient = createQueryClient();
  const [signUpData, setSignUpData] = useState<z.infer<
    typeof signUpSchema
  > | null>(null);
  const [resendIn, setResendIn] = useState(60);
  const { mutateAsync: sendVerificationEmail, isPending: isSending } =
    useMutation({
      mutationFn: async (data: z.infer<typeof signUpSchema>) => {
        const { error } = await authClient.emailOtp.sendVerificationOtp({
          email: data.email,
          type: "email-verification",
        });
        if (error) throw new Error(error.message);
      },
    });
  const { mutateAsync: finishSignUp, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof verifyEmailSchema>) => {
      if (!signUpData) {
        console.error("Sign up data is not available");
        return;
      }
      const { confirmPassword: _, acceptTerms: __, ...restData } = signUpData;
      const { error: signUpError } = await authClient.signUp.email({
        ...restData,
        name: "",
      });
      if (signUpError) throw new Error(signUpError.message);
      const { error: verifyError } = await authClient.emailOtp.verifyEmail({
        email: signUpData.email,
        otp: data.otp,
      });
      if (verifyError) throw new Error(verifyError.message);
    },
  });
  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });
  const verifyEmailForm = useForm<z.infer<typeof verifyEmailSchema>>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      otp: "",
    },
  });
  useEffect(() => {
    const id = setInterval(() => {
      setResendIn((prev) => {
        if (prev === 0) return prev;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  });

  async function handleStartSubmit(data: z.infer<typeof signUpSchema>) {
    setSignUpData(data);
    setIsChecking(true);
    const duplicateFields = await queryClient.fetchQuery(
      trpc.user.checkForExistingAccount.queryOptions({
        username: data.username,
        email: data.email,
      }),
    );
    if (duplicateFields.email) {
      setIsChecking(false);
      signUpForm.setError("email", {
        message: "Email is already registered",
      });
      return;
    } else if (duplicateFields.username) {
      setIsChecking(false);
      signUpForm.setError("username", {
        message: "Username is already taken",
      });
      return;
    }
    setIsChecking(false);
    await sendVerificationEmail(data);
    setStep("verify");
  }

  if (step === "start") {
    return (
      <Form {...signUpForm}>
        <form
          onSubmit={signUpForm.handleSubmit(handleStartSubmit)}
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
            control={signUpForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                      placeholder="email@domain.com"
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
            control={signUpForm.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <div className="relative">
                    <AtSign className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                      placeholder="averycooleditor"
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
            control={signUpForm.control}
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
          <FormField
            control={signUpForm.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
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
          <FormField
            control={signUpForm.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="my-4 flex">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                  />
                </FormControl>
                <div className="space-y-1">
                  <FormLabel>Accept terms and conditions</FormLabel>
                  <FormDescription>
                    By clicking this checkbox, you agree to the{" "}
                    <Button variant="link" className="h-fit p-0" asChild>
                      <Link href="terms-of-service" target="_blank">
                        Terms of Service
                      </Link>
                    </Button>{" "}
                    and the{" "}
                    <Button variant="link" className="h-fit p-0" asChild>
                      <Link href="privacy-policy" target="_blank">
                        Privacy Policy
                      </Link>
                    </Button>
                    .
                  </FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={isChecking || isSending}
          >
            {(isChecking || isSending) && (
              <LoaderCircle className="size-4 animate-spin" />
            )}
            <p>Sign up</p>
          </Button>
        </form>
      </Form>
    );
  } else if (step === "verify") {
    if (!signUpData)
      throw new Error("Sign up data for verification is not available");
    return (
      <Form {...verifyEmailForm}>
        <form
          onSubmit={verifyEmailForm.handleSubmit(
            async (data) => await finishSignUp(data),
          )}
          className="space-y-2"
        >
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
                <span className="text-foreground font-semibold">
                  {signUpData.email}
                </span>
                .
              </p>
            </div>
            <FormField
              control={verifyEmailForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full max-w-xs" disabled={isPending}>
              {isPending && <LoaderCircle className="size-4 animate-spin" />}
              <p>Complete sign up</p>
            </Button>
            <p className="text-muted-foreground -mt-2 text-center text-sm">
              Didn’t receive the code?{" "}
              {resendIn === 0 ? (
                <Button
                  variant="link"
                  className="h-fit p-0"
                  onClick={async () => await sendVerificationEmail(signUpData)}
                  disabled={isSending}
                >
                  Resend code
                </Button>
              ) : (
                <span className="text-muted-foreground">
                  Resend in {resendIn} {resendIn === 1 ? "second" : "seconds"}
                </span>
              )}
            </p>
          </div>
        </form>
      </Form>
    );
  }
}
