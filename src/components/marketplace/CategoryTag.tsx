import { Badge } from "@/components/ui/badge";
import { getCategoryTheme } from "@/lib/category-theme";
import { cn } from "@/lib/utils";

interface CategoryTagProps {
  categorySlug?: string;
  categoryName?: string;
  className?: string;
}

const CategoryTag = ({ categorySlug, categoryName, className }: CategoryTagProps) => {
  const theme = getCategoryTheme(categorySlug);
  const label = categoryName || theme.label;

  return (
    <Badge variant="outline" className={cn("text-xs font-semibold px-2.5 py-1", theme.pillClassName, className)}>
      {label}
    </Badge>
  );
};

export default CategoryTag;
