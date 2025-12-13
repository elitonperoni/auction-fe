"use client"; // <-- MUDANÇA: Necessário para usar estado e eventos

import { useState } from "react"; // <-- MUDANÇA: Para guardar email e senha
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
} from "../ui/card";
import { cn } from "@/src/lib/utils";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "../ui/field";
import { Button } from "../ui/button";
import { authApi } from "@/src/api";
import { Loader2 } from "lucide-react";
import ToastSuccess from "../Toast/toastNotificationSuccess";
import ToastError from "../Toast/toastNotificationError";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const searchParams = useSearchParams();
  const requestId = searchParams.get("id");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    debugger
    setIsLoading(true);
    setError(null);    

    if (password !== confirmPassword)
    {        
        setError("As senhas não correspondem");
        setIsLoading(false);
        return;
    }    

    try {
      await authApi.resetPassword({ token: requestId!, password: password })
        .then((resp) => {
        if (resp === true) 
        {
          ToastSuccess("Senha alterada com sucesso!");
          router.push("/login");
        }
        else{
          ToastError("Ocorreu um erro ao alterar a senha");
        }
          
        setIsLoading(false);
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro inesperado");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
       
        <CardContent>
          {/* <-- MUDANÇA: Adicionado o evento onSubmit */}
          <form onSubmit={handleSubmit}>
            <FieldGroup>
            
              <Field>
                <FieldLabel htmlFor="password">Digite sua nova senha</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Senha"
                  required
                  value={password} // <-- MUDANÇA: Controla o valor
                  onChange={(e) => setPassword(e.target.value)} // <-- MUDANÇA: Atualiza o estado
                />
              </Field>
              
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="confirm-password"></FieldLabel>
                </div>
                <Input
                  id="confirm-password"
                  type="password"
                   placeholder="Confirme a senha"
                  required
                  value={confirmPassword} // <-- MUDANÇA: Controla o valor
                  onChange={(e) => setConfirmPassword(e.target.value)} // <-- MUDANÇA: Atualiza o estado
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="animate-spin size-4" />
                  ) : (
                    "Confirmar"
                  )}
                </Button>

                {/* <-- MUDANÇA: Mostrar mensagem de erro */}
                {error && (
                  <p className="text-sm text-center text-destructive">
                    {error}
                  </p>
                )}
               
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    
    </div>
  );
}
