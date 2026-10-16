import React from 'react';
import { EyeOff } from 'lucide-react';

interface ReducedMotionFallbackProps {
  poster: string;
  altText: string;
  headline?: string;
  subheadline?: string;
  className?: string;
}

export const ReducedMotionFallback: React.FC<ReducedMotionFallbackProps> = ({
  poster,
  altText,
  headline,
  subheadline,
  className = '',
}) => {
  return (
    <div className={`relative w-full h-full overflow-hidden bg-obsidian ${className}`}>
      <img
        src={poster}
        alt={altText}
        className="w-full h-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-black/40 to-transparent pointer-events-none" />

      {/* Notice Tag */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-2 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded border border-white/10 text-xs font-mono text-silver">
        <EyeOff size={13} className="text-accent" />
        <span className="uppercase tracking-widest text-[10px]">Static Cinematic View (Reduced Motion Enabled)</span>
      </div>

      {(headline || subheadline) && (
        <div className="absolute bottom-12 left-6 right-6 md:left-12 max-w-2xl z-10">
          {subheadline && <span className="label-technical text-accent text-xs block mb-2">{subheadline}</span>}
          {headline && <h2 className="heading-subsection text-white">{headline}</h2>}
        </div>
      )}
    </div>
  );
};
