import { useState } from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/site';
import { Badge, FilterBar, PageHero } from '../components/ui';

const categories = ['All', ...Array.from(new Set(blogPosts.map((p) => p.category)))];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function Blog() {
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? blogPosts : blogPosts.filter((p) => p.category === filter);

  return (
    <div>
      <PageHero
        eyebrow="Blog"
        title="Writing & Insights"
        subtitle="Lessons from building products, growing businesses and shipping code — written from the trenches."
      />
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <FilterBar options={categories} active={filter} onChange={setFilter} />
          <div className="grid gap-8 md:grid-cols-2">
            {filtered.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 transition hover:-translate-y-1 hover:border-emerald-500/40"
              >
                <div className="overflow-hidden">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    loading="lazy"
                    className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-7">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <Badge>{post.category}</Badge>
                    <span>{formatDate(post.publishedAt)}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-white transition group-hover:text-emerald-400">
                    {post.title}
                  </h2>
                  <p className="mt-3 line-clamp-2 leading-relaxed text-slate-400">{post.excerpt}</p>
                  <p className="mt-5 font-semibold text-emerald-400">Read article →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
