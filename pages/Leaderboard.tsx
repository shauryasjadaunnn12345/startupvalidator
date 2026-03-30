import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { StartupCard } from '@/components/startups/StartupCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useLeaderboard, useCategories } from '@/hooks/useStartups';
import { Trophy, Rocket, Instagram, Github, Linkedin, Mail, Shield, Users, Zap } from 'lucide-react';

// ✅ FOOTER COMPONENT (Consistent with other pages)
function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/40 py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Rocket className="h-6 w-6 text-primary" />
              <span className="font-display font-bold text-lg">Startup Validator</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The #1 Indian platform to validate startup ideas, find beta testers, and discover funding.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Discover</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Startup Directory</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">Startup Blog</Link></li>
              <li><Link to="/submit" className="hover:text-primary transition-colors">Submit Startup</Link></li>
              <li><Link to="/funding" className="hover:text-primary transition-colors">Funding Directory</Link></li>
              <li><Link to="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/checklist" className="hover:text-primary transition-colors">SaaS Product Launch Checklist</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/startupvalidator/" rel="me" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://github.com/shauryasjadaunnn12345" rel="me" className="text-muted-foreground hover:text-primary transition-colors" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/startupvalidator/" rel="me" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="mailto:startupvliadator@zohomail.in" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Email">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Startup Validator. All rights reserved.</p>
          <p className="mt-2 flex items-center justify-center gap-1">
            Built for Indian founders, beta testing, and startup validation
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Leaderboard() {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Sync State with URL (Defaults to 'weekly' and 'null')
  const period = (searchParams.get('period') as 'daily' | 'weekly' | 'monthly') || 'weekly';
  const selectedCategory = searchParams.get('category') || null;

  const { data: categories = [] } = useCategories();
  const { data: leaderboardRaw = [], isLoading } = useLeaderboard(period, selectedCategory);

  // Prepare dynamic text
  const categoryName = selectedCategory 
    ? categories.find(c => c.slug === selectedCategory)?.name 
    : "All Startups";
  
  const timeText = period === 'daily' ? "Today" : period === 'weekly' ? "This Week" : "This Month";

  // URL Handlers
  const setPeriod = (newPeriod: string) => {
    searchParams.set('period', newPeriod);
    setSearchParams(searchParams);
  };

  const setSelectedCategory = (slug: string | null) => {
    if (slug) {
      searchParams.set('category', slug);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  // ✅ SEO: INDIA-FOCUSED KEYWORD INJECTION
  useEffect(() => {
    // Title Strategy: Focus on "Top Rated", "India", "Directory"
    document.title = `Top Rated Startups in India ${timeText} | ${categoryName} Leaderboard`;

    const updateMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.name = name;
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Description Strategy: Long-tail, intent-rich
    updateMeta(
      "description", 
      `Discover the highest-rated and trending Indian startups in ${categoryName} for ${timeText.toLowerCase()}. Our community-driven leaderboard highlights the best SaaS and tech products in India based on real founder validation.`
    );
    
    // Keywords Strategy: Low competition phrases
    updateMeta("keywords", [
      "best SaaS startups India", 
      "top rated startups India", 
      "trending Indian tech startups", 
      "startup directory India", 
      "most popular startups India this week", 
      "validated startup ideas India",
      `top ${categoryName.toLowerCase()} startups India`,
      "community-driven startup ranking India"
    ].join(", "));

    // Canonical Logic
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    
    let canonicalUrl = "https://startupvalidator.in/leaderboard";
    if (selectedCategory) canonicalUrl += `?category=${selectedCategory}`;
    if (period !== 'weekly') canonicalUrl += `${selectedCategory ? '&' : '?'}period=${period}`;
    canonical.setAttribute('href', canonicalUrl);

    // Schema: ItemList + BreadcrumbList
    const schemaId = "leaderboard-schema";
    let schemaScript = document.getElementById(schemaId);
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = schemaId;
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }
    
    const leaderboardSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": `${categoryName} Leaderboard India - ${timeText}`,
      "description": `Community-ranked list of the best startups in India for ${categoryName} ${timeText.toLowerCase()}.`,
      "itemListElement": leaderboardRaw.slice(0, 10).map((startup, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": startup.name,
        "url": `https://startupvalidator.in/startup/${startup.id}`
      }))
    };
    
    schemaScript.textContent = JSON.stringify(leaderboardSchema);

    // Breadcrumb Schema (Good for site structure)
    const breadcrumbId = "breadcrumb-schema";
    let breadcrumbScript = document.getElementById(breadcrumbId);
    if (!breadcrumbScript) {
      breadcrumbScript = document.createElement('script');
      breadcrumbScript.id = breadcrumbId;
      breadcrumbScript.type = 'application/ld+json';
      document.head.appendChild(breadcrumbScript);
    }

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://startupvalidator.in/" },
        { "@type": "ListItem", "position": 2, "name": "Leaderboard", "item": "https://startupvalidator.in/leaderboard" },
        { "@type": "ListItem", "position": 3, "name": `${categoryName} - ${timeText}`, "item": canonicalUrl }
      ]
    };
    breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema);

  }, [searchParams, categories, leaderboardRaw, categoryName, timeText]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 sm:py-12">
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary/40 shadow-lg">
            <Trophy className="h-9 w-9 text-primary-foreground" />
          </div>
          
          {/* ✅ SEMANTIC H1: India Focused */}
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Top Rated Startups in India <span className="text-primary">{timeText}</span>
          </h1>
          
          <p className="text-base text-muted-foreground leading-relaxed">
            Discover the most validated and trending startups in the Indian ecosystem. 
            Rankings are updated daily based on community engagement and founder feedback.
          </p>
        </div>

        <div className="mx-auto w-full max-w-5xl">
          <Tabs value={period} onValueChange={setPeriod}>
            {/* Tabs with SEO-friendly Links */}
            <TabsList className="flex w-full justify-center gap-2 mb-8">
              <Link to={`?period=daily${selectedCategory ? `&category=${selectedCategory}` : ''}`}>
                 <TabsTrigger value="daily" className="w-full">Today</TabsTrigger>
              </Link>
              <Link to={`?period=weekly${selectedCategory ? `&category=${selectedCategory}` : ''}`}>
                 <TabsTrigger value="weekly" className="w-full">This Week</TabsTrigger>
              </Link>
              <Link to={`?period=monthly${selectedCategory ? `&category=${selectedCategory}` : ''}`}>
                 <TabsTrigger value="monthly" className="w-full">This Month</TabsTrigger>
              </Link>
            </TabsList>
            
            <TabsContent value={period} className="mt-0">
              {/* Category Filters */}
              <div className="mb-8 flex flex-wrap justify-center gap-2 items-center">
                <span className="font-semibold text-sm">Sector:</span>
                <Link
                  to={`?period=${period}`}
                  className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                    !selectedCategory 
                      ? 'bg-primary text-white border-primary shadow-sm' 
                      : 'bg-background text-foreground border-muted hover:bg-muted hover:border-primary/50'
                  }`}
                >
                  All Sectors
                </Link>
                {categories.map(category => (
                  <Link
                    key={category.id}
                    to={`?period=${period}&category=${category.slug}`}
                    className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                      selectedCategory === category.slug 
                        ? 'bg-primary text-white border-primary shadow-sm' 
                        : 'bg-background text-foreground border-muted hover:bg-muted hover:border-primary/50'
                    }`}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
              
              <h2 className="font-semibold mb-6 text-xl text-center text-muted-foreground uppercase tracking-wider text-xs">
                Top Winners
              </h2>
              
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                  ))}
                </div>
              ) : leaderboardRaw.length === 0 ? (
                <div className="rounded-lg border border-dashed p-12 text-center bg-muted/10">
                  <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 font-display text-lg font-semibold">No rankings yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Be the first to engage and climb the ranks in the Indian startup community.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {leaderboardRaw.map((startup, index) => (
                    <StartupCard 
                      key={startup.id} 
                      startup={startup} 
                      rank={index + 1}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* ✅ SEO CONTENT BLOCK: INDIA FOCUSED CONTEXT */}
        {/* This section targets long-tail keywords naturally */}
        <section className="mt-20 max-w-4xl mx-auto border-t pt-12">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold mb-2">Why Trust Our Startup Leaderboard?</h2>
            <p className="text-muted-foreground">
              We track the pulse of the Indian startup ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-muted/30 p-6 rounded-lg text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-bold mb-2">Founder Validated</h3>
              <p className="text-sm text-muted-foreground">
                Rankings are driven by real feedback from Indian founders and beta testers, not just bots.
              </p>
            </div>
            <div className="bg-muted/30 p-6 rounded-lg text-center">
              <Zap className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-bold mb-2">Real-Time Updates</h3>
              <p className="text-sm text-muted-foreground">
                Our "Trending" algorithm identifies the hottest SaaS products in India right now, updated daily.
              </p>
            </div>
            <div className="bg-muted/30 p-6 rounded-lg text-center">
              <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-bold mb-2">Curated Quality</h3>
              <p className="text-sm text-muted-foreground">
                We filter out spam to ensure you only discover legitimate, high-potential Indian startups.
              </p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-muted-foreground text-center">
            <p className="mb-4">
              Whether you are looking for the <strong>best SaaS startups in India</strong>, exploring 
              <strong> early-stage product launches</strong>, or seeking inspiration for your own venture, 
              our leaderboard serves as the premier directory for the Indian market.
            </p>
            <p>
              Explore categories ranging from <strong>Fintech</strong> and <strong>Healthtech</strong> to 
              <strong>AI & ML</strong>. Join the community to validate ideas, get your first 100 users, 
              and see your startup rise to the top of the rankings.
            </p>
          </div>
        </section>

      </div>
      
      <Footer />

    </Layout>
  );
}