import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/toast/toast-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Tech Blog",
  description: "A personal tech blog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <Header />
            <main className="min-h-screen bg-background">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
