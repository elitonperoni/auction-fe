// Em: app/(main)/layout.tsx (O NOVO arquivo)

import { LayoutMain } from "@/src/components/LayoutMain/layoutMain"; // (Ajuste o caminho)

export default function MainPagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LayoutMain>
      {children}
    </LayoutMain>
  );
}