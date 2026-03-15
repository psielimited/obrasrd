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
      <Card className={cn("bg-slate-900 border-slate-800 rounded-2xl hover:border-slate-700 transition-colors", className)}>
        <CardContent className="p-4 flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
              {icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">{title}</p>
              <p className="text-xs text-slate-400 mt-0.5">{description}</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-500" />
        </CardContent>
      </Card>
    </Link>
  );
};

export default QuickActionCard;
