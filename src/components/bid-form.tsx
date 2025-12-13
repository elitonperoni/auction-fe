"use client";

import type React from "react";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import Button from "./Button/button";
import ButtonCustom from "./Button/button";

interface BidFormProps {
  currentBid: number;
  minBid: number;
  successBid: boolean;
  onPlaceBid: (bidAmount: number) => void; // A função para disparar o evento SignalR
}

export default function BidForm({
  currentBid,
  minBid,
  successBid,
  onPlaceBid,  
}: BidFormProps) {
  const [bidAmount, setBidAmount] = useState<string>("");
  const [error, setError] = useState<string>("");
  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBidAmount(value);
    setError("");
    //setSuccess(false);
  };

  const handleSubmitBid = () => {
    //e.preventDefault();
    setError("");

    const bid = Number.parseFloat(bidAmount); // 1. Validação: Valor numérico

//     if (!bidAmount || isNaN(bid)) {
//       toast({
//         title: "Erro de Lance Inválido",
//         description: "Por favor, digite um valor numérico válido para o lance.",
//         variant: "destructive",
//       });
//       return;
//     }

    // 2. Validação: Checa se é maior que o lance atual
    if (bid <= currentBid) {
      setError(
        `Seu lance (R$ ${bid.toLocaleString(
          "pt-BR"
        )}) deve ser maior que o Lance Atual (R$ ${currentBid.toLocaleString(
          "pt-BR"
        )})`
      );
      return;
    }

    // 3. Validação: Checa o lance mínimo (Normalmente, se for maior que o atual, já cumpre o mínimo, mas é bom manter)
    if (bid < minBid) {
      setError(`Lance mínimo é R$ ${minBid.toLocaleString("pt-BR")}`);
      return;
    }

    // 4. Ação do SignalR: Chama a função do componente pai (ProductPage)
    // para que ela use o connection.invoke()
    onPlaceBid(bid);

    // 5. Feedback e Limpeza
    //setSuccess(true); // Assumimos sucesso momentaneamente, mas o ideal é que o 'success'
    // seja definido no componente pai APÓS a confirmação do Hub.
    setBidAmount("");
    //setTimeout(() => setSuccess(false), 3000);
  }; // Ajuste nas sugestões para garantir que sejam maiores que o lance atual

  const nextMinBid = currentBid + 1;

  const suggestedBids = [
    nextMinBid,
    Math.round(nextMinBid * 1.1),
    Math.round(nextMinBid * 1.2),
  ]
    .map((bid) => Math.max(bid, minBid))
    .slice(0, 3); 

 return (
        <form onSubmit={handleSubmitBid} className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                    Seu Lance
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                        R$
                    </span>
                    <Input
                        type="number"
                        placeholder="0,00"
                        value={bidAmount}
                        onChange={handleBidChange}
                        className="pl-10 text-lg font-semibold border-border focus:border-primary focus:ring-primary"
                    />
                </div>
            </div>

            {error && (
                <Alert
                    variant="destructive"
                    className="bg-destructive/10 border-destructive/30"
                >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {successBid && (
                <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                        ✓ Lance realizado com sucesso!
                    </AlertDescription>
                </Alert>
            )}

            <div>
                <p className="text-xs text-muted-foreground mb-2 font-semibold">
                    Sugestões de Lance
                </p>
                {/* 🎯 AJUSTE DE LAYOUT: Garantir altura uniforme para alinhamento */}
                <div className="grid grid-cols-3 gap-2">
                    {suggestedBids.map((bid) => (
                        <ButtonCustom
                            key={bid}
                            //type="button"
                            onClick={() => setBidAmount(bid.toString())}
                            variant="outline"
                            // ❗ Chave para o alinhamento: h-10 (altura fixa)
                            className="h-10 text-sm font-semibold border-border hover:bg-muted" 
                        >
                            R$ {bid.toLocaleString("pt-BR")}
                        </ButtonCustom>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Próximo lance mínimo: R$ {(currentBid + 1).toLocaleString("pt-BR")}
                </p>
            </div>

            <ButtonCustom                
                onClick={handleSubmitBid}
            >
                Fazer Lance
            </ButtonCustom>

            <p className="text-xs text-muted-foreground text-center">
                Ao fazer um lance, você concorda com nossos termos de serviço
            </p>
        </form>
    );
}
