"use-client"

import Button from "@/src/components/Button/button";
import { RecoveryPasswordForm } from "@/src/components/RecoveryPassword/recoveryPassword";
import { ChevronLeft, GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";

export default function RecoveryPasswordPage() {
  
  return (
    // 1. Adicionado 'relative' aqui para o botão absoluto funcionar em relação a esta div
    <div className="relative bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      {/* 2. Botão Voltar Posicionado */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8">
        <Button isSubmit>
          <Link href="/" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Menu principal
          </Link>
        </Button>
      </div>

      {/* Conteúdo Original */}
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Acme Inc.
        </a>
        <RecoveryPasswordForm  />
      </div>
    </div>
  );
}
