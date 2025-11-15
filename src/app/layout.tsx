import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Noto_Sans } from "next/font/google";
import { LayoutMain } from "../components/LayoutMain/layoutMain";

const font = Noto_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${font.className} antialiased`}>
          {children}
          <Analytics />
      </body>
    </html>
  );
}
