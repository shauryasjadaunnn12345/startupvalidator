import { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Rocket, 
  Users, 
  ShieldCheck, 
  MessageSquare, 
  Zap, 
  CheckCircle2, 
  Search,
  ArrowRight,
  Twitter,
  Github,
  Linkedin,
  Mail,
  Instagram, // ✅ Added for Footer
  DollarSign // ✅ Added for Funding context
} from 'lucide-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// ✅ FOOTER COMPONENT (Fixed Links)
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

export default function About() {
  // ✅ 1. INDIA-FOCUSED SEO INJECTION
  useEffect(() => {
    document.title = "About Us | India's #1 Startup Validation & Funding Platform";

    const updateMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.name = name;
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

    // Keywords Strategy: Low competition, India-specific
    updateMeta("description", "Startup Validator is India's premier platform for startup idea submission, validation, and funding. Connect with beta testers, access angel networks, and validate your business idea for free.");
    updateMeta("keywords", [
      "startup idea validation tool India",
      "submit startup idea India",
      "free beta testing platforms India",
      "government grants for startups in India",
      "angel investors directory India",
      "SaaS launch guide India",
      "validate business idea India",
      "startup feedback community India"
    ].join(", "));

    // AboutPage Schema
    updateSchema("schema-about", {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "mainEntity": {
        "@type": "Organization",
        "name": "Startup Validator",
        "url": "https://startupvalidator.in",
        "description": "India's community-driven platform for startup idea submission, AI-moderated validation, and funding discovery.",
        "areaServed": {
          "@type": "Country",
          "name": "India"
        }
      }
    });

    // ✅ FAQ Schema Injection (India Focused)
    updateSchema("schema-faq", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I validate my startup idea in India?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Simply submit your project details on Startup Validator. Our AI-moderated platform connects you with Indian founders who provide deep, actionable feedback. We also help you find beta testers specifically within the Indian market."
          }
        },
        {
          "@type": "Question",
          "name": "Does this platform help with finding funding?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Beyond validation, we host a curated directory of Indian government grants, angel investors, and venture capital funds. Validating your idea here often increases your credibility when approaching investors."
          }
        },
        {
          "@type": "Question",
          "name": "Is idea submission free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely. Startup Validator is a free platform. We believe early-stage founders in India shouldn't pay to get their first 100 users or initial validation."
          }
        },
        {
          "@type": "Question",
          "name": "How does the AI ensure feedback quality?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our custom AI analyzes every feedback submission for depth and sentiment. It filters out generic comments and AI-generated fluff, ensuring you receive high-quality insights relevant to the Indian startup ecosystem."
          }
        }
      ]
    });
  }, []);

  return (
    <Layout>
      <ErrorBoundary>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-accent/50 to-background py-16 px-4 md:py-24 w-full">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Empowering <span className="text-primary">Indian Founders</span> to Launch Faster
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                From idea submission and validation to funding and beta testing. We built the complete ecosystem for the Indian startup journey.
              </p>
            </div>
          </div>
        </section>

        {/* Stats/Social Proof */}
        <section className="border-y bg-muted/20 py-12 px-4">
          <div className="container mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Free Platform</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">AI</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Validated Feedback</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Idea Submission</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">Pan-India</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Funding Access</div>
            </div>
          </div>
        </section>

        {/* ✅ NEW SECTION: The 3 Pillars (Idea + Validation + Funding) */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl font-bold mb-4">More Than Just a Directory</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We tackle the unique challenges of the Indian startup ecosystem by bridging the gap between <strong>Idea Submission</strong>, <strong>Validation</strong>, and <strong>Funding</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Pillar 1: Idea Submission */}
              <div className="p-6 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Rocket className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Idea Submission</h3>
                <p className="text-sm text-muted-foreground">
                  Don't build in silence. Submit your startup idea to get immediate visibility. Our platform is designed for early-stage submissions, allowing you to test market fit before writing a single line of code.
                </p>
              </div>

              {/* Pillar 2: Validation */}
              <div className="p-6 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI Validation</h3>
                <p className="text-sm text-muted-foreground">
                  Leverage our AI-moderated "Give-to-Get" loop. Validate your business idea by receiving deep, honest feedback from other Indian founders, while filtering out low-quality noise.
                </p>
              </div>

              {/* Pillar 3: Funding */}
              <div className="p-6 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Funding Access</h3>
                <p className="text-sm text-muted-foreground">
                  Ready to scale? Access our curated directory of Indian government grants, angel networks, and VCs specifically looking for validated ideas in the Indian market.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission */}
        <section className="bg-accent/30 py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl font-bold mb-6">Why We Built Startup Validator</h2>
                <p className="text-muted-foreground text-lg mb-4">
                  Most startup directories in India are passive lists. Founders submit their projects and hope for the best. We realized that for true <strong>startup validation</strong>, engagement must be mandatory.
                </p>
                <p className="text-muted-foreground text-lg mb-6">
                  Our mission is to help Indian founders <strong>get their first 100 users</strong> and secure funding through a transparent, community-driven system.
                </p>
                <div className="space-y-3">
                  {['Free Idea Submission', 'AI-Filtered Quality Feedback', 'Access to Indian Funding Schemes', 'Community-First Growth'].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/50 dark:bg-black/20 rounded-2xl p-8 border">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">The "Give-to-Get" Loop</h3>
                </div>
                <p className="text-muted-foreground">
                  To ensure everyone gets value, we require a feedback exchange. You provide meaningful insights to 2 other startups to unlock your own validation. This keeps the ecosystem honest and helpful.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Trust Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Search className="h-4 w-4" />
              <span>AI-Powered Quality Control</span>
            </div>
            <h2 className="font-display text-3xl font-bold mb-6">No Fluff, Just Actionable Insights</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We developed a custom AI layer that analyzes feedback depth. If you try to submit generic "cool site" comments to cheat the system, our validator will reject it. This ensures every founder on <strong>Startup Validator</strong> receives real, human insights that actually improve their product.
            </p>
            <Button size="lg" asChild>
              <Link to="/submit">
                Submit Your Idea Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* FAQ Section (India Focused) */}
        <section className="py-20 px-4 bg-muted/20 border-t">
          <div className="container mx-auto max-w-4xl">
            <h2 className="font-display text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                {
                  q: "How can I validate my startup idea for the Indian market?",
                  a: "Submit your idea on our platform. Our community of Indian founders will provide feedback based on local market nuances, helping you refine your product-market fit specifically for India."
                },
                {
                  q: "Does this help me find angel investors in India?",
                  a: "Yes. We provide a dedicated funding directory that lists active angel networks, government grants (like Startup India Seed Fund), and VCs. Having a validated profile on our platform can significantly boost your credibility."
                },
                {
                  q: "Is there a fee for idea submission or validation?",
                  a: "No, Startup Validator is completely free. We are committed to lowering the barrier to entry for Indian founders. You can submit your startup, get feedback, and find beta testers at zero cost."
                },
                {
                  q: "Can I find beta testers for my app here?",
                  a: "Absolutely. Many users on the platform are actively looking for new tools to test. By engaging with the community and validating others' ideas, you build trust and attract genuine beta testers to your own startup."
                }
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-xl border bg-background">
                  <h3 className="text-lg font-bold mb-2">{item.q}</h3>
                  <p className="text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ✅ SEO CONTENT BLOCK: LONG-TAIL KEYWORDS */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">Supporting the Indian Startup Ecosystem</h2>
            <div className="prose prose-slate max-w-none text-muted-foreground space-y-6">
              <p>
                Starting a business in India is challenging. From finding the right co-founders to securing <strong>government grants for startups</strong>, the journey is complex. <strong>Startup Validator</strong> simplifies the first step: <strong>Idea Validation</strong>.
              </p>
              <p>
                We serve as a bridge between early-stage founders and the resources they need. Whether you are looking for <strong>free beta testing platforms</strong>, honest feedback from developers, or a <strong>startup directory in India</strong> to list your product, we are here to help.
              </p>
              <p>
                Unlike global platforms that may not understand the local context, our community is built for the Indian market. We help you navigate the landscape of <strong>angel investors in India</strong>, understand the requirements for <strong>DPIIT recognition</strong>, and ensure your SaaS launch is successful.
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </ErrorBoundary>
    </Layout>
  );
}