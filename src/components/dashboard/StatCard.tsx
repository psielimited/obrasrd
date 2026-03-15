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
    <Card className="bg-slate-900 border-slate-800 rounded-2xl shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-100 mt-2">{value}</p>
            {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
            <Icon className="h-5 w-5 text-slate-200" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
