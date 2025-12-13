"use client"; // <-- MUDANÇA: Necessário para usar estado e eventos

import { useState } from "react";
import { cn } from "@/src/lib/utils";
import { authApi } from "@/src/api";
import ToastSuccess from "@/src/components/Toast/toastNotificationSuccess";
import ToastError from "@/src/components/Toast/toastNotificationError";
import { Card, CardContent } from "@/src/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/src/components/ui/field";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Loader2 } from "lucide-react";

export function RecoveryPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sucess, setSucess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    debugger;

    try {
      await authApi.recoveryPassword({ email: email }).then((resp) => {
        if (resp === true) {
          ToastSuccess("Email de alteração de senha enviado com sucesso!");
          setEmail("");
          setSucess("Verifique sua caixa de entrada de email");
        } else {
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
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">
                  Digite o email para recuperação da senha
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  required
                  value={email} // <-- MU
                  onChange={(e) => setEmail(e.target.value)}
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

                {error && (
                  <p className="text-sm text-center text-destructive">
                    {error}
                  </p>
                )}
                {sucess && (
                  <p className="text-sm text-center text-blue-600">{sucess}</p>
                )}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
