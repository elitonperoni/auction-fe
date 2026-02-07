"use client";

import React, { useEffect, useState } from 'react';
import { auctionApi } from '@/src/api';
import ButtonCustom from '@/src/components/Button/button';
import { Badge } from '@/src/components/ui/badge';
import Link from 'next/link';
import { RoutesScreenPaths } from '@/src/utils/routesPaths';
import { useRouter } from 'next/navigation';
import { AuctionListByUserResponse } from '@/src/models/respose/auctionProductDetail';

export default function MyAuctions() {
  const [leiloes, setLeiloes] = useState<AuctionListByUserResponse[]>();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLeiloes = async () => {
      try {
        await auctionApi.getAuctionsByUser()
          .then((resp) => setLeiloes(resp));
      } catch {
      } finally {
        setLoading(false);
      }
    };

    fetchLeiloes();
  }, []);

  if (loading) return <div className="p-8 text-center">Carregando seus leilões...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="flex justify-between items-start mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Meus Leilões</h1>
        <ButtonCustom className="text-white px-6 py-1 rounded-3xl transition" onClick={() => router.push(RoutesScreenPaths.REGISTER())}>
          + Novo Leilão
        </ButtonCustom>
      </header>

      {leiloes?.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-500">Você ainda não cadastrou nenhum leilão.</p>
        </div>
      ) : (
        <div className="grid gap-1">
          {leiloes?.map((leilao) => (
            <Link key={leilao.id} href={RoutesScreenPaths.AUCTION_DETAIL(leilao.id)} className="block mb-4 group">
              <div className="bg-white border rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-6 flex-1">
                  <div className="relative h-24 w-40 flex-shrink-0 overflow-hidden rounded-lg border bg-gray-100">
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
                  
                  <div className="flex flex-col items-start">
                    <h3 className="text-xl font-semibold text-gray-900">{leilao.title}</h3>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Badge className="bg-gray-200 text-black border-none">
                        Lance atual: R$ {leilao.currentPrice.toLocaleString('pt-BR')}
                      </Badge>
                      <Badge className="bg-gray-200 text-black border-none">
                        Lances: {leilao.bidCount}
                      </Badge>
                      <Badge className={`border-none ${leilao.actualWinner ? 'bg-green-800 text-white' : 'bg-gray-200 text-black'}`}>
                        Líder: {leilao.actualWinner || "Ninguém"}
                      </Badge>
                      <Badge className="bg-gray-200 text-black border-none">
                        Fim: {new Date(leilao.endDate).toLocaleDateString('pt-BR')}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-4 ml-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${leilao.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                    {leilao.status}
                  </span>
                  <ButtonCustom
                    className="cursor-pointer"
                    onClick={(e: any) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(RoutesScreenPaths.REGISTER(leilao.id));
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