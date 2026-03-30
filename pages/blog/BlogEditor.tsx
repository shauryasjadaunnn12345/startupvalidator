import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateBlog } from '@/hooks/useBlogs';
import { useAdmin } from '@/hooks/useAdmin';

export default function BlogEditor() {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin(); // ✅ FIX 1
  const createBlog = useCreateBlog();

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    meta_title: '',
    meta_description: '',
    published: true,
  });

//   if (!isAdmin) {
//     return (
//       <Layout>
//         <p className="p-6">Access denied</p>
//       </Layout>
//     );
//   }
// TEMP DEV SHORTCUT


  const submit = async () => {
    try {
      // ✅ FIX 2: get inserted blog back
      const blog = await createBlog.mutateAsync(form);

      // Redirect to published blog
      navigate(`/blog/${form.slug}`);
    } catch (err) {
      alert('Failed to publish blog');
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-bold">Write Blog</h1>

        <Input
          placeholder="Title"
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
        <Input
          placeholder="Slug"
          onChange={e => setForm({ ...form, slug: e.target.value })}
        />
        <Textarea
          placeholder="Excerpt"
          onChange={e => setForm({ ...form, excerpt: e.target.value })}
        />
        <Textarea
          placeholder="Markdown content"
          rows={10}
          onChange={e => setForm({ ...form, content: e.target.value })}
        />
        <Input
          placeholder="Meta title"
          onChange={e => setForm({ ...form, meta_title: e.target.value })}
        />
        <Textarea
          placeholder="Meta description"
          onChange={e =>
            setForm({ ...form, meta_description: e.target.value })
          }
        />

        <Button onClick={submit} disabled={createBlog.isPending}>
          {createBlog.isPending ? 'Publishing…' : 'Publish'}
        </Button>
      </div>
    </Layout>
  );
}
