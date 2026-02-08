"use client";

import { useEffect, useState } from 'react';
import { auctionApi } from '@/src/api';
import ButtonCustom from '@/src/components/Button/button';
import { Badge } from '@/src/components/ui/badge';
import Link from 'next/link';
import { RoutesScreenPaths } from '@/src/utils/routesPaths';
import { useRouter } from 'next/navigation';
import { AuctionListByUserResponse } from '@/src/models/respose/auctionProductDetail';
import LoadingSpinner from '@/src/components/Loading/loadingSpinner';

export default function AuctionsUserOwner() {
  const [leiloes, setLeiloes] = useState<AuctionListByUserResponse[]>();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLeiloes = async () => {
      try {
        const resp = await auctionApi.getAuctionsByUser();
        setLeiloes(resp);
      } catch (error) {
        console.error("Erro ao buscar leilões", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeiloes();
  }, []);

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header Responsivo */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Meus Leilões</h1>
        <ButtonCustom
          className="text-white px-6 py-2 rounded-3xl transition w-full sm:w-auto"
          onClick={() => router.push(RoutesScreenPaths.AUCTION_REGISTER())}
        >
          + Novo Leilão
        </ButtonCustom>
      </header>

      {leiloes?.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 sm:p-12 text-center">
          <p className="text-gray-500">Você ainda não cadastrou nenhum leilão.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {leiloes?.map((leilao) => (
            <Link key={leilao.id} href={RoutesScreenPaths.AUCTION_DETAIL(leilao.id)} className="block group">
              <div className="bg-white border rounded-xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between hover:shadow-md transition-shadow gap-6">

                {/* Lado Esquerdo: Imagem + Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full flex-1">

                  {/* Container da Imagem Responsiva */}
                  <div className="relative h-48 sm:h-24 w-full sm:w-40 flex-shrink-0 overflow-hidden rounded-lg border bg-gray-100">
                    {leilao.imageUrl ? (
                      <img
                        src={leilao.imageUrl}
                        alt={leilao.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Textos e Badges */}
                  <div className="flex flex-col items-start w-full">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 line-clamp-2">{leilao.title}</h3>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge className="bg-gray-100 text-gray-700 border-none text-xs py-1 px-2">
                        Lance: R$ {leilao.currentPrice.toLocaleString('pt-BR')}
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-700 border-none text-xs py-1 px-2">
                        Lances: {leilao.bidCount}
                      </Badge>
                      <Badge className={`border-none text-xs py-1 px-2 ${leilao.actualWinner ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                        Líder: {leilao.actualWinner || "Ninguém"}
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-700 border-none text-xs py-1 px-2">
                        Fim: {new Date(leilao.endDate).toLocaleDateString('pt-BR')}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Lado Direito: Status e Ações */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 w-full sm:w-auto border-t sm:border-none pt-4 sm:pt-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${leilao.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                    {leilao.status}
                  </span>
                  <ButtonCustom
                    className="cursor-pointer text-sm"
                    onClick={(e: any) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(RoutesScreenPaths.AUCTION_REGISTER(leilao.id));
                    }}
                  >
                    Editar
                  </ButtonCustom>
                </div>

              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}