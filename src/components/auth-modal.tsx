"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import SignInTab from "./sign-in-tab";
import SignUpTab from "./sign-up-tab";

export default function AuthModal({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState("sign-in");

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading text-center text-2xl">
            {activeTab === "sign-in"
              ? "Welcome back!"
              : "Join the Editorverse!"}
          </DialogTitle>
        </DialogHeader>
        <Tabs
          value={activeTab}
          onValueChange={(newTab) => setActiveTab(newTab)}
          className="w-full"
        >
          <TabsList className="mb-2 flex w-full">
            <TabsTrigger value="sign-in" className="flex-1">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="sign-up" className="flex-1">
              Sign Up
            </TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in">
            <SignInTab />
          </TabsContent>
          <TabsContent value="sign-up">
            <SignUpTab />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
