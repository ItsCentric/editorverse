import "~/styles/globals.css";

import { type Metadata } from "next";
import { Lexend_Deca, Readex_Pro } from "next/font/google";

import { ClerkProvider, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { TRPCReactProvider } from "~/trpc/react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  House,
  LogIn,
  MessageCircle,
  PlusSquare,
  Search,
  UserPlus,
  UsersRound,
  Video,
} from "lucide-react";
import NavButton from "~/components/nav-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import AuthModal from "~/components/auth-modal";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${lexendDeca.variable} ${readexPro.variable}`}>
      <body className="dark">
        <ClerkProvider>
          <TRPCReactProvider>
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
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SpecialButton size="lg">
                          <PlusSquare className="size-4" />
                          <p>Create</p>
                        </SpecialButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="mt-1">
                        <DropdownMenuItem>
                          <Video className="size-4" />
                          <p>Video Post</p>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserPlus className="size-4" />
                          <p>Recruiting Post</p>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UsersRound className="size-4" />
                          <p>Collab Post</p>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <UserButton />
                  </div>
                </SignedIn>
                <SignedOut>
                  <SpecialButton>
                    <LogIn className="size-4" />
                    <p>Sign In</p>
                  </SpecialButton>
                </SignedOut>
              </div>
            </nav>
            <main>{children}</main>
            <nav className="bg-background supports-[backdrop-filter]:bg-background/80 sticky bottom-0 z-50 w-full border-t py-4 backdrop-blur-md md:hidden">
              <div className="flex items-center justify-around">
                <NavButton href="/">
                  <House className="size-6" />
                </NavButton>
                <NavButton href="/search">
                  <Search className="size-6" />
                </NavButton>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="hover:text-foreground bg-transparent">
                      <PlusSquare className="text-muted size-6" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="mb-1">
                    <DropdownMenuItem>
                      <Video className="size-4" />
                      <p>Video Post</p>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserPlus className="size-4" />
                      <p>Recruiting Post</p>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UsersRound className="size-4" />
                      <p>Collab Post</p>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <NavButton href="/messages">
                  <MessageCircle className="size-6" />
                </NavButton>
              </div>
            </nav>
          </TRPCReactProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
