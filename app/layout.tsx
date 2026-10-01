import "./globals.css";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Link from 'next/link';

export const metadata = {
  title: "English Mentor AI",
  description: "Your AI-powered English communication coach",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <nav className="glass-card m-4 p-4 flex justify-between items-center rounded-2xl">
            <div className="flex gap-6 font-semibold text-lg ml-2">
              <Link href="/" className="hover:text-purple-400 transition">Grammar Checker</Link>
              <Link href="/pos" className="hover:text-purple-400 transition">Practice Studio</Link>
              <Link href="/dashboard" className="hover:text-purple-400 transition">Dashboard</Link>
            </div>
            <div className="mr-2">
              <SignedOut>
                <SignInButton mode="modal" />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </nav>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}