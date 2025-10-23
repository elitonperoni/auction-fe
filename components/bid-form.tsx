"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface BidFormProps {
  currentBid: number
  minBid: number
}

export default function BidForm({ currentBid, minBid }: BidFormProps) {
  const [bidAmount, setBidAmount] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState(false)

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setBidAmount(value)
    setError("")
    setSuccess(false)
  }

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    const bid = Number.parseFloat(bidAmount)

    if (!bidAmount || isNaN(bid)) {
      setError("Digite um valor válido")
      return
    }

    if (bid < minBid) {
      setError(`Lance mínimo é R$ ${minBid.toLocaleString("pt-BR")}`)
      return
    }

    if (bid <= currentBid) {
      setError(`Lance deve ser maior que R$ ${currentBid.toLocaleString("pt-BR")}`)
      return
    }

    // Simulate bid submission
    setSuccess(true)
    setBidAmount("")
    setTimeout(() => setSuccess(false), 3000)
  }

  const suggestedBids = [minBid, Math.round(minBid * 1.1), Math.round(minBid * 1.2)]

  return (
    <form onSubmit={handleSubmitBid} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Seu Lance</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">R$</span>
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
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">✓ Lance realizado com sucesso!</AlertDescription>
        </Alert>
      )}

      <div>
        <p className="text-xs text-muted-foreground mb-2 font-semibold">Sugestões de Lance</p>
        <div className="grid grid-cols-3 gap-2">
          {suggestedBids.map((bid) => (
            <Button
              key={bid}
              type="button"
              onClick={() => setBidAmount(bid.toString())}
              variant="outline"
              className="py-2 px-3 text-sm font-semibold border-border hover:bg-muted"
            >
              R$ {bid.toLocaleString("pt-BR")}
            </Button>
          ))}
        </div>
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
  )
}
