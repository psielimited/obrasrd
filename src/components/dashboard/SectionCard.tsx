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
    <Card className={cn("rounded-2xl border-border bg-card shadow-sm", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg text-foreground">{title}</CardTitle>
            {description && <CardDescription className="mt-1 text-muted-foreground">{description}</CardDescription>}
          </div>
          {right}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default SectionCard;
