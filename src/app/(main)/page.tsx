"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Gavel, Heart } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { AuctionListResponse } from "@/src/models/respose/auctionProductDetail";
import { auctionApi } from "@/src/api";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [auctionList, setAuctionList] = useState<AuctionListResponse[] | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);

  const categories = [
    "Todos",
    "Relógios",
    "Eletrônicos",
    "Joias",
    "Arte",
    "Moda",
    "Livros",
  ];

  useEffect(() => {
    getAuctionList();
  }, []);

  async function getAuctionList() {
    setLoading(true);
    try {
      const data = await auctionApi.getList();
      setAuctionList(data);
    } catch (error) {
      console.error("Failed to fetch auction list:", error);
    } finally {
      setLoading(false);
    }
  }

  const ProductSkeleton = () => (
    <div className="overflow-hidden rounded-lg border border-border bg-card h-full flex flex-col">
      {/* Placeholder da Imagem */}
      <div className="h-48 w-full bg-muted animate-pulse" />

      <div className="p-4 space-y-3 flex-1">
        {/* Placeholder do Título */}
        <div className="h-5 bg-muted animate-pulse rounded-md w-3/4" />

        {/* Placeholder da Descrição/Texto */}
        <div className="space-y-2">
          <div className="h-3 bg-muted animate-pulse rounded-md w-full" />
          <div className="h-3 bg-muted animate-pulse rounded-md w-5/6" />
        </div>

        {/* Placeholder do Preço/Botão */}
        <div className="pt-4 flex justify-between items-center">
          <div className="h-6 bg-muted animate-pulse rounded-md w-1/4" />
          <div className="h-8 bg-muted animate-pulse rounded-md w-1/3" />
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Encontre Produtos Incríveis
          </h2>
          <p className="text-primary-foreground/90 text-lg max-w-2xl">
            Participe de leilões emocionantes e ganhe os melhores itens com os
            melhores preços
          </p>
        </div>
      </section>

      {/* Categories Filter */}
      <section className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Categorias
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                className={
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : ""
                }
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
          {loading ? (
            <>
              {Array.from({ length: 6 }).map((_, index) => (
                <ProductSkeleton key={`skeleton-${index}`} />
              ))}
            </>
          ) : (
            auctionList?.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col bg-card border-border hover:border-primary/30">
                  {/* Product Image */}
                  <div className="relative overflow-hidden bg-muted h-48">
                    <img
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge
                        variant="destructive"
                        className="flex items-center gap-1 px-3 py-1"
                      >
                        <Clock className="w-4 h-4" />
                        {new Date(product.endDate).toLocaleDateString("pt-BR")}
                      </Badge>
                    </div>
                    <button className="absolute top-3 left-3 bg-background/80 hover:bg-background p-2 rounded-full transition-colors">
                      <Heart className="w-5 h-5 text-foreground" />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-foreground mb-2 line-clamp-2 text-lg">
                      {product.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {"product.seller"}
                    </p>

                    <div className="space-y-3 flex-1">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                          Lance Atual
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          R$ {product.currentPrice.toLocaleString("pt-BR")}
                        </p>
                      </div>

                      <div className="flex justify-between text-sm">
                        <div>
                          <p className="text-muted-foreground">Mínimo</p>
                          <p className="font-semibold text-foreground">
                            R$ {product.currentPrice.toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-muted-foreground">Lances</p>
                          <p className="font-semibold text-foreground">
                            {product.bidCount}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
                      Ver Detalhes
                    </Button>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
