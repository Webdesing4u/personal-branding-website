import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { blogPosts } from '../data/site';
import { Badge } from '../components/ui';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  // SEO: set document title & meta description (simulating Next.js metadata)
  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Emran Hossain`;
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', post.excerpt);
    }
    return () => {
      document.title = 'Emran Hossain | Full Stack Developer & Entrepreneur';
    };
  }, [post]);

  if (!post) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 pt-24 text-center">
        <p className="text-6xl">📝</p>
        <h1 className="mt-4 text-2xl font-bold text-white">Post not found</h1>
        <Link to="/blog" className="mt-4 font-semibold text-emerald-400">← Back to Blog</Link>
      </div>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const others = blogPosts.filter((p) => p.id !== post.id).slice(0, 2);

  return (
    <div>
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 pb-12 pt-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Link to="/blog" className="text-sm font-medium text-slate-400 hover:text-emerald-400">← Back to Blog</Link>
          <div className="mt-4">
            <Badge>{post.category}</Badge>
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">{post.title}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-400">
                E
              </span>
              {post.author}
            </span>
            <span>·</span>
            <span>{formatDate(post.publishedAt)}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </section>

      <article className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full rounded-2xl border border-slate-800 object-cover shadow-2xl"
          />
          <div className="mt-10 space-y-6 text-lg leading-relaxed text-slate-300">
            {post.content.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {/* Tags */}
          <div className="mt-10 flex flex-wrap gap-2 border-t border-slate-800 pt-6">
            {post.tags.map((t) => (
              <span key={t} className="rounded-full border border-slate-700 px-4 py-1.5 text-sm text-slate-300">
                #{t}
              </span>
            ))}
          </div>

          {/* Share */}
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <p className="font-semibold text-white">Share this article</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank" rel="noreferrer"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                target="_blank" rel="noreferrer"
                className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400"
              >
                Twitter / X
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank" rel="noreferrer"
                className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {/* More posts */}
          <div className="mt-12 border-t border-slate-800 pt-8">
            <h2 className="text-xl font-bold text-white">More from the blog</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {others.map((p) => (
                <Link
                  key={p.id}
                  to={`/blog/${p.slug}`}
                  className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-emerald-500/40"
                >
                  <p className="text-xs text-slate-500">{formatDate(p.publishedAt)}</p>
                  <h3 className="mt-2 font-semibold text-white group-hover:text-emerald-400">{p.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
