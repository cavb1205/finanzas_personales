import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "MiCaja - Finanzas Personales",
  description: "Control financiero personal multi-país",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("h-full antialiased", "font-sans", geist.variable)}>
      <body className="min-h-full">
        <Sidebar />
        <main className="min-h-screen md:ml-64">
          <div className="p-4 pt-16 md:p-8 md:pt-8">{children}</div>
        </main>
      </body>
    </html>
  );
}
