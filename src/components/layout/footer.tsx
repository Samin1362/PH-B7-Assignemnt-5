import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/gear", label: "Browse gear" },
      { href: "/#how-it-works", label: "How it works" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Create an account" },
    ],
  },
  {
    title: "Providers",
    links: [
      { href: "/register", label: "List your gear" },
      { href: "/dashboard/provider", label: "Provider dashboard" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/40">
      <Container className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Rent sports and outdoor gear from trusted local providers.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title} className="space-y-3">
              <p className="text-sm font-semibold">{column.title}</p>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} GearUp. Built for Programming Hero
          Assignment 5.
        </p>
      </Container>
    </footer>
  );
}
