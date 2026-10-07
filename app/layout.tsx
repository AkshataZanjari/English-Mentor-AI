import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { Navbar } from "@/components/Navbar";
import { UserSync } from "@/components/UserSync";

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
      <html lang="en" className="dark">
        <body className="bg-slate-950 text-slate-100 min-h-screen">
          <UserSync />
          <Navbar />
          <main className="w-full">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}