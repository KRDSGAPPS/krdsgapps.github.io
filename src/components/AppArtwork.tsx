import React, { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';

interface AppArtworkProps {
  iconUrl: string;
  title: string;
  category: string;
  className?: string;
}

export const AppArtwork: React.FC<AppArtworkProps> = ({
  iconUrl,
  title,
  category,
  className = 'w-16 h-16 rounded-xl',
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [iconUrl]);

  const initials = title
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  if (!iconUrl || failed) {
    return (
      <div
        className={`${className} flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 select-none shrink-0`}
        aria-label={title}
      >
        {initials ? (
          <span className="font-display font-bold text-lg tracking-tight">
            {initials}
          </span>
        ) : (
          <Smartphone className="w-6 h-6 text-zinc-500" />
        )}
        <span className="sr-only">{category}</span>
      </div>
    );
  }

  return (
    <img
      src={iconUrl}
      alt={title}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${className} object-cover border border-zinc-200 dark:border-zinc-800 shrink-0`}
    />
  );
};
