"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function Navbar() {
  const pathname = usePathname();
  
  const navLinks = [
    { href: "/", label: "Check" },
    { href: "/pos", label: "Practice" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <nav className="glass-card m-4 p-4 flex justify-between items-center rounded-2xl bg-slate-900/80 border-slate-800">
      <div className="flex gap-4 sm:gap-6 font-semibold text-base sm:text-lg ml-2 overflow-x-auto">
        <Link href="/" className="mr-2 font-bold text-purple-400 hidden sm:block">English Mentor AI</Link>
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors ${
                isActive ? "text-purple-400" : "text-slate-300 hover:text-purple-300"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
      <div className="mr-2 flex-shrink-0">
        <SignedOut>
          <SignInButton mode="modal" />
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </nav>
  );
}
