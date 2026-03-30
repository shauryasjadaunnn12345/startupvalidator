import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useBlog } from '@/hooks/useBlogs';
import ReactMarkdown from 'react-markdown';
import { useEffect } from 'react';
import { ArrowLeft, Calendar, User, Rocket, Instagram, Github, Linkedin, Mail } from 'lucide-react';

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

// ✅ TRANSFORMER: Adds mandatory newlines (\n) before headings
const transformMarkdown = (content: string) => {
  return content
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (/^#{1,6}\s|^[-*+]\s|^\>\s|^`/.test(trimmed)) {
        return line;
      }
      if (/^\d+\.\s+/.test(trimmed)) {
        return `\n## ${trimmed.replace(/^\d+\.\s+/, '')}\n`;
      }
      if (/^[A-Z][a-zA-Z\s]+:$/.test(trimmed)) {
        return `\n## ${trimmed}\n`;
      }
      if (
        trimmed.length > 3 &&
        trimmed.length < 80 &&
        /^[A-Z]/.test(trimmed) &&
        !trimmed.endsWith('.')
      ) {
        return `\n## ${trimmed}\n`;
      }
      return line;
    })
    .join('\n');
};

export default function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: blog, isLoading } = useBlog(slug!);

  useEffect(() => {
    if (!blog) return;

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

    document.title = `${blog.title} | Startup Validator Blog`;

    const desc = blog.excerpt || blog.content.replace(/[#*]/g, '').substring(0, 160);
    updateMeta("description", desc);

    updateMeta("keywords", `Startup Validator, ${blog.title}, ${blog.author_name}, startup tips, SaaS blog`);

    updateCanonical(`https://startupvalidator.in/blog/${slug}`);

    updateProperty("og:type", "article");
    updateProperty("og:title", blog.title);
    updateProperty("og:image", blog.cover_image || "");
    updateProperty("og:description", desc);
    updateProperty("og:url", `https://startupvalidator.in/blog/${slug}`);

    const schemaId = "blog-schema";
    let script = document.getElementById(schemaId);
    if (!script) {
      script = document.createElement('script');
      script.id = schemaId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": blog.title,
      "image": blog.cover_image || undefined,
      "datePublished": blog.published_at,
      "author": {
        "@type": "Person",
        "name": blog.author_name
      },
      "description": desc,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://startupvalidator.in/blog/${slug}`
      }
    });
  }, [blog, slug]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
             <div className="flex items-center justify-center min-h-[60vh]">
                <Skeleton className="h-96 w-full rounded-xl" />
             </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!blog) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <h1 className="font-display text-3xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">The article you are looking for doesn't exist or has been removed.</p>
            <Button asChild size="lg">
              <Link to="/blog">Back to Blog</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="container mx-auto max-w-3xl px-4 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </div>

        {/* Header Meta */}
        <header className="mb-10 text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            {blog.title}
          </h1>
          
          <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground sm:flex-row sm:gap-6">
            <div className="flex items-center gap-2">
               <User className="h-4 w-4 text-primary" />
               <span className="text-sm font-medium">{blog.author_name}</span>
            </div>
            
            <div className="flex items-center gap-2">
               <Calendar className="h-4 w-4 text-primary" />
               <time dateTime={blog.published_at} className="text-sm">
                  {new Date(blog.published_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
               </time>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {blog.cover_image && (
          <figure className="mb-10 overflow-hidden rounded-2xl shadow-sm">
             <img
               src={blog.cover_image}
               alt={`Cover image for ${blog.title}`}
               className="w-full h-auto object-cover max-h-[500px]"
               loading="eager"
             />
          </figure>
        )}

        {/* Article Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none mb-16">
          <ReactMarkdown>
            {transformMarkdown(blog.content)}
          </ReactMarkdown>
        </div>

        {/* Read More / Internal Linking Section */}
        <nav className="border-t pt-8 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Enjoyed this article? Explore more resources.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/blog">Read More Articles</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/checklist">View SaaS Launch Checklist</Link>
            </Button>
          </div>
        </nav>

      </article>

      <Footer />

    </Layout>
  );
}