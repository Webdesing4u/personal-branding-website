'use client';

// Admin image uploader — signed direct-to-Cloudinary upload.
// Usage: <ImageUploader folder="blog" onUploaded={(url) => setFeaturedImage(url)} />

import { useRef, useState } from 'react';

const MAX_SIZE_MB = 8;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

interface Props {
  folder: 'blog' | 'portfolio' | 'business' | 'gallery';
  onUploaded: (secureUrl: string) => void;
}

export default function ImageUploader({ folder, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  const handleFile = async (file: File) => {
    setError('');

    // Client-side guardrails (server/Cloudinary still enforce their own)
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPG, PNG, WebP or AVIF images allowed.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Max file size is ${MAX_SIZE_MB} MB.`);
      return;
    }

    setProgress(0);
    try {
      // 1 — Get a fresh signature from our session-protected API
      const sigRes = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }),
      });
      if (!sigRes.ok) throw new Error('Could not authorize upload.');
      const { signature, timestamp, apiKey, uploadUrl, folder: signedFolder } = await sigRes.json();

      // 2 — Upload directly to Cloudinary with XHR (for progress events)
      const form = new FormData();
      form.append('file', file);
      form.append('api_key', apiKey);
      form.append('timestamp', String(timestamp));
      form.append('signature', signature);
      form.append('folder', signedFolder);

      const secureUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', uploadUrl);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText).secure_url);
          } else reject(new Error('Upload failed.'));
        };
        xhr.onerror = () => reject(new Error('Network error during upload.'));
        xhr.send(form);
      });

      // 3 — Hand the CDN URL back to the parent form
      setPreview(secureUrl);
      onUploaded(secureUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setProgress(null);
    }
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className="cursor-pointer rounded-xl border-2 border-dashed border-slate-700 p-6 text-center transition hover:border-emerald-500/60"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Uploaded" className="mx-auto max-h-40 rounded-lg" />
        ) : progress !== null ? (
          <div>
            <p className="text-sm text-slate-300">Uploading… {progress}%</p>
            <div className="mx-auto mt-2 h-2 max-w-xs overflow-hidden rounded-full bg-slate-800">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            📤 Click or drag an image here
            <span className="mt-1 block text-xs text-slate-500">
              JPG / PNG / WebP / AVIF · max {MAX_SIZE_MB} MB · uploads straight to CDN
            </span>
          </p>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
