"use client";
import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import { LogIn, LogOut } from "lucide-react";
import { Button } from "../../ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "../../ui/navigation-menu";
import Link from "next/link";

interface UserGreeting {
  readonly isAuthenticated: boolean;
  readonly username: string;
  readonly action: () => void;
}

export default function UserGreeting({
  isAuthenticated,
  username,
  action,
}: UserGreeting) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <div className="text-primary-foreground font-medium">Convidado</div>;
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-primary-foreground font-medium">
        {isAuthenticated ? `Olá ${username}!` : "Convidado"}
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={action}
              className="bg-primary-foreground text-primary hover:bg-secondary font-semibold cursor-pointer"
            >
              {isAuthenticated && <LogOut />}
              {!isAuthenticated && <LogIn />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isAuthenticated ? "Encerrar sessão" : "Fazer login"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>     
    </div>
  );
}
