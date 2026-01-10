"use client"; // <-- MUDANÇA: Necessário para usar estado e eventos

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { authApi } from "@/src/api";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/src/components/ui/field";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authApi.login({ email: email, password: password }).then((resp) => {
        if (resp === true) {
          router.push("/");
        } else {
          setError("Usuário ou senha inválidos");
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
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Bem-vindo!</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@email.com"
                  required
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Senha</FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="animate-spin size-4" />
                  ) : (
                    "Login"
                  )}
                </Button>

                {/* <-- MUDANÇA: Mostrar mensagem de erro */}
                {error && (
                  <p className="text-sm text-center text-destructive">
                    {error}
                  </p>
                )}
                <FieldDescription className="text-center">
                  <Link href="/recovery-password">Esqueceu sua senha?</Link>
                </FieldDescription>
                <FieldDescription className="text-center">
                  Não possui uma conta?
                  <Link href="/register"> Cadastre-se</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
