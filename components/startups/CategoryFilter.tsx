import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useCategories } from '@/hooks/useStartups';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
}

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  const { data: categories = [] } = useCategories();

  return (
    <ScrollArea className="w-full whitespace-nowrap overflow-x-auto">
      <div className="flex gap-2 pb-2 min-w-max">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectCategory(null)}
          className={cn(
            "flex-shrink-0 rounded-full",
            selectedCategory === null && "bg-primary text-primary-foreground"
          )}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.slug ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectCategory(category.slug)}
            className={cn(
              "flex-shrink-0 rounded-full",
              selectedCategory === category.slug && "bg-primary text-primary-foreground"
            )}
          >
            {category.name}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
