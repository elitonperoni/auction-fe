"use client";

import { Gavel } from "lucide-react";
import Link from "next/link";
import { authApi } from "@/src/api";
import { useRouter } from "next/navigation";
import UserGreeting from "./components/userGreeting";
import { RootState } from "@/src/store/store";
import { useSelector } from "react-redux";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
import React from "react";
import { RoutesScreenPaths } from "@/src/utils/routesPaths";
import { NotificationBell } from "./components/notificationBell";

export function LayoutMain({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);

  function logout() {
    authApi.logout();
    router.push("/login");
  }


  const ListItem = ({
    title,
    children,
    href,
    ...props
  }: React.ComponentPropsWithoutRef<"li"> & { href: string }) => {
    return (
      <li {...props} className="list-none">
        <NavigationMenuLink asChild>
          <Link
            href={href}
            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:!bg-slate-100 group"
          >
            <div className="flex flex-col gap-1">
              <div className="text-sm font-semibold leading-none !text-slate-900">
                {title}
              </div>
              <div className="text-xs !text-slate-500 line-clamp-2">
                {children}
              </div>
            </div>
          </Link>
        </NavigationMenuLink>
      </li>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-primary border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">


            <NavigationMenu viewport={false} className="relative">
              <NavigationMenuList>
                <NavigationMenuItem className="relative">
                  <NavigationMenuTrigger className="!bg-transparent !border-none !shadow-none p-0 h-auto hover:!bg-transparent data-[state=open]:!bg-transparent">
                    <div className="bg-primary-foreground p-2 rounded-lg transition-transform hover:scale-105 active:scale-95 shadow-sm">
                      <Gavel className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                  </NavigationMenuTrigger>

                  {user.isAuthenticated && (
                    <NavigationMenuContent className="absolute left-0 top-full mt-2 w-[85vw] max-w-[280px] !bg-white border border-slate-200 shadow-xl rounded-md z-[60]">
                      <ul className="grid w-[240px] gap-1 p-2 list-none">
                        <ListItem href={RoutesScreenPaths.AUCTION_REGISTER()} title="Anuncie um produto">
                          Cadastre seu produto para venda agora mesmo.
                        </ListItem>
                      </ul>
                      <ul className="grid w-[240px] gap-1 p-2 list-none">
                        <ListItem href={RoutesScreenPaths.AUCTIONS_BY_USER} title="Meus leilões">
                          Acompanhe seus leilões e lances recebidos em seus produtos.
                        </ListItem>
                      </ul>
                      <ul className="grid w-[240px] gap-1 p-2 list-none">
                        <ListItem href={RoutesScreenPaths.AUCTION_USER_BIDS} title="Meus lances">
                          Acompanhe os lances em leilões em que você está participando.
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  )}             
                       
                </NavigationMenuItem>
              </NavigationMenuList>

              <button
                onClick={() => router.push(RoutesScreenPaths.HOME)}
                className="flex items-center cursor-pointer gap-2 ml-2 sm:ml-4 bg-transparent border-none p-0 hover:opacity-80 transition-opacity"
              >
                <h1 className="text-xl sm:text-2xl font-bold text-primary-foreground whitespace-nowrap">
                  LeilãoMax
                </h1>
              </button>
            </NavigationMenu>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {user.isAuthenticated && <NotificationBell />}
              <div className="text-primary-foreground font-medium text-sm sm:text-base">
                <UserGreeting
                  isAuthenticated={user.isAuthenticated}
                  username={user.name || "Convidado"}
                  action={logout}
                />
              </div>
            </div>
          </div>
        </div>
      </header>
      {children}
    </main>
  );
}
