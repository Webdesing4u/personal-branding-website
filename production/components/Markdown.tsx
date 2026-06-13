// Shared markdown renderer for public pages (Server Component compatible).
// Locked spec:
//   remark-gfm                  → tables, strikethrough, task lists, autolinks
//   rehype-slug                 → heading ids
//   rehype-autolink-headings    → anchor links on headings
//   <a> mapped                  → rel="noopener noreferrer" on external links
//   raw HTML prevented          → react-markdown skips raw HTML by default
//                                 (NO rehype-raw — that is the security boundary)

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

interface Props {
  content: string;
  className?: string;
}

export default function Markdown({ content, className }: Props) {
  return (
    <div className={className ?? 'prose prose-invert prose-emerald max-w-none'}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        ]}
        // NOTE: no rehype-raw → any raw HTML in content is rendered as text,
        // never parsed. This is intentional and must not be changed.
        components={{
          a: ({ href, children, ...props }) => {
            const isExternal = !!href && /^https?:\/\//.test(href);
            return (
              <a
                href={href}
                {...(isExternal && {
                  target: '_blank',
                  rel: 'noopener noreferrer',
                })}
                {...props}
              >
                {children}
              </a>
            );
          },
          // Defensive: images in markdown get lazy loading
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={alt ?? ''} loading="lazy" className="rounded-xl" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
