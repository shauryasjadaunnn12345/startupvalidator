import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useBlogs } from '@/hooks/useBlogs';
import { Blog } from '@/types/blog';
import { Rocket, Calendar, ArrowRight, Instagram, Github, Linkedin, Mail } from 'lucide-react';

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
              {/* ✅ 1. AUTHOR AUTHORITY FOOTER: Added rel="me" and actual URLs */}
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

export default function BlogList() {
  const { data: blogs = [], isLoading } = useBlogs();
  console.log('[BlogList] blogs:', blogs);
  
  // ✅ 3. ITEM LIST SCHEMA & UPDATED METADATA
  useEffect(() => {
    document.title = "Startup Blog | Launch Tips & Founder Stories";
    
    const updateMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
      el.setAttribute('content', content);
    };

    const updateProperty = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };

    const updateCanonical = (href: string) => {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) { link = document.createElement('link'); link.rel = "canonical"; document.head.appendChild(link); }
      link.setAttribute('href', href);
    };

    updateMeta("description", "Read the latest insights on startup validation, launch strategies, and founder stories.");
    updateCanonical("https://startupvalidator.in/blog");
    
    // Open Graph Tags
    updateProperty("og:title", "Startup Validator Blog");
    updateProperty("og:description", "Read the latest insights on startup validation, launch strategies, and founder stories.");
    updateProperty("og:type", "website");
    updateProperty("og:url", "https://startupvalidator.in/blog");
    
    // JSON-LD ItemList Schema
    if (blogs.length > 0) {
      const schemaId = "blog-list-schema";
      let script = document.getElementById(schemaId);
      if (!script) {
        script = document.createElement('script');
        script.id = schemaId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": blogs.map((blog, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "url": `https://startupvalidator.in/blog/${blog.slug}`
        }))
      });
    }
  }, [blogs]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Startup Validator<span className="text-primary">Blog</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Insights, tips, and success stories for modern founders.
          </p>
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-96 w-full rounded-xl" />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-xl font-semibold text-muted-foreground">No articles yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">Check back soon for fresh content.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <Card key={blog.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
                {blog.cover_image && (
                  <div className="h-48 w-full overflow-hidden">
                    <Link to={`/blog/${blog.slug}`}>
                      {/* ✅ 2. IMAGE PERFORMANCE: Added loading="lazy" */}
                      <img 
                        src={blog.cover_image} 
                        alt={blog.title}
                        loading="lazy" 
                        className="h-full w-full object-cover transition-transform hover:scale-105 duration-500"
                      />
                    </Link>
                  </div>
                )}
                
                <CardHeader className="p-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3" />
                    <time dateTime={blog.published_at ?? blog.created_at}>
                      {new Date(blog.published_at ?? blog.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        year: 'numeric',
                        day: 'numeric'
                      })}
                    </time>
                  </div>
                  {/* ✅ 4. SEMANTIC HEADING: CardTitle renders as H3, which is correct under H1 */}
                  <CardTitle className="line-clamp-2">
                    <Link to={`/blog/${blog.slug}`} className="hover:text-primary transition-colors">
                      {blog.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-6 pt-0 flex-1 flex flex-col">
                  <CardDescription className="line-clamp-3 text-base mb-6 flex-1">
                    {blog.excerpt}
                  </CardDescription>
                  
                  <Button variant="outline" asChild className="w-full sm:w-auto mt-auto">
                    <Link to={`/blog/${blog.slug}`}>
                      Read Article
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </Layout>
  );
}