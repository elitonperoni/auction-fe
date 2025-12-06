"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { useRouter, useParams } from "next/navigation";
import { Clock, Heart, Share2, CheckCircle2, History } from "lucide-react";
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
import { getSignalRConnection } from "@/src/api/hub";
import BidForm from "@/src/components/bid-form";

interface ProductDetail {
  id: string;
  title: string;
  image: string;
  currentBid: number;
  minBid: number;
  bids: number;
  timeLeft: string;
  category: string;
  description: string;
  seller: string;
  sellerRating: number;
  condition: string;
  location: string;
  bidHistory: Array<{ bidder: string; amount: number; time: string }>;
}

const mockProductDetails: Record<string, ProductDetail> = {
  "1": {
    id: "1",
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
  "863ca937-a969-4938-af92-11dd82303420": {
    id: "863ca937-a969-4938-af92-11dd82303420",
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
};

interface BidEntry {
  bidder: string;
  amount: number;
  time: string;
}

export default function ProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = String(params?.id);
  const initialProduct = mockProductDetails[productId];
  const [bidSuccess, setBidSuccess] = useState(false);
  const [product, setProduct] = useState<ProductDetail | undefined>(
    initialProduct
  );
  const [isFavorite, setIsFavorite] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  if (!product) {
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

 
  /** Handler para "ReceiveNewBid": Quando um novo lance chega. */
  const handleNewBid = useCallback(
    (
      receivedProductId: string,
      newBidAmount: number,
      newTotalBids: number,
      newBidderName: string,
      newBidTime: string,
      isBidOwner: boolean
    ) => {
      if (receivedProductId === productId) {
        setProduct((prevProduct) => {
          if (!prevProduct) return undefined;

          const newBidEntry: BidEntry = {
            bidder: newBidderName,
            amount: newBidAmount,
            time: newBidTime,
          };
          showNotifyBid(isBidOwner, newBidderName, newBidAmount);

          return {
            ...prevProduct,
            currentBid: newBidAmount,
            bids: newTotalBids,
            bidHistory: [newBidEntry, ...prevProduct.bidHistory], // Adiciona no topo
          };
        });
      }
    },
    [productId] 
  );

  /** Handler para "FullAuctionState": Recebe o estado completo pós-reconexão. */
  const handleFullStateUpdate = useCallback((fullState: ProductDetail) => {
    console.log("Estado completo recebido (pós-reconexão):", fullState);
    // Substitui o estado, garantindo a reconciliação
    //setProduct(fullState);
    setIsReconnecting(false); // Parou de reconectar
  }, []); // Sem dependências, pois só usa 'setProduct' e 'setIsReconnecting'

  // ---
  // 5. HANDLERS DE CICLO DE VIDA (com useCallback)
  // ---

  /** Handler para 'onreconnected': Quando a conexão é re-estabelecida. */
  const handleReconnect = useCallback(
    (connectionId?: string) => {
      const groupName = String(productId);
      console.log(`[${groupName}] Reconectado com ID: ${connectionId}`);
      setIsReconnecting(false);

      // IIFE para rodar código async dentro de um handler síncrono
      (async () => {
        try {
          const connection = getSignalRConnection();
          console.log(`[${groupName}] Re-entrando no grupo...`);
          await connection.invoke("JoinAuctionGroup", groupName);

          console.log(`[${groupName}] Sincronizando estado...`);
          await connection.invoke("SyncAuctionState", groupName);
        } catch (err) {
          console.error(`[${groupName}] Erro ao re-sincronizar:`, err);
        }
      })();
    },
    [productId] // Depende do productId para saber qual grupo/sincronizar
  );

  /** Handler para 'onreconnecting': Quando a conexão cai e tenta voltar. */
  const handleReconnecting = useCallback(
    (error?: Error) => {
      const groupName = String(productId);
      console.log(`[${groupName}] Tentando reconectar...`, error);
      setIsReconnecting(true);
    },
    [productId] // Depende do productId para logs
  );

  // ---
  // 6. useEffect PRINCIPAL (Gerencia o Ciclo de Vida do SignalR)
  // ---
  useEffect(() => {
    debugger
    const groupName = String(productId);
    const connection = getSignalRConnection();

    // --- 1. Registrar Handlers de DADOS ---
    connection.on("ReceiveNewBid", handleNewBid);
    connection.on("FullAuctionState", handleFullStateUpdate);

    // --- 2. Registrar Handlers de CICLO DE VIDA ---
    connection.onreconnected(handleReconnect);
    connection.onreconnecting(handleReconnecting);

    // --- 3. Lógica de INICIALIZAÇÃO e CONEXÃO ---
    const setup = async () => {
      try {
        if (connection.state === signalR.HubConnectionState.Disconnected) {
          console.log(`[${groupName}] Iniciando conexão SignalR...`);
          await connection.start();
          console.log(`[${groupName}] Conexão estabelecida.`);
        }

        // Se já estiver conectado (ou acabou de conectar)
        if (connection.state === signalR.HubConnectionState.Connected) {
          console.log(`[${groupName}] Entrando no grupo e sincronizando...`);
          await connection.invoke("JoinAuctionGroup", groupName);
          await connection.invoke("SyncAuctionState", groupName);
        }
      } catch (err) {
        console.error(`[${groupName}] Erro ao configurar SignalR:`, err);
      }
    };

    setup(); // Executa a lógica de setup

    // --- 4. Função de LIMPEZA (Cleanup) ---
    return () => {
      console.log(`Limpando ouvintes e grupo ${groupName}...`);

      // Limpar handlers de DADOS
      connection.off("ReceiveNewBid", handleNewBid);
      connection.off("FullAuctionState", handleFullStateUpdate);

      // Limpar handlers de CICLO DE VIDA (atribuir função vazia)
      connection.onreconnected = () => {};
      connection.onreconnecting = () => {};

      // Sair do grupo
      // if (connection.state === signalR.HubConnectionState.Connected) {
      //   connection
      //     .invoke("OnDisconnectedAsync", groupName)
      //     .then(() => console.log(`[${groupName}] Saiu do grupo.`))
      //     .catch((err) => console.log("Erro ao sair do grupo:", err));
      // }
    };
  }, [
    // Array de dependências ESTÁVEL
    productId,
    handleNewBid,
    handleFullStateUpdate,
    handleReconnect,
    handleReconnecting,
  ]);

  // ---
  // 7. AÇÕES DO USUÁRIO (ex: Dar Lance)
  // ---
  const handlePlaceBid = (bidAmount: number) => {
    const groupName = String(productId); // Garante que é string
    const connection = getSignalRConnection();
    debugger

    if (
      connection &&
      connection.state === signalR.HubConnectionState.Connected
    ) {
      setBidSuccess(false); // (Do seu código original)
      connection
        .invoke("SendBid", groupName, bidAmount.toString())
        .then(() => {
          console.log(
            `Lance de R$${bidAmount} enviado para ${groupName}.`
          );
          // O 'setBidSuccess(true)' deve vir do 'handleNewBid'
          // se 'isBidOwner' for verdadeiro
        })
        .catch((err) => {
          console.error("Falha ao Enviar Lance:", err);
          ToastError("Falha ao Enviar Lance 🛑");
        });
    } else {
      if (isReconnecting) {
        ToastError("Tentando reconectar. Aguarde para dar o lance.");
      } else {
        ToastError("Não foi possível enviar o lance. Falha de conexão");
      }
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-2 px-4 py-2 text-base shadow-lg"
                  >
                    <Clock className="w-5 h-5" />
                    {product.timeLeft}
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
                        {product.bids}
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
                    <h3 className="font-bold text-foreground mb-3">Vendedor</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-foreground">
                          {product.seller}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ⭐ {product.sellerRating} (Avaliação)
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
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Histórico de Lances
                  </h3>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                    {product.bidHistory.length > 0 ? (
                      product.bidHistory.map(
                        (
                          bid: { bidder: string; time: string; amount: number },
                          index: number
                        ) => (
                          <div
                            key={`${bid.bidder}-${index}`}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border"
                          >
                            <div>
                              <p className="font-semibold text-foreground">
                                {bid.bidder}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {bid.time}
                              </p>
                            </div>
                            <p className="font-bold text-foreground text-lg">
                              R$ {bid.amount.toLocaleString("pt-BR")}
                            </p>
                          </div>
                        )
                      )
                    ) : (
                      <Alert className="bg-secondary/20 border-secondary">
                        <AlertDescription>
                          Ainda não há lances para este produto. Seja o primeiro
                          a dar um lance!
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
              <div className="mb-6 pb-6 border-b border-border">
                <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  Lance Atual
                </p>
                <p className="text-4xl font-bold text-primary mb-2">
                  R$ {product.currentBid.toLocaleString("pt-BR")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Mínimo: R$ {product.minBid.toLocaleString("pt-BR")}
                </p>
              </div>
              {/* Bid Form */}
              <BidForm
                currentBid={product.currentBid}
                minBid={product.minBid}
                successBid={bidSuccess}
                onPlaceBid={handlePlaceBid}
              />
              {/* Action Buttons e Info Box */}
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => setIsFavorite(!isFavorite)}
                  variant={isFavorite ? "default" : "outline"}
                  className="flex-1"
                >
                  <Heart
                    className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`}
                  />
                  Favoritar
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
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
            </Card>
          </div>
        </div>
      </div>
    </main>
  );

  function showNotifyBid(
    isBidOwner: boolean,
    newBidderName: string,
    newBidAmount: number
  ) {
    if (isBidOwner) {
      ToastSuccess(`Lance processado com sucesso!`);
      setBidSuccess(true);
      setTimeout(() => setBidSuccess(false), 3000);
      return;
    }

    ToastSuccess(
      `Lance superado por ${newBidderName} R$ ${newBidAmount.toLocaleString(
        "pt-BR",
        { style: "currency", currency: "BRL" }
      )}`
    );
  }
}
