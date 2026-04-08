import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import GlobalFab from "@/components/GlobalFab";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "MiCaja - Finanzas Personales",
  description: "Control financiero personal multi-país",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("h-full antialiased", geist.variable)} suppressHydrationWarning>
      <body className="min-h-full">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Sidebar />
          <main className="min-h-screen md:ml-64">
            <div className="p-4 pt-16 md:p-8 md:pt-8">{children}</div>
          </main>
          <GlobalFab />
          <Toaster position="bottom-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
