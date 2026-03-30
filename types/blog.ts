export type Blog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string; // markdown
  cover_image: string | null;
  author_name: string;
  status: 'draft' | 'published';
  created_at: string;
  published_at: string | null;
};
