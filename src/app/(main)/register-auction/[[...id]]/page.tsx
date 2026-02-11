"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, UploadCloud, X } from "lucide-react";
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ToastSuccess from "@/src/components/Toast/toastNotificationSuccess";
import { auctionApi } from "@/src/api";
import { useParams, useRouter } from "next/navigation";
import ButtonCustom from "@/src/components/Button/button";
import { RoutesScreenPaths } from "@/src/utils/routesPaths";
import LoadingSpinner from "@/src/components/Loading/loadingSpinner";


export default function CreateAuctionForm() {
  const [originalPhotos, setOriginalPhotos] = useState<string[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const params = useParams();
  const auctionId = params?.id;
  const isEditing = !!auctionId;

  const formSchema = z.object({
    title: z.string().min(5, "O título deve ter pelo menos 5 caracteres"),
    description: z
      .string()
      .min(20, "Descreva melhor o produto (mín. 20 caracteres)"),
    initialValue: z
      .string()
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "O valor inicial deve ser maior que zero",
      }),
    endDate: z.date({
      required_error: "A data de término é obrigatória",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      initialValue: "",
    },
  });

  useEffect(() => {
    if (isEditing) {
      getDetail();
    }
  }, [])

  async function getDetail() {
    setLoading(true);
    await auctionApi.getRegisterDetail(String(auctionId))
      .then((resp) => {
        form.setValue("title", resp.title)
        form.setValue("description", resp.description)
        form.setValue("initialValue", Number(resp.initialValue).toString())
        form.setValue("endDate", new Date(resp.endDate))
        if (resp.photos) {
          setOriginalPhotos(resp.photos);
        }
        setLoading(false);
      })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewImages((prev) => [...prev, ...filesArray]);

      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      const urlToRemove = originalPhotos[index];
      setImagesToRemove(prev => [...prev, urlToRemove]);
      setOriginalPhotos(prev => prev.filter((_, i) => i !== index));
    } else {
      setNewImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const formData = new FormData();

    if (isEditing)
      formData.append("Id", String(auctionId));

    formData.append("Title", values.title);
    formData.append("Description", values.description);
    formData.append("StartingPrice", Number(values.initialValue).toString());
    formData.append("EndDate", values.endDate.toISOString());

    if (newImages && newImages.length > 0) {
      newImages.forEach((file) => {
        formData.append("NewImages", file);
      });
    }

    imagesToRemove.forEach(url => formData.append("ImagesToRemove", url));

    setLoading(true);
    auctionApi.create(formData).then((response) => {
      if (isEditing)
        ToastSuccess("Leilão editado com sucesso!");
      else
        ToastSuccess("Leilão criado com sucesso!");

      setLoading(false);
      router.push(RoutesScreenPaths.AUCTION_DETAIL(response));
    });
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{isEditing ? "Editar leilão" : "Criar leilão"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: MacBook Pro 2023 M3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição Detalhada</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Conte detalhes sobre o estado do produto, acessórios, etc."
                        className="resize-none h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="initialValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lance Inicial (R$)</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isEditing}
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="mb-2">Término do Leilão</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            autoFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormLabel>Imagens do Produto</FormLabel>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors border-border">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Clique para subir fotos
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  </label>
                </div>

                {(
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-4">

                    {originalPhotos.map((url, index) => (
                      <div key={`old-${index}`} className="relative group aspect-square rounded-md overflow-hidden border">
                        <img src={url} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index, true)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {previews.map((url, index) => (
                      <div key={`new-${index}`} className="relative group aspect-square rounded-md overflow-hidden border">
                        <img src={url} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(index, false)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}

                  </div>
                )}
              </div>

              <ButtonCustom
                isLoading={loading}
                className="w-full mt-4"
                isSubmit
              >
                {isEditing ? "Salvar" : "Publicar"} Leilão
              </ButtonCustom>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
