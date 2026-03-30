import { useState, useMemo, useEffect } from 'react';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Layout } from '@/components/layout/Layout';
import { StartupCard } from '@/components/startups/StartupCard';
import { CategoryFilter } from '@/components/startups/CategoryFilter';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLiveStartups, useTodaysLaunches, type StartupSort } from '@/hooks/useStartups';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Rocket, TrendingUp, Calendar, Github, Twitter, Linkedin, Mail, Instagram, DollarSign } from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// ✅ 1. UPDATED STATIC SCHEMA (Added 'about' for Entity Recognition)
const seoSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Startup Validator",
  "alternateName": ["StartupValidator", "Startup Submit Tool"],
  "url": "https://startupvalidator.in",
  "description": "India's #1 platform to validate startup ideas, submit startups for free backlinks, and discover funding schemes including Startup India Seed Fund.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://startupvalidator.in/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  // ✅ 7. UPDATE JSON-LD: Signals what the site is 'About' to Google
  "about": [
    {
      "@type": "Thing",
      "name": "Startup Funding",
      "description": "Access to Indian government grants, angel investors, and incubators."
    },
    {
      "@type": "Thing",
      "name": "Startup Validation",
      "description": "Tools and community feedback to validate business ideas in the Indian market."
    },
    {
      "@type": "Thing",
      "name": "Startup Directory",
      "description": "A curated directory of Indian SaaS and tech startups for discovery and SEO."
    }
  ]
};

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
              {/* ✅ 3. ADD FUNDING TO FOOTER (SEO + UX) */}
              <li><Link to="/funding" className="hover:text-primary transition-colors">Funding Directory</Link></li>
              <li><Link to="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/checklist" className="hover:text-primary transition-colors">SaaS Launch Checklist</Link></li>
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

function TodaysLaunchesSection({ todaysLaunches, loading }: { todaysLaunches: any[], loading: boolean }) {
  if (todaysLaunches.length === 0 && !loading) return null;
  
  return (
    <section className="mb-8 sm:mb-12 w-full">
      <div className="mb-4 flex items-center gap-2 sm:mb-6">
        <Calendar className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
        <h2 className="font-display text-xl font-bold sm:text-2xl">Today's Launches</h2>
      </div>
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))
        ) : todaysLaunches.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Calendar className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              No launches today
            </p>
          </div>
        ) : (
          todaysLaunches.map((startup, index) => (
            <article key={startup.id}>
              <StartupCard startup={startup} rank={index + 1} />
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function AllStartupsSection({ 
  allStartups, 
  loading, 
  user, 
  sortBy 
}: { 
  allStartups: any[], 
  loading: boolean, 
  user: any,
  sortBy: StartupSort
}) {
  const getHeading = () => {
    switch (sortBy) {
      case 'trending': return 'Trending Startups';
      case 'new': return 'New Startups';
      case 'validated': return 'Most Validated Startups';
      case 'upvotes': return 'Most Upvoted Startups';
      default: return 'Discover Startups';
    }
  };

  return (
    <section className="w-full">
      <div className="mb-4 flex items-center gap-2 sm:mb-6">
        <TrendingUp className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
        <h2 className="font-display text-xl font-bold sm:text-2xl">{getHeading()}</h2>
      </div>
      
      <main className="space-y-4 w-full">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))
        ) : allStartups.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <Rocket className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-display text-lg font-semibold">No startups yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Be the first to add to our startup directory!
            </p>
            
            {/* ✅ 4. ADD FUNDING TO EMPTY STATE (SMART UX) */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <Link to="/checklist" className="hover:text-primary underline underline-offset-4">
                View SaaS Launch Checklist
              </Link>
              <span>•</span>
              <Link to="/leaderboard" className="hover:text-primary underline underline-offset-4">
                Top Startups
              </Link>
              <span>•</span>
              <Link to="/funding" className="hover:text-primary underline underline-offset-4">
                Explore Startup Funding
              </Link>
            </div>

            {user && (
              <Button className="mt-6" asChild>
                <Link to="/submit">Submit Startup</Link>
              </Button>
            )}
          </div>
        ) : (
          allStartups.map((startup) => (
            <article key={startup.id}>
              <StartupCard startup={startup} />
            </article>
          ))
        )}
      </main>
    </section>
  );
}

export default function Index() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<StartupSort>('trending');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  
  const { data: todaysLaunches = [], isLoading: loadingToday } = useTodaysLaunches();

  const { data: allStartupsRaw = [], isLoading: loadingAll } = 
    useLiveStartups(selectedCategory || undefined, sortBy);

  const processedData = useMemo(() => {
    let result = allStartupsRaw;
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(lowerTerm) || 
        s.tagline?.toLowerCase().includes(lowerTerm)
      );
    }
    const totalPages = Math.ceil(result.length / pageSize);
    const start = (page - 1) * pageSize;
    const paginated = result.slice(start, start + pageSize);
    return { paginated, totalPages };
  }, [allStartupsRaw, searchTerm, page, pageSize]);

  const { paginated: displayedStartups, totalPages } = processedData;

  useEffect(() => {
    setPage(1);
  }, [sortBy, selectedCategory]);

  const startupListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": displayedStartups.map((startup, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "SoftwareApplication",
        "name": startup.name,
        "description": startup.tagline || "New startup listed on Startup Validator",
        "applicationCategory": startup.category?.name || "SoftwareApplication", 
        "operatingSystem": "Web",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
      }
    }))
  };

  useEffect(() => {
    // ✅ 5. ON-PAGE SEO: INDIA-SPECIFIC TITLE & META
    
    // 1. Title: Targets "Indian Startup Submission Directory"
    document.title = "Startup Validator | India’s Top Startup Directory, Validation & Funding";

    const updateMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.name = name;
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const updateProperty = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const updateSchema = (id: string, schemaData: object) => {
      let element = document.getElementById(id);
      if (!element) {
        element = document.createElement('script');
        element.type = 'application/ld+json';
        element.id = id; 
        element.textContent = JSON.stringify(schemaData);
        document.head.appendChild(element);
      } else {
        element.textContent = JSON.stringify(schemaData);
      }
    };

    // 2. Description: Covers Validation, Funding, and Directory for India
    updateMeta("description", "Startup Validator helps Indian founders validate startup ideas, submit startups to directories, discover funding opportunities (grants & investors), and get early users. The best Product Hunt alternative for India.");

    // 3. Keywords: Injecting the 20 long-tail keywords
    updateMeta("keywords", "startup directories in India for free backlinks, how to validate startup ideas in India, best platforms to showcase Indian SaaS startups, free startup idea validation tool India, market validation checklist for Indian founders, Startup India Seed Fund Scheme application guide, incubators in India for early stage tech startups, pitch deck requirements for Indian angel investors, government grants for women entrepreneurs in India 2026, list my startup on Indian directories for SEO, how to test business viability in Indian market, startup listing sites for DPIIT recognized startups, where to get feedback on startup ideas India, alternative funding for bootstrapped startups India, startup idea validation framework for Indian students, best business listing sites in India for tech companies, how to find angel investors in Tier 2 cities India, proof of concept development for Indian startups, micro-SaaS startup ideas for Indian market 2026, startup equity calculator for Indian founders");

    // 4. Open Graph Updates
    updateProperty("og:title", "Startup Validator - Validate Ideas & Find Funding in India");
    updateProperty("og:description", "Don't build in the dark. Validate your idea, submit your startup, and find Indian government grants or angel investors.");
    updateProperty("og:image", "https://startupvalidator.in/og-image.jpg");
    updateProperty("og:url", "https://startupvalidator.in/");
    updateProperty("og:type", "website");

    // 5. Twitter Updates
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", "Startup Validator | India's Startup Directory & Funding Hub");
    updateMeta("twitter:description", "Validate ideas, get feedback, and discover startup funding schemes for Indian founders.");
    updateMeta("twitter:image", "https://startupvalidator.in/og-image.jpg");

    // 6. Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
    }
    canonical.href = "https://startupvalidator.in/";

    // 7. Schemas
    updateSchema("schema-website", seoSchema);
    updateSchema("schema-list", startupListSchema);

  }, [displayedStartups]); 

  return (
    <Layout>
      <ErrorBoundary>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-accent/50 to-background py-12 px-4 sm:py-16 md:py-24 w-full">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 w-full">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl break-words">
                <span className="text-primary">Startup Validator:</span>
                <br />
                Validate & Get Fundings  <span className="text-gradient">Faster</span>
              </h1>
              <p className="mt-3 text-base text-muted-foreground sm:text-lg md:mt-4 md:text-xl px-2">
                The premier Indian platform to validate startup ideas, get your first 100 users, and discover funding schemes like Startup India Seed Fund.
              </p>
              
              <div className="mt-6 flex flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:items-center sm:justify-center px-2">
                {user ? (
                  <>
                    <Button size="lg" asChild className="w-full sm:w-auto">
                      <Link to="/submit">
                        <Rocket className="mr-2 h-5 w-5" />
                        Submit Startup
                      </Link>
                    </Button>
                    {/* ✅ 2. ADD FUNDING BUTTON IN HERO (HIGH CONVERSION) */}
                    <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                      <Link to="/funding">
                        <DollarSign className="mr-2 h-5 w-5" />
                        Find Funding
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="lg" asChild className="w-full sm:w-auto">
                      <Link to="/signup">
                        <Rocket className="mr-2 h-5 w-5" />
                        Get Started
                      </Link>
                    </Button>
                    {/* ✅ 2. ADD FUNDING BUTTON IN HERO (NON-LOGGED IN) */}
                    <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                      <Link to="/funding">
                        <DollarSign className="mr-2 h-5 w-5" />
                        Explore Funding
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl pointer-events-none hidden md:block" />
          <div className="absolute -bottom-20 right-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl pointer-events-none hidden md:block" />
        </section>

        {/* Main Content Area */}
        <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl w-full">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CategoryFilter selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Search startups..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                className="border rounded px-3 py-2 text-sm w-48"
              />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as StartupSort)}
                className="border rounded px-2 py-2 text-sm"
              >
                <option value="trending">Trending</option>
                <option value="new">New</option>
                <option value="validated">Most Validated</option>
                <option value="upvotes">Most Upvoted</option>
              </select>
            </div>
          </div>
          
          <AllStartupsSection allStartups={displayedStartups} loading={loadingAll} user={user} sortBy={sortBy} />
          
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="?page=1" onClick={e => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }} disabled={page === 1} />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      href={`?page=${i + 1}`} 
                      isActive={page === i + 1} 
                      onClick={e => { e.preventDefault(); setPage(i + 1); }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext href={`?page=${totalPages}`} onClick={e => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)); }} disabled={page === totalPages} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}

          {/* ✅ 8. OPTIONAL: HOMEPAGE FUNDING TEASER */}
          <section className="mt-12 rounded-lg border bg-muted/30 p-6 sm:p-8 text-center">
            <div className="mx-auto max-w-2xl">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-bold sm:text-2xl">
                Looking for Startup Funding in India?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Discover grants, accelerators, and angel investors tailored for early-stage Indian founders. From DPIIT recognition to Seed Fund schemes.
              </p>
              <Button className="mt-6" asChild>
                <Link to="/funding">Explore Funding Opportunities</Link>
              </Button>
            </div>
          </section>
        </div>

        <Footer />
      </ErrorBoundary>
    </Layout>
  );
}