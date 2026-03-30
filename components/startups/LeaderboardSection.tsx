import { useLeaderboard, useCategories } from '@/hooks/useStartups';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function LeaderboardSection() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: categories = [] } = useCategories();
  const { data: overallWinners = [], isLoading: loadingOverall } = useLeaderboard(period);
  const { data: categoryWinners = [], isLoading: loadingCategory } = useLeaderboard(period);

  // Filter category winners if a category is selected
  const filteredCategoryWinners = selectedCategory
    ? categoryWinners.filter(s => s.category?.slug === selectedCategory)
    : categoryWinners;

  return (
    <section className="w-full mt-12">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="font-display text-xl font-bold sm:text-2xl">Leaderboard</h2>
        <select
          value={period}
          onChange={e => setPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      <div className="mb-6 flex gap-2 items-center">
        <span className="font-semibold">Category:</span>
        <Badge
          variant={selectedCategory === null ? 'default' : 'outline'}
          onClick={() => setSelectedCategory(null)}
          className="cursor-pointer"
        >
          All
        </Badge>
        {categories.map(category => (
          <Badge
            key={category.id}
            variant={selectedCategory === category.slug ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category.slug)}
            className="cursor-pointer"
          >
            {category.name}
          </Badge>
        ))}
      </div>
      <Card className="mb-8">
        <CardContent>
          <h3 className="font-semibold mb-2">Overall Winners</h3>
          {loadingOverall ? (
            <div>Loading...</div>
          ) : overallWinners.length === 0 ? (
            <div>No winners yet.</div>
          ) : (
            <ul className="space-y-2">
              {overallWinners.map((startup, i) => (
                <li key={startup.id} className="flex items-center gap-2">
                  <span className="font-bold">#{i + 1}</span>
                  <span>{startup.name}</span>
                  <Badge variant="secondary">{startup.category?.name}</Badge>
                  <span className="text-xs text-muted-foreground">Upvotes: {startup.upvote_count}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <h3 className="font-semibold mb-2">Category Winners</h3>
          {loadingCategory ? (
            <div>Loading...</div>
          ) : filteredCategoryWinners.length === 0 ? (
            <div>No category winners yet.</div>
          ) : (
            <ul className="space-y-2">
              {filteredCategoryWinners.map((startup, i) => (
                <li key={startup.id} className="flex items-center gap-2">
                  <span className="font-bold">#{i + 1}</span>
                  <span>{startup.name}</span>
                  <Badge variant="secondary">{startup.category?.name}</Badge>
                  <span className="text-xs text-muted-foreground">Upvotes: {startup.upvote_count}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
