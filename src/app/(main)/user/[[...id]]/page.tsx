"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
    User, Mail, Phone, MapPin, Lock, Camera, Save,
    ArrowLeft, Eye, EyeOff, Bell, Globe, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Link from "next/link";
import { City, State } from "country-state-city";
import { authApi, userApi } from "@/src/api";
import { GetUserByIdResponse } from "@/src/models/respose/getUserByIdResponse";
import { useParams } from "next/navigation";
import { UpdateUserRequest } from './../../../../models/request/updateUserRequest';
import ToastSuccess from "@/src/components/Toast/toastNotificationSuccess";
import ToastError from "@/src/components/Toast/toastNotificationError";
import ButtonCustom from "@/src/components/Button/button";

const profileSchema = z.object({
    name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
    username: z
        .string()
        .min(3, "Mínimo de 3 caracteres")
        .regex(/^[a-z0-9_]+$/, "Apenas letras minúsculas, números e _"),
    email: z.string().email("E-mail inválido"),
    phone: z
        .string(),           
    location: z.string().optional(),
    language: z.string(),
    timezone: z.string(),
    // Novos campos adicionados ao schema
    country: z.string().min(1, "Selecione um país"),
    state: z.string().min(1, "Selecione um estado"),
    city: z.string().min(1, "Selecione uma cidade"),
    memberSince: z.date().optional() 
});

const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, "Informe a senha atual"),
        newPassword: z
            .string()
            .min(8, "Mínimo 8 caracteres")
            .regex(/[A-Z]/, "Deve conter ao menos uma maiúscula")
            .regex(/[0-9]/, "Deve conter ao menos um número"),
        confirmPassword: z.string(),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
        message: "As senhas não coincidem",
        path: ["confirmPassword"],
    });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

// ─── Password strength helper ────────────────────────────────────────────────

function getPasswordStrength(password: string) {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const map = [
        { label: "Fraca", color: "bg-destructive" },
        { label: "Razoável", color: "bg-orange-400" },
        { label: "Boa", color: "bg-emerald-500" },
        { label: "Forte", color: "bg-emerald-600" },
    ];
    return { score, ...map[score - 1] };
}

// ─── Notification items ──────────────────────────────────────────────────────

const NOTIF_ITEMS = [
    { key: "emailUpdates", label: "Atualizações por e-mail", desc: "Novidades e atualizações do produto" },
    { key: "pushNotifications", label: "Notificações push", desc: "Alertas em tempo real no navegador" }
] as const;

type NotifKey = (typeof NOTIF_ITEMS)[number]["key"];

// ─── Component ───────────────────────────────────────────────────────────────

export default function EditProfilePage() {
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [savingNotifs, setSavingNotifs] = useState(false);

    const [notifications, setNotifications] = useState<Record<NotifKey, boolean>>({
        emailUpdates: true,
        pushNotifications: false,
    });
    const params = useParams();
    const userId = String(params?.id);

    const profileForm = useForm<ProfileValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: "",
            username: "",
            email: "",
            phone: "",
            location: "",
            timezone: "",
            country: "",
            state: "",  
            city: "", 
            language: "", 
            memberSince: undefined
        },
    });

    useEffect(() => {
        if (userId) {
            authApi.getById(userId.toString()).then((resp) => {
            if (resp) {
                const userData = resp as GetUserByIdResponse;
                profileForm.reset({
                    name: userData.completeName,
                    username: userData.userName,
                    email: userData.email,
                    phone: userData.phone || "",
                    country: userData.country,
                    state: userData.state,
                    city: userData.city,
                    language: String(userData.languageId),
                    timezone: userData.timeZone,
                    memberSince: new Date(userData.memberSince)
                });
            }
            });
        }
    }, []);

    const passwordForm = useForm<PasswordValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    });

    const newPwValue = passwordForm.watch("newPassword");
    const strength = getPasswordStrength(newPwValue);

    const watchedCountry = profileForm.watch("country");
    const watchedState = profileForm.watch("state");

    const countriesAvailable = [
        { nome: "Brasil", isoCode: "BR" },
        { nome: "Estados Unidos", isoCode: "US" }
    ];

    const states = watchedCountry ? State.getStatesOfCountry(watchedCountry) : [];
    const cities = (watchedCountry && watchedState)
        ? City.getCitiesOfState(watchedCountry, watchedState)
        : [];

    async function onProfileSubmit(data: ProfileValues) {
        setSavingProfile(true);

        const request: UpdateUserRequest = {
            name: data.name,
            userName: data.username,
            email: data.email,
            phone: data.phone,
            state: data.state,
            country: data.country,
            city: data.city,
            language: Number(data.language),
            timezone: data.timezone
        };

        try {
            userApi.updateUser(userId, request).then(() => {
                setSavingProfile(false);
                ToastSuccess("Perfil atualizado com sucesso!");
            })
        }
        catch {
            setSavingProfile(false);
            ToastError("Erro ao atualizar perfil. Tente novamente.");
        }
    }

    async function onPasswordSubmit(data: PasswordValues) {
        setSavingPassword(true);
        await new Promise((r) => setTimeout(r, 1200));
        console.log("Dados da Senha:", data);
        setSavingPassword(false);
        passwordForm.reset();
        toast.success("Senha alterada com sucesso!");
    }

    async function onSaveNotifs() {
        setSavingNotifs(true);
        await new Promise((r) => setTimeout(r, 900));
        setSavingNotifs(false);
        toast.success("Notificações salvas!");
    }

    const EyeToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground"
            onClick={onToggle}
        >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
    );

    const Spinner = () => (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
    );

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Topbar */}
            <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                <div className="mx-auto max-w-3xl flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link href="/"><ArrowLeft className="h-4 w-4" /></Link>
                        </Button>
                        <div className="leading-tight">
                            <p className="text-sm font-medium">Editar perfil</p>
                            <p className="text-xs text-muted-foreground">Gerencie suas informações</p>
                        </div>
                    </div>
                    <Badge variant="secondary" className="hidden gap-1.5 sm:flex text-xs font-normal">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        Conta verificada
                    </Badge>
                </div>
            </div>

            <div className="mx-auto max-w-3xl px-4 py-8 space-y-5">
                {/* Hero card */}
                <Card className="shadow-none">
                    {/* ... (Hero card content permenece igual) ... */}
                    <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                            <div className="relative shrink-0">
                                <Avatar className="h-20 w-20 border-4 border-background ring-1 ring-border">
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback className="text-xl font-medium bg-blue-50 text-blue-700">MO</AvatarFallback>
                                </Avatar>
                                <Button size="icon" className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full shadow-md">
                                    <Camera className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                            <div className="text-center sm:text-left space-y-0.5">
                                <p className="font-medium text-base">{profileForm.getValues().name}</p>
                                <p className="text-sm text-muted-foreground">@{profileForm.getValues().username}</p>
                                <p className="text-xs text-muted-foreground/70">Membro desde {profileForm.getValues().memberSince?.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                                <div className="flex gap-2 pt-2 justify-center sm:justify-start">
                                    <Button variant="outline" size="sm" className="h-7 text-xs px-3">Alterar foto</Button>
                                    <Button variant="ghost" size="sm" className="h-7 text-xs px-3 text-destructive hover:text-destructive hover:bg-destructive/10">Remover</Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="profile">
                    <TabsList className="h-9 w-full rounded-lg p-1">
                        <TabsTrigger value="profile" className="flex-1 gap-1.5 text-xs cursor-pointer">
                            <User className="h-3.5 w-3.5" /> Perfil
                        </TabsTrigger>
                        <TabsTrigger value="security" className="flex-1 gap-1.5 text-xs cursor-pointer">
                            <Lock className="h-3.5 w-3.5" /> Segurança
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="flex-1 gap-1.5 text-xs cursor-pointer">
                            <Bell className="h-3.5 w-3.5" /> Notificações
                        </TabsTrigger>
                    </TabsList>

                    {/* ── Perfil ── */}
                    <TabsContent value="profile" className="mt-5 space-y-4">
                        <Form {...profileForm}>
                            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                                <Card className="shadow-none">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <User className="h-3.5 w-3.5 text-muted-foreground" /> Informações pessoais
                                        </CardTitle>
                                        <CardDescription className="text-xs">Dados visíveis no seu perfil público</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            <FormField control={profileForm.control} name="name" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Nome completo</FormLabel>
                                                    <FormControl>
                                                        <Input className="h-8 text-sm" placeholder="Seu nome" {...field} />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )} />
                                            <FormField control={profileForm.control} name="username" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Username</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">@</span>
                                                            <Input className="h-8 text-sm pl-6" placeholder="username" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-none">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Contato &amp; localização
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            <FormField control={profileForm.control} name="email" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">E-mail</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                            <Input className="h-8 text-sm pl-9" type="email" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )} />
                                            <FormField control={profileForm.control} name="phone" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Telefone</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                                            <Input className="h-8 text-sm pl-9" placeholder="(00) 00000-0000" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            )} />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* PAÍS */}
                                            <FormField
                                                control={profileForm.control}
                                                name="country"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">País</FormLabel>
                                                        <Select
                                                            onValueChange={(value) => {
                                                                field.onChange(value);
                                                                // Reseta estado e cidade ao trocar de país
                                                                profileForm.setValue("state", "");
                                                                profileForm.setValue("city", "");
                                                            }}
                                                            value={field.value || ""}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="w-full h-8 text-sm">
                                                                    <SelectValue placeholder="Selecione o país..." />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {countriesAvailable.map((pais) => (
                                                                    <SelectItem key={pais.isoCode} value={pais.isoCode}>
                                                                        {pais.nome}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage className="text-xs" />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* ESTADO */}
                                            <FormField
                                                control={profileForm.control}
                                                name="state"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Estado</FormLabel>
                                                        <Select
                                                            key={watchedCountry}
                                                            onValueChange={(value) => {
                                                                field.onChange(value);
                                                                // Reseta a cidade ao trocar de estado
                                                                profileForm.setValue("city", "");
                                                            }}
                                                            value={field.value || ""}
                                                            disabled={!watchedCountry || states.length === 0}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="w-full h-8 text-sm">
                                                                    <SelectValue placeholder="Selecione o estado..." />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {states.map((estado) => (
                                                                    <SelectItem key={estado.isoCode} value={estado.isoCode}>
                                                                        {estado.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage className="text-xs" />
                                                    </FormItem>
                                                )}
                                            />

                                            {/* CIDADE */}
                                            <FormField
                                                control={profileForm.control}
                                                name="city"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Cidade</FormLabel>
                                                        <Select
                                                            key={watchedState}
                                                            onValueChange={field.onChange}
                                                            value={field.value || ""}
                                                            disabled={!watchedState || cities.length === 0}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="w-full h-8 text-sm">
                                                                    <SelectValue placeholder="Selecione a cidade..." />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {cities.map((cidade) => (
                                                                    <SelectItem key={cidade.name} value={cidade.name}>
                                                                        {cidade.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage className="text-xs" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-none">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <Globe className="h-3.5 w-3.5 text-muted-foreground" /> Preferências regionais
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            <FormField
                                                control={profileForm.control}
                                                name="language"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Idioma</FormLabel>
                                                        <Select
                                                            onValueChange={(value) => field.onChange(value)}
                                                            value={field.value?.toString() || ""}
                                                            defaultValue={field.value?.toString()}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="h-8 text-sm">
                                                                    <SelectValue placeholder="Selecione um idioma" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="1">🇧🇷 Português</SelectItem>
                                                                <SelectItem value="2">🇺🇸 Inglês</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage className="text-xs" />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={profileForm.control}
                                                name="timezone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Fuso horário</FormLabel>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            value={field.value?.toString() || ""}
                                                            defaultValue={field.value?.toString()}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="h-8 text-sm">
                                                                    <SelectValue placeholder="Selecione um fuso horário" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {timezones.map((tz) => (
                                                                    <SelectItem key={tz.value} value={tz.value}>
                                                                        {tz.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage className="text-xs" />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex justify-end gap-2">
                                    <ButtonCustom variant="outline" size="sm" className="bg-white text-gray-800" onClick={() => profileForm.reset()}>Cancelar</ButtonCustom>                                    
                                    <ButtonCustom isSubmit size="sm" disabled={savingProfile}>
                                        {savingProfile ? <><Spinner /> Salvando...</> : <><Save className="h-3.5 w-3.5" /> Salvar alterações</>}
                                    </ButtonCustom>
                                </div>
                            </form>
                        </Form>
                    </TabsContent>

                    {/* ── Segurança ── */}
                    {/* ... (Segurança e Notificações permanecem iguais) ... */}
                    <TabsContent value="security" className="mt-5 space-y-4">
                        <Form {...passwordForm}>
                            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                                <Card className="shadow-none">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Alterar senha
                                        </CardTitle>
                                        <CardDescription className="text-xs">Use ao menos 8 caracteres, uma maiúscula e um número</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Senha atual</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input className="h-8 text-sm pr-10" type={showCurrentPw ? "text" : "password"} placeholder="••••••••" {...field} />
                                                        <EyeToggle show={showCurrentPw} onToggle={() => setShowCurrentPw(!showCurrentPw)} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )} />
                                        <Separator />
                                        <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Nova senha</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input className="h-8 text-sm pr-10" type={showNewPw ? "text" : "password"} placeholder="••••••••" {...field} />
                                                        <EyeToggle show={showNewPw} onToggle={() => setShowNewPw(!showNewPw)} />
                                                    </div>
                                                </FormControl>
                                                {newPwValue && (
                                                    <div className="space-y-1 pt-1">
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4].map((i) => (
                                                                <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-200 ${i <= strength.score ? strength.color : "bg-muted"}`} />
                                                            ))}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">{strength.label}</p>
                                                    </div>
                                                )}
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )} />
                                        <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Confirmar nova senha</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input className="h-8 text-sm pr-10" type={showConfirmPw ? "text" : "password"} placeholder="••••••••" {...field} />
                                                        <EyeToggle show={showConfirmPw} onToggle={() => setShowConfirmPw(!showConfirmPw)} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )} />
                                    </CardContent>
                                </Card>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => passwordForm.reset()}>Cancelar</Button>
                                    <Button type="submit" size="sm" disabled={savingPassword}>
                                        {savingPassword ? <><Spinner /> Alterando...</> : <><Lock className="h-3.5 w-3.5" /> Alterar senha</>}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </TabsContent>

                    {/* ── Notificações ── */}
                    <TabsContent value="notifications" className="mt-5 space-y-4">
                        <Card className="shadow-none">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Bell className="h-3.5 w-3.5 text-muted-foreground" /> Preferências de notificação
                                </CardTitle>
                                <CardDescription className="text-xs">Escolha como e quando deseja ser notificado</CardDescription>
                            </CardHeader>
                            <CardContent className="divide-y">
                                {NOTIF_ITEMS.map(({ key, label, desc }) => (
                                    <div key={key} className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="text-sm font-medium">{label}</p>
                                            <p className="text-xs text-muted-foreground">{desc}</p>
                                        </div>
                                        <Switch
                                            checked={notifications[key]}
                                            onCheckedChange={(v) => setNotifications((prev) => ({ ...prev, [key]: v }))}
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => toast("Alterações descartadas")}>Cancelar</Button>
                            <Button size="sm" onClick={onSaveNotifs} disabled={savingNotifs}>
                                {savingNotifs ? <><Spinner /> Salvando...</> : <><Save className="h-3.5 w-3.5" /> Salvar preferências</>}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

const timezones = [
    // Fusos do Brasil
    { value: "America/Noronha", label: "Fernando de Noronha (UTC-2)" },
    { value: "America/Sao_Paulo", label: "São Paulo, Brasília (UTC-3)" },
    { value: "America/Manaus", label: "Manaus, Cuiabá (UTC-4)" },
    { value: "America/Rio_Branco", label: "Rio Branco (UTC-5)" },

    // Fusos Globais Principais
    { value: "Pacific/Midway", label: "Midway Island (UTC-11)" },
    { value: "Pacific/Honolulu", label: "Havaí (UTC-10)" },
    { value: "America/Anchorage", label: "Alasca (UTC-9)" },
    { value: "America/Los_Angeles", label: "Pacífico (EUA/Canadá) (UTC-8)" },
    { value: "America/Denver", label: "Montanhas (EUA/Canadá) (UTC-7)" },
    { value: "America/Chicago", label: "Central (EUA/Canadá) (UTC-6)" },
    { value: "America/New_York", label: "Leste (EUA/Canadá) (UTC-5)" },
    { value: "America/Caracas", label: "Caracas (UTC-4)" },
    { value: "America/Halifax", label: "Atlântico (Canadá) (UTC-4)" },
    { value: "America/Buenos_Aires", label: "Buenos Aires (UTC-3)" },
    { value: "Atlantic/Azores", label: "Açores (UTC-1)" },
];