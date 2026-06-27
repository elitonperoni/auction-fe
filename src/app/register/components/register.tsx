"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { authApi } from "@/src/api";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/src/components/ui/field";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { City, State } from "country-state-city";

const registerSchema = z.object({
  fullName: z.string().min(2, "Nome completo deve ter pelo menos 2 caracteres"),
  username: z
    .string()
    .min(3, "Nome de usuário deve ter pelo menos 3 caracteres")
    .regex(/^[a-z0-9_]+$/, "Apenas letras minúsculas, números e _"),
  email: z.string().email("Formato de e-mail inválido"),
  phone: z.string().optional(),
  location: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      phone: "",
      location: "",
      country: "",
      state: "",
      city: "",
      language: "",
      timezone: "",
      password: "",
    },
  });

  const watchedCountry = watch("country");
  const watchedState = watch("state");

  const countriesAvailable = [
    { nome: "Brasil", isoCode: "BR" },
    { nome: "Estados Unidos", isoCode: "US" },
  ];

  const states = watchedCountry ? State.getStatesOfCountry(watchedCountry) : [];
  const cities = watchedCountry && watchedState
    ? City.getCitiesOfState(watchedCountry, watchedState)
    : [];

  const languageOptions = [
    { value: "1", label: "🇧🇷 Português" },
    { value: "2", label: "🇺🇸 Inglês" },
  ];

  const timezones = [
    { value: "America/Sao_Paulo", label: "São Paulo, Brasília (UTC-3)" },
    { value: "America/New_York", label: "Nova York (UTC-5)" },
    { value: "Europe/London", label: "Londres (UTC+0)" },
  ];

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);

    try {
      const registerResponse = await authApi.register({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        userName: data.username,
        phone: data.phone,
        location: data.location,
        country: data.country,
        state: data.state,
        city: data.city,
        language: data.language,
        timezone: data.timezone,
      });

      if (registerResponse?.checkoutUrl) {
        window.location.href = registerResponse.checkoutUrl;
        return;
      }

      setServerError("Cadastro realizado, mas o link de checkout não foi retornado.");
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
    <div className={cn("flex w-full flex-col items-center gap-6", className)} {...props}>
      <Card className="relative w-full">
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
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              <Field className="md:col-span-2">
                <FieldLabel htmlFor="fullName">Nome completo</FieldLabel>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <span className="text-xs text-destructive">
                    {errors.fullName.message}
                  </span>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="username">Nome de usuário</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="seu_usuario"
                  {...register("username")}
                />
                {errors.username && (
                  <span className="text-xs text-destructive">
                    {errors.username.message}
                  </span>
                )}
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
                <FieldLabel htmlFor="phone">Telefone</FieldLabel>
                <Input
                  id="phone"
                  type="text"
                  placeholder="(11) 99999-9999"
                  {...register("phone")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="location">Localização</FieldLabel>
                <Input
                  id="location"
                  type="text"
                  placeholder="Cidade, Estado"
                  {...register("location")}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="country">País</FieldLabel>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setValue("state", "");
                        setValue("city", "");
                      }}
                      value={field.value || ""}
                    >
                      <SelectTrigger id="country" className="h-8 text-sm">
                        <SelectValue placeholder="Selecione o país..." />
                      </SelectTrigger>
                      <SelectContent>
                        {countriesAvailable.map((country) => (
                          <SelectItem key={country.isoCode} value={country.isoCode}>
                            {country.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="state">Estado</FieldLabel>
                <Controller
                  name="state"
                  control={control}
                  render={({ field }) => (
                    <Select
                      key={watchedCountry}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setValue("city", "");
                      }}
                      value={field.value || ""}
                      disabled={!watchedCountry || states.length === 0}
                    >
                      <SelectTrigger id="state" className="h-8 text-sm">
                        <SelectValue placeholder="Selecione o estado..." />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state.isoCode} value={state.isoCode}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="city">Cidade</FieldLabel>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <Select
                      key={watchedState}
                      onValueChange={field.onChange}
                      value={field.value || ""}
                      disabled={!watchedState || cities.length === 0}
                    >
                      <SelectTrigger id="city" className="h-8 text-sm">
                        <SelectValue placeholder="Selecione a cidade..." />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city.name} value={city.name}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="language">Idioma</FieldLabel>
                <Controller
                  name="language"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger id="language" className="h-8 text-sm">
                        <SelectValue placeholder="Selecione um idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        {languageOptions.map((language) => (
                          <SelectItem key={language.value} value={language.value}>
                            {language.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="timezone">Fuso horário</FieldLabel>
                <Controller
                  name="timezone"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger id="timezone" className="h-8 text-sm">
                        <SelectValue placeholder="Selecione um fuso horário" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((timezone) => (
                          <SelectItem key={timezone.value} value={timezone.value}>
                            {timezone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>

              <Field className="md:col-span-2">
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Senha</FieldLabel>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="pr-10"
                    {...register("password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <span className="text-xs text-destructive">
                    {errors.password.message}
                  </span>
                )}
              </Field>
            </FieldGroup>

            <div className="mt-6 flex flex-col items-stretch gap-3 sm:items-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto sm:min-w-36"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin size-4" />
                ) : (
                  "Cadastre-se"
                )}
              </Button>

              {serverError && (
                <p className="text-sm text-center text-destructive sm:text-right">
                  {serverError}
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
