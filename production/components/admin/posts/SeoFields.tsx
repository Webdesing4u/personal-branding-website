'use client';

// SEO fields — meta_title + meta_description with 160-char counter.
// Fallback rule (matches generateMetadata on the public page):
//   meta_title empty   → post title is used
//   meta_description empty → excerpt is used

interface Props {
  metaTitle: string;
  metaDescription: string;
  errors: Record<string, string>;
  onChange: (patch: { metaTitle?: string; metaDescription?: string }) => void;
}

export default function SeoFields({ metaTitle, metaDescription, errors, onChange }: Props) {
  const descLen = metaDescription.length;
  const counterColor =
    descLen > 160 ? 'text-red-400' : descLen > 145 ? 'text-amber-400' : 'text-slate-600';

  const input =
    'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500';

  return (
    <div className="space-y-3">
      <div>
        <input
          className={input}
          value={metaTitle}
          maxLength={200}
          placeholder="Meta title"
          onChange={(e) => onChange({ metaTitle: e.target.value })}
        />
        <p className="mt-1 text-xs text-slate-500">Leave blank to auto-generate from the post title.</p>
        {errors.metaTitle && <p className="mt-1 text-sm text-red-400">{errors.metaTitle}</p>}
      </div>
      <div>
        <textarea
          className={input}
          rows={3}
          value={metaDescription}
          maxLength={160}
          placeholder="Meta description"
          onChange={(e) => onChange({ metaDescription: e.target.value })}
        />
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-slate-500">Leave blank to auto-generate from the excerpt.</p>
          <p className={`text-xs font-medium ${counterColor}`}>{descLen}/160</p>
        </div>
        {errors.metaDescription && <p className="mt-1 text-sm text-red-400">{errors.metaDescription}</p>}
      </div>
    </div>
  );
}
