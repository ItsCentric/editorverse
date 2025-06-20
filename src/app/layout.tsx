import "~/styles/globals.css";

import { type Metadata } from "next";
import { Lexend_Deca, Readex_Pro } from "next/font/google";
import { TRPCReactProvider } from "~/trpc/react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { House, LogIn, MessageCircle, PlusSquare, Search } from "lucide-react";
import NavButton from "./nav-button";
import AuthModal from "./auth-modal";
import CreatePostModal from "./_components/create-post-modal";
import { Toaster } from "sonner";
import DevTools from "./_components/dev-tools";
import SessionProvider from "./_components/session-provider";
import ProfileButton from "./_components/profile-button";
import SignedIn from "~/components/signed-in";
import SignedOut from "~/components/signed-out";
import { env } from "~/env";

export const metadata: Metadata = {
  title: "Editorverse",
  description: "A social media platform for video editors",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  variable: "--font-lexend-deca",
});
const readexPro = Readex_Pro({
  subsets: ["latin"],
  variable: "--font-readex-pro",
});

function SpecialButton({
  children,
  ...props
}: { children: React.ReactNode } & React.ComponentProps<typeof Button>) {
  return (
    <Button
      className="from-primary to-secondary hidden cursor-pointer bg-linear-150 transition-all hover:scale-105 md:flex"
      {...props}
    >
      {children}
    </Button>
  );
}
// TODO: fix no image for author on post, change file uploading to upload to user folder,
// test website further, video player for video preview on post creation is not same as rest of application
export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${lexendDeca.variable} ${readexPro.variable}`}>
      <body className="dark flex min-h-screen flex-col">
        <TRPCReactProvider>
          <SessionProvider>
            {env.NODE_ENV !== "production" && <DevTools />}
            <nav className="bg-background supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 w-full border-b py-4 backdrop-blur-md md:top-0">
              <div className="container mx-auto flex items-center justify-center md:justify-between">
                <div className="flex gap-8">
                  <Link href="/" className="font-heading text-2xl font-bold">
                    Editorverse
                  </Link>
                  <div className="hidden items-center gap-1 md:flex">
                    <NavButton href="/">
                      <House size={16} />
                      <p>Home</p>
                    </NavButton>
                    <NavButton href="/search">
                      <Search size={16} />
                      <p>Search</p>
                    </NavButton>
                    <NavButton href="/messages">
                      <MessageCircle size={16} />
                      <p>Messages</p>
                    </NavButton>
                  </div>
                </div>
                <SignedIn>
                  <div className="hidden items-center gap-4 md:flex">
                    <CreatePostModal>
                      <SpecialButton size="lg">
                        <PlusSquare className="size-4" />
                        <p>Create</p>
                      </SpecialButton>
                    </CreatePostModal>
                    <ProfileButton />
                  </div>
                </SignedIn>
                <SignedOut>
                  <AuthModal>
                    <SpecialButton>
                      <LogIn className="size-4" />
                      <p>Sign In</p>
                    </SpecialButton>
                  </AuthModal>
                </SignedOut>
              </div>
            </nav>
            <main className="flex-1">{children}</main>
            <nav className="bg-background supports-[backdrop-filter]:bg-background/80 sticky bottom-0 z-50 w-full border-t py-4 backdrop-blur-md md:hidden">
              <div className="flex items-center justify-around">
                <NavButton href="/" size="icon">
                  <House className="size-6" />
                </NavButton>
                <NavButton href="/search" size="icon">
                  <Search className="size-6" />
                </NavButton>
                <CreatePostModal>
                  <Button
                    size="icon"
                    className="hover:text-foreground bg-transparent"
                  >
                    <PlusSquare className="text-muted-foreground size-6" />
                  </Button>
                </CreatePostModal>
                <NavButton href="/messages" size="icon">
                  <MessageCircle className="size-6" />
                </NavButton>
                <SignedIn>
                  <ProfileButton />
                </SignedIn>
                <SignedOut>
                  <AuthModal>
                    <Button
                      className="hover:text-foreground bg-transparent"
                      size="icon"
                    >
                      <LogIn className="text-muted-foreground size-6" />
                    </Button>
                  </AuthModal>
                </SignedOut>
              </div>
            </nav>
            <Toaster />
          </SessionProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
