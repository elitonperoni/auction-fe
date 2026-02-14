"use-client"

import { getSignalRConnection, startSignalRConnection } from "@/src/api/hub";
import { RootState } from "@/src/store/store";
import { ChannelNames } from "@/src/utils/channerlNames";
import { Bell } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as signalR from "@microsoft/signalr";
import { useRouter } from "next/navigation";
import { RoutesScreenPaths } from "@/src/utils/routesPaths";
import { userApi } from "@/src/api";
import getTimeAgo from "@/src/utils/getTimeAgo";

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [hasNotifications, setHasNotifications] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [hasUnread, setHasUnread] = useState(false);
    const user = useSelector((state: RootState) => state.user);
    const router = useRouter();

    const userGroupName = String(user.id);

    useEffect(() => {
        debugger
        getNotifications();
    }, [])

    async function getNotifications() {
        await userApi.getNotifications()
            .then((resp) => {
                debugger
                setNotifications(resp)
            })
    }

    const handleNotification = useCallback((auctionId: string, message: string) => {
        const newNotification: NotificationItem = {
            id: auctionId,
            message,
            createdAt: new Date(),
            isRead: false
        };

        setNotifications(prev => [newNotification, ...prev]);
        setHasUnread(true);
    }, []);

    useEffect(() => {
        if (!user.id) return;

        const connection = getSignalRConnection();

        connection.on(ChannelNames.ReceiveUserNotification, handleNotification);

        const setup = async () => {
            try {
                await startSignalRConnection();
                await connection.invoke(ChannelNames.JoinUserGroup, userGroupName);
            } catch (err) {
                console.error(`[${userGroupName}] Erro ao configurar SignalR:`, err);
            }
        };

        setup();

        return () => {
            connection.off(ChannelNames.ReceiveUserNotification, handleNotification);

            if (connection.state === signalR.HubConnectionState.Connected) {
                connection
                    .invoke(ChannelNames.OnDisconnectedAsync, userGroupName)
                    .then(() => console.log(`[${userGroupName}] Saiu do grupo.`))
                    .catch((err) => console.log("Erro ao sair do grupo:", err));
            }
        };
    }, [user.id,
        handleNotification,
    ]);    

    return (
        <div className="relative">
            {/* Botão do Sino */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-full transition-colors focus:outline-none"
                aria-label="Notificações"
            >
                <Bell className="w-5 h-5 sm:w-6 h-6" />

                {hasUnread && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800 z-20 overflow-hidden">
                        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 font-bold text-zinc-700 dark:text-zinc-200">
                            Notificações
                        </div>

                        {/* Corrigido para max-h */}
                        <div className="max-h-[300px] overflow-y-auto">
                            {notifications && notifications.length > 0 ? (
                                notifications.map((mp) => (
                                    <div
                                        key={mp.id} 
                                        className="p-4 border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer flex flex-col gap-1"
                                        onClick={() => {
                                            router.push(RoutesScreenPaths.AUCTION_DETAIL(mp.id));
                                            setHasUnread(false);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                            <strong>{mp.message}</strong>
                                        </span>
                                        
                                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                            {getTimeAgo(mp.createdAt)}
                                        </span>
                                    </div>
                                ))
                            ) : (                                
                                <div className="p-6 text-center text-sm text-zinc-500">
                                    Você não tem novas notificações.
                                </div>
                            )}
                        </div>

                        <button className="w-full py-2 text-xs text-center text-blue-500 hover:underline bg-zinc-50 dark:bg-zinc-800/30">
                            Ver todas as notificações
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}