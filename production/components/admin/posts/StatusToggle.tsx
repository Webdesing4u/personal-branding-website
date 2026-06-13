'use client';

// Status switch — Draft ↔ Published.
// Draft → Published requires confirmation (parent shows the modal via
// onPublishRequest). Published → Draft switches immediately, no confirm.

interface Props {
  status: 'draft' | 'published';
  onPublishRequest: () => void;        // parent opens confirm modal
  onDraft: () => void;                 // immediate
}

export default function StatusToggle({ status, onPublishRequest, onDraft }: Props) {
  const isPublished = status === 'published';

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-white">
          {isPublished ? 'Published' : 'Draft'}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isPublished}
          onClick={() => (isPublished ? onDraft() : onPublishRequest())}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            isPublished ? 'bg-emerald-500' : 'bg-slate-700'
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              isPublished ? 'translate-x-[22px]' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {isPublished
          ? 'Visible on the public blog. Switching to draft hides it instantly.'
          : 'Hidden from the public blog until published.'}
      </p>
    </div>
  );
}
