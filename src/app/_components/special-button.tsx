import { Button } from "~/components/ui/button";

export default function SpecialButton({
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
