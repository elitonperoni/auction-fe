import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Noto_Sans } from "next/font/google";
import { Providers } from "../store/providers";

const font = Noto_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Leilão Max",
  description: "Encontre os produtos que deseja com os melhores preços",
  generator: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={`${font.className} antialiased`}>
          <Providers>{children}</Providers>
          <Analytics />
      </body>
    </html>
  );
}
