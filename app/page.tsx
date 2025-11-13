"use client"

import { useState } from "react"
import Link from "next/link"
import { Clock, Gavel, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AuctionProduct {
  id: string
  title: string
  image: string
  currentBid: number
  minBid: number
  bids: number
  timeLeft: string
  category: string
  seller: string
}

const mockProducts: AuctionProduct[] = [
  {
    id: '1',
    title: "Relógio Suíço Vintage",
    image: "/vintage-swiss-watch.jpg",
    currentBid: 450,
    minBid: 500,
    bids: 12,
    timeLeft: "2h 30m",
    category: "Relógios",
    seller: "Colecionador Premium",
  },
  {
    id: '863ca937-a969-4938-af92-11dd82303420',
    title: "Câmera Fotográfica Profissional",
    image: "/professional-camera.png",
    currentBid: 1200,
    minBid: 1300,
    bids: 8,
    timeLeft: "5h 15m",
    category: "Eletrônicos",
    seller: "Tech Store",
  },
  {
    id: '3',
    title: "Joia de Ouro 18K",
    image: "/gold-jewelry.jpg",
    currentBid: 800,
    minBid: 900,
    bids: 15,
    timeLeft: "1h 45m",
    category: "Joias",
    seller: "Joalheria Fina",
  },
  {
    id: '4',
    title: "Quadro de Arte Moderna",
    image: "/modern-art-painting.png",
    currentBid: 600,
    minBid: 700,
    bids: 5,
    timeLeft: "8h 20m",
    category: "Arte",
    seller: "Galeria Contemporânea",
  },
  {
    id: '5',
    title: "Bolsa Designer Italiana",
    image: "/italian-designer-bag.jpg",
    currentBid: 350,
    minBid: 400,
    bids: 9,
    timeLeft: "3h 10m",
    category: "Moda",
    seller: "Fashion Luxury",
  },
  {
    id: '6',
    title: "Livro Raro Primeira Edição",
    image: "/rare-first-edition-book.jpg",
    currentBid: 280,
    minBid: 300,
    bids: 6,
    timeLeft: "6h 45m",
    category: "Livros",
    seller: "Livraria Antiga",
  },
]

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos")

  const categories = ["Todos", "Relógios", "Eletrônicos", "Joias", "Arte", "Moda", "Livros"]

  const filteredProducts =
    selectedCategory === "Todos" ? mockProducts : mockProducts.filter((p) => p.category === selectedCategory)

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary-foreground p-2 rounded-lg">
                <Gavel className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-primary-foreground">LeilãoMax</h1>
            </div>
            <Button className="bg-primary-foreground text-primary hover:bg-secondary font-semibold">Meus Lances</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Encontre Produtos Incríveis</h2>
          <p className="text-primary-foreground/90 text-lg max-w-2xl">
            Participe de leilões emocionantes e ganhe os melhores itens com os melhores preços
          </p>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h3 className="text-sm font-semibold text-foreground mb-4">Categorias</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                className={selectedCategory === category ? "bg-primary text-primary-foreground" : ""}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col bg-card border-border hover:border-primary/30">
                {/* Product Image */}
                <div className="relative overflow-hidden bg-muted h-48">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant="destructive" className="flex items-center gap-1 px-3 py-1">
                      <Clock className="w-4 h-4" />
                      {product.timeLeft}
                    </Badge>
                  </div>
                  <button className="absolute top-3 left-3 bg-background/80 hover:bg-background p-2 rounded-full transition-colors">
                    <Heart className="w-5 h-5 text-foreground" />
                  </button>
                </div>

                {/* Product Info */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-foreground mb-2 line-clamp-2 text-lg">{product.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{product.seller}</p>

                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Lance Atual</p>
                      <p className="text-2xl font-bold text-primary">R$ {product.currentBid.toLocaleString("pt-BR")}</p>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="text-muted-foreground">Mínimo</p>
                        <p className="font-semibold text-foreground">R$ {product.minBid.toLocaleString("pt-BR")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Lances</p>
                        <p className="font-semibold text-foreground">{product.bids}</p>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                    Ver Detalhes
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
