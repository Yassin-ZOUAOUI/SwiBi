"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function NavLinks() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <>
      {isAuthenticated ? (
        <>
          <Link
            href="/discover"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/discover"
                ? "text-black dark:text-white"
                : "text-muted-foreground"
            )}
          >
            Discover
          </Link>
          <Link
            href="/contacts"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/contacts"
                ? "text-black dark:text-white"
                : "text-muted-foreground"
            )}
          >
            Matches
          </Link>
          <Link
            href="/profile"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/profile"
                ? "text-black dark:text-white"
                : "text-muted-foreground"
            )}
          >
            Profile
          </Link>
        </>
      ) : (
        <>
          <Link
            href="/login"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/login"
                ? "text-black dark:text-white"
                : "text-muted-foreground"
            )}
          >
            Login
          </Link>
          <Link
            href="/signup"
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === "/signup"
                ? "text-black dark:text-white"
                : "text-muted-foreground"
            )}
          >
            Sign Up
          </Link>
        </>
      )}
    </>
  );
} 