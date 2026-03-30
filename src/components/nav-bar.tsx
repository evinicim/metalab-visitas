"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/alunos", label: "Alunos", icon: Users },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {links.map((link) => {
          const isActive =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors",
                isActive
                  ? "text-teal-700 font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <link.icon className="h-5 w-5" />
              <span className="text-xs">{link.label}</span>
            </Link>
          );
        })}
        <form action="/auth/logout" method="POST">
          <button
            type="submit"
            className="flex flex-col items-center gap-1 px-3 py-1 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-xs">Sair</span>
          </button>
        </form>
      </div>
    </nav>
  );
}
