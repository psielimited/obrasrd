import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}

const SectionCard = ({ title, description, right, children, className }: SectionCardProps) => {
  return (
    <Card className={cn("bg-slate-900 border-slate-800 rounded-2xl shadow-lg", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg text-slate-100">{title}</CardTitle>
            {description && <CardDescription className="text-slate-400 mt-1">{description}</CardDescription>}
          </div>
          {right}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default SectionCard;
