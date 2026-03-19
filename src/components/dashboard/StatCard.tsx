import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}

const StatCard = ({ title, value, hint, icon: Icon }: StatCardProps) => {
  return (
    <Card className="rounded-2xl border-border bg-card shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="label-upper">{title}</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted">
            <Icon className="h-5 w-5 text-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
