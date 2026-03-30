import { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Lock, 
  Eye, 
  FileText, 
  Scale, 
  Zap, 
  Rocket, 
  Instagram, // ✅ Added
  Github, 
  Linkedin, 
  Mail 
} from 'lucide-react';

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

export default function Privacy() {
  
  useEffect(() => {
    document.title = "Privacy Policy | Startup Validator";
    
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
    
    // Update description
    updateMeta("description", "Privacy Policy for Startup Validator. Learn how we protect your startup data, handle AI-moderated feedback, and ensure transparency for Indian founders.");
  }, []);

  return (
    <Layout>
      <ErrorBoundary>
        {/* Header Section */}
        <section className="bg-muted/30 py-16 px-4 border-b">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              <span>Your Data Security</span>
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </section>

        {/* Policy Content */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <div className="prose prose-slate max-w-none space-y-10">
              
              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <Eye className="h-6 w-6 text-primary" /> 1. Information We Collect
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  To provide the best <strong>startup validation</strong> experience for Indian founders, we collect the following:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>Account Data:</strong> Name, email, and profile information via authentication providers.</li>
                  <li><strong>Startup Profile:</strong> Product name, website URL, logo, problem statement, and category.</li>
                  <li><strong>Feedback Data:</strong> All feedback you provide during the "Give-to-Get" loop, which is processed by our AI to ensure quality.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <Zap className="h-6 w-6 text-primary" /> 2. AI Processing & Quality Control
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our platform uses AI to moderate feedback and detect spam. When you submit feedback, our system analyzes the text to ensure it is deep and actionable. We do not use your proprietary startup data or feedback to train public AI models. Your data remains private within the <strong>Startup Validator</strong> ecosystem.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <Lock className="h-6 w-6 text-primary" /> 3. Data Sharing & Visibility
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  As a <strong>community-driven platform</strong>, the startup profiles you submit are publicly visible to other founders and beta testers to facilitate validation and discovery. However, your private account details (like email) are never shared. We do not sell your data to third-party advertisers.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                  <Scale className="h-6 w-6 text-primary" /> 4. Your Rights
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  You have the right to access, correct, or delete your personal data at any time. You can also request a complete export of your startup submissions and feedback history. To exercise these rights, please contact us via the email link in our footer.
                </p>
              </div>

              <div className="rounded-2xl bg-muted/50 p-8 border border-muted">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Cookies & Tracking
                </h3>
                <p className="text-sm text-muted-foreground">
                  We use essential cookies to keep you logged in and analytics cookies to understand how founders use our platform. By using <strong>Startup Validator</strong>, you agree to this standard practice.
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