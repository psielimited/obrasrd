import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
  to: string;
  title: string;
  description: string;
  icon: ReactNode;
  className?: string;
}

const QuickActionCard = ({ to, title, description, icon, className }: QuickActionCardProps) => {
  return (
    <Link to={to} className="block">
      <Card className={cn("rounded-2xl border-border bg-card transition-colors hover:bg-muted/40", className)}>
        <CardContent className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted text-foreground">
              {icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
};

export default QuickActionCard;
