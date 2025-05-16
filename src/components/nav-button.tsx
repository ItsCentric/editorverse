"use client";

import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import Link from "next/link";

export default function NavButton({
  href,
  children,
  ...props
}: {
  href?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (href) {
    return (
      <Button
        variant="ghost"
        className={`text-muted hover:text-foreground bg-none transition-all hover:scale-105 ${pathname === href ? "md:bg-primary/50 text-foreground" : ""}`}
        {...props}
        asChild
      >
        <Link href={href} className="font-heading">
          {children}
        </Link>
      </Button>
    );
  } else {
    return (
      <Button
        variant="ghost"
        className={`text-muted font-heading hover:text-foreground bg-none transition-all hover:scale-105 md:block ${pathname === href ? "md:bg-primary/50 text-foreground" : ""}`}
      >
        {children}
      </Button>
    );
  }
}
