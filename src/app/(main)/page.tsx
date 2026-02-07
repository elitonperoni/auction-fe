"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Heart, Loader2, Search, Tag } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { AuctionListResponse } from "@/src/models/respose/auctionProductDetail";
import { auctionApi } from "@/src/api";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/src/components/ui/form";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { SearchAuctionListRequest } from "@/src/models/request/searchAuctionListRequest";
import ButtonCustom from "@/src/components/Button/button";
import { Button } from "@/src/components/ui/button";

const formSchema = z.object({
  searchTerm: z.string().optional(),
  category: z.string().optional(),
});

export default function Home() {
  const [auctionList, setAuctionList] = useState<AuctionListResponse[] | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const hasMore = page < totalPages;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchTerm: "",
      // category: "all",
    },
  });

  useEffect(() => {
    fetchAuctions(1);
  }, []);

  const fetchAuctions = async (pageNumber: number) => {
    setLoading(true);
    try {

      const formValues = form.getValues();

      const request: SearchAuctionListRequest = {
        searchTerm: formValues.searchTerm,
        pageIndex: pageNumber,
        pageSize: 6,
      };

      const response = await auctionApi.getList(request);

      const { items, metaData } = response;

      setAuctionList((prev) => (pageNumber === 1 ? items : [...prev!, ...items]));

      setTotalPages(metaData.totalPages);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao carregar leilões", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAuctions(nextPage);
  };

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

  function onSubmit() {
    fetchAuctions(1);
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Encontre Produtos Incríveis</h2>
          <p className="text-primary-foreground/90 text-lg max-w-2xl">
            Participe de leilões emocionantes e ganhe os melhores itens.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-background border rounded-xl shadow-xl p-4 md:p-6">

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
            >

              <div className="md:col-span-8 w-full">

                <FormField
                  control={form.control}
                  name="searchTerm"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                          <Input
                            {...field}
                            placeholder="O que você está buscando?"
                            autoComplete="off"
                            className="pl-10 py-6 bg-secondary/10 border-none text-lg w-full focus-visible:ring-primary"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* CATEGORIA: 2 colunas */}
              <div className="md:col-span-2 w-full">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="py-6 bg-secondary/10 border-none">
                            <SelectValue placeholder="Todas" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">Todas as categorias</SelectItem>
                          <SelectItem value="veiculos">Veículos</SelectItem>
                          <SelectItem value="eletronicos">Eletrônicos</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-2 w-full">
                <Button type="submit" className="w-full py-6 text-lg font-bold shadow-lg cursor-pointer">
                  <Search className="mr-2 h-5 w-5" />
                  Buscar
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

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
        <div className="flex justify-center py-8">
          {hasMore ? (
            <Button
              onClick={handleLoadMore}
              disabled={loading}
              variant="outline"
              className="px-8 py-6 text-lg font-semibold cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Carregando...
                </>
              ) : (
                "Carregar Mais Leilões"
              )}
            </Button>
          ) : (
            !loading && auctionList && auctionList.length > 0 && (
              <ButtonCustom disabled variant="outline" className="px-8 py-6 text-lg font-semibold cursor-pointer">
                Você chegou ao fim da lista.
              </ButtonCustom>
            )
          )}
        </div>
      </section>
    </main>
  );
}
