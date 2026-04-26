import React from 'react';
import { marqueeWords } from './content';
import { C } from './theme';

export const LandingMarquee: React.FC = () => (
  <section
    className="relative overflow-hidden py-6"
    style={{
      background: 'rgba(255,255,255,0.6)',
      borderTop: `1px solid ${C.lightBorder}`,
      borderBottom: `1px solid ${C.lightBorder}`,
    }}
  >
    <div className="flex flex-col gap-3 overflow-hidden">
      <div className="flex overflow-hidden">
        <div className="marquee-fwd flex shrink-0 items-center gap-10">
          {[...marqueeWords, ...marqueeWords].map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="flex shrink-0 items-center gap-2.5 text-sm font-semibold"
              style={{ color: C.textMuted }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})` }}
              />
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  </section>
);
