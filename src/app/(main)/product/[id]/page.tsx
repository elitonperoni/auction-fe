"use client";

import React, { useState, useEffect, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { useRouter, useParams } from "next/navigation";
import {
  Clock,
  Heart,
  Share2,
  CheckCircle2,
  History,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import ToastSuccess from "@/src/components/Toast/toastNotificationSuccess";
import ToastError from "@/src/components/Toast/toastNotificationError";
import { Badge } from "@/src/components/ui/badge";
import { Card } from "@/src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { getSignalRConnection, startSignalRConnection } from "@/src/api/hub";
import BidForm from "@/src/components/bid-form";
import {
  AuctionProductDetail,
  BidHistory,
} from "@/src/models/respose/auctionProductDetail";
import { auctionApi, authApi } from "@/src/api";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Dialog, DialogContent, DialogTitle } from "@/src/components/ui/dialog";
import { formatDate } from "@/src/lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store/store";
import ToastInfo from "@/src/components/Toast/toastNotificationInfo";
import { ChannelNames } from "@/src/utils/channerlNames";

export default function ProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = String(params?.id);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [bidSuccess, setBidSuccess] = useState(false);
  const [product, setProduct] = useState<AuctionProductDetail>();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCurrentUserAuctionOwner, setIsCurrentUserAuctionOwner] = useState(false);
  const [isLoadingScreen, setIsLoadingScreen] = useState(false);
  const [isLoadingBid, setIsLoadingBid] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [currentZoomIndex, setCurrentZoomIndex] = useState(0);
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    fetchProductDetails(productId);
  }, []);

  const handleNewBid = useCallback(
    (
      receivedProductId: string,
      newBidAmount: number,
      newTotalBids: number,
      newBidderId: string,
      newBidderName: string,
      newBidTime: string,
      errorMessage?: string,
    ) => {
      if (receivedProductId === productId) {
        setProduct((prevProduct) => {
          if (!prevProduct) return undefined;

          if (errorMessage) {
            ToastError(`Lance Rejeitado: ${errorMessage} 🛑`);
            setIsLoadingBid(false);
            return prevProduct;
          }

          const newBidEntry: BidHistory = {
            bidderName: newBidderName,
            amount: newBidAmount,
            date: new Date(newBidTime),
          };
          showNotifyBid(newBidderId == user.id, isCurrentUserAuctionOwner, newBidderName, newBidAmount);
          setIsLoadingBid(false);

          return {
            ...prevProduct,
            currentBid: newBidAmount,
            bidsCounts: newTotalBids,
            bids: newTotalBids,
            bidHistory: [newBidEntry, ...prevProduct.bidHistory],
          };
        });
      }
    },
    [productId],
  );

  useEffect(() => {
    if (!product?.endDate) return;

    calculateTimeLeft();

    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [product?.endDate]);

  const calculateTimeLeft = () => {
    if (!product)
      return 0;

    const now = new Date().getTime();
    const target = new Date(product.endDate).getTime();
    const difference = target - now;

    if (difference <= 0) {
      setTimeLeft("Leilão Encerrado");
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    const pad = (num: number) => num.toString().padStart(2, "0");

    if (days > 0) {
      setTimeLeft(
        `${pad(days)}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`,
      );
    } else {
      setTimeLeft(`${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`);
    }
  };

  async function fetchProductDetails(id: string) {
    setIsLoadingScreen(true);
    await auctionApi
      .getDetail(id)
      .then((data) => {
        setProduct(data);
        setIsCurrentUserAuctionOwner(data.isOwner);
        setIsLoadingScreen(false);
      })
      .catch((error) => {
        setIsLoadingScreen(false);
      });
  }

  const handleNotification = useCallback(
    (notification: string) => {
      ToastInfo(notification);
      setIsLoadingBid(false);
    },
    [],
  );

  const handleReconnect = useCallback(
    (connectionId?: string) => {
      const groupName = String(productId);
      console.log(`[${groupName}] Reconectado com ID: ${connectionId}`);

      (async () => {
        try {
          const connection = getSignalRConnection();
          await connection.invoke("JoinAuctionGroup", groupName);

          await connection.invoke("SyncAuctionState", groupName);
        } catch {
        }
      })();
    },
    [productId],
  );

  const handleReconnecting = useCallback(
    (error?: Error) => {
      const groupName = String(productId);
    },
    [productId],
  );

  useEffect(() => {
    const groupName = String(productId);

    const connection = getSignalRConnection();

    connection.on(ChannelNames.ReceiveNewBid, handleNewBid);
    connection.on(ChannelNames.ReceiveNotification, handleNotification);

    connection.onreconnected(handleReconnect);
    connection.onreconnecting(handleReconnecting);

    const setup = async () => {
      try {
        await startSignalRConnection();

        await connection.invoke("JoinAuctionGroup", groupName);
        await connection.invoke("SyncAuctionState", groupName);
      } catch (err) {
        console.error(`[${groupName}] Erro ao configurar SignalR:`, err);
      }
    };

    setup();

    return () => {
      connection.off(ChannelNames.ReceiveNewBid, handleNewBid);
      connection.off(ChannelNames.ReceiveNotification, handleNotification);

      connection.onreconnected = () => { };
      connection.onreconnecting = () => { };

      if (connection.state === signalR.HubConnectionState.Connected) {
        connection
          .invoke(ChannelNames.OnDisconnectedAsync, groupName)
          .then(() => console.log(`[${groupName}] Saiu do grupo.`))
          .catch((err) => console.log("Erro ao sair do grupo:", err));
      }
    };
  }, [
    productId,
    handleNewBid,
    handleNotification,
    handleReconnect,
    handleReconnecting,
  ]);

  const handlePlaceBid = async (bidAmount: number) => {
    const groupName = String(productId);
    const connection = getSignalRConnection();

    const invokeSendBid = () =>
      connection.invoke(ChannelNames.SendBid, groupName, bidAmount.toString());

    if (connection?.state === signalR.HubConnectionState.Connected) {
      setBidSuccess(false);
      setIsLoadingBid(true);

      try {
        await invokeSendBid();
      } catch {
        ToastError("Erro ao enviar lance. Tente novamente.");
      }
    };
  }

  const plugin = React.useRef(
    Autoplay({ delay: 3500, stopOnInteraction: true }),
  );

  const handleOpenZoom = (index: number) => {
    setCurrentZoomIndex(index);
    setIsZoomOpen(true);
  };

  if (!product && !isLoadingScreen) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Produto não encontrado
          </h1>
          <Button onClick={() => router.push("/")}>Voltar para Home</Button>
        </div>
      </div>
    );
  }

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentZoomIndex((prev) =>
      prev === 0 ? product!.photos.length - 1 : prev - 1,
    );
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentZoomIndex((prev) =>
      prev === product!.photos.length - 1 ? 0 : prev + 1,
    );
  };

  const handleShare = () => {
    const currentUrl = window.location.href;

    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        ToastSuccess("Link copiado para a área de transferência!");
      })
      .catch((err) => {
        console.error("Erro ao copiar link: ", err);
      });
  };

  if (isLoadingScreen) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Carregando produto...</p>
      </div>
    );
  }

  return (
    <>
      {isLoadingScreen && !product && (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Carregando produto...</p>
        </div>
      )}
      {!isLoadingScreen && !product && (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Produto não encontrado
            </h1>
            <Button onClick={() => router.push("/")}>Voltar para Home</Button>
          </div>
        </div>
      )}

      {!isLoadingScreen && product && (
        <main className="min-h-screen bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                    {product.title}
                  </h1>
                </div>
                {/* Product Image */}
                <Card className="overflow-hidden mb-6 bg-card border-border group">
                  <div className="relative bg-muted aspect-video">
                    <Carousel
                      plugins={[plugin.current]}
                      className="w-full h-full"
                      onMouseEnter={plugin.current.stop}
                      onMouseLeave={plugin.current.reset}
                      opts={{
                        loop: true,
                      }}
                    >
                      <CarouselContent>
                        {product.photos.map((imageSrc, index) => (
                          <CarouselItem key={index}>
                            <div
                              className="relative aspect-video w-full h-full cursor-zoom-in overflow-hidden rounded-md border"
                              onClick={() => handleOpenZoom(index)}
                            >
                              <div className="relative aspect-video w-full h-full cursor-zoom-in overflow-hidden rounded-md border">
                                <img
                                  src={imageSrc}
                                  alt={`${product.title} - ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>

                      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
                        <DialogContent className="!max-w-none !w-screen !h-screen p-0 bg-white-950/95 border-none shadow-none overflow-hidden outline-none flex items-center justify-center fixed inset-0 translate-x-0 translate-y-0">
                          <DialogTitle className="sr-only">
                            Visualização de {product.title}
                          </DialogTitle>
                          <button
                            onClick={() => setIsZoomOpen(false)}
                            className="absolute right-4 top-4 z-[60] p-2 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                          >
                            <X className="w-8 h-8" />
                          </button>

                          {product.photos.length > 1 && (
                            <button
                              onClick={handlePrevious}
                              className="absolute left-4 top-1/2 -translate-y-1/2 z-[60] p-2 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                            >
                              <ChevronLeft className="w-10 h-10" />
                            </button>
                          )}

                          {product.photos.length > 1 && (
                            <button
                              onClick={handleNext}
                              className="absolute right-4 top-1/2 -translate-y-1/2 z-[60] p-2 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                            >
                              <ChevronRight className="w-10 h-10" />
                            </button>
                          )}

                          <div className="w-full h-full flex items-center justify-center">
                            <TransformWrapper
                              key={currentZoomIndex}
                              initialScale={1}
                            >
                              <TransformComponent
                                wrapperClass="!w-screen !h-screen"
                                contentClass="flex items-center justify-center w-full h-full"
                              >
                                <img
                                  src={product.photos[currentZoomIndex]}
                                  alt="Zoom"
                                  className="max-w-full max-h-full w-auto h-auto object-contain"
                                />
                              </TransformComponent>
                            </TransformWrapper>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <CarouselPrevious className="pointer-events-auto relative left-2 translate-x-0 bg-white/80 hover:bg-white" />
                        <CarouselNext className="pointer-events-auto relative right-2 translate-x-0 bg-white/80 hover:bg-white" />
                      </div>
                    </Carousel>

                    {/* Badge do Timer */}
                    <div className="absolute top-4 right-4 z-10 pointer-events-none">
                      <Badge
                        variant="destructive"
                        className="flex items-center gap-2 px-4 py-2 text-base shadow-lg"
                      >
                        <Clock className="w-5 h-5" />
                        {timeLeft}
                      </Badge>
                    </div>
                  </div>
                </Card>

                {/* Product Info with Tabs */}
                <Tabs defaultValue="details" className="w-full">
                  {/* 1. Inclusão da TabsList para navegação */}
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger
                      value="details"
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Detalhes do Produto
                    </TabsTrigger>
                    <TabsTrigger
                      value="history"
                      className="flex items-center gap-2"
                    >
                      <History className="h-4 w-4" /> Histórico de Lances
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-6">
                    <Card className="p-6 bg-card border-border">
                      <h1 className="text-3xl font-bold text-foreground mb-4">
                        {product.title}
                      </h1>

                      <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-border">
                        <div>
                          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                            Categoria
                          </p>
                          <Badge variant="secondary">{product.category}</Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                            Condição
                          </p>
                          <Badge variant="outline">{product.condition}</Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                            Localização
                          </p>
                          <p className="font-semibold text-foreground">
                            {product.location}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                            Total de Lances
                          </p>
                          <p className="font-semibold text-foreground">
                            {product.bidsCounts}
                          </p>
                        </div>
                      </div>
                      <div className="mb-6">
                        <h3 className="font-bold text-foreground mb-3">
                          Descrição
                        </h3>
                        <p className="text-foreground/80 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                      <Card className="p-4 bg-muted border-border">
                        <h3 className="font-bold text-foreground mb-3">
                          Vendedor
                        </h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-foreground">
                              {product.seller}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {/* ⭐ {product.sellerRating} (Avaliação) */}⭐{" "}
                              {"4.9"} (Avaliação)
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            className="border-border bg-transparent"
                          >
                            Contatar Vendedor
                          </Button>
                        </div>
                      </Card>
                    </Card>
                  </TabsContent>

                  {/* 2. Seção Histórico de Lances Completa */}
                  <TabsContent value="history">
                    <Card className="p-6 bg-card border-border">
                      <div className="flex items-center justify-between mb-4">
                        {/* Título à Esquerda */}
                        <h3 className="text-2xl font-bold text-foreground">
                          Histórico de Lances
                        </h3>

                        {/* Quantidade à Direita */}
                        <span className="text-lg text-muted-foreground mr-6">
                          {product.bidsCounts} lances
                        </span>
                      </div>
                      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                        {product.bidHistory.length > 0 ? (
                          (product.bidHistory as BidHistory[]).map(
                            (bid, index: number) => (
                              <div
                                key={`${bid.date}-${index}`}
                                className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border"
                              >
                                <div>
                                  <p className="font-semibold text-foreground">
                                    {bid.bidderName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(bid.date)}
                                  </p>
                                </div>
                                <p className="font-bold text-foreground text-lg">
                                  {bid.amount.toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                                </p>
                              </div>
                            ),
                          )
                        ) : (
                          <Alert className="bg-secondary/20 border-secondary">
                            <AlertDescription>
                              Ainda não há lances para este produto. Seja o
                              primeiro a dar um lance!
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="lg:col-span-1">
                <Card className="p-6 bg-card border-border sticky top-24">
                  {/* Current Bid */}
                  <div className="pb-6 border-b border-border">
                    <p className="text-sm text-muted-foreground tracking-wide mb-2">
                      {product?.bidHistory[0]?.bidderName && "Lance Atual"}
                      {!product?.bidHistory[0]?.bidderName && "Faça um lance agora mesmo!"}
                    </p>
                    <p className="text-4xl font-bold text-primary mb-2">
                      R$ {product.currentBid.toLocaleString("pt-BR")}
                    </p>
                    {product?.bidHistory[0]?.bidderName && (<p className="text-sm text-muted-foreground">
                      Usuário com maior lance: @{product?.bidHistory[0]?.bidderName}
                    </p>)}
                  </div>

                  {product.isOwner &&
                    <>
                      <p className="text-sm text-muted-foreground">
                        Este leilão percente a você!
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Acompanhe os lances recebidos abaixo na aba Histórico de Lances
                      </p>
                    </>
                  }

                  {!product.isOwner && (
                    <>
                      <BidForm
                        currentBid={product.currentBid}
                        minBid={product.minBid}
                        successBid={bidSuccess}
                        isLoading={isLoadingBid}
                        onPlaceBid={handlePlaceBid}
                      />

                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => setIsFavorite(!isFavorite)}
                          variant={isFavorite ? "default" : "outline"}
                          className="flex-1"
                        >
                          <Heart
                            className={`w-5 h-5 ${isFavorite ? "fill-current" : ""
                              }`}
                          />
                          Favoritar
                        </Button>
                        <Button onClick={handleShare} variant="outline" className="flex-1 bg-transparent">
                          <Share2 className="w-5 h-5" />
                          Compartilhar
                        </Button>
                      </div>
                      <Alert className="mt-6 bg-muted border-border">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <AlertDescription className="text-foreground">
                          ✓ Pagamento seguro garantido
                          <br />✓ Autenticidade verificada
                          <br />✓ Frete incluído na venda
                        </AlertDescription>
                      </Alert>
                    </>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </main>
      )}
    </>
  );

  function showNotifyBid(
    isBidOwner: boolean,
    isAuctionOwner: boolean,
    newBidderName: string,
    newBidAmount: number,
  ) {    
    if (isBidOwner) {
      ToastSuccess(`Lance processado com sucesso!`);      
    }
    else if (isAuctionOwner) {
      ToastSuccess(
        `Novo lance recebido neste item de ${newBidderName} R$ ${newBidAmount.toLocaleString(
          "pt-BR",
          { style: "currency", currency: "BRL" },
        )}`,
      );      
    }
    else {
      ToastInfo(
        `Lance superado por ${newBidderName} R$ ${newBidAmount.toLocaleString(
          "pt-BR",
          { style: "currency", currency: "BRL" },
        )}`,
      );
    }
    setBidSuccess(true);
    setTimeout(() => setBidSuccess(false), 3000);
  }
}
