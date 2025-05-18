"use client";

import { useSignUp } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { OAuthStrategy } from "@clerk/types";
import { Button } from "./ui/button";
import Google from "./brand-icons/google";
import Apple from "./brand-icons/apple";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  ArrowLeft,
  AtSign,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
} from "lucide-react";
import { Input } from "./ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";

const signUpSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters long")
      .max(20, "Username must be at most 20 characters long")
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username can only contain letters, numbers, and underscores",
      }),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function SignUpTab() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [secondsTilResend, setSecondsTilResend] = useState(60);
  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!isVerifying) return;
    setSecondsTilResend(60);
    const id = setInterval(() => {
      setSecondsTilResend((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(id);
  }, [isVerifying]);

  async function onSignUpSubmit(values: z.infer<typeof signUpSchema>) {
    if (!isLoaded) return;

    try {
      await signUp.create({
        username: values.username,
        emailAddress: values.email,
        password: values.password,
      });

      await signUp.prepareEmailAddressVerification();
      setIsVerifying(true);
    } catch (err) {
      console.error("Error creating sign up:", err);
    }
  }

  function signInWith(strategy: OAuthStrategy) {
    if (!isLoaded) return;
    return signUp
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

  async function handleVerficationCode(code: string) {
    if (!isLoaded) return;
    try {
      const attempt = await signUp.attemptEmailAddressVerification({
        code,
      });
      console.log("Verification attempt:", attempt.status);
      if (attempt.status === "complete") {
        setIsVerifying(false);
        await setActive({ session: attempt.createdSessionId });
      } else {
        console.log("Verification attempt failed:", attempt);
      }
    } catch (err) {
      console.error("Error verifying code:", err);
    }
  }

  if (!isVerifying) {
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
        <Form {...signUpForm}>
          <form className="mb-4 space-y-4">
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
                        placeholder="thebesteditor"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
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
            <FormField
              control={signUpForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
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
          </form>
        </Form>
        <Button
          className="w-full"
          onClick={signUpForm.handleSubmit(onSignUpSubmit)}
        >
          Sign Up
        </Button>
        <div id="clerk-captcha"></div>
      </>
    );
  } else {
    return (
      <div className="flex flex-col items-center gap-4">
        <Button
          variant="ghost"
          className="self-start"
          onClick={() => {
            setIsVerifying(false);
          }}
        >
          <ArrowLeft className="size-4" />
          <p>Back</p>
        </Button>
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
            <span className="text-foreground">{signUp?.emailAddress}</span>.
          </p>
        </div>
        <InputOTP
          maxLength={6}
          value={code}
          onChange={(value) => setCode(value)}
        >
          <InputOTPGroup className="mx-auto">
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <Button
          className="w-full max-w-xs"
          onClick={async () => await handleVerficationCode(code)}
        >
          Verify & Complete Sign Up
        </Button>
        <p className="text-muted-foreground -mt-2 text-center text-sm">
          Didn’t receive the code?{" "}
          {secondsTilResend !== 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="text-primary saturate-[80%]">
                  Resend Code
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  You may resend a verification code in {secondsTilResend}{" "}
                  seconds
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {secondsTilResend === 0 && (
            <Button
              variant="link"
              className="p-0"
              onClick={async () => {
                if (!isLoaded) return;
                await signUp.prepareEmailAddressVerification();
                setSecondsTilResend(60);
              }}
            >
              Resend Code
            </Button>
          )}
        </p>
      </div>
    );
  }
}
