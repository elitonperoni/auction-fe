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

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-primary border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
           

            <Link href="/" className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary-foreground p-2 rounded-lg">
                  <Gavel className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-primary-foreground">
                  LeilãoMax
                </h1>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <div className="text-primary-foreground font-medium">
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
