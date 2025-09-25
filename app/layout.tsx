import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/toast/toast-context";
import PageTransition from "@/components/PageTransition";
import { I18nProvider } from "@/lib/i18n";
import Script from "next/script";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
  variable: '--font-inter'
});

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
    <html lang="en" className="dark" data-theme="dark">
      <body className={`${inter.className} ${inter.variable}`}>
        <AuthProvider>
          <I18nProvider>
            <ToastProvider>
              <Script id="theme-init" strategy="beforeInteractive">{`
                (function(){
                  try {
                    var stored = localStorage.getItem('theme-preference');
                    var system = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
                    var theme = stored || system || 'dark';
                    document.documentElement.setAttribute('data-theme', theme);
                    document.documentElement.classList.toggle('dark', theme === 'dark');
                  } catch (e) {}
                })();
              `}</Script>
              <Header />
                <main className="min-h-screen bg-grid pb-[30px]">
                  <PageTransition>
                    {children}
                  </PageTransition>
                </main>
              <Footer />
            </ToastProvider>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
