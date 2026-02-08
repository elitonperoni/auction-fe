import { Spinner } from "../ui/spinner";

export default function LoadingSpinner() {
    return (<div className="flex flex-col h-screen w-full items-center justify-center gap-4">
        <Spinner className="size-8" />
        <div className="text-center animate-pulse text-lg font-medium text-gray-600">
            Carregando...
        </div>
    </div>)
}