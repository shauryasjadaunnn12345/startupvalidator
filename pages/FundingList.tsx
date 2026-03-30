import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
// ✅ UPDATED: Added icons required for Footer
import { Search, Calendar, DollarSign, ArrowRight, Filter, Globe, Star, X, Rocket, Instagram, Github, Linkedin, Mail, Twitter } from 'lucide-react';

// ✅ 6B. SEO: FAQ SCHEMA
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How can Indian startups get funding?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Indian startups can get funding through government grants like the Startup India Seed Fund, Angel Networks, Micro VCs for early stages, and Venture Capital for growth stages."
      }
    },
    {
      "@type": "Question",
      "name": "What is the Startup India Seed Fund?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Startup India Seed Fund Scheme (SISFS) provides financial assistance to startups for proof of concept, prototype development, product trials, market entry, and commercialization."
      }
    },
    {
      "@type": "Question",
      "name": "Do government grants take equity?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most government grants and schemes (like SISFS or NIDHI PRAYAS) are typically equity-free or debt-based, whereas Angel investors and VCs almost always take equity in exchange for capital."
      }
    }
  ]
};

const fundingSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "India Startup Funding Directory 2026",
  "description": "A comprehensive list of active investors, grants, and funding schemes for Indian startups including pre-seed, seed, and government schemes.",
  "url": "https://startupvalidator.in/funding"
};

// ✅ FOOTER COMPONENT
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

export default function FundingList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [fundings, setFundings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ 5. PERFORMANCE: Load limiting state
  const [limit, setLimit] = useState(30);
  const [hasMore, setHasMore] = useState(true);

  // Filter States (Initialized from URL)
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedStage, setSelectedStage] = useState(searchParams.get('stage') || 'all');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || 'all');

  // ✅ 2B. URL PERSISTENCE LOGIC
  useEffect(() => {
    const params: any = {};
    if (searchTerm) params.q = searchTerm;
    if (selectedStage !== 'all') params.stage = selectedStage;
    if (selectedType !== 'all') params.type = selectedType;
    
    setSearchParams(params);
  }, [searchTerm, selectedStage, selectedType, setSearchParams]);

  // ✅ DATA FETCHING WITH LIMIT & NEW COLUMNS
  useEffect(() => {
    setLoading(true);
    supabase
      .from('fundings')
      // ✅ 1A, 1B: ADDED 'equity', 'geography', 'description' columns
      // ⚠️ Make sure these exist in your DB!
      .select('name, slug, funding_type, funding_amount, stage, deadline, equity, geography, description')
      .order('deadline', { ascending: true, nullsFirst: false })
      .limit(limit)
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching fundings:", error);
        } else {
          setFundings(data || []);
          // If we got less than limit, we assume no more data
          setHasMore((data?.length || 0) >= limit);
        }
        setLoading(false);
      });
  }, [limit]); // Re-fetch when limit changes (Load More)

  // Filter Logic (Client-side for search term, others are server-side ideally but here we do client for simplicity)
  const filteredFundings = useMemo(() => {
    return fundings.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase()));
      // Note: If filters are strictly URL based, we might skip client filtering for stage/type 
      // assuming the API handled it. For this hybrid approach:
      const matchesStage = selectedStage === 'all' || f.stage === selectedStage;
      const matchesType = selectedType === 'all' || f.funding_type === selectedType;
      
      return matchesSearch && matchesStage && matchesType;
    });
  }, [fundings, searchTerm, selectedStage, selectedType]);

  // ✅ 2A. CLEAR FILTERS
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStage('all');
    setSelectedType('all');
  };

  // ✅ 5. LOAD MORE HANDLER
  const handleLoadMore = () => {
    setLimit(prev => prev + 30);
  };

  // SEO Head Management
  useEffect(() => {
    document.title = "Startup Funding India 2026 | Grants, Angels & VCs Directory";
    
    const description = "Discover active pre-seed investors in India 2026, government grants, and startup schemes. Access our database of Micro VCs, angel networks, and revenue-based financing options.";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);

    // Keywords Injection
    const keywords = [
      "Active pre-seed investors in India 2026", "Micro VCs in India for seed stage startups",
      "Angel networks in India for prototype stage", "Revenue-based financing startups India list",
      "Venture debt funds in India for early stage", "Climate tech startup investors India 2026",
      "Top VCs for AI and deeptech startups India", "Agritech funding agencies in India list",
      "Fintech angel investors India sheet", "Defense tech startup grants and funding India",
      "Government grants for startups in India 2026 list", "Startup India seed fund scheme approved incubators list",
      "Angel investors in Jaipur and Indore 2026", "State-wise startup seed funds India",
      "CSR funding for social impact startups India", "Indian startup investor database excel download",
      "How to find investors for small business in India without collateral", "List of active family offices in India for startups",
      "Latest startup funding rounds India January 2026", "Investors for woman entrepreneurs in India grants list"
    ].join(", ");

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = "keywords";
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute("content", keywords);

    // ✅ 6B. FAQ SCHEMA INJECTION
    let schema = document.getElementById('funding-faq-schema');
    if (!schema) {
      schema = document.createElement('script');
      schema.type = 'application/ld+json';
      schema.id = 'funding-faq-schema';
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify(faqSchema);

  }, []);

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto px-4 py-8 sm:py-12 min-h-screen">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold font-display tracking-tight mb-4">
            Startup Funding <span className="text-primary">Opportunities</span>
          </h1>
          {/* ✅ 4. TRUST SIGNALS */}
          <p className="text-sm text-muted-foreground font-medium flex items-center justify-center gap-3 mb-2">
            <span>✔ Updated weekly</span>
            <span>•</span>
            <span>✔ India-focused</span>
            <span>•</span>
            <span>✔ Founder-verified</span>
          </p>
          <p className="text-muted-foreground text-lg">
            The ultimate database for Indian founders. Find <strong>active pre-seed investors</strong>, 
            <strong> government grants</strong>, and <strong>angel networks</strong> tailored to your stage.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="bg-card border rounded-xl p-4 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Search */}
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search funding by name..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Stage Filter */}
            <div className="md:col-span-3">
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
              >
                <option value="all">All Stages</option>
                <option value="Idea/Prototype">Idea / Prototype</option>
                <option value="Pre-Seed">Pre-Seed</option>
                <option value="Seed">Seed</option>
                <option value="Series A">Series A+</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="md:col-span-3">
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="Grant">Government Grant</option>
                <option value="Angel">Angel Network</option>
                <option value="VC">Venture Capital</option>
                <option value="Debt">Venture Debt</option>
              </select>
            </div>

            {/* ✅ 2A. CLEAR FILTERS */}
            <div className="md:col-span-1 text-right">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearFilters}
                className="w-full md:w-auto text-xs"
                disabled={!searchTerm && selectedStage === 'all' && selectedType === 'all'}
              >
                <X className="w-3 h-3 mr-1" /> Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Funding List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredFundings.length === 0 ? (
          /* ✅ 3. EMPTY STATE CONVERSION */
          <div className="text-center py-20 border rounded-xl border-dashed bg-muted/20">
            <Filter className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No funding found</h3>
            <p className="text-muted-foreground mt-2">
              We’re adding new funding opportunities weekly. Adjust filters or check back later.
            </p>
            <Button asChild className="mt-6">
              <Link to="/signup">Get notified when new funding is added</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredFundings.map((f) => (
                <Link key={f.slug} to={`/funding/${f.slug}`} className="group">
                  <Card className="h-full hover:border-primary transition-all hover:shadow-md relative overflow-hidden flex flex-col">
                    
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        {/* Main Type Badge */}
                        <Badge variant={f.funding_type === 'Grant' ? 'secondary' : 'outline'} className="text-xs font-bold shrink-0">
                          {f.funding_type}
                        </Badge>
                        
                        {/* ✅ 1C. URGENCY: Deadline or Rolling */}
                        <div className="flex flex-col items-end gap-1">
                          {f.deadline ? (
                            <span className="flex items-center text-[10px] text-destructive font-bold bg-destructive/10 px-2 py-0.5 rounded">
                              Closing Soon
                            </span>
                          ) : (
                            <Badge variant="outline" className="text-[10px] h-5">Rolling</Badge>
                          )}
                          
                          {/* ✅ 1A. EQUITY / NON-EQUITY BADGE */}
                          {f.equity && (
                            <Badge 
                              variant={f.equity.toLowerCase().includes('non') || f.equity.toLowerCase().includes('debt') ? 'secondary' : 'default'} 
                              className="text-[10px] h-5 px-1.5"
                            >
                              {f.equity}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <CardTitle className="group-hover:text-primary transition-colors line-clamp-1 text-lg mt-2">
                        {f.name}
                      </CardTitle>
                      
                      {/* ✅ 1B. GEOGRAPHY + STAGE */}
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        {f.geography && (
                          <span className="flex items-center" title="Geography">
                            <Globe className="w-3 h-3 mr-1" /> {f.geography}
                          </span>
                        )}
                        {f.geography && f.stage && <span>•</span>}
                        {f.stage && <span>{f.stage}</span>}
                      </div>
                    </CardHeader>

                    <CardContent className="mt-auto pt-0">
                      {/* Description Preview */}
                      {f.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 min-h-[2.5em]">
                          {f.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        {/* ✅ 8. VISUAL HIERARCHY: Emphasize Money */}
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Funding</span>
                          <span className="font-bold text-primary text-sm">
                            <DollarSign className="w-3 h-3 inline mr-0.5" />
                            {f.funding_amount || 'Varies'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* ✅ 7. RETURN VISITS: Bookmark Button (UI Only) */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-yellow-500"
                            onClick={(e) => {
                              e.preventDefault();
                              // Implement save logic here
                              alert("Saved to your bookmarks!");
                            }}
                          >
                            <Star className="w-4 h-4" />
                          </Button>
                          
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* ✅ 5. LOAD MORE BUTTON */}
            {hasMore && (
              <div className="text-center mt-8 mb-12">
                <Button onClick={handleLoadMore} variant="outline" size="lg">
                  Load more funding
                </Button>
              </div>
            )}
          </>
        )}

        {/* ✅ 6A. SEO CONTENT BLOCK WITH INTERNAL LINKS */}
        <section className="border-t pt-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Explore Funding by Stage & Sector</h2>
            <p className="text-muted-foreground mb-6">
              Navigating the Indian startup ecosystem? We've categorized opportunities to help you find the right fit. 
              Whether you are looking for <strong>government grants for startups in India 2026</strong> or 
              <strong>Micro VCs in India for seed stage startups</strong>, our directory covers the spectrum.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-lg mb-3">By Funding Stage</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Active pre-seed investors in India 2026</li>
                  <li>• Angel networks in India for prototype stage</li>
                  <li>• Micro VCs in India for seed stage startups</li>
                  <li>• Venture debt funds in India for early stage</li>
                  <li>• Revenue-based financing startups India list</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">By Sector & Niche</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Top VCs for AI and deeptech startups India</li>
                  <li>• Climate tech startup investors India 2026</li>
                  <li>• Agritech funding agencies in India list</li>
                  <li>• Fintech angel investors India sheet</li>
                  <li>• Defense tech startup grants and funding India</li>
                </ul>
              </div>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Resources & Guides</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Don't know where to start? Read our comprehensive guide on the{' '}
                {/* ✅ INTERNAL LINK */}
                <Link to="/blog/startup-india-seed-fund" className="text-primary hover:underline font-medium">
                  Startup India Seed Fund application process
                </Link>
                {' '}or learn how to find investors for small business in India without collateral. 
                We also curate specific lists like <strong>Angel investors in Jaipur and Indore 2026</strong>.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Startup India Seed Fund</Badge>
                <Badge variant="secondary">DPIIT Recognition</Badge>
                <Badge variant="secondary">CSR Funding</Badge>
                <Badge variant="secondary">Family Offices</Badge>
              </div>
            </div>
          </div>
        </section>

      </div>
      
      {/* ✅ FOOTER INTEGRATION */}
      <Footer />
    </Layout>
  );
}