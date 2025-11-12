"use client";

import { useState, useEffect, useRef, useCallback } from "react"; // useRef adicionado
import * as signalR from "@microsoft/signalr";
import { useRouter, useParams } from "next/navigation";
import { Clock, Heart, Share2, CheckCircle2 } from "lucide-react";
import BidForm from "../../../components/bid-form"; // Corrigindo o caminho do componente
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

// ... (interface ProductDetail e mockProductDetails)

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
  const connection = useRef<signalR.HubConnection | null>(null); // Corrigido para usar useRef

  // Lógica para Produto não encontrado (deve ser antes de usar 'product' abaixo)
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

  const handleNewBid = useCallback(
    (
      receivedProductId: string,
      newBidAmount: number,
      newTotalBids: number,
      newBidderName: string, // Adicionado para o histórico
      newBidTime: string // Adicionado para o histórico
    ) => {
      debugger;
      if (receivedProductId === productId) {
        setProduct((prevProduct) => {
          // Removido o tipo explícito 'ProductDetail | undefined' para simplificar
          if (!prevProduct) return undefined;

          // Adicionando o novo lance ao histórico
          const newBidEntry = {
            bidder: newBidderName,
            amount: newBidAmount,
            time: newBidTime,
          };

          setBidSuccess(true);

          // 3. Remover a notificação após 3 segundos
          setTimeout(() => setBidSuccess(false), 3000);

          return {
            ...prevProduct,
            currentBid: newBidAmount,
            bids: newTotalBids,
            bidHistory: [newBidEntry, ...prevProduct.bidHistory], // Atualiza o histórico
          };
        });
      }
    },
    [productId]
  );

  useEffect(() => {
    debugger;
    
    // ✅ PASSO 1: Flag para rastrear se o componente ainda está montado
    let isMounted = true;
    
    const HUB_URL = "http://localhost:5000/auctionHub";

    // Verificação síncrona: Se a conexão já existe, não faz nada.
    // (Na Montagem 2, isso falha, pois a limpeza do Passo 2 define como null)
    if (connection.current !== null) {
      console.warn("Conexão já existe, pulando.");
      return;
    }

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJkZXZlbG9wZXJzIiwiaXNzIjoiY2xlYW4tYXJjaGl0ZWN0dXJlIiwiZXhwIjoxNzYxOTY3MzYyLCJzdWIiOiI5NjRkMTFmNS1jZWQyLTQ4OGYtYmNlMi1kM2U4MGU2YzA2OTMiLCJlbWFpbCI6ImVsaXRvbkBlbWFpbC5jb20iLCJpYXQiOjE3NjE5NjM3NjIsIm5iZiI6MTc2MTk2Mzc2Mn0.vv7LHWo3tRQ1k0rGeOWJPQkJiHaO1nCLG7bqJC3UCvs', 
      })
      .withAutomaticReconnect()
      .build();
      
    debugger;
    connection.current = newConnection;

    newConnection
      .start()
      .then(() => {
        debugger;
        
        // ✅ PASSO 2: A VERIFICAÇÃO CRÍTICA
        // Se !isMounted for verdadeiro, significa que a função de limpeza 
        // (do "Unmount 1" do StrictMode) já rodou.
        // Nós simplesmente não fazemos nada e evitamos o erro.
        if (!isMounted) {
          console.log("Start() concluído, mas componente foi desmontado. Ignorando.");
          return; 
        }

        // Se chegamos aqui, é uma montagem válida (a Montagem 2)
        console.log("Conexão SignalR estabelecida.");
        const groupName = String(productId);
        
        newConnection
          .invoke("JoinAuctionGroup", groupName)
          .then(() => console.log(`Entrou no grupo ${groupName} com sucesso.`))
          .catch((err) => console.log("Erro ao entrar no grupo:", err));

        newConnection.on("ReceiveNewBid", handleNewBid);
      })
      .catch((err) => {
        // O start() pode falhar se o stop() for chamado antes
        // Só exibe o erro se o componente ainda estiver "oficialmente" montado
        if (isMounted) {
            console.log("Erro ao iniciar a conexão SignalR: ", err);
        } else {
            console.log("Erro de start() ignorado (componente desmontado).", err.message);
        }
      });

    // A função de limpeza (roda na "Desmontagem 1" e na saída real da página)
    return () => {
      debugger;
      
      // ✅ PASSO 3: Define a flag para false
      isMounted = false;
      
      if (connection.current) {
        console.log("Limpando conexão SignalR anterior...");
        
        connection.current.off("ReceiveNewBid", handleNewBid);
        
        // Nós podemos tentar parar, mas o mais importante é resetar o ref
        connection.current.stop()
          .then(() => console.log("Conexão parada."))
          .catch((err) => console.log("Erro ao parar conexão (pode ser normal durante o start):", err.message));

        // Reseta o ref para que a "Montagem 2" possa criar uma nova conexão
        connection.current = null;
      }
    };
  }, [productId, handleNewBid]);

  const handlePlaceBid = (bidAmount: number) => {
    // Valores de exemplo que você pegaria de um formulário ou contexto de autenticação
    const user = "CurrentUserId_42"; // Substitua pelo ID/Nome do usuário logado
    const groupName = productId; // Define o grupo (o ID do produto)

    // O Hub espera: SendBid(groupName, user, bidValue)
    if (
      connection.current &&
      connection.current.state === signalR.HubConnectionState.Connected
    ) {
      debugger;
      setBidSuccess(false);
      connection.current
        .invoke("SendBid", groupName, bidAmount.toString())
        .then(() => {
          console.log(
            `Lance de R$${bidAmount} enviado com sucesso para o grupo ${groupName}.`
          );

          // Você pode adicionar uma notificação de sucesso aqui
        })
        .catch((err) => {
          console.log("Erro ao enviar o lance via SignalR:", err);
          // Exiba uma mensagem de erro ao usuário (ex: lance muito baixo)
        });
    } else {
      console.warn(
        "Conexão SignalR não está estabelecida. Não foi possível enviar o lance."
      );
      // Informe o usuário que a conexão está indisponível
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* ... header e layout */}
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
              {/* ... TabsList */}
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
                      </p>{" "}
                      {/* Usa o estado atualizado */}
                    </div>
                  </div>
                  {/* ... Descrição e Vendedor */}
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

              {/* ... TabsContent history */}
              <TabsContent value="history">
                <Card className="p-6 bg-card border-border">
                  <h3 className="font-bold text-foreground mb-4">
                    Histórico de Lances
                  </h3>
                  <div className="space-y-3">
                    {/* Note: O bidHistory não será atualizado automaticamente com esta implementação, 
                        apenas o currentBid e bids. Uma implementação completa exigiria a busca do histórico
                        ou o envio dos dados do novo lance (incluindo bidder e time) via SignalR.
                        Por enquanto, ele reflete o mock inicial.
                    */}
                    {product.bidHistory.map(
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
                </p>{" "}
                {/* Usa o estado atualizado */}
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
              />{" "}
              {/* Passa o lance atualizado */}
              {/* ... Action Buttons e Info Box */}
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
}
