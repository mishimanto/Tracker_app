import React, { useEffect, useState } from 'react';

interface PageLoaderProps {
  message?: string;
  exiting?: boolean;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ message = 'Loading', exiting = false }) => {
  return (
    <div
      className={`flex h-96 items-center justify-center transition-all duration-300 ${
        exiting ? 'translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-5 animate-[fadeUp_0.4s_ease_both]">

        {/* Spinner */}
        <div className="relative h-13 w-13">
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full border-2 border-slate-300 animate-[pulseRing_1.6s_ease-out_infinite]" />
          {/* Track */}
          <div className="absolute inset-0 rounded-full border-[2.5px] border-slate-200" />
          {/* Spinning arc */}
          <div className="absolute inset-0 animate-spin rounded-full border-[2.5px] border-transparent border-t-slate-900 [animation-duration:750ms]" />
        </div>

        {/* Label + animated bars */}
        <div className="flex items-center gap-1.5 text-[13px] tracking-wide text-slate-400">
          <span>Loading</span>
          <div className="flex items-center gap-[3px]">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="inline-block h-3 w-[3px] rounded-sm bg-slate-300 animate-[dotBounce_1.2s_ease-in-out_infinite]"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

interface PageLoaderTransitionProps {
  loading: boolean;
  message?: string;
  children: React.ReactNode;
}

export const PageLoaderTransition: React.FC<PageLoaderTransitionProps> = ({
  loading,
  message,
  children,
}) => {
  const [visible, setVisible] = useState(loading);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (loading) {
      setVisible(true);
      setExiting(false);
      return;
    }

    if (!visible) {
      return;
    }

    setExiting(true);
    const timeout = window.setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, 280);

    return () => window.clearTimeout(timeout);
  }, [loading, visible]);

  if (visible) {
    return <PageLoader message={message} exiting={exiting} />;
  }

  return <>{children}</>;
};
