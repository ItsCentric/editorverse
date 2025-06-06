"use client";

import { usePathname } from "next/navigation";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export default function NavButton({
  href,
  children,
  ...props
}: {
  href?: string;
  children: React.ReactNode;
} & React.ComponentProps<typeof Button>) {
  const pathname = usePathname();
  if (href) {
    return (
      <Button
        variant="ghost"
        className={`text-muted-foreground hover:text-foreground bg-none transition-all hover:scale-105 ${pathname === href ? "md:bg-primary/50 text-foreground" : ""}`}
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
        className={`text-muted-foreground font-heading hover:text-foreground bg-none transition-all hover:scale-105 md:block ${pathname === href ? "md:bg-primary/50 text-foreground" : ""}`}
        {...props}
      >
        {children}
      </Button>
    );
  }
}
