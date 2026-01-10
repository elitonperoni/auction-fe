"use-client"

import { RecoveryPasswordForm } from "./components/recoveryPassword";
import MenuLink from "@/src/components/MenuLink/menuLink";

export default function RecoveryPasswordPage() {
  
  return (    
    <div className="relative bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">         
      <div className="flex w-full max-w-sm flex-col gap-6">
         <MenuLink/>
        <RecoveryPasswordForm  />
      </div>
    </div>
  );
}
