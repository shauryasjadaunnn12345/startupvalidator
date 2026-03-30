import { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Rocket, Loader2, AlertTriangle, Twitter, Github, Linkedin, Mail, CheckCircle2, BadgeCheck, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';

import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useCategories, useCreateStartup } from '@/hooks/useStartups';
import { toast } from 'sonner';

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
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Email">
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

// Helper function to update meta tags
const updateMeta = (name: string, content: string) => {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
  el.setAttribute('content', content);
};

// ✅ HELPER: Ensure HTTPS for URLs
const ensureHttps = (url: string) => {
  if (!url) return url;
  // Trim to handle accidental spaces
  const cleanUrl = url.trim();
  return cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
};

export default function Submit() {
  const navigate = useNavigate();
  const submissionRef = useRef(false);

  // ✅ SEO BOOSTER: Schema Injection
  useEffect(() => {
    // 1. Title for Founders
    document.title = "Submit Your Startup for Validation | Startup Validator";

    // 2. Meta Description targeting 'Beta Testing' and 'Launch'
    const metaDesc = "Submit your SaaS or startup idea to get honest feedback from 500+ founders. Launch your beta, find early adopters, and validate market fit today.";
    updateMeta("description", metaDesc);

    // 3. Organization/Service Schema
    const schemaId = "submit-page-schema";
    let script = document.getElementById(schemaId);
    if (!script) {
      script = document.createElement('script');
      script.id = schemaId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Startup Validation Service",
      "description": "A platform for founders to submit their startups for peer review and beta testing.",
      "provider": {
        "@type": "Organization",
        "name": "Startup Validator",
        "url": "https://startupvalidator.in"
      }
    });
  }, []);

  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const createStartup = useCreateStartup();

  const [websiteUrl, setWebsiteUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  /**
   * MAIN SUBMIT HANDLER
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !tagline.trim() || !description.trim() || !categoryId) {
      setValidationError('Please fill in all required fields.');
      return;
    }

    if (categoriesLoading) {
      setValidationError('Categories are still loading. Please wait.');
      return;
    }

    if (submissionRef.current) return;

    submissionRef.current = true;
    setIsSubmitting(true);
    setValidationError(null);

    try {
      /**
       * 🖼 STEP 1: Upload logo (if provided)
       */
      let logoUrl: string | undefined;

      if (logoFile) {
        const ext = logoFile.name.split('.').pop();
        const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const fileName = `logos/${Date.now()}-${safeName}-${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('startup-logos')
          .upload(fileName, logoFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('startup-logos')
          .getPublicUrl(fileName);

        if (!data?.publicUrl) {
          throw new Error('Failed to generate logo URL.');
        }

        logoUrl = data.publicUrl;
      }

      /**
       * 🚀 STEP 2: Create startup
       */
      await createStartup.mutateAsync({
        name,
        tagline,
        description,
        // ✅ FIX: Apply ensureHttps helper
        website_url: ensureHttps(websiteUrl) || null,
        logo_url: logoUrl,
        // ✅ FIX: Also apply to video URL for consistency
        video_url: ensureHttps(videoUrl) || null,
        category_id: categoryId,
      });

      // ✅ NEW SUCCESS MESSAGE
      toast.success('Startup submitted! Please validate 2 other startups to go live.');
      localStorage.removeItem('startup-draft');

      // ✅ NEW REDIRECT TO VALIDATION PAGE
      navigate('/validate', {
        state: {
          fromSubmission: true,
        },
      });

    } catch (error: any) {
      const message =
        error?.message ||
        error?.error_description ||
        'Something went wrong while submitting your startup.';

      setValidationError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
      submissionRef.current = false;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">
              Submit Your Startup
            </h1>
            <p className="text-center text-sm text-muted-foreground">
              Join community and get real feedback.
            </p>
          </CardHeader>

          <CardContent>
            {/* ✅ VISUALIZING FOUNDER LOOP */}
            <div className="mb-8 rounded-xl border bg-muted/30 p-4">
              <p className="mb-4 text-center text-sm font-semibold text-primary">
                How "Give-to-Get" Loop works:
              </p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold">1. Submit</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Fill out the form.</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold">2. Validate</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Provide feedback to 2 others.</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <BadgeCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold">3. Go Live</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Your startup gets traffic.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label>Startup Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>Tagline *</Label>
                <Input
                  value={tagline}
                  maxLength={100}
                  onChange={(e) => setTagline(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label>Category *</Label>
                <Select
                  value={categoryId}
                  onValueChange={setCategoryId}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        categoriesLoading ? 'Loading...' : 'Select category'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Website URL</Label>
                <Input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourstartup.com"
                />
              </div>

              <div>
                <Label>Demo / Promo Video URL</Label>
                <Input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div>
                <Label>Logo Upload</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    if (!file.type.startsWith('image/')) {
                      toast.error('Only image files are allowed.');
                      return;
                    }

                    if (file.size > 2 * 1024 * 1024) {
                      toast.error('Logo must be smaller than 2MB.');
                      return;
                    }

                    setLogoFile(file);
                    toast.info('Logo selected');
                  }}
                />
                {logoFile && (
                  <span className="text-xs text-muted-foreground">
                    Selected: {logoFile.name}
                  </span>
                )}
              </div>

              {validationError && (
                <Alert className="border-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Rocket className="mr-2 h-4 w-4" />
                Submit Startup
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Startups are published once you validate 2 others.{' '}
                <Link to="/validate" className="underline">
                  Start validating
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Footer Added Here */}
      <Footer />

    </Layout>
  );
}