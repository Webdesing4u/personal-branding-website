'use client';

// Tech stack chips input — purely local (string[]), no backend entity.
// Enter or comma adds a chip · × or Backspace removes · dedupe (case-insensitive)
// Mirrors projectSchema: max 20 items, each ≤ 50 chars.

import { useRef, useState } from 'react';

const MAX_ITEMS = 20;
const MAX_LEN = 50;

interface Props {
  value: string[];
  error?: string;
  onChange: (stack: string[]) => void;
}

export default function TechStackInput({ value, error, onChange }: Props) {
  const [input, setInput] = useState('');
  const [localError, setLocalError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const add = (raw: string) => {
    const name = raw.trim().replace(/,+$/, '');
    if (!name) return;
    if (name.length > MAX_LEN) {
      setLocalError(`Max ${MAX_LEN} characters per item`);
      return;
    }
    if (value.length >= MAX_ITEMS) {
      setLocalError(`Max ${MAX_ITEMS} items`);
      return;
    }
    if (value.some((v) => v.toLowerCase() === name.toLowerCase())) {
      setLocalError(`"${name}" already added`);
      setInput('');
      return;
    }
    setLocalError('');
    onChange([...value, name]);
    setInput('');
  };

  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div>
      <div
        className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-2 py-1.5 focus-within:border-emerald-500"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tech, i) => (
          <span
            key={tech}
            className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200"
          >
            {tech}
            <button
              type="button"
              aria-label={`Remove ${tech}`}
              onClick={(e) => { e.stopPropagation(); remove(i); }}
              className="text-slate-500 transition hover:text-white"
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="min-w-[140px] flex-1 bg-transparent px-1 py-1 text-sm text-white placeholder-slate-500 outline-none"
          value={input}
          placeholder={value.length === 0 ? 'e.g. Next.js, PostgreSQL — Enter to add' : ''}
          maxLength={MAX_LEN + 1}
          onChange={(e) => {
            setLocalError('');
            // Comma auto-commits the chip
            if (e.target.value.endsWith(',')) add(e.target.value);
            else setInput(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add(input);
            }
            if (e.key === 'Backspace' && !input && value.length > 0) {
              remove(value.length - 1);
            }
          }}
          onBlur={() => input.trim() && add(input)} // commit on blur — nothing lost
        />
      </div>
      <p className="mt-1 text-xs text-slate-600">{value.length}/{MAX_ITEMS} technologies</p>
      {(localError || error) && <p className="mt-1 text-sm text-red-400">{localError || error}</p>}
    </div>
  );
}
