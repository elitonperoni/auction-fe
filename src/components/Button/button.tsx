import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";

interface ButtonProps {
    readonly children: React.ReactNode;
    readonly variant?: "default" | "outline" | "ghost" | "link";
    readonly isLoading?: boolean;
    readonly disabled?: boolean;
    readonly isSubmit?: boolean;
    readonly className?: string;
    readonly onClick?: (e : any) => void;
}   

export default function ButtonCustom({ 
    children, 
    variant,
    isLoading, 
    disabled,
    isSubmit,
    className,
    onClick, 
}
: ButtonProps) {
  return (
    <Button           
        variant={variant ?? "default"}
        type={isSubmit ? "submit" : "button"} 
        onClick={onClick}
        disabled={isLoading || disabled}                
        className={`cursor-pointer ${className ?? "w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 text-lg"}`}        
        >
      {isLoading 
        ? <Loader2 className="animate-spin size-4" /> 
    : children}
    </Button>
  );
}
