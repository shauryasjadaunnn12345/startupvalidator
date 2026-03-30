import { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Link } from 'react-router-dom';
import { Scale, Gavel, AlertCircle, RefreshCcw, UserPlus, Rocket, Instagram, Github, Linkedin, Mail } from 'lucide-react';

// ✅ FOOTER COMPONENT (Consistent with site)
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

export default function Terms() {
  
  useEffect(() => {
    document.title = "Terms of Service | Startup Validator";
    
    const updateMeta = (name: string, content: string) => {
      let element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.name = name;
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Keep noindex for legal pages
    updateMeta("robots", "noindex, follow");
    
    // Updated description
    updateMeta("description", "Terms of Service for Startup Validator. Rules regarding startup submission, the 'Give-to-Get' feedback loop, community conduct, and intellectual property for Indian founders.");
  }, []);

  return (
    <Layout>
      <ErrorBoundary>
        {/* Header Section */}
        <section className="bg-muted/30 py-16 px-4 border-b">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Scale className="h-4 w-4" />
              <span>Legal Agreement</span>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight mb-4">
              Terms of Service
            </h1>
            <p className="text-muted-foreground">
              Agreement valid as of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="prose prose-slate max-w-none space-y-12">
              
              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <UserPlus className="h-6 w-6 text-primary" /> 1. Acceptance of Terms
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing <strong>Startup Validator</strong>, you agree to be bound by these terms. Our platform is designed to help founders <strong>validate startup ideas</strong> through mutual exchange. If you do not agree with these terms, you are prohibited from using the site.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <RefreshCcw className="h-6 w-6 text-primary" /> 2. The "Give-to-Get" Loop
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  To maintain a listing on our <strong>startup directory</strong>, users must provide high-quality feedback to other startups. 
                </p>
                <div className="bg-accent/20 p-6 rounded-xl border border-accent/30 italic text-sm text-foreground">
                  "High-quality feedback" is defined as actionable, specific, and non-generic insights. AI-generated, low-effort, or spam comments are strictly prohibited and will result in the immediate removal of your startup listing.
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <Gavel className="h-6 w-6 text-primary" /> 3. Intellectual Property
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  You retain all ownership rights to the startup ideas you submit. By posting on Startup Validator, you grant us a worldwide, non-exclusive license to display your content to our community for validation purposes. We are not responsible for any "copycat" behavior within the community; users are encouraged to share only what is necessary for validation.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <AlertCircle className="h-6 w-6 text-primary" /> 4. Limitation of Liability
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Startup Validator provides a platform for feedback and <strong>beta testing</strong>. We do not guarantee startup success, investment, or accuracy of user feedback. The service is provided "as is" without warranties of any kind.
                </p>
              </div>

              <div className="border-t pt-8">
                <p className="text-sm text-muted-foreground">
                  Questions about these terms? Reach out via the contact information provided in our site footer.
                </p>
              </div>

            </div>
          </div>
        </section>

        <Footer />

      </ErrorBoundary>
    </Layout>
  );
}