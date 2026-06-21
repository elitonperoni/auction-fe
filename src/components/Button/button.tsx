import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";

interface ButtonProps {
    readonly children: React.ReactNode;
    readonly variant?: "default" | "outline" | "ghost" | "link";
    readonly isLoading?: boolean;
    readonly disabled?: boolean;
    readonly isSubmit?: boolean;
    readonly className?: string;
    readonly size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";
    readonly onClick?: (e : any) => void;
}   

export default function ButtonCustom({ 
    children, 
    variant,
    isLoading, 
    disabled,
    isSubmit,
    className,
    size,
    onClick, 
}
: ButtonProps) {

  return (
    <Button           
        variant={variant ?? "default"}
        type={isSubmit ? "submit" : "button"} 
        onClick={onClick}
        size={size ?? "default"}
        disabled={isLoading || disabled}                
        className={`cursor-pointer ${className ?? "bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 text-sm"}`}        
        >
      {isLoading 
        ? <Loader2 className="animate-spin size-4" /> 
    : children}
    </Button>
  );
}
