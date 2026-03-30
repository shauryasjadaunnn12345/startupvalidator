import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  CheckSquare, 
  Rocket, 
  Target, 
  Zap, 
  ExternalLink,
  ArrowRight,
  ClipboardList,
  Twitter,
  Github,
  Linkedin,
  Mail,
  Instagram // ✅ Added for Footer
} from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// ✅ SEO Checklist Content
const CHECKLIST_DATA = [
  {
    category: "Phase 1: Validation & Research",
    items: [
      { id: 'v1', task: "Define your Value Proposition", desc: "What specific pain point does your SaaS solve?" },
      { id: 'v2', task: "Validate on Startup Validator", desc: "Submit your idea and get real human feedback from other founders." },
      { id: 'v3', task: "Conduct User Interviews", desc: "Follow 'The Mom Test' framework to talk to potential customers." },
      { id: 'v4', task: "Analyze Competitors", desc: "Identify gaps in existing Product Hunt or G2 listings." }
    ]
  },
  {
    category: "Phase 2: Technical Readiness",
    items: [
      { id: 't1', task: "Setup Analytics", desc: "Install Google Analytics 4 or Plausible to track conversion." },
      { id: 't2', task: "Error Monitoring", desc: "Ensure Sentry or LogRocket is tracking frontend/backend bugs." },
      { id: 't3', task: "SEO Optimization", desc: "Check Meta tags, OpenGraph images, and Schema.org integration." }
    ]
  },
  {
    category: "Phase 3: Launch Day Execution",
    items: [
      { id: 'l1', task: "Submit to Startup Directories", desc: "List on Startup Validator, BetaList, and Product Hunt." },
      { id: 'l2', task: "Social Media Blitz", desc: "Coordinate posts on X (Twitter), LinkedIn, and Reddit." },
      { id: 'l3', task: "Email Outbound", desc: "Notify your waitlist and early beta testers." }
    ]
  }
];

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
              The #1 platform to validate startup ideas and find beta testers.
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
            Built for beta testing platforms and startup validation
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Checklist() {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setCheckedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  useEffect(() => {
    // ✅ 1. INDIA-FOCUSED TITLE & META
    document.title = "SaaS Launch Checklist India | 2024 Founder Guide";

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

    // Description: Targeting Indian founders looking for structured launch plans
    updateMeta("description", "The ultimate SaaS product launch checklist for Indian founders. From idea validation and MVP development to funding strategies, DPIIT recognition, and community engagement.");

    // Keywords: Long-tail, low competition
    updateMeta("keywords", [
      "SaaS launch checklist India",
      "how to validate startup idea in India",
      "startup roadmap for Indian founders",
      "free startup submission sites India",
      "DPIIT recognition checklist",
      "product launch strategy India",
      "SaaS MVP development guide India",
      "marketing checklist for Indian startups"
    ].join(", "));

    // Open Graph
    updateProperty("og:title", "SaaS Launch Checklist India | Startup Validator");
    updateProperty("og:description", "Don't launch in the dark. Use our comprehensive checklist to validate, build, and launch your SaaS in the Indian market.");
    updateProperty("og:url", "https://startupvalidator.in/checklist");
    updateProperty("og:type", "website");

    // ✅ 2. HOWTO SCHEMA (Optimized)
    updateSchema("schema-howto", {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Launch a SaaS Product in India",
      "description": "A step-by-step roadmap for Indian founders to validate, build, and launch their software startups.",
      "step": CHECKLIST_DATA.flatMap(cat => cat.items).map((item, index) => ({
        "@type": "HowToStep",
        "position": index + 1,
        "name": item.task,
        "text": item.desc
      }))
    });

    // ✅ 3. BREADCRUMB SCHEMA
    updateSchema("schema-breadcrumb", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://startupvalidator.in/" },
        { "@type": "ListItem", "position": 2, "name": "SaaS Launch Checklist", "item": "https://startupvalidator.in/checklist" }
      ]
    });

  }, []);

  return (
    <Layout>
      <ErrorBoundary>
        {/* Header Section */}
        <section className="bg-muted/30 py-16 px-4 border-b">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <ClipboardList className="h-4 w-4" />
              <span>Interactive Founder Resource</span>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              The Ultimate <span className="text-primary">SaaS Product Launch</span> Checklist
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Going from 0 to 1 requires more than just code. Use this checklist to ensure your startup is validated, legally compliant, and ready for the Indian market.
            </p>
          </div>
        </section>

        {/* Interactive Checklist UI */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl">
            {CHECKLIST_DATA.map((category, idx) => (
              <div key={idx} className="mb-12">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {idx === 0 ? <Target className="h-5 w-5" /> : idx === 1 ? <Zap className="h-5 w-5" /> : <Rocket className="h-5 w-5" />}
                  </div>
                  {category.category}
                </h2>
                
                <div className="space-y-4">
                  {category.items.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={`p-5 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                        checkedItems.includes(item.id) 
                        ? 'bg-primary/5 border-primary/30' 
                        : 'bg-card hover:border-primary/50'
                      }`}
                    >
                      <div className={`mt-1 h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                        checkedItems.includes(item.id) ? 'bg-primary border-primary' : 'border-muted-foreground'
                      }`}>
                        {checkedItems.includes(item.id) && <CheckSquare className="h-4 w-4 text-white" />}
                      </div>
                      <div>
                        <h3 className={`font-bold transition-all ${checkedItems.includes(item.id) ? 'line-through text-muted-foreground' : ''}`}>
                          {item.task}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* CTA Section */}
            <div className="mt-20 p-8 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white text-center shadow-xl">
              <h2 className="text-3xl font-bold mb-4">Step #2 is the most important.</h2>
              <p className="mb-8 opacity-90 text-lg">
                Don't launch to a silent room. Get your first users and validate your idea today.
              </p>
              <Button size="lg" variant="secondary" asChild className="font-bold">
                <Link to="/submit">
                  Validate My Idea for Free <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ✅ SEO Article Section (India Focused) */}
        <section className="py-16 bg-muted/20 border-t">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="text-3xl font-bold mb-8">Why You Need a SaaS Launch Roadmap in India</h2>
            <div className="prose prose-slate max-w-none text-muted-foreground space-y-6">
              <p>
                Launching a SaaS in India comes with unique challenges. According to recent data, 90% of startups fail globally, and the #1 reason is <strong>lack of market need</strong>. This is why we created the <Link to="/" className="text-primary font-bold">Startup Validator</Link>—to help you test your business idea within the Indian context before you spend thousands on development.
              </p>
              
              <h3 className="text-xl font-bold text-foreground">1. Validation in the Indian Market</h3>
              <p>
                The most successful launches start with a <strong>validation checklist</strong>. By using platforms that allow you to find beta testers locally, you can refine your UI/UX and messaging to suit Indian user behaviors and preferences.
              </p>

              <h3 className="text-xl font-bold text-foreground">2. Navigating Compliance & Funding</h3>
              <p>
                Unlike generic guides, this checklist touches upon specifics relevant to Indian founders, such as <strong>DPIIT recognition</strong> for tax benefits and connecting with <strong>Indian angel networks</strong>. Ensuring your legal and technical backbone is ready before a Product Hunt launch is crucial.
              </p>

              <h3 className="text-xl font-bold text-foreground">3. Leveraging Startup Directories</h3>
              <p>
                Free startup submission sites are essential for initial backlink building. While global directories are great, being featured on a high-intent <strong>startup directory</strong> like ours ensures you get quality feedback from the Indian developer community, helping you iterate faster.
              </p>
            </div>
          </div>
        </section>
        
        <Footer />

      </ErrorBoundary>
    </Layout>
  );
}