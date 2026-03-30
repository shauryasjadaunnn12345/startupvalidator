import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Globe,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Rocket,
  Instagram,
  Github,
  Linkedin,
  Mail
} from 'lucide-react';

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
        </div>
      </div>
    </footer>
  );
}

export default function FundingDetails() {
  const { slug } = useParams();
  const [funding, setFunding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    
    setLoading(true);
    supabase
      .from('fundings')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching funding:", error);
          setError("Could not load funding details.");
        } else {
          setFunding(data);
        }
        setLoading(false);
      });
  }, [slug]);

  // ✅ SEO: Dynamic Title & Schema
  useEffect(() => {
    if (funding) {
      document.title = `${funding.name} | Funding Details - Startup Validator`;
      
      // Update Description
      const description = `Apply for ${funding.name}. ${funding.funding_type} opportunity for ${funding.stage} startups. ${funding.funding_amount} available.`;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", description);

      // JSON-LD Schema for FinancialProduct/Grant
      const schema = {
        "@context": "https://schema.org",
        "@type": funding.funding_type === 'Grant' ? "Grant" : "FinancialProduct",
        "name": funding.name,
        "description": funding.description,
        "provider": { "@type": "Organization", "name": funding.provider || "Unknown Provider" },
        "amount": funding.funding_amount,
        "offers": {
          "@type": "Offer",
          "price": funding.funding_amount,
          "priceCurrency": "INR"
        }
      };

      let schemaTag = document.getElementById('funding-details-schema');
      if (!schemaTag) {
        schemaTag = document.createElement('script');
        schemaTag.type = 'application/ld+json';
        schemaTag.id = 'funding-details-schema';
        document.head.appendChild(schemaTag);
      }
      schemaTag.textContent = JSON.stringify(schema);
    }
  }, [funding]);

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 py-10 space-y-8">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (error || !funding) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto px-4 py-20 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-bold mb-2">Funding Not Found</h2>
          <p className="text-muted-foreground mb-6">{error || "The funding opportunity you're looking for doesn't exist."}</p>
          <Button asChild>
            <Link to="/funding">Back to Directory</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto px-4 py-10 space-y-8">
        
        {/* Back Button */}
        <Button variant="ghost" asChild className="pl-0">
          <Link to="/funding">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Funding Directory
          </Link>
        </Button>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={funding.funding_type === 'Grant' ? 'secondary' : 'default'} className="text-xs px-3 py-1">
              {funding.funding_type.toUpperCase()}
            </Badge>
            {funding.stage && (
              <Badge variant="outline" className="text-xs px-3 py-1">
                {funding.stage}
              </Badge>
            )}
            {funding.equity && (
              <Badge variant="outline" className="text-xs px-3 py-1">
                {funding.equity}
              </Badge>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{funding.name}</h1>
              <p className="text-muted-foreground mt-2 text-lg">
                By <span className="font-medium text-foreground">{funding.provider || 'Unknown Provider'}</span>
              </p>
            </div>
            
            {/* Sticky CTA on Desktop could go here, kept simple for now */}
            <a
              href={funding.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Apply Officially <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>

        <Separator />

        {/* Key Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <DollarSign className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs text-muted-foreground uppercase font-semibold">Funding Amount</span>
              <span className="font-bold text-lg mt-1">{funding.funding_amount || 'N/A'}</span>
            </CardContent>
          </Card>
          
          <Card className="bg-muted/30">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Globe className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs text-muted-foreground uppercase font-semibold">Eligibility</span>
              <span className="font-bold text-lg mt-1">{funding.geography || 'Global'}</span>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Calendar className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs text-muted-foreground uppercase font-semibold">Deadline</span>
              <span className="font-bold text-lg mt-1 text-destructive">
                {funding.deadline ? new Date(funding.deadline).toLocaleDateString() : 'Rolling'}
              </span>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <CheckCircle2 className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs text-muted-foreground uppercase font-semibold">Equity</span>
              <span className="font-bold text-lg mt-1">{funding.equity || 'N/A'}</span>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">About this Opportunity</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {funding.description}
            </p>
          </section>

          {funding.benefits && funding.benefits.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Benefits</h2>
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {funding.benefits.map((b: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 shrink-0 mt-0.5" />
                        <span className="text-sm">{b}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>
          )}

          {funding.eligibility && funding.eligibility.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Eligibility Criteria</h2>
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {funding.eligibility.map((e: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-blue-500 mr-3 shrink-0 mt-0.5" />
                        <span className="text-sm">{e}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </section>
          )}

          {funding.application_process && funding.application_process.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Application Process</h2>
              <div className="space-y-6 relative pl-4 border-l-2 border-muted">
                {funding.application_process.map((step: string, i: number) => (
                  <div key={i} className="relative pl-8">
                    <div className="absolute -left-[21px] top-1 h-4 w-4 rounded-full bg-primary border-2 border-background" />
                    <h3 className="font-semibold text-sm">Step {i + 1}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{step}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <Separator />

        {/* Bottom CTA */}
        <div className="bg-primary/5 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold mb-2">Ready to apply?</h3>
          <p className="text-muted-foreground mb-6">Make sure you have all documents ready before visiting the official site.</p>
          <a
            href={funding.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8 py-2"
          >
            Visit Official Website <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </div>

      </div>
      
      <Footer />
    </Layout>
  );
}