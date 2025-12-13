"use client"; // <-- MUDANÇA: Necessário para usar estado e eventos

import { useState } from "react"; // <-- MUDANÇA: Para guardar email e senha
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "../ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { cn } from "@/src/lib/utils";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "../ui/field";
import { Button } from "../ui/button";
import { authApi } from "@/src/api";
import { Loader2 } from "lucide-react";
import ToastSuccess from "../Toast/toastNotificationSuccess";
import ToastError from "../Toast/toastNotificationError";

export function RecoveryPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sucess, setSucess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
      debugger

    try {
      await authApi.recoveryPassword({ email: email })
        .then((resp) => {
        if (resp === true) 
        {
            debugger
          ToastSuccess("Email de alteração de senha enviado com sucesso!");
          setEmail("")
          setSucess("Verifique sua caixa de entrada de email")
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
                <FieldLabel htmlFor="email">Digite o email para recuperação da senha</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="email"
                  required
                  value={email} // <-- MUDANÇA: Controla o valor
                  onChange={(e) => setEmail(e.target.value)} // <-- MUDANÇA: Atualiza o estado
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
                 {sucess && (
                  <p className="text-sm text-center text-blue-600">
                    {sucess}
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
