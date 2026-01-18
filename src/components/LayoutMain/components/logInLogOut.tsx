"use client";
import { useState, useEffect } from "react";

interface UserGreeting {
  readonly isAuthenticated: boolean;
  readonly username: string;
}

export default function User({ isAuthenticated, username }: UserGreeting) {
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
    </div>
  );
}