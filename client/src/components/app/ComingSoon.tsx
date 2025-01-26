import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

interface ComingSoonProps {
  title?: string;
  message?: string;
  className?: string;
}

const ComingSoon = ({
  title = "Coming Soon",
  message = "This feature is currently under development.",
  className
}: ComingSoonProps) => {
  const navigate = useNavigate();

  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[50vh] gap-4", className)}>
              <div className="mt-4 flex gap-2">
        <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="h-2 w-2 bg-primary/70 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="h-2 w-2 bg-primary/30 rounded-full animate-bounce" />
      </div>
      <div className="relative">
        
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary rounded-lg blur opacity-25" />
        <h1 className="relative text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          {title}
        </h1>
      </div>
      <p className="text-muted-foreground text-lg max-w-md text-center">
        {message}
      </p>

      <div className="flex gap-4 mt-2">
        <Button onClick={() => navigate(-1)} variant="outline">
          Go Back
        </Button>
        <Button onClick={() => navigate('/')}>Home</Button>
      </div>
    </div>
  );
};

export default ComingSoon; 