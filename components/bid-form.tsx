"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BidFormProps {
  currentBid: number;
  minBid: number;
  onPlaceBid: (bidAmount: number) => void; // A função para disparar o evento SignalR
}

export default function BidForm({
  currentBid,
  minBid,
  onPlaceBid,
}: BidFormProps) {
  const [bidAmount, setBidAmount] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false); // Será ativado no futuro, após a confirmação do SignalR

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBidAmount(value);
    setError("");
    setSuccess(false);
  };

  const handleSubmitBid = (e: React.FormEvent) => {
    debugger
    e.preventDefault();
    setError("");
    setSuccess(false);

    const bid = Number.parseFloat(bidAmount); // 1. Validação: Valor numérico

    if (!bidAmount || isNaN(bid)) {
      setError("Digite um valor válido");
      return;
    }

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
    setSuccess(true); // Assumimos sucesso momentaneamente, mas o ideal é que o 'success'
    // seja definido no componente pai APÓS a confirmação do Hub.
    setBidAmount("");
    setTimeout(() => setSuccess(false), 3000);
  }; // Ajuste nas sugestões para garantir que sejam maiores que o lance atual

  const nextMinBid = currentBid + 1;
  const suggestedBids = [
    nextMinBid,
    Math.round(nextMinBid * 1.1),
    Math.round(nextMinBid * 1.2),
  ]
    .map((bid) => Math.max(bid, minBid))
    .slice(0, 3); // Garante que as sugestões respeitem o minBid

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

            {success && (
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
                        <Button
                            key={bid}
                            type="button"
                            onClick={() => setBidAmount(bid.toString())}
                            variant="outline"
                            // ❗ Chave para o alinhamento: h-10 (altura fixa)
                            className="h-10 text-sm font-semibold border-border hover:bg-muted" 
                        >
                            R$ {bid.toLocaleString("pt-BR")}
                        </Button>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Próximo lance mínimo: R$ {(currentBid + 1).toLocaleString("pt-BR")}
                </p>
            </div>

            <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 text-lg"
            >
                Fazer Lance
            </Button>

            <p className="text-xs text-muted-foreground text-center">
                Ao fazer um lance, você concorda com nossos termos de serviço
            </p>
        </form>
    );
}
