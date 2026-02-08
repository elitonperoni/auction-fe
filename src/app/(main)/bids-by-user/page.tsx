"use client";

import { useEffect, useState } from 'react';
import { auctionApi } from '@/src/api';
import { Badge } from '@/src/components/ui/badge';
import Link from 'next/link';
import { RoutesScreenPaths } from '@/src/utils/routesPaths';
import { AuctionBidsByUserResponse } from '@/src/models/respose/auctionProductDetail';
import { Gavel, ImageOff } from 'lucide-react';
import LoadingSpinner from '@/src/components/Loading/loadingSpinner';

export default function BidByUser() {
    const [auctionBids, setAuctionBids] = useState<AuctionBidsByUserResponse[]>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuctionBidsByUser = async () => {
            try {
                const resp = await auctionApi.getAuctionsBidByUser();
                setAuctionBids(resp);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAuctionBidsByUser();
    }, []);

    if (loading) {
        return <LoadingSpinner />
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6">
            <header className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Meus lances</h1>
                <p className="text-sm font-medium text-gray-500 mt-1">
                    Acompanhe os lances dos leilões que você está participando
                </p>
            </header>

            {auctionBids?.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 md:p-12 text-center">
                    <p className="text-gray-500">Você ainda não fez nenhum lance.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {auctionBids?.map((leilao) => (
                        <Link key={leilao.id} href={RoutesScreenPaths.AUCTION_DETAIL(leilao.id)} className="block group">
                            <div className="bg-white border rounded-xl p-4 md:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 hover:shadow-md transition-shadow">

                                <div className="relative h-48 md:h-24 w-full md:w-40 flex-shrink-0 overflow-hidden rounded-lg border bg-gray-100">
                                    {leilao.imageUrl ? (
                                        <img
                                            src={leilao.imageUrl}
                                            alt={leilao.title}
                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                                            <ImageOff className="h-10 w-10" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 w-full">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                        <h3 className="text-lg md:text-xl font-semibold text-gray-900 leading-tight">
                                            {leilao.title}
                                        </h3>

                                        <div className="flex flex-wrap gap-2">
                                            {leilao.isUserActualLeader && !leilao.isUserWinner && (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-700 text-white">
                                                    Você está vencendo!
                                                </span>
                                            )}
                                            {!leilao.isUserActualLeader && !leilao.isUserWinner && (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
                                                    Lance superado
                                                </span>
                                            )}
                                            {leilao.isUserWinner && (
                                                <div className="flex items-center gap-2 bg-blue-900 text-white px-3 py-1 rounded-full shadow-sm">
                                                    <Gavel className="w-4 h-4" />
                                                    <span className="text-xs font-medium">Parabéns você venceu!</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Status Global</span>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 py-1">
                                                    Atual: R$ {leilao.currentPrice.toLocaleString('pt-BR')}
                                                </Badge>
                                                <Badge variant="outline" className="text-gray-600 py-1">
                                                    Lances: {leilao.bidCount}
                                                </Badge>
                                                <Badge variant="outline" className="text-gray-600 py-1 hidden sm:inline-flex">
                                                    Líder: {leilao.actualLeader || "Ninguém"}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Minha Atividade</span>
                                            <div className="flex flex-wrap gap-2">
                                                <Badge className={`py-1 border-none ${leilao.isUserActualLeader ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                                                    }`}>
                                                    Meu Lance: R$ {leilao.userLastBidAmount?.toLocaleString('pt-BR') || "0,00"}
                                                </Badge>
                                                <Badge className="bg-white text-gray-600 border-gray-200 py-1">
                                                    Lances: {leilao.userBidsCount}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-[11px] text-gray-400 mt-3 md:mt-2 italic">
                                        Encerra em: {new Date(leilao.endDate).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}