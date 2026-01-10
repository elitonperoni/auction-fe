"use client"; 

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn, isEmpty } from "@/src/lib/utils";
import { authApi } from "@/src/api";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/src/components/ui/field";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastname: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Formato de e-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      const registerResponse = await authApi.register({
        email: data.email,
        password: data.password,
        firstName: data.name,
        lastName: data.lastname,
      });

      if (!isEmpty(registerResponse.data)) {
        await authApi
          .login({ email: data.email, password: data.password })
          .then((resp) => {
            if (resp === true) {
              router.push("/");
            }
          });
      }

      setServerError("Ocorreu um erro ao realizar o cadastro");
    } catch (err: any) {
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        if (errorData.detail) {
          setServerError(errorData.detail);
        } else {
          setServerError("Ocorreu um erro no cadastro.");
        }
      } else {
        setServerError("Erro de conexão ou servidor indisponível.");
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
         <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-4" 
          onClick={() => router.back()} 
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Crie sua conta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Nome</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  {...register("name")}
                />
                {errors.name && (
                  <span className="text-xs text-destructive">
                    {errors.name.message}
                  </span>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="lastname">Sobrenome</FieldLabel>
                <Input
                  id="lastname"
                  type="text"
                  placeholder="Seu sobrenome"
                  {...register("lastname")}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@email.com"
                  {...register("email")}
                />
                {errors.email && (
                  <span className="text-xs text-destructive">
                    {errors.email.message}
                  </span>
                )}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Senha</FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />
                {errors.password && (
                  <span className="text-xs text-destructive">
                    {errors.password.message}
                  </span>
                )}
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin size-4" />
                  ) : (
                    "Cadastre-se"
                  )}
                </Button>

                {serverError && (
                  <p className="text-sm text-center text-destructive mt-2">
                    {serverError}
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
