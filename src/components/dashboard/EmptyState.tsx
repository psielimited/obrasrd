import { type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: ReactNode;
}

const EmptyState = ({ title, description, icon: Icon, action }: EmptyStateProps) => {
  return (
    <Card className="bg-slate-900 border-slate-800 rounded-2xl">
      <CardContent className="p-8 text-center">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
          <Icon className="h-5 w-5 text-slate-300" />
        </div>
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
        <p className="text-sm text-slate-400 mt-2">{description}</p>
        {action && <div className="mt-5">{action}</div>}
      </CardContent>
    </Card>
  );
};

export default EmptyState;
