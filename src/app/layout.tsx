import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Noto_Sans } from "next/font/google";
import { Providers } from "../store/providers";
import { getDictionary } from "../lib/get-dictionary";
import DictionaryProvider from "../components/dictionary-provider";
import { cookies } from "next/headers";

const font = Noto_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Leilão Max",
  description: "Encontre os produtos que deseja com os melhores preços",
  icons: {
    icon: '/icon.png'
  },
  generator: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("lang")?.value as "pt" | "en") || "pt";

  const dict = await getDictionary(lang);

  return (
    <html lang="pt-br">
      <body className={`${font.className} antialiased`}>
        <Providers>
          <DictionaryProvider dict={dict} />
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
