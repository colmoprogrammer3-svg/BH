import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QuickNav from "@/components/QuickNav";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "甜蜜小屋",
  description: "情侣专属小天地",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} font-sans antialiased`}>
        <QuickNav />
        {children}
      </body>
    </html>
  );
}
