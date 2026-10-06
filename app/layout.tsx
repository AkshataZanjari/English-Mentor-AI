import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { Navbar } from "@/components/Navbar";

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
          <Navbar />
          <main className="max-w-3xl mx-auto px-4 py-10">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}