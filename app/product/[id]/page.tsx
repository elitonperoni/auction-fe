"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Clock, Heart, Share2, ChevronLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BidForm from "@/components/bid-form"

interface ProductDetail {
  id: number
  title: string
  image: string
  currentBid: number
  minBid: number
  bids: number
  timeLeft: string
  category: string
  description: string
  seller: string
  sellerRating: number
  condition: string
  location: string
  bidHistory: Array<{ bidder: string; amount: number; time: string }>
}

const mockProductDetails: Record<number, ProductDetail> = {
  1: {
    id: 1,
    title: "Relógio Suíço Vintage",
    image: "/vintage-swiss-watch.jpg",
    currentBid: 450,
    minBid: 500,
    bids: 12,
    timeLeft: "2h 30m",
    category: "Relógios",
    description:
      "Relógio suíço de luxo dos anos 1970, em perfeito estado de funcionamento. Caixa de ouro 18K, pulseira original de couro. Acompanha certificado de autenticidade.",
    seller: "Colecionador Premium",
    sellerRating: 4.8,
    condition: "Excelente",
    location: "São Paulo, SP",
    bidHistory: [
      { bidder: "Usuário123", amount: 450, time: "há 5 minutos" },
      { bidder: "Usuário456", amount: 420, time: "há 15 minutos" },
      { bidder: "Usuário789", amount: 400, time: "há 1 hora" },
    ],
  },
  2: {
    id: 2,
    title: "Câmera Fotográfica Profissional",
    image: "/professional-camera.png",
    currentBid: 1200,
    minBid: 1300,
    bids: 8,
    timeLeft: "5h 15m",
    category: "Eletrônicos",
    description:
      "Câmera DSLR profissional com lente 24-70mm. Sensor full-frame, 45MP. Praticamente nova, com menos de 1000 disparos.",
    seller: "Fotógrafo Profissional",
    sellerRating: 4.9,
    condition: "Como Nova",
    location: "Rio de Janeiro, RJ",
    bidHistory: [
      { bidder: "Usuário111", amount: 1200, time: "há 2 minutos" },
      { bidder: "Usuário222", amount: 1150, time: "há 20 minutos" },
    ],
  },
}

export default function ProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = Number.parseInt(String(params?.id))
  const product = mockProductDetails[productId as keyof typeof mockProductDetails]
  const [isFavorite, setIsFavorite] = useState(false)

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Produto não encontrado</h1>
          <Button onClick={() => router.push("/")}>Voltar para Home</Button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-primary border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-primary-foreground hover:text-primary-foreground/80 font-semibold mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Product Image and Details */}
          <div className="lg:col-span-2">
            {/* Product Image */}
            <Card className="overflow-hidden mb-6 bg-card border-border">
              <div className="relative bg-muted aspect-square">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge variant="destructive" className="flex items-center gap-2 px-4 py-2 text-base shadow-lg">
                    <Clock className="w-5 h-5" />
                    {product.timeLeft}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Product Info with Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted">
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="history">Histórico de Lances</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <Card className="p-6 bg-card border-border">
                  <h1 className="text-3xl font-bold text-foreground mb-4">{product.title}</h1>

                  <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-border">
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">Categoria</p>
                      <Badge variant="secondary">{product.category}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">Condição</p>
                      <Badge variant="outline">{product.condition}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">Localização</p>
                      <p className="font-semibold text-foreground">{product.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">Total de Lances</p>
                      <p className="font-semibold text-foreground">{product.bids}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold text-foreground mb-3">Descrição</h3>
                    <p className="text-foreground/80 leading-relaxed">{product.description}</p>
                  </div>

                  {/* Seller Info */}
                  <Card className="p-4 bg-muted border-border">
                    <h3 className="font-bold text-foreground mb-3">Vendedor</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{product.seller}</p>
                        <p className="text-sm text-muted-foreground">⭐ {product.sellerRating} (Avaliação)</p>
                      </div>
                      <Button variant="outline" className="border-border bg-transparent">
                        Contatar Vendedor
                      </Button>
                    </div>
                  </Card>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card className="p-6 bg-card border-border">
                  <h3 className="font-bold text-foreground mb-4">Histórico de Lances</h3>
                  <div className="space-y-3">
                    {product.bidHistory.map((bid, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border"
                      >
                        <div>
                          <p className="font-semibold text-foreground">{bid.bidder}</p>
                          <p className="text-sm text-muted-foreground">{bid.time}</p>
                        </div>
                        <p className="font-bold text-foreground text-lg">R$ {bid.amount.toLocaleString("pt-BR")}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 bg-card border-border sticky top-24">
              {/* Current Bid */}
              <div className="mb-6 pb-6 border-b border-border">
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Lance Atual</p>
                <p className="text-4xl font-bold text-primary mb-2">R$ {product.currentBid.toLocaleString("pt-BR")}</p>
                <p className="text-sm text-muted-foreground">Mínimo: R$ {product.minBid.toLocaleString("pt-BR")}</p>
              </div>

              {/* Bid Form */}
              <BidForm currentBid={product.currentBid} minBid={product.minBid} />

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => setIsFavorite(!isFavorite)}
                  variant={isFavorite ? "default" : "outline"}
                  className="flex-1"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                  Favoritar
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  <Share2 className="w-5 h-5" />
                  Compartilhar
                </Button>
              </div>

              {/* Info Box */}
              <Alert className="mt-6 bg-muted border-border">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <AlertDescription className="text-foreground">
                  ✓ Pagamento seguro garantido
                  <br />✓ Autenticidade verificada
                  <br />✓ Frete incluído na venda
                </AlertDescription>
              </Alert>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
