"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, SignOutButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const pathname = usePathname();
  const { isLoaded, user } = useUser();
  
  const navLinks = [
    { href: "/", label: "Check" },
    { href: "/pos", label: "Practice" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:h-16 justify-between items-center px-4 py-2 sm:py-0">
        {/* Row 1 on mobile: Logo + Auth */}
        <div className="flex w-full sm:w-auto justify-between items-center">
          <Link href="/" className="font-bold text-purple-400 text-lg">English Mentor AI</Link>
          <div className="flex sm:hidden items-center gap-2">
            <AuthControls isLoaded={isLoaded} user={user} />
          </div>
        </div>

        {/* Row 2 on mobile: Nav Links */}
        <div className="flex w-full sm:w-auto mt-2 sm:mt-0 gap-1 sm:gap-6 font-semibold text-sm sm:text-base">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 sm:flex-none text-center py-2 sm:py-0 transition-colors whitespace-nowrap border-b-2 sm:border-0 ${
                  isActive ? "text-purple-400 border-purple-400" : "text-slate-400 hover:text-purple-300 border-transparent"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop Auth */}
        <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
          <AuthControls isLoaded={isLoaded} user={user} />
        </div>
      </div>
    </nav>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AuthControls({ isLoaded, user }: { isLoaded: boolean; user: any }) {
  if (!isLoaded) {
    return <div className="h-8 w-20 bg-slate-800 animate-pulse rounded-md"></div>;
  }
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="ghost" className="px-3 py-1.5 text-xs sm:text-sm" aria-label="Sign in">Sign in</Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button variant="primary" className="px-3 py-1.5 text-xs sm:text-sm" aria-label="Sign up">Sign up</Button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <span className="text-sm font-medium text-slate-300 hidden md:block truncate max-w-[120px]">
          {user?.firstName || user?.emailAddresses[0]?.emailAddress?.split("@")[0] || ""}
        </span>
        <UserButton />
        <SignOutButton redirectUrl="/">
          <Button variant="ghost" className="px-3 py-1.5 text-xs sm:text-sm" aria-label="Sign out">Sign out</Button>
        </SignOutButton>
      </SignedIn>
    </>
  );
}
